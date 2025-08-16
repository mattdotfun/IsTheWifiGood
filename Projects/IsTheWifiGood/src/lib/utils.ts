import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced rate limiting utility with adaptive timing
export class RateLimiter {
  private lastRequest: number = 0
  private minDelay: number
  private maxDelay: number
  private successCount: number = 0
  private failureCount: number = 0
  private requestHistory: number[] = []

  constructor(minDelaySeconds: number = 6, maxDelaySeconds: number = 12) {
    this.minDelay = minDelaySeconds * 1000
    this.maxDelay = maxDelaySeconds * 1000
  }

  // Record success for adaptive rate limiting
  recordSuccess(): void {
    this.successCount++
    this.requestHistory.push(Date.now())
    // Keep only last 10 requests
    if (this.requestHistory.length > 10) {
      this.requestHistory.shift()
    }
  }

  // Record failure for adaptive rate limiting
  recordFailure(): void {
    this.failureCount++
  }

  // Calculate adaptive delay based on success/failure rate
  private calculateAdaptiveDelay(): number {
    const totalRequests = this.successCount + this.failureCount
    if (totalRequests === 0) {
      return this.minDelay
    }

    const successRate = this.successCount / totalRequests
    
    // If success rate is high, use shorter delays
    // If success rate is low, use longer delays
    let baseDelay: number
    if (successRate > 0.8) {
      baseDelay = this.minDelay
    } else if (successRate > 0.6) {
      baseDelay = this.minDelay * 1.2
    } else if (successRate > 0.4) {
      baseDelay = this.minDelay * 1.5
    } else {
      baseDelay = this.maxDelay
    }

    // Add randomization for human-like behavior (±20%)
    const jitter = baseDelay * 0.2 * (Math.random() - 0.5)
    const adaptiveDelay = baseDelay + jitter

    return Math.max(this.minDelay * 0.8, Math.min(adaptiveDelay, this.maxDelay))
  }

  // Human-like waiting patterns
  private generateHumanLikeDelay(): number {
    // Simulate human patterns: sometimes quick succession, sometimes longer breaks
    const patterns = [
      // Quick succession (30% chance)
      { weight: 0.3, minMultiplier: 0.8, maxMultiplier: 1.1 },
      // Normal timing (50% chance) 
      { weight: 0.5, minMultiplier: 1.0, maxMultiplier: 1.3 },
      // Longer break (20% chance)
      { weight: 0.2, minMultiplier: 1.5, maxMultiplier: 2.0 }
    ]

    const random = Math.random()
    let cumulativeWeight = 0
    
    for (const pattern of patterns) {
      cumulativeWeight += pattern.weight
      if (random <= cumulativeWeight) {
        const multiplier = pattern.minMultiplier + 
          Math.random() * (pattern.maxMultiplier - pattern.minMultiplier)
        return this.calculateAdaptiveDelay() * multiplier
      }
    }

    return this.calculateAdaptiveDelay()
  }

  async wait(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequest
    const requiredDelay = this.generateHumanLikeDelay()
    
    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest
      console.log(`Adaptive rate limiting: waiting ${Math.round(waitTime)}ms (success rate: ${(this.successCount / Math.max(this.successCount + this.failureCount, 1) * 100).toFixed(1)}%)`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequest = Date.now()
  }

  // Get current statistics
  getStats() {
    const totalRequests = this.successCount + this.failureCount
    return {
      successRate: totalRequests > 0 ? this.successCount / totalRequests : 0,
      totalRequests,
      successCount: this.successCount,
      failureCount: this.failureCount
    }
  }
}

// Data validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-.,!?()]/g, '') // Remove special characters except basic punctuation
}

export function extractSpeedFromText(text: string): number | null {
  // Look for various speed patterns
  const patterns = [
    // Direct speed mentions: "50 Mbps", "100mbps", "200 MB/s", "25 mbit/s"
    /(\d+(?:\.\d+)?)\s*(mbps|mb\/s|mbit\/s|mega|mb|mbit)\b/i,
    // Speed with "around", "about", "up to": "around 50mbps", "up to 100 Mbps"
    /(?:around|about|up\s+to|over|more\s+than|faster\s+than)\s+(\d+(?:\.\d+)?)\s*(mbps|mb\/s|mbit\/s|mega|mb|mbit)\b/i,
    // Speed ranges: "20-30 Mbps", "between 50 and 100 mbps"
    /(?:between\s+)?(\d+(?:\.\d+)?)\s*[-–]\s*\d+(?:\.\d+)?\s*(mbps|mb\/s|mbit\/s|mega|mb|mbit)\b/i,
    // Just numbers with context: "got 25mbps", "speed was 100"
    /(?:got|speed\s+(?:was|is|of)|download\s+(?:speed|rate)|upload\s+(?:speed|rate))\s+(?:around\s+|about\s+|up\s+to\s+)?(\d+(?:\.\d+)?)\s*(?:mbps|mb\/s|mbit\/s|mega|mb|mbit)?\b/i,
    // Bandwidth mentions: "bandwidth of 50mbps"
    /bandwidth\s+(?:of\s+|was\s+|is\s+)?(\d+(?:\.\d+)?)\s*(mbps|mb\/s|mbit\/s|mega|mb|mbit)\b/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const speed = parseFloat(match[1])
      // Basic validation - reasonable WiFi speeds
      if (speed > 0 && speed <= 10000) {
        return speed
      }
    }
  }
  
  return null
}

// Enhanced date parsing for Google Maps review dates
export function parseGoogleMapsDate(dateText: string): Date | null {
  if (!dateText || !dateText.trim()) {
    return null
  }

  const text = dateText.trim().toLowerCase()
  const now = new Date()

  // Absolute year patterns (e.g., "2023", "2022")
  const absoluteYearMatch = text.match(/\b(20\d{2})\b/)
  if (absoluteYearMatch) {
    const year = parseInt(absoluteYearMatch[1])
    // Assume end of year for more inclusive comparison (gives benefit of doubt)
    return new Date(year, 11, 31) // December 31st of that year
  }

  // Relative date patterns
  const patterns = [
    // Years ago: "2 years ago", "a year ago", "1 year ago"
    { 
      regex: /(?:(\d+)|a|an|one)\s+years?\s+ago/i,
      unit: 'years',
      getValue: (match: RegExpMatchArray) => {
        const num = match[1]
        if (num) return parseInt(num)
        return 1 // "a year ago" or "an year ago"
      }
    },
    // Months ago: "6 months ago", "a month ago", "1 month ago"
    {
      regex: /(?:(\d+)|a|an|one)\s+months?\s+ago/i,
      unit: 'months',
      getValue: (match: RegExpMatchArray) => {
        const num = match[1]
        if (num) return parseInt(num)
        return 1 // "a month ago"
      }
    },
    // Weeks ago: "3 weeks ago", "a week ago", "1 week ago"
    {
      regex: /(?:(\d+)|a|an|one)\s+weeks?\s+ago/i,
      unit: 'weeks',
      getValue: (match: RegExpMatchArray) => {
        const num = match[1]
        if (num) return parseInt(num)
        return 1 // "a week ago"
      }
    },
    // Days ago: "5 days ago", "a day ago", "yesterday"
    {
      regex: /(?:(\d+)|a|an|one)\s+days?\s+ago/i,
      unit: 'days',
      getValue: (match: RegExpMatchArray) => {
        const num = match[1]
        if (num) return parseInt(num)
        return 1 // "a day ago"
      }
    },
    // Special cases
    {
      regex: /yesterday/i,
      unit: 'days',
      getValue: () => 1
    }
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern.regex)
    if (match) {
      const value = pattern.getValue(match)
      const resultDate = new Date(now)
      
      switch (pattern.unit) {
        case 'years':
          resultDate.setFullYear(now.getFullYear() - value)
          break
        case 'months':
          resultDate.setMonth(now.getMonth() - value)
          break
        case 'weeks':
          resultDate.setDate(now.getDate() - (value * 7))
          break
        case 'days':
          resultDate.setDate(now.getDate() - value)
          break
      }
      
      return resultDate
    }
  }

  // If no pattern matches, return null
  return null
}

// Check if a date string represents a review within the last N years
export function isReviewWithinYears(dateText: string, years: number = 5): boolean {
  const reviewDate = parseGoogleMapsDate(dateText)
  if (!reviewDate) {
    // If we can't parse the date, assume it's recent to be safe
    return true
  }

  const cutoffDate = new Date()
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years)
  
  return reviewDate >= cutoffDate
}

// Retry utility for network operations
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.log(`Attempt ${attempt}/${maxAttempts} failed:`, error)
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError!
}