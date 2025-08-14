// Simple logging utility for scraping operations
export class Logger {
  private prefix: string

  constructor(prefix = 'APP') {
    this.prefix = prefix
  }

  info(message: string, data?: any) {
    console.log(`[${new Date().toISOString()}] [${this.prefix}] INFO: ${message}`, data || '')
  }

  error(message: string, error?: any) {
    console.error(`[${new Date().toISOString()}] [${this.prefix}] ERROR: ${message}`, error || '')
  }

  warn(message: string, data?: any) {
    console.warn(`[${new Date().toISOString()}] [${this.prefix}] WARN: ${message}`, data || '')
  }

  success(message: string, data?: any) {
    console.log(`[${new Date().toISOString()}] [${this.prefix}] SUCCESS: ${message}`, data || '')
  }
}

// Create default logger instances
export const scraperLogger = new Logger('SCRAPER')
export const aiLogger = new Logger('AI')
export const dbLogger = new Logger('DATABASE')