import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Rate limiting utility
export class RateLimiter {
  private lastRequest: number = 0
  private minDelay: number

  constructor(minDelaySeconds: number = 8) {
    this.minDelay = minDelaySeconds * 1000
  }

  async wait(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequest
    
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest
      console.log(`Rate limiting: waiting ${waitTime}ms`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequest = Date.now()
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