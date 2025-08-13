import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import { PageLayout, SchemaMarkup } from '@/components/layout'

// Generate metadata for this page
export const metadata: Metadata = generateMetadata({
  title: 'Example Page',
  description: 'This is an example page demonstrating the PageLayout component.',
  keywords: 'example, page layout, next.js, seo',
})

export default function ExamplePage() {
  // Define schema markup for this page
  const pageSchema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Example Page',
    description: 'This is an example page demonstrating the PageLayout component.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://isthewifigood.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Example',
          item: 'https://isthewifigood.com/example'
        }
      ]
    }
  }

  return (
    <PageLayout schema={pageSchema} className="py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Example Page</h1>
        
        <div className="prose prose-lg">
          <p>
            This is an example page demonstrating how to use the PageLayout component
            with Next.js App Router&apos;s Metadata API.
          </p>
          
          <h2>Features Demonstrated</h2>
          <ul>
            <li>SEO metadata using the Metadata API</li>
            <li>JSON-LD schema markup injection</li>
            <li>Consistent layout with navigation and footer</li>
            <li>Google Analytics integration</li>
            <li>Responsive container with Tailwind CSS</li>
          </ul>
          
          <h2>How It Works</h2>
          <p>
            The PageLayout component provides a consistent structure for all pages,
            while SEO metadata is handled separately through Next.js&apos;s built-in
            Metadata API for optimal performance and SEO.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
