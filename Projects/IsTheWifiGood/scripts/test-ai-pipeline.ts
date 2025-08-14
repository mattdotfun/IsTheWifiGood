#!/usr/bin/env tsx

/**
 * Test Complete AI Pipeline
 * 
 * This script demonstrates the complete pipeline:
 * 1. Mock some WiFi reviews (simulating scraper output)
 * 2. Process them with OpenAI GPT-5-mini to generate structured summaries
 * 3. Show the results and cost analysis
 */

import { WiFiReviewProcessor } from './ai-processor'
import { aiLogger, scraperLogger } from '../src/lib/logger'

// Mock WiFi reviews data (simulating what our scraper would collect)
const mockWiFiReviews = [
  {
    hotel_id: 'marina-bay-sands',
    reviewer_name: 'BusinessTraveler2024',
    rating: 5,
    review_text: 'Excellent WiFi throughout the hotel. Got around 150 Mbps download speed in my room on the 45th floor. Perfect for video calls and streaming. Never had any connectivity issues during my 4-day stay.',
    review_date: '2 months ago',
    wifi_mentioned: true,
    extracted_speed: 150
  },
  {
    hotel_id: 'marina-bay-sands',
    reviewer_name: 'TechConsultant',
    rating: 4,
    review_text: 'WiFi was reliable for most of my stay. Speed tested at about 80-100 Mbps which was sufficient for my work needs. Had one brief outage on day 2 but otherwise solid connection.',
    review_date: '1 month ago',
    wifi_mentioned: true,
    extracted_speed: 90
  },
  {
    hotel_id: 'marina-bay-sands',
    reviewer_name: 'ConferenceAttendee',
    rating: 3,
    review_text: 'Internet connection was okay but inconsistent. Sometimes very fast (120+ Mbps) and sometimes quite slow (20-30 Mbps). Depends on time of day and hotel occupancy I think.',
    review_date: '3 weeks ago',
    wifi_mentioned: true,
    extracted_speed: 75
  },
  {
    hotel_id: 'marina-bay-sands',
    reviewer_name: 'DigitalNomad',
    rating: 4,
    review_text: 'Good WiFi for remote work. Upload speeds were particularly impressive - got 50+ Mbps up which is great for video conferencing. Download was consistently 100+ Mbps.',
    review_date: '1 week ago',
    wifi_mentioned: true,
    extracted_speed: 100
  },
  {
    hotel_id: 'marina-bay-sands',
    reviewer_name: 'StreamingFan',
    rating: 2,
    review_text: 'WiFi was disappointing for the price. Had trouble streaming 4K content and frequent buffering. Speed tests showed only 25-35 Mbps most of the time. Expected much better.',
    review_date: '2 weeks ago',
    wifi_mentioned: true,
    extracted_speed: 30
  }
]

const mockWiFiReviewsRitz = [
  {
    hotel_id: 'ritz-carlton-singapore',
    reviewer_name: 'ExecutiveTraveler',
    rating: 5,
    review_text: 'Outstanding internet connectivity. Consistently got 200+ Mbps throughout my suite. Perfect for video conferences and large file uploads. Never experienced any downtime.',
    review_date: '1 month ago',
    wifi_mentioned: true,
    extracted_speed: 200
  },
  {
    hotel_id: 'ritz-carlton-singapore',
    reviewer_name: 'TechStartupCEO',
    rating: 5,
    review_text: 'Blazing fast WiFi! Speed tests showed 250-300 Mbps consistently. Upload speeds were excellent too at 100+ Mbps. Crucial for my team video calls.',
    review_date: '3 weeks ago',
    wifi_mentioned: true,
    extracted_speed: 275
  },
  {
    hotel_id: 'ritz-carlton-singapore',
    reviewer_name: 'DataAnalyst',
    rating: 4,
    review_text: 'Very reliable connection for data downloads and analysis work. Speed was around 180 Mbps most of the time. Only minor issue was slower speeds during peak hours.',
    review_date: '2 weeks ago',
    wifi_mentioned: true,
    extracted_speed: 180
  }
]

async function testAIPipeline() {
  try {
    // Load environment variables from .env.local
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

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('\n🚨 OpenAI API key not configured!')
      console.log('To test the AI pipeline:')
      console.log('1. Get an OpenAI API key from https://platform.openai.com')
      console.log('2. Update .env.local with: OPENAI_API_KEY=your_actual_key')
      console.log('3. Run this test again')
      console.log('\nFor now, showing mock data structure that would be generated...\n')
      
      // Show what the AI would generate
      const mockSummary = {
        hotel_id: 'marina-bay-sands',
        summary: 'Marina Bay Sands offers good WiFi with speeds ranging from 30-150 Mbps. Most guests report reliable connectivity suitable for business needs, though some experience variability during peak hours.',
        overall_score: 4,
        positive_highlights: [
          'Speeds up to 150 Mbps in upper floors',
          'Reliable for video calls and streaming',
          'Good upload speeds (50+ Mbps reported)'
        ],
        warnings: [
          'Speed can vary significantly (20-120+ Mbps range)',
          'Some guests experienced brief outages'
        ],
        use_case_scores: {
          video_calls: 4,
          streaming: 4,
          uploads: 4,
          general_browsing: 5
        },
        speed_analysis: {
          mentioned_speeds: [150, 90, 75, 100, 30],
          average_speed: 89,
          speed_consistency: 'variable'
        },
        review_count: 5,
        generated_at: new Date().toISOString()
      }
      
      console.log('📊 Mock AI-Generated Summary:')
      console.log(JSON.stringify(mockSummary, null, 2))
      console.log('\n💰 Estimated cost per hotel: $0.01-0.02')
      
      return
    }

    scraperLogger.info('Testing complete AI pipeline with mock review data')
    
    const processor = new WiFiReviewProcessor()
    
    // Test data: hotels with their WiFi reviews
    const hotelsWithReviews = [
      {
        hotelName: 'Marina Bay Sands Singapore',
        reviews: mockWiFiReviews
      },
      {
        hotelName: 'The Ritz-Carlton Singapore',
        reviews: mockWiFiReviewsRitz
      }
    ]
    
    // Process reviews with AI
    const summaries = await processor.processBatchReviews(hotelsWithReviews)
    
    // Display results
    console.log('\n' + '='.repeat(60))
    console.log('🤖 AI-GENERATED WIFI SUMMARIES')
    console.log('='.repeat(60))
    
    summaries.forEach((summary, i) => {
      console.log(`\n--- Hotel ${i + 1}: ${hotelsWithReviews[i].hotelName} ---`)
      console.log(`Overall Score: ${summary.overall_score}/5`)
      console.log(`Reviews Analyzed: ${summary.review_count}`)
      console.log(`\nSummary: ${summary.summary}`)
      
      console.log('\n✅ Positive Highlights:')
      summary.positive_highlights.forEach(highlight => {
        console.log(`  • ${highlight}`)
      })
      
      if (summary.warnings.length > 0) {
        console.log('\n⚠️  Warnings:')
        summary.warnings.forEach(warning => {
          console.log(`  • ${warning}`)
        })
      }
      
      console.log('\n🎯 Use Case Scores:')
      console.log(`  Video Calls: ${summary.use_case_scores.video_calls}/5`)
      console.log(`  Streaming: ${summary.use_case_scores.streaming}/5`)
      console.log(`  Uploads: ${summary.use_case_scores.uploads}/5`)
      console.log(`  Browsing: ${summary.use_case_scores.general_browsing}/5`)
      
      console.log('\n🚀 Speed Analysis:')
      console.log(`  Mentioned Speeds: ${summary.speed_analysis.mentioned_speeds.join(', ')} Mbps`)
      console.log(`  Average Speed: ${summary.speed_analysis.average_speed || 'N/A'} Mbps`)
      console.log(`  Consistency: ${summary.speed_analysis.speed_consistency}`)
      
      // Display new quirk sections
      if (summary.location_quirks.length > 0) {
        console.log('\n📍 Location Quirks:')
        summary.location_quirks.forEach(quirk => {
          console.log(`  • ${quirk}`)
        })
      }
      
      if (summary.time_patterns.length > 0) {
        console.log('\n⏰ Time Patterns:')
        summary.time_patterns.forEach(pattern => {
          console.log(`  • ${pattern}`)
        })
      }
      
      if (summary.connection_quirks.length > 0) {
        console.log('\n🔌 Connection Quirks:')
        summary.connection_quirks.forEach(quirk => {
          console.log(`  • ${quirk}`)
        })
      }
      
      if (summary.business_traveler_notes.length > 0) {
        console.log('\n💼 Business Traveler Notes:')
        summary.business_traveler_notes.forEach(note => {
          console.log(`  • ${note}`)
        })
      }
      
      if (summary.unique_features.length > 0) {
        console.log('\n✨ Unique Features:')
        summary.unique_features.forEach(feature => {
          console.log(`  • ${feature}`)
        })
      }
    })
    
    // Cost analysis
    const costSummary = processor.getCostSummary()
    console.log('\n' + '='.repeat(60))
    console.log('💰 COST ANALYSIS')
    console.log('='.repeat(60))
    console.log(`Total Cost: $${costSummary.totalCost.toFixed(4)}`)
    console.log(`Input Tokens: ${costSummary.inputTokens.toLocaleString()}`)
    console.log(`Output Tokens: ${costSummary.outputTokens.toLocaleString()}`)
    console.log(`Cost per Hotel: $${(costSummary.totalCost / summaries.length).toFixed(4)}`)
    console.log(`Estimated Cost for 90 Hotels: $${(costSummary.totalCost / summaries.length * 90).toFixed(2)}`)
    
    aiLogger.success('AI pipeline test completed successfully!')
    
  } catch (error) {
    aiLogger.error('AI pipeline test failed:', error)
  }
}

// Run test
testAIPipeline().catch(console.error)