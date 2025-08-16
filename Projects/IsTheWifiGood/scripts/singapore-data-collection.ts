#!/usr/bin/env tsx

/**
 * Singapore Hotel Data Collection - Production Run
 * 
 * Collects WiFi reviews from all 30 Singapore business hotels using:
 * - Enhanced scraper with network timeout fixes
 * - 5-year date filtering (August 2020 - August 2025)
 * - AI quirk detection pipeline
 * - Comprehensive data validation
 */

import { HotelWiFiScraper } from './scraper'
import { WiFiReviewProcessor } from './ai-processor'
import { scraperLogger, aiLogger, dbLogger } from '../src/lib/logger'

interface Hotel {
  id: string
  name: string
  neighborhood: string
}

interface CollectionStats {
  totalHotels: number
  hotelsCrawled: number
  totalReviews: number
  successfulHotels: number
  failedHotels: string[]
  avgReviewsPerHotel: number
  timeElapsed: number
}

class SingaporeDataCollector {
  private scraper: HotelWiFiScraper
  private aiProcessor: WiFiReviewProcessor
  private stats: CollectionStats
  
  constructor() {
    this.scraper = new HotelWiFiScraper(6) // 6-12s adaptive rate limiting
    this.aiProcessor = new WiFiReviewProcessor()
    this.stats = {
      totalHotels: 0,
      hotelsCrawled: 0,
      totalReviews: 0,
      successfulHotels: 0,
      failedHotels: [],
      avgReviewsPerHotel: 0,
      timeElapsed: 0
    }
  }

  async initialize(): Promise<void> {
    scraperLogger.info('🏨 Initializing Singapore Data Collection System')
    await this.scraper.initialize()
    scraperLogger.success('✅ Enhanced scraper ready with 5-year date filtering')
  }

  // Fetch all Singapore hotels from database
  private async fetchSingaporeHotels(): Promise<Hotel[]> {
    // For now, return the list based on our database structure
    // In production, this would query the actual database
    const hotels: Hotel[] = [
      // Marina Bay (8 hotels)
      { id: 'ddf49728-d779-4615-a9e5-99d6702c9d51', name: 'Marina Bay Sands', neighborhood: 'Marina Bay' },
      { id: 'da6b6f4b-4442-4ada-bb86-ed8bc5ceaff3', name: 'The Ritz-Carlton Millenia Singapore', neighborhood: 'Marina Bay' },
      { id: 'mandarin-oriental-singapore', name: 'Mandarin Oriental Singapore', neighborhood: 'Marina Bay' },
      { id: 'fullerton-bay-hotel', name: 'Fullerton Bay Hotel', neighborhood: 'Marina Bay' },
      { id: 'pan-pacific-singapore', name: 'Pan Pacific Singapore', neighborhood: 'Marina Bay' },
      { id: 'conrad-centennial-singapore', name: 'Conrad Centennial Singapore', neighborhood: 'Marina Bay' },
      { id: 'fairmont-singapore', name: 'Fairmont Singapore', neighborhood: 'Marina Bay' },
      { id: 'swissotel-the-stamford', name: 'Swissotel The Stamford', neighborhood: 'Marina Bay' },
      
      // Orchard Road (8 hotels)
      { id: '778322e5-8a3c-478e-ac0e-fd95eb7736ec', name: 'Grand Hyatt Singapore', neighborhood: 'Orchard Road' },
      { id: 'four-seasons-singapore', name: 'Four Seasons Hotel Singapore', neighborhood: 'Orchard Road' },
      { id: 'shangri-la-singapore', name: 'Shangri-La Hotel Singapore', neighborhood: 'Orchard Road' },
      { id: 'marriott-tang-plaza', name: 'Marriott Tang Plaza Hotel', neighborhood: 'Orchard Road' },
      { id: 'st-regis-singapore', name: 'The St. Regis Singapore', neighborhood: 'Orchard Road' },
      { id: 'hilton-singapore-orchard', name: 'Hilton Singapore Orchard', neighborhood: 'Orchard Road' },
      { id: 'regent-singapore', name: 'Regent Singapore', neighborhood: 'Orchard Road' },
      { id: 'goodwood-park-hotel', name: 'Goodwood Park Hotel', neighborhood: 'Orchard Road' },
      
      // Raffles Place/CBD (10 hotels)
      { id: 'raffles-singapore', name: 'Raffles Singapore', neighborhood: 'Raffles Place' },
      { id: 'westin-singapore', name: 'The Westin Singapore', neighborhood: 'Raffles Place' },
      { id: 'intercontinental-singapore', name: 'InterContinental Singapore', neighborhood: 'Raffles Place' },
      { id: 'carlton-hotel-singapore', name: 'Carlton Hotel Singapore', neighborhood: 'Raffles Place' },
      { id: 'furama-city-centre', name: 'Furama City Centre', neighborhood: 'Raffles Place' },
      { id: 'amara-singapore', name: 'Amara Singapore', neighborhood: 'Raffles Place' },
      { id: 'crowne-plaza-changi', name: 'Crowne Plaza Changi Airport', neighborhood: 'Raffles Place' },
      { id: 'park-hotel-clarke-quay', name: 'Park Hotel Clarke Quay', neighborhood: 'Raffles Place' },
      { id: 'grand-copthorne-waterfront', name: 'Grand Copthorne Waterfront', neighborhood: 'Raffles Place' },
      { id: 'novotel-clarke-quay', name: 'Novotel Singapore Clarke Quay', neighborhood: 'Raffles Place' },
      
      // Bugis/Civic District (4 hotels)
      { id: 'hotel-fort-canning', name: 'Hotel Fort Canning', neighborhood: 'Bugis/Civic District' },
      { id: 'naumi-hotel-singapore', name: 'Naumi Hotel Singapore', neighborhood: 'Bugis/Civic District' },
      { id: 'andaz-singapore', name: 'Andaz Singapore', neighborhood: 'Bugis/Civic District' },
      { id: 'parkroyal-collection-pickering', name: 'Parkroyal Collection Pickering', neighborhood: 'Bugis/Civic District' }
    ]
    
    this.stats.totalHotels = hotels.length
    scraperLogger.info(`📊 Loaded ${hotels.length} Singapore business hotels for data collection`)
    return hotels
  }

  async collectHotelData(hotel: Hotel): Promise<boolean> {
    const startTime = Date.now()
    
    try {
      scraperLogger.info(`🏨 Starting collection: ${hotel.name} (${hotel.neighborhood})`)
      
      // Scrape WiFi reviews with enhanced 5-year filtering
      const reviews = await this.scraper.scrapeHotelWiFiReviews({
        id: hotel.id,
        name: hotel.name,
        address: '', // Will be filled during scraping
        city_id: 'singapore'
      })
      
      if (reviews.length === 0) {
        scraperLogger.warn(`⚠️  No WiFi reviews found for ${hotel.name}`)
        return false
      }
      
      this.stats.totalReviews += reviews.length
      scraperLogger.success(`📝 Collected ${reviews.length} WiFi reviews for ${hotel.name}`)
      
      // Process with AI quirk detection
      aiLogger.info(`🤖 Processing ${hotel.name} reviews with AI quirk detection...`)
      const aiSummary = await this.aiProcessor.processReviews(hotel.name, reviews)
      
      if (aiSummary) {
        aiLogger.success(`✅ AI analysis complete for ${hotel.name}: Score ${aiSummary.overall_score}/5`)
        
        // Log quirk insights
        if (aiSummary.location_quirks && aiSummary.location_quirks.length > 0) {
          aiLogger.info(`📍 Location quirks found: ${aiSummary.location_quirks.join(', ')}`)
        }
        if (aiSummary.time_patterns && aiSummary.time_patterns.length > 0) {
          aiLogger.info(`⏰ Time patterns found: ${aiSummary.time_patterns.join(', ')}`)
        }
      }
      
      const duration = (Date.now() - startTime) / 1000
      scraperLogger.success(`✅ ${hotel.name} complete in ${duration.toFixed(1)}s`)
      
      return true
      
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000
      scraperLogger.error(`❌ Failed ${hotel.name} after ${duration.toFixed(1)}s:`, error)
      this.stats.failedHotels.push(hotel.name)
      return false
    }
  }

  async runFullCollection(): Promise<void> {
    const collectionStartTime = Date.now()
    
    try {
      console.log('🚀 Singapore Business Hotel Data Collection')
      console.log('==========================================')
      console.log('Target: 30 hotels, 6,000+ WiFi reviews')
      console.log('Features: 5-year filtering, AI quirk detection, network timeout fixes')
      console.log('')
      
      // Fetch hotels from database
      const hotels = await this.fetchSingaporeHotels()
      
      console.log('📊 Collection Plan:')
      console.log(`  Marina Bay: 8 hotels (premium business district)`)
      console.log(`  Orchard Road: 8 hotels (shopping/business area)`)
      console.log(`  Raffles Place: 10 hotels (financial district)`)
      console.log(`  Bugis/Civic District: 4 hotels (government/cultural area)`)
      console.log('')
      
      // Process hotels by neighborhood for better organization
      const neighborhoods = ['Marina Bay', 'Orchard Road', 'Raffles Place', 'Bugis/Civic District']
      
      for (const neighborhood of neighborhoods) {
        const neighborhoodHotels = hotels.filter(h => h.neighborhood === neighborhood)
        
        console.log(`\n🏙️  Processing ${neighborhood} (${neighborhoodHotels.length} hotels)`)
        console.log('=' .repeat(50))
        
        for (const hotel of neighborhoodHotels) {
          this.stats.hotelsCrawled++
          
          const success = await this.collectHotelData(hotel)
          if (success) {
            this.stats.successfulHotels++
          }
          
          // Progress update
          const progress = ((this.stats.hotelsCrawled / this.stats.totalHotels) * 100).toFixed(1)
          console.log(`📈 Progress: ${this.stats.hotelsCrawled}/${this.stats.totalHotels} hotels (${progress}%)`)
        }
      }
      
      this.stats.timeElapsed = (Date.now() - collectionStartTime) / 1000
      this.stats.avgReviewsPerHotel = this.stats.totalReviews / this.stats.successfulHotels
      
      this.displayFinalResults()
      
    } catch (error) {
      scraperLogger.error('💥 Collection failed:', error)
      throw error
    }
  }

  private displayFinalResults(): void {
    console.log('\n' + '='.repeat(60))
    console.log('🏆 SINGAPORE DATA COLLECTION COMPLETE')
    console.log('='.repeat(60))
    
    console.log(`📊 Collection Statistics:`)
    console.log(`  Total hotels processed: ${this.stats.hotelsCrawled}/${this.stats.totalHotels}`)
    console.log(`  Successful collections: ${this.stats.successfulHotels}`)
    console.log(`  Failed collections: ${this.stats.failedHotels.length}`)
    console.log(`  Success rate: ${((this.stats.successfulHotels / this.stats.hotelsCrawled) * 100).toFixed(1)}%`)
    
    console.log(`\n📝 Review Statistics:`)
    console.log(`  Total WiFi reviews collected: ${this.stats.totalReviews}`)
    console.log(`  Average reviews per hotel: ${this.stats.avgReviewsPerHotel.toFixed(1)}`)
    console.log(`  Date range: August 2020 - August 2025 (5 years)`)
    
    console.log(`\n⏱️  Performance:`)
    console.log(`  Total collection time: ${(this.stats.timeElapsed / 60).toFixed(1)} minutes`)
    console.log(`  Average time per hotel: ${(this.stats.timeElapsed / this.stats.hotelsCrawled).toFixed(1)} seconds`)
    
    if (this.stats.failedHotels.length > 0) {
      console.log(`\n❌ Failed Hotels:`)
      this.stats.failedHotels.forEach(hotel => console.log(`  • ${hotel}`))
    }
    
    console.log(`\n🎯 Next Steps:`)
    console.log(`  ✅ Data collection complete for Singapore`)
    console.log(`  📊 Ready for data quality validation`)
    console.log(`  🚀 Ready to expand to London hotels`)
    console.log(`  📖 Ready for Phase 4: Page generation`)
  }

  async cleanup(): Promise<void> {
    await this.scraper.cleanup()
    
    // Display final scraper stats
    const scraperStats = this.scraper.getRateLimiterStats?.() || { successRate: 0, totalRequests: 0 }
    console.log(`\n📈 Scraper Performance:`)
    console.log(`  Success rate: ${(scraperStats.successRate * 100).toFixed(1)}%`)
    console.log(`  Total requests: ${scraperStats.totalRequests}`)
    
    // Display AI processing stats
    const aiStats = this.aiProcessor.getCostSummary()
    console.log(`\n💰 AI Processing Costs:`)
    console.log(`  Total cost: $${aiStats.totalCost.toFixed(4)}`)
    console.log(`  Average cost per hotel: $${(aiStats.totalCost / this.stats.successfulHotels).toFixed(4)}`)
  }
}

// Main execution
async function main() {
  const collector = new SingaporeDataCollector()
  
  try {
    await collector.initialize()
    await collector.runFullCollection()
  } catch (error) {
    console.error('💥 Singapore data collection failed:', error)
    process.exit(1)
  } finally {
    await collector.cleanup()
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { SingaporeDataCollector }