#!/usr/bin/env tsx

/**
 * AI-Powered WiFi Review Processor
 * 
 * This script uses OpenAI GPT-5-mini to process raw WiFi reviews into structured summaries
 * with scores, highlights, warnings, and use-case specific ratings.
 */

import OpenAI from 'openai'
import { aiLogger } from '../src/lib/logger'
import { retry } from '../src/lib/utils'

interface WiFiReview {
  hotel_id: string
  reviewer_name: string
  rating: number
  review_text: string
  review_date: string
  wifi_mentioned: boolean
  extracted_speed?: number
}

interface WiFiSummary {
  hotel_id: string
  summary: string
  overall_score: number
  positive_highlights: string[]
  warnings: string[]
  use_case_scores: {
    video_calls: number
    streaming: number
    uploads: number
    general_browsing: number
  }
  speed_analysis: {
    mentioned_speeds: number[]
    average_speed?: number
    speed_consistency: 'consistent' | 'variable' | 'unknown'
  }
  // New quirk fields for unique WiFi characteristics
  location_quirks: string[]        // "WiFi better on higher floors", "Dead zone in lobby"
  time_patterns: string[]          // "Slower 6-9pm", "Resets at midnight"
  connection_quirks: string[]      // "Need to reconnect hourly", "Password changes daily"
  business_traveler_notes: string[] // "VPN issues reported", "Great for video calls"
  unique_features: string[]        // "Premium WiFi available", "Ethernet in rooms"
  review_count: number
  generated_at: string
}

class WiFiReviewProcessor {
  private openai: OpenAI
  private costTracker = {
    inputTokens: 0,
    outputTokens: 0,
    totalCost: 0
  }

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    
    this.openai = new OpenAI({
      apiKey
    })
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // GPT-5-mini pricing: $0.25/1M input tokens, $2.00/1M output tokens
    const inputCost = (inputTokens / 1000000) * 0.25
    const outputCost = (outputTokens / 1000000) * 2.00
    return inputCost + outputCost
  }

  private createPrompt(hotelName: string, reviews: WiFiReview[]): string {
    const reviewTexts = reviews.map((review, i) => 
      `Review ${i + 1} (${review.rating}/5 stars, ${review.review_date}): "${review.review_text}"`
    ).join('\n\n')

    const extractedSpeeds = reviews
      .filter(r => r.extracted_speed)
      .map(r => r.extracted_speed)

    return `Analyze WiFi reviews for ${hotelName}. Extract patterns and quirks for business travelers.

Reviews:
${reviewTexts}

${extractedSpeeds.length > 0 ? `Speeds mentioned: ${extractedSpeeds.join(', ')} Mbps` : ''}

Return JSON only:
{
  "summary": "Brief summary with key characteristics and quirks",
  "overall_score": 1-5,
  "positive_highlights": ["Up to 3 positive points"],
  "warnings": ["Up to 2 warnings if any"],
  "use_case_scores": {
    "video_calls": 1-5,
    "streaming": 1-5,
    "uploads": 1-5,
    "general_browsing": 1-5
  },
  "speed_analysis": {
    "mentioned_speeds": [numbers],
    "average_speed": number_or_null,
    "speed_consistency": "consistent|variable|unknown"
  },
  "location_quirks": ["Location-specific behaviors"],
  "time_patterns": ["Time-based patterns"], 
  "connection_quirks": ["Connection issues"],
  "business_traveler_notes": ["Work-specific insights"],
  "unique_features": ["Special features"]
}

Focus: Extract specific quirks like floor differences, time patterns, VPN issues, premium options. Be concise but specific.`
  }

  async processReviews(hotelName: string, reviews: WiFiReview[]): Promise<WiFiSummary | null> {
    if (reviews.length === 0) {
      aiLogger.warn(`No reviews to process for ${hotelName}`)
      return null
    }

    aiLogger.info(`Processing ${reviews.length} WiFi reviews for ${hotelName}`)

    try {
      const prompt = this.createPrompt(hotelName, reviews)
      
      const response = await retry(async () => {
        return await this.openai.chat.completions.create({
          model: 'gpt-5-mini', // Using GPT-5-mini as requested
          messages: [
            {
              role: 'system',
              content: 'You are a WiFi quality analyst specializing in hotel internet connectivity for business travelers. Analyze reviews and provide structured, factual summaries with accurate scoring.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_completion_tokens: 2200, // Allow room for reasoning (1500) + quirk analysis output (700)
          // temperature: 1.0, // GPT-5-mini only supports default temperature (removing parameter)
          response_format: { type: 'json_object' }
        })
      }, 3, 2000)

      if (!response.choices[0]?.message?.content) {
        throw new Error('No response content from OpenAI')
      }

      // Track costs
      const inputTokens = response.usage?.prompt_tokens || 0
      const outputTokens = response.usage?.completion_tokens || 0
      const requestCost = this.calculateCost(inputTokens, outputTokens)

      this.costTracker.inputTokens += inputTokens
      this.costTracker.outputTokens += outputTokens
      this.costTracker.totalCost += requestCost

      aiLogger.info(`Request cost: $${requestCost.toFixed(4)} (${inputTokens} in, ${outputTokens} out)`)

      // Parse JSON response
      const aiResult = JSON.parse(response.choices[0].message.content)
      
      // Validate and structure the response
      const summary: WiFiSummary = {
        hotel_id: reviews[0].hotel_id,
        summary: aiResult.summary || '',
        overall_score: Math.max(1, Math.min(5, aiResult.overall_score || 3)),
        positive_highlights: Array.isArray(aiResult.positive_highlights) ? 
          aiResult.positive_highlights.slice(0, 3) : [],
        warnings: Array.isArray(aiResult.warnings) ? 
          aiResult.warnings.slice(0, 2) : [],
        use_case_scores: {
          video_calls: Math.max(1, Math.min(5, aiResult.use_case_scores?.video_calls || 3)),
          streaming: Math.max(1, Math.min(5, aiResult.use_case_scores?.streaming || 3)),
          uploads: Math.max(1, Math.min(5, aiResult.use_case_scores?.uploads || 3)),
          general_browsing: Math.max(1, Math.min(5, aiResult.use_case_scores?.general_browsing || 4))
        },
        speed_analysis: {
          mentioned_speeds: Array.isArray(aiResult.speed_analysis?.mentioned_speeds) ? 
            aiResult.speed_analysis.mentioned_speeds : 
            reviews.filter(r => r.extracted_speed).map(r => r.extracted_speed!),
          average_speed: aiResult.speed_analysis?.average_speed || 
            (reviews.filter(r => r.extracted_speed).length > 0 ? 
              reviews.filter(r => r.extracted_speed).reduce((sum, r) => sum + r.extracted_speed!, 0) / 
              reviews.filter(r => r.extracted_speed).length : null),
          speed_consistency: ['consistent', 'variable', 'unknown'].includes(aiResult.speed_analysis?.speed_consistency) ? 
            aiResult.speed_analysis.speed_consistency : 'unknown'
        },
        // New quirk fields with validation
        location_quirks: Array.isArray(aiResult.location_quirks) ? 
          aiResult.location_quirks.slice(0, 5) : [],
        time_patterns: Array.isArray(aiResult.time_patterns) ? 
          aiResult.time_patterns.slice(0, 3) : [],
        connection_quirks: Array.isArray(aiResult.connection_quirks) ? 
          aiResult.connection_quirks.slice(0, 4) : [],
        business_traveler_notes: Array.isArray(aiResult.business_traveler_notes) ? 
          aiResult.business_traveler_notes.slice(0, 4) : [],
        unique_features: Array.isArray(aiResult.unique_features) ? 
          aiResult.unique_features.slice(0, 3) : [],
        review_count: reviews.length,
        generated_at: new Date().toISOString()
      }

      aiLogger.success(`Generated WiFi summary for ${hotelName}`)
      aiLogger.info(`Overall score: ${summary.overall_score}/5`)
      aiLogger.info(`Use case scores: Calls(${summary.use_case_scores.video_calls}) Streaming(${summary.use_case_scores.streaming}) Uploads(${summary.use_case_scores.uploads})`)
      
      // Log quirks if found
      if (summary.location_quirks.length > 0) {
        aiLogger.info(`Location quirks: ${summary.location_quirks.length} found`)
      }
      if (summary.connection_quirks.length > 0) {
        aiLogger.info(`Connection quirks: ${summary.connection_quirks.length} found`)
      }
      if (summary.business_traveler_notes.length > 0) {
        aiLogger.info(`Business notes: ${summary.business_traveler_notes.length} found`)
      }
      
      return summary

    } catch (error) {
      aiLogger.error(`Failed to process reviews for ${hotelName}:`, error)
      return null
    }
  }

  async processBatchReviews(hotelsWithReviews: { hotelName: string, reviews: WiFiReview[] }[]): Promise<WiFiSummary[]> {
    const summaries: WiFiSummary[] = []
    
    aiLogger.info(`Processing ${hotelsWithReviews.length} hotels with AI analysis`)
    
    for (let i = 0; i < hotelsWithReviews.length; i++) {
      const { hotelName, reviews } = hotelsWithReviews[i]
      
      try {
        const summary = await this.processReviews(hotelName, reviews)
        if (summary) {
          summaries.push(summary)
        }
        
        // Rate limiting between API calls
        if (i < hotelsWithReviews.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        aiLogger.error(`Failed to process ${hotelName}:`, error)
        continue
      }
    }
    
    // Log final cost summary
    aiLogger.success(`Batch processing complete!`)
    aiLogger.info(`Total cost: $${this.costTracker.totalCost.toFixed(4)}`)
    aiLogger.info(`Tokens used: ${this.costTracker.inputTokens} input, ${this.costTracker.outputTokens} output`)
    aiLogger.info(`Generated ${summaries.length}/${hotelsWithReviews.length} summaries`)
    
    return summaries
  }

  getCostSummary(): { inputTokens: number, outputTokens: number, totalCost: number } {
    return { ...this.costTracker }
  }
}

export { WiFiReviewProcessor, WiFiSummary }
export default WiFiReviewProcessor