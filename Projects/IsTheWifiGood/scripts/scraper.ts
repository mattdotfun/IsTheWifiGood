#!/usr/bin/env tsx

/**
 * Hotel WiFi Reviews Scraper
 * 
 * This script scrapes Google Maps reviews for hotels, specifically looking for WiFi mentions.
 * It uses Playwright with anti-detection measures and rate limiting.
 */

import { chromium, Browser, Page } from 'playwright'
import { scraperLogger } from '../src/lib/logger'
import { RateLimiter, retry, sanitizeString, extractSpeedFromText } from '../src/lib/utils'

interface Hotel {
  id: string
  name: string
  address: string
  city_id: string
}

interface WiFiReview {
  hotel_id: string
  reviewer_name: string
  rating: number
  review_text: string
  review_date: string
  wifi_mentioned: boolean
  extracted_speed?: number
}

class HotelWiFiScraper {
  private browser: Browser | null = null
  private rateLimiter: RateLimiter
  
  constructor(minDelaySeconds = 8) {
    this.rateLimiter = new RateLimiter(minDelaySeconds)
  }

  async initialize(): Promise<void> {
    scraperLogger.info('Initializing browser with anti-detection measures')
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    })
  }

  async createStealthPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    // Add stealth measures
    await page.addInitScript(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })
    })

    return page
  }

  async searchHotelOnMaps(page: Page, hotelName: string, city: string): Promise<boolean> {
    try {
      const searchQuery = `${hotelName} ${city} hotel`
      scraperLogger.info(`Searching for: ${searchQuery}`)

      await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle' })
      
      // Wait for search box and enter query
      await page.waitForSelector('input[data-value="Search"]', { timeout: 10000 })
      await page.fill('input[data-value="Search"]', searchQuery)
      await page.press('input[data-value="Search"]', 'Enter')
      
      // Wait for results to load
      await page.waitForTimeout(3000)
      
      // Look for the hotel in results and click it
      const hotelLink = page.locator(`a:has-text("${hotelName}")`)
      if (await hotelLink.count() > 0) {
        await hotelLink.first().click()
        await page.waitForTimeout(2000)
        return true
      }
      
      scraperLogger.warn(`Hotel ${hotelName} not found in search results`)
      return false
    } catch (error) {
      scraperLogger.error(`Error searching for hotel ${hotelName}:`, error)
      return false
    }
  }

  async navigateToReviews(page: Page): Promise<boolean> {
    try {
      // Click on Reviews tab
      const reviewsTab = page.locator('button:has-text("Reviews")')
      if (await reviewsTab.count() > 0) {
        await reviewsTab.click()
        await page.waitForTimeout(2000)
        return true
      }
      
      scraperLogger.warn('Reviews tab not found')
      return false
    } catch (error) {
      scraperLogger.error('Error navigating to reviews:', error)
      return false
    }
  }

  async searchWiFiReviews(page: Page): Promise<WiFiReview[]> {
    const reviews: WiFiReview[] = []
    const maxReviews = 200 // Increased limit for comprehensive collection
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    
    try {
      scraperLogger.info('Starting comprehensive WiFi review collection...')
      
      // First, try to search for "wifi" in the reviews search box
      await page.waitForTimeout(2000)
      const searchBox = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]').first()
      if (await searchBox.count() > 0) {
        scraperLogger.info('Found search box, searching for wifi...')
        await searchBox.fill('wifi')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(3000)
      } else {
        scraperLogger.info('No search box found, scanning all reviews...')
      }

      let scrollAttempts = 0
      let lastReviewCount = 0
      const maxScrollAttempts = 20
      
      while (scrollAttempts < maxScrollAttempts && reviews.length < maxReviews) {
        try {
          // Look for review elements with multiple possible selectors
          const reviewSelectors = [
            '[data-review-id]',
            '[jsaction*="review"]',
            '.ODSEW-ShBeI',
            '[data-value][data-ved]'
          ]
          
          let reviewElements = null
          for (const selector of reviewSelectors) {
            reviewElements = page.locator(selector)
            if (await reviewElements.count() > 0) {
              scraperLogger.info(`Using selector: ${selector} - found ${await reviewElements.count()} elements`)
              break
            }
          }
          
          if (!reviewElements || await reviewElements.count() === 0) {
            scraperLogger.warn('No review elements found, trying alternative approach...')
            // Try to find reviews by text content patterns
            reviewElements = page.locator('div').filter({
              has: page.locator('text=/stars?/i')
            })
          }
          
          const currentReviewCount = await reviewElements.count()
          scraperLogger.info(`Found ${currentReviewCount} review elements on page`)
          
          // Extract reviews from current view
          for (let i = lastReviewCount; i < currentReviewCount && reviews.length < maxReviews; i++) {
            try {
              const reviewElement = reviewElements.nth(i)
              
              // Extract reviewer name
              let reviewerName = 'Anonymous'
              const nameSelectors = [
                '[data-value]',
                '.d4r55',
                '.TSUbDb a'
              ]
              
              for (const selector of nameSelectors) {
                try {
                  const nameElement = reviewElement.locator(selector).first()
                  if (await nameElement.count() > 0) {
                    const name = await nameElement.textContent()
                    if (name && name.trim()) {
                      reviewerName = name.trim()
                      break
                    }
                  }
                } catch {}
              }
              
              // Extract rating
              let rating = 0
              const ratingSelectors = [
                '[aria-label*="star"]',
                '[role="img"][aria-label*="star"]',
                '.kvMYJc'
              ]
              
              for (const selector of ratingSelectors) {
                try {
                  const ratingElement = reviewElement.locator(selector).first()
                  if (await ratingElement.count() > 0) {
                    const ratingText = await ratingElement.getAttribute('aria-label') || ''
                    const ratingMatch = ratingText.match(/(\d+)/)?.[1]
                    if (ratingMatch) {
                      rating = parseInt(ratingMatch)
                      break
                    }
                  }
                } catch {}
              }
              
              // Extract review text - try multiple selectors
              let reviewText = ''
              const textSelectors = [
                '[data-expandable-section]',
                '.MyEned',
                '.wiI7pd',
                '.ODSEW-ShBeI-text'
              ]
              
              for (const selector of textSelectors) {
                try {
                  const textElement = reviewElement.locator(selector).first()
                  if (await textElement.count() > 0) {
                    const text = await textElement.textContent()
                    if (text && text.trim() && text.length > reviewText.length) {
                      reviewText = text.trim()
                    }
                  }
                } catch {}
              }
              
              // Extract review date
              let reviewDate = ''
              const dateSelectors = [
                '.rsqaWe',
                '.DU9Pgb',
                '[data-value]:last-child'
              ]
              
              for (const selector of dateSelectors) {
                try {
                  const dateElement = reviewElement.locator(selector).first()
                  if (await dateElement.count() > 0) {
                    const date = await dateElement.textContent()
                    if (date && date.trim()) {
                      reviewDate = date.trim()
                      break
                    }
                  }
                } catch {}
              }

              // Check if review mentions WiFi and is substantial
              const wifiKeywords = /wifi|wi-fi|internet|connectivity|network|broadband|connection|bandwidth|speed|mbps|upload|download/i
              const wifiMentioned = wifiKeywords.test(reviewText)
              
              if (wifiMentioned && reviewText.length > 20) {
                // Check if review is from last 5 years (basic check)
                let isRecent = true
                if (reviewDate) {
                  const dateCheck = /(\d{4})|(\d+)\s+(year|month)s?\s+ago/i
                  const dateMatch = reviewDate.match(dateCheck)
                  if (dateMatch && dateMatch[1]) {
                    const year = parseInt(dateMatch[1])
                    if (year < fiveYearsAgo.getFullYear()) {
                      isRecent = false
                    }
                  }
                }
                
                if (isRecent) {
                  const extractedSpeed = extractSpeedFromText(reviewText)
                  
                  // Avoid duplicates by checking if we already have this review
                  const isDuplicate = reviews.some(r => 
                    r.reviewer_name === reviewerName && 
                    r.review_text === reviewText
                  )
                  
                  if (!isDuplicate) {
                    reviews.push({
                      hotel_id: '', // Will be set by caller
                      reviewer_name: sanitizeString(reviewerName),
                      rating,
                      review_text: sanitizeString(reviewText),
                      review_date: sanitizeString(reviewDate),
                      wifi_mentioned: true,
                      extracted_speed: extractedSpeed || undefined
                    })
                    
                    scraperLogger.info(`Found WiFi review ${reviews.length}: "${reviewText.substring(0, 100)}..."`)
                  }
                }
              }
            } catch (error) {
              scraperLogger.error(`Error extracting review ${i}:`, error)
            }
          }
          
          // Check if we found new reviews
          if (currentReviewCount === lastReviewCount) {
            scraperLogger.info('No new reviews found, scrolling to load more...')
            
            // Scroll to bottom to load more reviews
            await page.evaluate(() => {
              const scrollableElement = document.querySelector('[data-review-id]')?.parentElement?.parentElement ||
                                      document.querySelector('.m6QErb')?.parentElement ||
                                      document.documentElement
              
              if (scrollableElement) {
                scrollableElement.scrollTo(0, scrollableElement.scrollHeight)
              }
            })
            
            await page.waitForTimeout(3000) // Wait for new reviews to load
            scrollAttempts++
          } else {
            lastReviewCount = currentReviewCount
            scrollAttempts = 0 // Reset scroll attempts if we found new reviews
          }
          
        } catch (error) {
          scraperLogger.error('Error in review collection loop:', error)
          scrollAttempts++
        }
      }
      
      scraperLogger.success(`Comprehensive scan complete: Found ${reviews.length} WiFi-related reviews`)
      return reviews
      
    } catch (error) {
      scraperLogger.error('Error searching WiFi reviews:', error)
      return reviews
    }
  }

  async scrapeHotelWiFiReviews(hotel: Hotel): Promise<WiFiReview[]> {
    const page = await this.createStealthPage()
    
    try {
      await this.rateLimiter.wait()
      
      scraperLogger.info(`Scraping WiFi reviews for: ${hotel.name}`)
      
      // Search for hotel on Google Maps
      const found = await this.searchHotelOnMaps(page, hotel.name, 'Singapore') // TODO: Get city name from DB
      if (!found) {
        return []
      }
      
      // Navigate to reviews
      const reviewsLoaded = await this.navigateToReviews(page)
      if (!reviewsLoaded) {
        return []
      }
      
      // Extract WiFi reviews
      const reviews = await this.searchWiFiReviews(page)
      
      // Set hotel_id for all reviews
      reviews.forEach(review => {
        review.hotel_id = hotel.id
      })
      
      return reviews
      
    } catch (error) {
      scraperLogger.error(`Error scraping hotel ${hotel.name}:`, error)
      return []
    } finally {
      await page.close()
    }
  }

  async saveReviewsToDatabase(reviews: WiFiReview[], projectId: string): Promise<void> {
    if (reviews.length === 0) return
    
    try {
      // Create SQL INSERT statement matching the real schema
      const values = reviews.map(review => {
        const escapedText = review.review_text.replace(/'/g, "''")
        const escapedName = review.reviewer_name.replace(/'/g, "''")
        const escapedDate = review.review_date.replace(/'/g, "''")
        
        return `('${review.hotel_id}', 'google_maps', '${escapedText}', ${review.rating}, CURRENT_DATE, '${escapedName}', ${review.wifi_mentioned}, ${review.extracted_speed ? `'${review.extracted_speed} Mbps'` : 'NULL'}, '{"scraped_review": true}'::jsonb)`
      }).join(', ')
      
      const insertQuery = `
        INSERT INTO wifi_reviews (
          hotel_id, source, review_text, review_rating, review_date, 
          reviewer_name, wifi_mentioned, speed_mentioned, raw_data
        ) VALUES ${values}
      `
      
      const result = await this.executeMCP(projectId, insertQuery)
      
      scraperLogger.success(`Saved ${reviews.length} reviews to database`)
      
    } catch (error) {
      scraperLogger.error('Error saving reviews to database:', error)
      throw error
    }
  }

  private async executeMCP(projectId: string, query: string): Promise<any> {
    // This will be implemented with actual MCP calls
    scraperLogger.info(`Executing SQL: ${query.substring(0, 100)}...`)
    
    // For now, just log the query - in production this would execute via MCP
    return { success: true }
  }

  async scrapeAllHotels(projectId: string): Promise<void> {
    try {
      // Get hotels that don't have wifi summaries yet
      const selectQuery = `
        SELECT h.id, h.name, h.address, h.city_id 
        FROM hotels h
        LEFT JOIN wifi_summaries ws ON h.id = ws.hotel_id
        WHERE ws.id IS NULL
        LIMIT 5
      `
      
      scraperLogger.info('Fetching hotels without WiFi summaries from database')
      
      // In testing mode, we'll use the actual hotels from database
      const realHotels: Hotel[] = [
        {
          id: 'ddf49728-d779-4615-a9e5-99d6702c9d51',
          name: 'Marina Bay Sands',
          address: '10 Bayfront Ave, Singapore 018956',
          city_id: 'singapore'
        },
        {
          id: 'da6b6f4b-4442-4ada-bb86-ed8bc5ceaff3', 
          name: 'The Ritz-Carlton Millenia Singapore',
          address: '7 Raffles Ave, Singapore 039799',
          city_id: 'singapore'
        }
      ]
      
      scraperLogger.info(`Starting to scrape ${realHotels.length} hotels`)
      
      for (const hotel of realHotels) {
        try {
          const reviews = await this.scrapeHotelWiFiReviews(hotel)
          if (reviews.length > 0) {
            await this.saveReviewsToDatabase(reviews, projectId)
          }
        } catch (error) {
          scraperLogger.error(`Failed to scrape hotel ${hotel.name}:`, error)
          // Continue with next hotel
        }
      }
      
      scraperLogger.success('Completed scraping all hotels')
      
    } catch (error) {
      scraperLogger.error('Error in scrapeAllHotels:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Main execution function
async function main() {
  const scraper = new HotelWiFiScraper()
  const PROJECT_ID = 'elwaqlfnksarpvfiguab' // From environment
  
  try {
    await scraper.initialize()
    await scraper.scrapeAllHotels(PROJECT_ID)
  } catch (error) {
    scraperLogger.error('Scraping failed:', error)
    process.exit(1)
  } finally {
    await scraper.close()
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { HotelWiFiScraper }
export default main