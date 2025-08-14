#!/usr/bin/env tsx

/**
 * Quick Browser Test - Verify Playwright Setup
 */

import { chromium } from 'playwright'
import { scraperLogger } from '../src/lib/logger'

async function testBrowser() {
  try {
    scraperLogger.info('Testing browser initialization...')
    
    const browser = await chromium.launch({
      headless: false, // Visible for testing
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    scraperLogger.info('Navigating to Google Maps...')
    await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle' })
    
    // Wait a moment to see the page
    await page.waitForTimeout(3000)
    
    scraperLogger.success('Browser test successful! ✅')
    
    await browser.close()
    
  } catch (error) {
    scraperLogger.error('Browser test failed:', error)
  }
}

testBrowser().catch(console.error)