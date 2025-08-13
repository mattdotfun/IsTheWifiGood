# PageLayout Component

The `PageLayout` component is a wrapper that provides consistent layout and analytics for all pages in the application.

## Important Note on SEO in Next.js App Router

In Next.js 13+ App Router, SEO meta tags should be handled using the [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata) in `page.tsx` or `layout.tsx` files, not in client components. Use the `generateMetadata` function from `/src/lib/metadata.ts` for SEO configuration.

## Features

- **Consistent Layout**: Includes the main navigation and footer.
- **Google Analytics**: Integrates Google Analytics and tracks page views automatically.
- **Schema Markup**: Supports JSON-LD for structured data injection.
- **Responsive Container**: Consistent spacing with Tailwind classes (`container mx-auto px-4`).

## Props

| Prop      | Type                               | Description                                                                 |
|-----------|------------------------------------|-----------------------------------------------------------------------------|
| `children`| `React.ReactNode`                  | The main content of the page.                                               |
| `schema`  | `SchemaMarkup` or `SchemaMarkup[]` | JSON-LD schema object(s) to be embedded in the page.                        |
| `className`| `string`                           | Optional CSS classes to apply to the main content container.                |

## `SchemaMarkup` Interface

A flexible object to define JSON-LD schema. Requires `@context` and `@type` properties.

## Example Usage

### Using PageLayout with Schema Markup

```tsx
import { PageLayout, SchemaMarkup } from '@/components/layout';

const MyPage: React.FC = () => {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'My Awesome Page',
    description: 'This is a description of my awesome page.',
  };

  return (
    <PageLayout schema={schema}>
      <h1>Hello, World!</h1>
      {/* Page content here */}
    </PageLayout>
  );
};

export default MyPage;
```

### Setting SEO Metadata in App Router (Recommended)

```tsx
// app/my-page/page.tsx
import { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';
import { PageLayout } from '@/components/layout';

// Static metadata generation
export const metadata: Metadata = generateMetadata({
  title: 'My Awesome Page',
  description: 'This is a description of my awesome page.',
  keywords: 'awesome, page, example',
});

// Or dynamic metadata generation
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch data if needed
  return generateMetadata({
    title: `Page ${params.id}`,
    description: `Description for page ${params.id}`,
  });
}

export default function MyPage() {
  return (
    <PageLayout>
      <h1>Hello, World!</h1>
      {/* Page content here */}
    </PageLayout>
  );
}
```

### Setting Google Analytics

Add your Google Analytics tracking ID to your `.env.local` file:

```env
NEXT_PUBLIC_GA_TRACKING_ID=G-YOUR-TRACKING-ID
NEXT_PUBLIC_SITE_URL=https://isthewifigood.com
```
