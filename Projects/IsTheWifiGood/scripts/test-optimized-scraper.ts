#!/usr/bin/env tsx

/**
 * Test Optimized WiFi Review Scraper
 * 
 * Tests the optimized scraper that targets 40-50 WiFi reviews per hotel
 * with text pre-filtering and smart early stopping.
 */

import { OptimizedHotelWiFiScraper } from './optimized-scraper'
import { scraperLogger } from '../src/lib/logger'

// Test hotel: Marina Bay Sands
const testHotel = {
  id: 'ddf49728-d779-4615-a9e5-99d6702c9d51',
  name: 'Marina Bay Sands',
  address: '10 Bayfront Avenue, Singapore',
  city_id: 'singapore'
}

async function testOptimizedScraper() {
  let scraper: OptimizedHotelWiFiScraper | null = null
  
  try {
    console.log('🚀 Testing OPTIMIZED WiFi Review Scraper')
    console.log('==========================================')
    console.log(`Hotel: ${testHotel.name}`)
    console.log(`Target: 40-50 high-quality WiFi reviews`)
    console.log(`Key optimizations:`)
    console.log(`  • Text pre-filtering before data extraction`)
    console.log(`  • Smart early stopping at 50 reviews`)
    console.log(`  • Quality threshold (>50 characters)`)
    console.log(`  • Enhanced 5-year date filtering`)
    console.log('')
    
    // Initialize optimized scraper
    console.log('🔧 Initializing optimized scraper...')
    scraper = new OptimizedHotelWiFiScraper(6) // 6-12s adaptive rate limiting
    await scraper.initialize()
    
    console.log('✅ Optimized scraper initialized successfully')
    console.log('')
    
    // Test optimized collection
    console.log('⚡ Starting optimized WiFi review collection...')
    const startTime = Date.now()
    
    const reviews = await scraper.scrapeHotelWiFiReviews(testHotel)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('')
    console.log('🏆 OPTIMIZED COLLECTION RESULTS')
    console.log('================================')
    console.log(`⏱️  Duration: ${duration.toFixed(1)} seconds`)
    console.log(`📝 WiFi reviews collected: ${reviews.length}`)
    
    if (reviews.length > 0) {
      // Analyze results quality
      const speedMentions = reviews.filter(r => r.extracted_speed).length
      const longReviews = reviews.filter(r => r.review_text.length > 100).length
      const recentReviews = reviews.filter(r => r.review_date.includes('ago') || r.review_date.includes('yesterday')).length
      const absoluteYearReviews = reviews.filter(r => /20\\d{2}/.test(r.review_date)).length
      
      console.log('')
      console.log('📊 Quality Analysis:')
      console.log('===================')
      console.log(`🚀 Reviews with speed data: ${speedMentions} (${((speedMentions / reviews.length) * 100).toFixed(1)}%)`)
      console.log(`📖 Detailed reviews (>100 chars): ${longReviews} (${((longReviews / reviews.length) * 100).toFixed(1)}%)`)
      console.log(`🆕 Recent format reviews: ${recentReviews}`)
      console.log(`📆 Absolute year reviews: ${absoluteYearReviews}`)
      
      if (speedMentions > 0) {
        const speeds = reviews
          .filter(r => r.extracted_speed)
          .slice(0, 5)
          .map(r => `${r.extracted_speed}Mbps`)
          .join(', ')
        console.log(`💨 Sample speeds: ${speeds}`)
      }
      
      // Show optimization statistics
      const optimizationStats = scraper.getOptimizationStats()
      console.log('')
      console.log('⚡ Optimization Performance:')
      console.log('===========================')
      console.log(`📊 Elements processed: ${optimizationStats.totalElementsProcessed}`)
      console.log(`🎯 WiFi reviews found: ${optimizationStats.wifiReviewsFound}`)
      console.log(`📈 Efficiency ratio: ${optimizationStats.efficiencyRatio.toFixed(2)}%`)
      console.log(`⏱️  Processing time: ${(optimizationStats.processingTimeMs / 1000).toFixed(1)}s`)
      console.log(`🗓️  Old reviews skipped: ${optimizationStats.oldReviewsSkipped}`)
      console.log(`📏 Low quality skipped: ${optimizationStats.lowQualitySkipped}`)
      
      // Compare to previous approach
      const previousApproachElements = 11809 // From our previous test
      const previousDuration = 18 * 60 // ~18 minutes
      const efficiencyImprovement = optimizationStats.efficiencyRatio / 0.5 // vs ~0.5% baseline
      const speedImprovement = previousDuration / (optimizationStats.processingTimeMs / 1000)
      
      console.log('')
      console.log('🚀 Improvement vs Previous Approach:')
      console.log('====================================')
      console.log(`📊 Elements: ${optimizationStats.totalElementsProcessed} vs ${previousApproachElements} (${((optimizationStats.totalElementsProcessed / previousApproachElements) * 100).toFixed(1)}%)`)
      console.log(`⚡ Efficiency: ${efficiencyImprovement.toFixed(1)}x better`)
      console.log(`🏃 Speed: ${speedImprovement.toFixed(1)}x faster`)
      console.log(`🎯 Target achievement: ${reviews.length >= 40 ? '✅ SUCCESS' : reviews.length >= 30 ? '🔶 GOOD' : '⚠️ PARTIAL'}`)
      
      if (reviews.length >= 40) {
        console.log('')
        console.log('🎉 OPTIMIZATION SUCCESS!')
        console.log('========================')
        console.log(`✅ Achieved target: ${reviews.length}/50 WiFi reviews`)
        console.log(`⚡ Massive efficiency gain: ${efficiencyImprovement.toFixed(1)}x improvement`)
        console.log(`🚀 Speed improvement: ${speedImprovement.toFixed(1)}x faster`)
        console.log(`📊 Ready for 30-hotel Singapore collection`)
        console.log('')
        console.log('🎯 Next Steps:')
        console.log('  1. Scale to all 30 Singapore hotels')
        console.log('  2. Process reviews with AI quirk detection')
        console.log('  3. Generate comprehensive dataset')
        console.log('  4. Expand to London and NYC')
      }
      
    } else {
      console.log('⚠️  No WiFi reviews collected')
      console.log('This could indicate:')
      console.log('  • Network or selector issues')
      console.log('  • Hotel may have limited WiFi mentions')
      console.log('  • All reviews may be older than 5 years')
    }
    
  } catch (error) {
    console.error('💥 Optimized test failed:', error)
  } finally {
    if (scraper) {
      await scraper.cleanup()
      console.log('')
      console.log('🧹 Optimized scraper cleanup completed')
    }
  }
}

console.log('🎯 OPTIMIZED SCRAPER TEST')
console.log('========================')
console.log('Previous approach: 11,809+ elements in 18+ minutes')
console.log('Optimized approach: Target 40-50 reviews in 3-8 minutes')
console.log('Expected efficiency: 3-7x improvement')
console.log('')

// Run optimized test
testOptimizedScraper().catch(console.error)