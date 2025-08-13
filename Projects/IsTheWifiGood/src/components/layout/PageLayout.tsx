'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'

// Google Analytics tracking ID - replace with your actual GA ID
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || 'G-XXXXXXXXXX'

interface SchemaMarkup {
  '@context': string
  '@type': string
  [key: string]: unknown
}

interface PageLayoutProps {
  children: React.ReactNode
  schema?: SchemaMarkup | SchemaMarkup[]
  className?: string
}

// Google Analytics page view tracking
const pageview = (url: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = window.gtag as (...args: unknown[]) => void
    gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

export default function PageLayout({ 
  children, 
  schema,
  className = ''
}: PageLayoutProps) {
  const pathname = usePathname()
  
  // Track page views on route change
  useEffect(() => {
    pageview(pathname)
  }, [pathname])

  // Generate site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isthewifigood.com'

  // Default schema markup for Organization
  const defaultSchema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IsTheWiFiGood',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'The most comprehensive directory of hotel WiFi quality for business travelers.',
    sameAs: [
      'https://isthewifigood.substack.com'
    ]
  }

  // Combine schemas if provided
  const schemaArray = schema 
    ? Array.isArray(schema) ? [defaultSchema, ...schema] : [defaultSchema, schema]
    : [defaultSchema]

  return (
    <>

      {/* JSON-LD Schema Markup */}
      {schemaArray.map((schemaItem, index) => (
        <Script
          key={`schema-${index}`}
          id={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaItem)
          }}
          strategy="afterInteractive"
        />
      ))}

      {/* Google Analytics Scripts */}
      {GA_TRACKING_ID && GA_TRACKING_ID !== 'G-XXXXXXXXXX' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Main Layout Structure */}
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <Navigation />
        
        {/* Main Content */}
        <main className={`flex-grow ${className}`}>
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}

// Export types for use in other components
export type { SchemaMarkup, PageLayoutProps }
