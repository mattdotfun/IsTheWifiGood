#!/usr/bin/env tsx

/**
 * Test Enhanced Hotel WiFi Reviews Scraper
 * 
 * This script tests the enhanced scraper to see how many WiFi reviews 
 * we can extract from Marina Bay Sands for comparison.
 */

import { chromium, Browser, Page } from 'playwright'
import { scraperLogger } from '../src/lib/logger'
import { RateLimiter, sanitizeString, extractSpeedFromText } from '../src/lib/utils'

interface WiFiReview {
  hotel_id: string
  reviewer_name: string
  rating: number
  review_text: string
  review_date: string
  wifi_mentioned: boolean
  extracted_speed?: number
}

class TestScraper {
  private browser: Browser | null = null
  private rateLimiter: RateLimiter
  
  constructor(minDelaySeconds = 5) {
    this.rateLimiter = new RateLimiter(minDelaySeconds)
  }

  async initialize(): Promise<void> {
    scraperLogger.info('Initializing browser for test')
    
    this.browser = await chromium.launch({
      headless: false, // Set to visible for testing
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
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

    return page
  }

  async searchWiFiReviews(page: Page): Promise<WiFiReview[]> {
    const reviews: WiFiReview[] = []
    const maxReviews = 100 // Test limit
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
      const maxScrollAttempts = 10
      
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
              
              // Extract review text
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

              // Check if review mentions WiFi
              const wifiKeywords = /wifi|wi-fi|internet|connectivity|network|broadband|connection|bandwidth|speed|mbps|upload|download/i
              const wifiMentioned = wifiKeywords.test(reviewText)
              
              if (wifiMentioned && reviewText.length > 20) {
                const extractedSpeed = extractSpeedFromText(reviewText)
                
                // Avoid duplicates
                const isDuplicate = reviews.some(r => 
                  r.reviewer_name === reviewerName && 
                  r.review_text === reviewText
                )
                
                if (!isDuplicate) {
                  reviews.push({
                    hotel_id: 'test',
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
            } catch (error) {
              scraperLogger.error(`Error extracting review ${i}:`, error)
            }
          }
          
          // Check if we found new reviews
          if (currentReviewCount === lastReviewCount) {
            scraperLogger.info('No new reviews found, scrolling to load more...')
            
            // Scroll to load more reviews
            await page.evaluate(() => {
              window.scrollTo(0, document.body.scrollHeight)
            })
            
            await page.waitForTimeout(3000)
            scrollAttempts++
          } else {
            lastReviewCount = currentReviewCount
            scrollAttempts = 0
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

  async testMarinaBAySands(): Promise<WiFiReview[]> {
    const page = await this.createStealthPage()
    
    try {
      await this.rateLimiter.wait()
      
      scraperLogger.info('Navigating to Marina Bay Sands on Google Maps')
      
      await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle' })
      
      // Search for Marina Bay Sands
      await page.waitForSelector('input[data-value="Search"]', { timeout: 10000 })
      await page.fill('input[data-value="Search"]', 'Marina Bay Sands Singapore hotel')
      await page.press('input[data-value="Search"]', 'Enter')
      
      await page.waitForTimeout(3000)
      
      // Click on Marina Bay Sands result
      const hotelLink = page.locator('a:has-text("Marina Bay Sands")')
      if (await hotelLink.count() > 0) {
        await hotelLink.first().click()
        await page.waitForTimeout(2000)
      }
      
      // Navigate to reviews
      const reviewsTab = page.locator('button:has-text("Reviews")')
      if (await reviewsTab.count() > 0) {
        await reviewsTab.click()
        await page.waitForTimeout(2000)
      }
      
      // Extract WiFi reviews
      const reviews = await this.searchWiFiReviews(page)
      return reviews
      
    } finally {
      await page.close()
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

async function testEnhancedScraper() {
  const scraper = new TestScraper(3) // 3 second delay for testing
  
  try {
    await scraper.initialize()
    
    scraperLogger.info('Testing enhanced scraper with Marina Bay Sands')
    const reviews = await scraper.testMarinaBAySands()
    
    scraperLogger.success(`Enhanced scraper found ${reviews.length} WiFi reviews`)
    
    // Show sample reviews
    reviews.slice(0, 5).forEach((review, i) => {
      console.log(`\n--- Review ${i + 1} ---`)
      console.log(`Reviewer: ${review.reviewer_name}`)
      console.log(`Rating: ${review.rating}/5`)
      console.log(`Date: ${review.review_date}`)
      console.log(`Speed: ${review.extracted_speed ? `${review.extracted_speed} Mbps` : 'Not specified'}`)
      console.log(`Text: ${review.review_text.substring(0, 200)}...`)
    })
    
    // Count reviews with speed info
    const reviewsWithSpeed = reviews.filter(r => r.extracted_speed)
    scraperLogger.info(`Reviews with speed information: ${reviewsWithSpeed.length}/${reviews.length}`)
    
  } catch (error) {
    scraperLogger.error('Test failed:', error)
  } finally {
    await scraper.close()
  }
}

// Run test
testEnhancedScraper().catch(console.error)