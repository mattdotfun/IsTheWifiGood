#!/usr/bin/env tsx

/**
 * Test Enhanced Scraper with Network Improvements
 * 
 * This script tests the enhanced scraper with:
 * - Enhanced timeout handling
 * - Anti-detection measures  
 * - Robust navigation logic
 * - Human-like behavior simulation
 */

import { HotelWiFiScraper } from './scraper'
import { scraperLogger } from '../src/lib/logger'

// Test hotel from Singapore
const testHotel = {
  id: 'test-marina-bay-sands',
  name: 'Marina Bay Sands',
  address: '10 Bayfront Avenue, Singapore',
  city_id: 'singapore'
}

async function testEnhancedScraper() {
  let scraper: HotelWiFiScraper | null = null
  
  try {
    console.log('🧪 Testing Enhanced Hotel WiFi Scraper')
    console.log('=====================================')
    console.log(`Hotel: ${testHotel.name}`)
    console.log(`Address: ${testHotel.address}`)
    
    // Initialize scraper with enhanced settings
    console.log('\n🚀 Step 1: Initializing enhanced scraper...')
    scraper = new HotelWiFiScraper(10) // 10 second rate limit
    await scraper.initialize()
    
    console.log('✅ Scraper initialized with enhanced anti-detection')
    
    // Test scraping
    console.log('\n📊 Step 2: Testing WiFi review scraping...')
    console.log('This will test:')
    console.log('  - Enhanced timeout handling (30s navigation, 15s selectors)')
    console.log('  - Multiple selector fallback strategies')
    console.log('  - Anti-bot detection evasion')
    console.log('  - Human-like mouse movement and clicking')
    console.log('  - Randomized user agents and viewports')
    
    const startTime = Date.now()
    
    // Attempt to scrape reviews
    const reviews = await scraper.scrapeHotelWiFiReviews(testHotel)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('\n📋 Test Results:')
    console.log(`  Duration: ${duration.toFixed(1)} seconds`)
    console.log(`  Reviews collected: ${reviews.length}`)
    
    if (reviews.length > 0) {
      console.log('\n✅ SUCCESS: Enhanced scraper working!')
      
      // Show sample reviews
      console.log('\n📝 Sample WiFi Reviews Found:')
      reviews.slice(0, 3).forEach((review, i) => {
        console.log(`  ${i + 1}. ${review.reviewer_name} (${review.rating}/5):`)
        console.log(`     "${review.review_text.substring(0, 100)}..."`)
        if (review.extracted_speed) {
          console.log(`     Speed mentioned: ${review.extracted_speed} Mbps`)
        }
      })
      
      // Analyze review quality
      const wifiReviews = reviews.filter(r => r.wifi_mentioned)
      const speedMentions = reviews.filter(r => r.extracted_speed).length
      
      console.log('\n📊 Review Quality Analysis:')
      console.log(`  Total reviews: ${reviews.length}`)
      console.log(`  WiFi mentions: ${wifiReviews.length} (${((wifiReviews.length / reviews.length) * 100).toFixed(1)}%)`)
      console.log(`  Speed mentions: ${speedMentions} (${((speedMentions / reviews.length) * 100).toFixed(1)}%)`)
      
      if (wifiReviews.length >= 10) {
        console.log('  ✅ Sufficient WiFi data for analysis')
      } else {
        console.log('  ⚠️  Limited WiFi data - may need more reviews')
      }
      
    } else {
      console.log('\n❌ WARNING: No reviews collected')
      console.log('  Possible causes:')
      console.log('  - Network connectivity issues')
      console.log('  - Google Maps layout changes')
      console.log('  - Anti-bot detection still blocking')
      console.log('  - Hotel not found in search results')
    }
    
    console.log('\n🔧 Enhancement Summary:')
    console.log('  ✅ Enhanced timeout handling (3x retries, exponential backoff)')
    console.log('  ✅ Multiple selector fallback strategies')  
    console.log('  ✅ Advanced anti-detection (user agents, viewports, stealth)')
    console.log('  ✅ Human-like behavior simulation')
    console.log('  ✅ Robust error handling and recovery')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    
    if (error.message.includes('timeout')) {
      console.log('\n🔍 Timeout Error Analysis:')
      console.log('  - Navigation timeout: Increased from 10s to 30s')
      console.log('  - Selector timeout: Increased from 5s to 15s')
      console.log('  - Result loading: Increased from 3s to 8s')
      console.log('  - Multiple retry attempts with exponential backoff')
    }
    
    if (error.message.includes('selector')) {
      console.log('\n🔍 Selector Error Analysis:')
      console.log('  - Multiple selector strategies implemented')
      console.log('  - Fallback selectors for search box, reviews tab, hotel links')
      console.log('  - Dynamic element detection with retries')
    }
    
  } finally {
    // Cleanup
    if (scraper) {
      try {
        await scraper.cleanup()
        console.log('\n🧹 Scraper cleanup completed')
      } catch (e) {
        console.log('\n⚠️  Cleanup warning:', e.message)
      }
    }
  }
}

// Run test
testEnhancedScraper().catch(console.error)