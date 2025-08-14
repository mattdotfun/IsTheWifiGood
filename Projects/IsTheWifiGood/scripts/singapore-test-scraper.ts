#!/usr/bin/env tsx

/**
 * Singapore Hotel Test Scraper
 * 
 * Phase 2: Small-scale test with 2 Singapore hotels
 * Tests the complete pipeline: Scraping → AI Processing → Results
 */

// Load environment variables
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.join(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = envContent.split('\n').filter(line => line.includes('='))
  
  envVars.forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
} catch (e) {
  console.log('Could not load .env.local file')
}

import { chromium, Browser, Page } from 'playwright'
import { WiFiReviewProcessor } from './ai-processor'
import { scraperLogger, aiLogger, dbLogger } from '../src/lib/logger'
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

interface Hotel {
  id: string
  name: string
  address: string
  city: string
}

class SingaporeTestScraper {
  private browser: Browser | null = null
  private aiProcessor: WiFiReviewProcessor
  private rateLimiter: RateLimiter
  
  constructor() {
    this.aiProcessor = new WiFiReviewProcessor()
    this.rateLimiter = new RateLimiter(8) // 8 second delays
  }

  async initialize(): Promise<void> {
    scraperLogger.info('🚀 Initializing Singapore Test Scraper')
    
    this.browser = await chromium.launch({
      headless: true, // Start with headless for faster testing
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    })
    
    scraperLogger.success('Browser initialized ✅')
  }

  async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    return page
  }

  async scrapeHotelReviews(hotel: Hotel): Promise<WiFiReview[]> {
    const page = await this.createPage()
    const reviews: WiFiReview[] = []
    
    try {
      await this.rateLimiter.wait()
      
      scraperLogger.info(`🏨 Scraping: ${hotel.name}`)
      
      // Navigate to Google Maps
      await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle' })
      
      // Search for hotel
      const searchQuery = `${hotel.name} Singapore hotel`
      scraperLogger.info(`🔍 Searching: ${searchQuery}`)
      
      await page.waitForSelector('input[data-value="Search"]', { timeout: 10000 })
      await page.fill('input[data-value="Search"]', searchQuery)
      await page.press('input[data-value="Search"]', 'Enter')
      
      await page.waitForTimeout(3000)
      
      // Click on hotel result
      const hotelLink = page.locator(`a:has-text("${hotel.name}")`).first()
      if (await hotelLink.count() > 0) {
        await hotelLink.click()
        await page.waitForTimeout(2000)
        
        // Navigate to reviews
        const reviewsButton = page.locator('button:has-text("Reviews")').first()
        if (await reviewsButton.count() > 0) {
          await reviewsButton.click()
          await page.waitForTimeout(2000)
          
          // Search for WiFi reviews
          await this.searchAndExtractWiFiReviews(page, hotel.id, reviews)
        }
      } else {
        scraperLogger.warn(`❌ Hotel not found: ${hotel.name}`)
      }
      
    } catch (error) {
      scraperLogger.error(`Error scraping ${hotel.name}:`, error)
    } finally {
      await page.close()
    }
    
    scraperLogger.success(`📊 Found ${reviews.length} WiFi reviews for ${hotel.name}`)
    return reviews
  }

  async searchAndExtractWiFiReviews(page: Page, hotelId: string, reviews: WiFiReview[]): Promise<void> {
    try {
      // Try searching for "wifi" in reviews
      const searchBox = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]').first()
      if (await searchBox.count() > 0) {
        await searchBox.fill('wifi')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(3000)
        scraperLogger.info('🔍 Searched for WiFi in reviews')
      }

      // Scroll and extract reviews
      let scrollAttempts = 0
      const maxScrollAttempts = 5 // Limited for testing
      
      while (scrollAttempts < maxScrollAttempts && reviews.length < 50) {
        const reviewElements = page.locator('[data-review-id], [jsaction*="review"]')
        const currentCount = await reviewElements.count()
        
        scraperLogger.info(`📄 Processing ${currentCount} review elements...`)
        
        for (let i = 0; i < Math.min(currentCount, 20); i++) {
          try {
            const reviewElement = reviewElements.nth(i)
            
            // Extract review data
            const reviewerName = await this.extractText(reviewElement, [
              '[data-value]', '.d4r55', '.TSUbDb a'
            ]) || 'Anonymous'
            
            const rating = await this.extractRating(reviewElement) || 0
            
            const reviewText = await this.extractText(reviewElement, [
              '[data-expandable-section]', '.MyEned', '.wiI7pd'
            ]) || ''
            
            const reviewDate = await this.extractText(reviewElement, [
              '.rsqaWe', '.DU9Pgb'
            ]) || ''

            // Check for WiFi mentions
            const wifiKeywords = /wifi|wi-fi|internet|connectivity|network|broadband|connection|bandwidth|speed|mbps/i
            const wifiMentioned = wifiKeywords.test(reviewText)
            
            if (wifiMentioned && reviewText.length > 20) {
              const extractedSpeed = extractSpeedFromText(reviewText)
              
              reviews.push({
                hotel_id: hotelId,
                reviewer_name: sanitizeString(reviewerName),
                rating,
                review_text: sanitizeString(reviewText),
                review_date: sanitizeString(reviewDate),
                wifi_mentioned: true,
                extracted_speed: extractedSpeed || undefined
              })
              
              if (reviews.length <= 5) {
                scraperLogger.info(`📝 WiFi Review ${reviews.length}: "${reviewText.substring(0, 80)}..."`)
              }
            }
          } catch (error) {
            // Continue with next review
          }
        }
        
        // Scroll to load more
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(2000)
        scrollAttempts++
      }
      
    } catch (error) {
      scraperLogger.error('Error extracting WiFi reviews:', error)
    }
  }

  private async extractText(element: any, selectors: string[]): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const textElement = element.locator(selector).first()
        if (await textElement.count() > 0) {
          const text = await textElement.textContent()
          if (text && text.trim()) {
            return text.trim()
          }
        }
      } catch {}
    }
    return null
  }

  private async extractRating(element: any): Promise<number | null> {
    try {
      const ratingElement = element.locator('[aria-label*="star"]').first()
      if (await ratingElement.count() > 0) {
        const ratingText = await ratingElement.getAttribute('aria-label') || ''
        const ratingMatch = ratingText.match(/(\\d+)/)?.[1]
        return ratingMatch ? parseInt(ratingMatch) : null
      }
    } catch {}
    return null
  }

  async runTest(): Promise<void> {
    const testHotels: Hotel[] = [
      {
        id: 'ddf49728-d779-4615-a9e5-99d6702c9d51',
        name: 'Marina Bay Sands',
        address: '10 Bayfront Ave, Singapore 018956',
        city: 'Singapore'
      },
      {
        id: 'da6b6f4b-4442-4ada-bb86-ed8bc5ceaff3',
        name: 'The Ritz-Carlton Millenia Singapore',
        address: '7 Raffles Ave, Singapore 039799', 
        city: 'Singapore'
      }
    ]

    const allResults: { hotel: Hotel, reviews: WiFiReview[], summary?: any }[] = []

    scraperLogger.info(`🎯 Starting Phase 2 test with ${testHotels.length} Singapore hotels`)
    
    // Scrape reviews
    for (const hotel of testHotels) {
      const reviews = await this.scrapeHotelReviews(hotel)
      allResults.push({ hotel, reviews })
    }
    
    // Process with AI
    aiLogger.info('🤖 Processing reviews with AI...')
    
    for (const result of allResults) {
      if (result.reviews.length > 0) {
        const summary = await this.aiProcessor.processReviews(result.hotel.name, result.reviews)
        result.summary = summary
      }
    }
    
    // Display results
    this.displayResults(allResults)
  }

  private displayResults(results: any[]): void {
    console.log('\\n' + '='.repeat(60))
    console.log('🏨 SINGAPORE HOTEL WiFi TEST RESULTS')
    console.log('='.repeat(60))
    
    results.forEach((result, i) => {
      console.log(`\\n--- ${i + 1}. ${result.hotel.name} ---`)
      console.log(`📊 Reviews Collected: ${result.reviews.length}`)
      
      if (result.summary) {
        console.log(`⭐ Overall Score: ${result.summary.overall_score}/5`)
        console.log(`📝 Summary: ${result.summary.summary}`)
        
        console.log('\\n✅ Highlights:')
        result.summary.positive_highlights.forEach(h => console.log(`  • ${h}`))
        
        if (result.summary.warnings.length > 0) {
          console.log('\\n⚠️ Warnings:')
          result.summary.warnings.forEach(w => console.log(`  • ${w}`))
        }
        
        const speeds = result.reviews.filter(r => r.extracted_speed)
        if (speeds.length > 0) {
          console.log(`\\n🚀 Speed Data: ${speeds.map(s => s.extracted_speed + ' Mbps').join(', ')}`)
        }
      }
    })
    
    // Cost summary
    const costSummary = this.aiProcessor.getCostSummary()
    console.log('\\n' + '='.repeat(60))
    console.log('💰 COST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Cost: $${costSummary.totalCost.toFixed(4)}`)
    console.log(`Hotels Processed: ${results.length}`)
    console.log(`Total Reviews: ${results.reduce((sum, r) => sum + r.reviews.length, 0)}`)
    console.log(`Average Cost per Hotel: $${(costSummary.totalCost / results.length).toFixed(4)}`)
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Main execution
async function main() {
  const scraper = new SingaporeTestScraper()
  
  try {
    await scraper.initialize()
    await scraper.runTest()
  } catch (error) {
    scraperLogger.error('Test failed:', error)
  } finally {
    await scraper.close()
  }
}

main().catch(console.error)