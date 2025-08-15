#!/usr/bin/env tsx

/**
 * Test Single Hotel Quirk Detection
 * 
 * This script tests the enhanced GPT-5-mini quirk detection with realistic hotel WiFi reviews
 * that contain specific patterns, location issues, and connection quirks.
 */

import { WiFiReviewProcessor } from './ai-processor'
import { aiLogger } from '../src/lib/logger'

// Enhanced mock reviews with specific quirks to test detection
const hotelWithQuirks = {
  hotelName: 'The Westin Singapore Business District',
  reviews: [
    {
      hotel_id: 'westin-singapore',
      reviewer_name: 'BusinessExecutive',
      rating: 4,
      review_text: 'WiFi works great in my room on the 28th floor but terrible in the lobby and restaurant. Speed in room was around 120 Mbps but lobby barely gets 5 Mbps. The password changes every morning at 6am which is annoying.',
      review_date: '2 weeks ago',
      wifi_mentioned: true,
      extracted_speed: 120
    },
    {
      hotel_id: 'westin-singapore',
      reviewer_name: 'RemoteWorker',
      rating: 3,
      review_text: 'Internet connection drops every 2 hours and you need to reconnect. VPN has issues connecting during business hours (9am-6pm). After 7pm it works fine for video calls. The concierge mentioned they have premium WiFi for $15/day.',
      review_date: '1 week ago',
      wifi_mentioned: true,
      extracted_speed: undefined
    },
    {
      hotel_id: 'westin-singapore',
      reviewer_name: 'TechConsultant',
      rating: 4,
      review_text: 'Conference room on 5th floor has dedicated business WiFi that is blazing fast - got 200+ Mbps there. Regular guest WiFi in rooms is around 80-100 Mbps. The business center also has ethernet cables if you need wired connection.',
      review_date: '5 days ago',
      wifi_mentioned: true,
      extracted_speed: 200
    },
    {
      hotel_id: 'westin-singapore',
      reviewer_name: 'StartupFounder',
      rating: 2,
      review_text: 'WiFi completely stops working between 11pm-1am every night for maintenance. They should warn guests about this! During day it\'s decent around 60-70 Mbps but uploads are very slow, maybe 5-10 Mbps up.',
      review_date: '3 days ago',
      wifi_mentioned: true,
      extracted_speed: 65
    }
  ]
}

async function testQuirkDetection() {
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

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OpenAI API key not found. Please set OPENAI_API_KEY in .env.local')
      return
    }

    console.log('🧪 Testing Enhanced Quirk Detection for Business Hotels')
    console.log('Hotel:', hotelWithQuirks.hotelName)
    console.log('Reviews with quirks:', hotelWithQuirks.reviews.length)
    
    const processor = new WiFiReviewProcessor()
    
    // Process the reviews
    const summary = await processor.processReviews(hotelWithQuirks.hotelName, hotelWithQuirks.reviews)
    
    if (!summary) {
      console.log('❌ Failed to generate summary')
      return
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('🏨 ENHANCED WIFI ANALYSIS WITH QUIRKS')
    console.log('='.repeat(80))
    
    console.log(`\n📊 Overall Analysis:`)
    console.log(`  Score: ${summary.overall_score}/5`)
    console.log(`  Reviews: ${summary.review_count}`)
    console.log(`  Summary: ${summary.summary}`)
    
    console.log(`\n✅ Positive Highlights:`)
    summary.positive_highlights.forEach(highlight => {
      console.log(`  • ${highlight}`)
    })
    
    if (summary.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`)
      summary.warnings.forEach(warning => {
        console.log(`  • ${warning}`)
      })
    }
    
    // NEW QUIRK SECTIONS
    if (summary.location_quirks.length > 0) {
      console.log(`\n📍 Location Quirks:`)
      summary.location_quirks.forEach(quirk => {
        console.log(`  • ${quirk}`)
      })
    }
    
    if (summary.time_patterns.length > 0) {
      console.log(`\n⏰ Time Patterns:`)
      summary.time_patterns.forEach(pattern => {
        console.log(`  • ${pattern}`)
      })
    }
    
    if (summary.connection_quirks.length > 0) {
      console.log(`\n🔌 Connection Quirks:`)
      summary.connection_quirks.forEach(quirk => {
        console.log(`  • ${quirk}`)
      })
    }
    
    if (summary.business_traveler_notes.length > 0) {
      console.log(`\n💼 Business Traveler Notes:`)
      summary.business_traveler_notes.forEach(note => {
        console.log(`  • ${note}`)
      })
    }
    
    if (summary.unique_features.length > 0) {
      console.log(`\n✨ Unique Features:`)
      summary.unique_features.forEach(feature => {
        console.log(`  • ${feature}`)
      })
    }
    
    console.log(`\n🎯 Use Case Scores:`)
    console.log(`  Video Calls: ${summary.use_case_scores.video_calls}/5`)
    console.log(`  Streaming: ${summary.use_case_scores.streaming}/5`)
    console.log(`  Uploads: ${summary.use_case_scores.uploads}/5`)
    console.log(`  Browsing: ${summary.use_case_scores.general_browsing}/5`)
    
    console.log(`\n🚀 Speed Analysis:`)
    console.log(`  Speeds: ${summary.speed_analysis.mentioned_speeds.join(', ')} Mbps`)
    console.log(`  Average: ${summary.speed_analysis.average_speed || 'N/A'} Mbps`)
    console.log(`  Consistency: ${summary.speed_analysis.speed_consistency}`)
    
    // Cost summary
    const cost = processor.getCostSummary()
    console.log(`\n💰 Cost: $${cost.totalCost.toFixed(4)} (${cost.inputTokens} in, ${cost.outputTokens} out)`)
    
    console.log('\n✅ Quirk detection test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testQuirkDetection()