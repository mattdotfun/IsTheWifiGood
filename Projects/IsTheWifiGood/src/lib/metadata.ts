import { Metadata } from 'next'

interface GenerateMetadataProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  noindex?: boolean
  author?: string
  publishedTime?: string
  modifiedTime?: string
  canonicalUrl?: string
}

const defaultMetadata: GenerateMetadataProps = {
  title: 'IsTheWiFiGood? - Hotel WiFi Quality Directory',
  description: 'The most comprehensive directory of hotel WiFi quality for business travelers. Find hotels with reliable, fast internet for video calls, streaming, and remote work.',
  keywords: 'hotel wifi, business travel, hotel internet speed, wifi quality, remote work hotels, digital nomad hotels, hotel wifi review',
  ogImage: '/og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  noindex: false,
  author: 'IsTheWiFiGood',
}

export function generateMetadata(props: GenerateMetadataProps = {}): Metadata {
  const merged = { ...defaultMetadata, ...props }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isthewifigood.com'
  
  // Construct full title with site name
  const fullTitle = merged.title === defaultMetadata.title 
    ? merged.title 
    : `${merged.title} | IsTheWiFiGood?`
  
  // Ensure ogImage has full URL
  const ogImageUrl = merged.ogImage?.startsWith('http') 
    ? merged.ogImage 
    : `${siteUrl}${merged.ogImage}`
  
  // Generate canonical URL if not provided
  const canonicalUrl = merged.canonicalUrl || siteUrl

  const metadata: Metadata = {
    title: fullTitle,
    description: merged.description,
    keywords: merged.keywords,
    authors: merged.author ? [{ name: merged.author }] : undefined,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: merged.description,
      url: canonicalUrl,
      siteName: 'IsTheWiFiGood?',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: merged.ogType,
      ...(merged.publishedTime && { publishedTime: merged.publishedTime }),
      ...(merged.modifiedTime && { modifiedTime: merged.modifiedTime }),
    },
    twitter: {
      card: merged.twitterCard,
      title: fullTitle,
      description: merged.description,
      images: [ogImageUrl],
      site: '@isthewifigood',
      creator: '@isthewifigood',
    },
    robots: {
      index: !merged.noindex,
      follow: !merged.noindex,
      googleBot: {
        index: !merged.noindex,
        follow: !merged.noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
    // Theme color
    themeColor: '#1e293b',
  }

  return metadata
}

// Re-export default metadata for use in layout.tsx
export const defaultSiteMetadata = generateMetadata()

// Helper function to generate article metadata
export function generateArticleMetadata(props: GenerateMetadataProps & {
  tags?: string[]
  section?: string
}): Metadata {
  return generateMetadata({
    ...props,
    ogType: 'article',
  })
}

// Helper function to generate JSON-LD for pages
export function generateJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data)
}
