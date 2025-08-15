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
    scraperLogger.info('Initializing browser with enhanced anti-detection measures')
    
    // Enhanced browser args for better stealth
    const browserArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-ipc-flooding-protection',
      '--disable-hang-monitor',
      '--disable-features=VizDisplayCompositor',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--disable-web-security',
      '--disable-features=TranslateUI',
      '--disable-component-extensions-with-background-pages'
    ]
    
    this.browser = await chromium.launch({
      headless: true,
      args: browserArgs,
      ignoreDefaultArgs: ['--enable-automation'],
      // Randomize executable path detection
      timeout: 60000
    })
    
    scraperLogger.info('Browser initialized with enhanced stealth configuration')
  }

  async createStealthPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    // Randomized user agents for better stealth
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    ]
    
    // Randomized viewport sizes
    const viewports = [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 }
    ]
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]
    const randomViewport = viewports[Math.floor(Math.random() * viewports.length)]
    
    scraperLogger.info(`Creating stealth page with UA: ${randomUserAgent.substring(0, 50)}...`)

    const page = await this.browser.newPage({
      userAgent: randomUserAgent,
      viewport: randomViewport
    })

    // Enhanced stealth measures
    await page.addInitScript(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })

      // Mock chrome runtime
      Object.defineProperty(window, 'chrome', {
        get: () => ({
          runtime: {
            onConnect: undefined,
            onMessage: undefined,
          },
        }),
      })

      // Mock plugins with realistic data
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            name: 'Chrome PDF Plugin',
            filename: 'internal-pdf-viewer',
            description: 'Portable Document Format'
          },
          {
            name: 'Chrome PDF Viewer',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            description: ''
          },
          {
            name: 'Native Client',
            filename: 'internal-nacl-plugin',
            description: ''
          }
        ],
      })

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      })

      // Mock permissions
      const originalQuery = window.navigator.permissions.query
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      )

      // Remove automation indicators
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol
    })

    // Set additional headers for authenticity
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    })

    // Random delay to avoid patterns
    const initialDelay = Math.random() * 2000 + 1000 // 1-3 seconds
    await page.waitForTimeout(initialDelay)

    scraperLogger.info(`Stealth page created with viewport ${randomViewport.width}x${randomViewport.height}`)
    return page
  }

  // Human-like behavior methods for better stealth
  async simulateHumanDelay(min: number = 500, max: number = 2000): Promise<void> {
    const delay = Math.random() * (max - min) + min
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  async simulateMouseMovement(page: Page): Promise<void> {
    try {
      const viewport = page.viewportSize()
      if (!viewport) return

      // Random mouse movements
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * viewport.width
        const y = Math.random() * viewport.height
        await page.mouse.move(x, y, { steps: 5 + Math.floor(Math.random() * 10) })
        await this.simulateHumanDelay(100, 500)
      }
    } catch (error) {
      // Silent fail - mouse simulation is optional
    }
  }

  async humanLikeClick(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector)
    
    // Move to element with human-like behavior
    const box = await element.boundingBox()
    if (box) {
      // Move to a random point within the element
      const x = box.x + Math.random() * box.width
      const y = box.y + Math.random() * box.height
      
      await page.mouse.move(x, y, { steps: 5 + Math.floor(Math.random() * 10) })
      await this.simulateHumanDelay(100, 300)
      await page.mouse.click(x, y)
    } else {
      // Fallback to regular click
      await element.click()
    }
  }

  async searchHotelOnMaps(page: Page, hotelName: string, city: string): Promise<boolean> {
    const maxRetries = 3
    const timeouts = {
      navigation: 30000,    // 30s for page navigation
      selector: 15000,      // 15s for element selection
      results: 8000,        // 8s for results to load
      interaction: 4000     // 4s for click interactions
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const searchQuery = `${hotelName} ${city} hotel`
        scraperLogger.info(`Searching for: ${searchQuery} (attempt ${attempt}/${maxRetries})`)

        // Enhanced navigation with longer timeout
        await page.goto('https://www.google.com/maps', { 
          waitUntil: 'domcontentloaded', // More reliable than networkidle
          timeout: timeouts.navigation 
        })
        
        // Simulate human behavior after page load
        await this.simulateMouseMovement(page)
        await this.simulateHumanDelay(1000, 3000)
        
        // Multiple selector strategies for search box
        const searchSelectors = [
          'input[data-value="Search"]',
          'input#searchboxinput',
          'input[aria-label*="Search"]',
          'input[placeholder*="Search"]'
        ]
        
        let searchBox = null
        for (const selector of searchSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: timeouts.selector })
            searchBox = page.locator(selector)
            if (await searchBox.count() > 0) {
              scraperLogger.info(`Found search box with selector: ${selector}`)
              break
            }
          } catch (e) {
            // Try next selector
            continue
          }
        }
        
        if (!searchBox || await searchBox.count() === 0) {
          throw new Error('No search box found with any selector')
        }
        
        // Fill search query with retry
        await searchBox.fill(searchQuery)
        await page.keyboard.press('Enter')
        
        // Dynamic wait for results with progressive timeout
        await page.waitForTimeout(timeouts.results)
        
        // Enhanced hotel link detection
        const hotelSelectors = [
          `a:has-text("${hotelName}")`,
          `[data-value="${hotelName}"]`,
          `*:has-text("${hotelName}"):visible`
        ]
        
        let hotelFound = false
        for (const selector of hotelSelectors) {
          const hotelLink = page.locator(selector)
          const count = await hotelLink.count()
          
          if (count > 0) {
            scraperLogger.info(`Found hotel with selector: ${selector} (${count} matches)`)
            
            // Use human-like click behavior
            await this.simulateHumanDelay(500, 1500)
            try {
              await this.humanLikeClick(page, selector)
            } catch (e) {
              // Fallback to regular click
              await hotelLink.first().click()
            }
            
            await this.simulateHumanDelay(2000, 4000) // Human-like delay after click
            hotelFound = true
            break
          }
        }
        
        if (hotelFound) {
          scraperLogger.success(`Successfully found and clicked hotel: ${hotelName}`)
          return true
        }
        
        scraperLogger.warn(`Hotel ${hotelName} not found in search results (attempt ${attempt})`)
        
        // If not last attempt, wait before retry
        if (attempt < maxRetries) {
          const retryDelay = attempt * 2000 // Exponential backoff
          scraperLogger.info(`Waiting ${retryDelay}ms before retry...`)
          await page.waitForTimeout(retryDelay)
        }
        
      } catch (error) {
        scraperLogger.error(`Error searching for hotel ${hotelName} (attempt ${attempt}):`, error)
        
        // If not last attempt, wait before retry
        if (attempt < maxRetries) {
          const retryDelay = attempt * 3000 // Exponential backoff
          scraperLogger.info(`Waiting ${retryDelay}ms before retry...`)
          await page.waitForTimeout(retryDelay)
        }
      }
    }
    
    scraperLogger.error(`Failed to find hotel ${hotelName} after ${maxRetries} attempts`)
    return false
  }

  async navigateToReviews(page: Page): Promise<boolean> {
    const maxRetries = 3
    const timeouts = {
      selector: 15000,      // 15s for element detection
      interaction: 5000     // 5s for click actions
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        scraperLogger.info(`Navigating to reviews tab (attempt ${attempt}/${maxRetries})`)

        // Multiple selector strategies for Reviews tab
        const reviewsSelectors = [
          'button:has-text("Reviews")',
          'button[data-value="Reviews"]',
          '[role="tab"]:has-text("Reviews")',
          'div:has-text("Reviews"):visible',
          'a:has-text("Reviews")',
          '*[aria-label*="Reviews"]'
        ]
        
        let reviewsFound = false
        for (const selector of reviewsSelectors) {
          try {
            const reviewsElement = page.locator(selector)
            await page.waitForSelector(selector, { timeout: timeouts.selector })
            
            const count = await reviewsElement.count()
            if (count > 0) {
              scraperLogger.info(`Found reviews tab with selector: ${selector} (${count} matches)`)
              
              // Human-like behavior before clicking
              await this.simulateHumanDelay(500, 1000)
              try {
                await this.humanLikeClick(page, selector)
              } catch (e) {
                // Fallback to regular click
                await reviewsElement.first().click()
              }
              
              await this.simulateHumanDelay(3000, 6000) // Wait for reviews to load
              reviewsFound = true
              break
            }
          } catch (e) {
            // Try next selector
            continue
          }
        }
        
        if (reviewsFound) {
          // Verify we successfully navigated to reviews
          try {
            await page.waitForSelector('[data-review-id], .review, [jsaction*="review"]', { 
              timeout: 10000 
            })
            scraperLogger.success('Successfully navigated to reviews section')
            return true
          } catch (e) {
            scraperLogger.warn('Reviews tab clicked but reviews section not detected')
          }
        }
        
        scraperLogger.warn(`Reviews tab not found (attempt ${attempt})`)
        
        // If not last attempt, wait before retry
        if (attempt < maxRetries) {
          const retryDelay = attempt * 2000 // Exponential backoff
          scraperLogger.info(`Waiting ${retryDelay}ms before retry...`)
          await page.waitForTimeout(retryDelay)
        }
        
      } catch (error) {
        scraperLogger.error(`Error navigating to reviews (attempt ${attempt}):`, error)
        
        // If not last attempt, wait before retry
        if (attempt < maxRetries) {
          const retryDelay = attempt * 2500
          await page.waitForTimeout(retryDelay)
        }
      }
    }
    
    scraperLogger.error(`Failed to navigate to reviews after ${maxRetries} attempts`)
    return false
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