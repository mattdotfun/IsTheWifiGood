# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Is The Wi-Fi Good?" is a specialized directory website focused on hotel Wi-Fi quality for business travelers. This is a content-driven, SEO-optimized directory built with Next.js that provides AI-generated summaries of hotel internet connectivity across major business travel destinations.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Shadcn UI (built on Radix UI)
- **Styling**: Tailwind CSS + Custom CSS animations
- **Scraping**: Playwright (local execution)
- **AI**: OpenAI GPT-5-mini
- **Hosting**: Vercel
- **Newsletter**: Substack (embedded)
- **Analytics**: Google Analytics 4
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## Development Commands

Since this is a new project, these commands will be available once the Next.js project is set up:

```bash
# Install dependencies
npm install

# Initialize Shadcn UI
npx shadcn@latest init

# Add Shadcn UI components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add navigation-menu

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run type checking
npm run type-check

# Run web scraper
npm run scrape

# Generate AI summaries
npm run generate-summaries

# Generate static pages
npm run generate-pages
```

## GitHub CLI Commands

GitHub CLI (gh) is available for managing repository operations:

```bash
# Check authentication status
gh auth status

# Create a new repository
gh repo create IsTheWifiGood --public --description "Hotel Wi-Fi Quality Directory"

# Clone repository
gh repo clone yourusername/IsTheWifiGood

# Create and push a new branch
git checkout -b feature/design-system
git push -u origin feature/design-system

# Create a pull request
gh pr create --title "Implement Shadcn UI design system" --body "Added complete design system with animations and Shadcn UI integration"

# View pull requests
gh pr list
gh pr view 1

# Merge pull request
gh pr merge 1 --merge

# Create an issue
gh issue create --title "Set up web scraping for Google Reviews" --body "Implement Playwright scraper for hotel Wi-Fi reviews"

# View issues
gh issue list

# Create a release
gh release create v1.0.0 --title "MVP Launch" --notes "Initial launch with 90 hotels across Singapore, London, and NYC"
```

## Architecture & Core Concepts

### Data Flow
1. **Web Scraping**: Playwright scrapes Google Reviews for Wi-Fi mentions
2. **AI Processing**: GPT-4-mini generates structured summaries and scores
3. **Static Generation**: Next.js generates 200+ programmatic pages
4. **SEO Optimization**: Schema markup, meta tags, and sitemaps

### Page Types
- **City Hub Pages**: Overview of all hotels in a city (`/cities/singapore`)
- **Use Case Pages**: Hotels for specific needs (`/singapore-hotels-video-calls`)
- **Neighborhood Pages**: Hotels by area (`/singapore-marina-bay-hotels-wifi`)
- **Comparison Pages**: Chain vs chain (`/compare/singapore-marriott-vs-hilton`)
- **Speed Tier Pages**: Hotels by connection quality (`/singapore-hotels-excellent-wifi`)

### Database Schema
Core tables in Supabase:
- `hotels`: Hotel information and metadata
- `wifi_reviews`: Raw scraped reviews mentioning Wi-Fi
- `wifi_summaries`: AI-generated summaries and scores
- `cities`: City information and metadata
- `neighborhoods`: Neighborhood data within cities

### Design System Philosophy
- **Modern & Premium**: Stand out from typical directories
- **Data-Dense but Beautiful**: Inspired by Levels.fyi aesthetic
- **Performance with Beauty**: Fast loads despite rich visuals
- **Scannable Elegance**: Information hierarchy with style
- **Shadcn Foundation**: Built on accessible Radix UI primitives with Tailwind styling
- **Custom Enhancement**: Extend Shadcn components with custom animations and branding

## Key Components

### Core UI Components (Built on Shadcn Foundations)
- `HotelCard`: Extends Shadcn Card with shadow hover, lift animation, gradient overlay
- `WiFiStrengthBars`: Custom component with animated fill based on score (1-5 bars)
- `ScoreBadge`: Extends Shadcn Badge with floating position, rotation hover effect
- `CityGrid`: Custom grid layout using Shadcn Card base with emoji flags, gradient backgrounds
- `NavigationBar`: Shadcn Navigation Menu with fixed floating position, backdrop blur
- `Hero`: Custom component with animated gradient background and mesh overlay

### Component Implementation Strategy
```jsx
// Example: Extending Shadcn Card for HotelCard
import { Card, CardHeader, CardContent } from "@/components/ui/card"

const HotelCard = ({ hotel }) => {
  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3>{hotel.name}</h3>
          <ScoreBadge score={hotel.wifiScore} />
        </div>
      </CardHeader>
      <CardContent>
        <WiFiStrengthBars strength={hotel.wifiScore} />
        {/* Custom animations and styling on top of Shadcn foundation */}
      </CardContent>
    </Card>
  )
}
```

### Animation Specifications
- Global transitions: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Hover effects: translateY(-4px) for cards
- Gradient animations: 15s infinite gradient-shift
- Fade in animations: 600ms ease-out

### Color System
```css
/* WiFi Quality Indicators (Critical for UX) */
--wifi-excellent: #10B981; /* Emerald */
--wifi-good: #3B82F6;      /* Blue */
--wifi-moderate: #F59E0B;   /* Amber */
--wifi-poor: #EF4444;       /* Red */

/* Primary Colors */
--primary-500: #0052FF;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## Data Collection Strategy

### Web Scraping Configuration
- **Primary Source**: Google Reviews (MVP scope)
- **Tool**: Playwright with rate limiting (8-10 seconds between requests)
- **Target**: 10-20 WiFi mentions per hotel
- **Fallback**: Manual collection if blocked

### AI Summary Generation (GPT-5-mini)
```javascript
// Process reviews into structured data with GPT-5-mini
const generateSummary = async (reviews, hotelName) => {
  const prompt = `
    Analyze these WiFi-related reviews for ${hotelName}:
    ${reviews.join('\n')}
    
    Create:
    1. Summary (2-3 sentences with specific speeds if mentioned)
    2. Score (1-5)
    3. Highlights (3 positives)
    4. Warnings (1-2 if applicable)
    5. Use case scores (video_calls, streaming, uploads: 1-5)
    
    Be specific and factual. No hallucinations.
  `;
  
  return await openai.chat.completions.create({
    model: "gpt-5-mini", // Updated to GPT-5-mini
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.3
  });
};

// Cost: $0.25/1M input tokens, $2/1M output tokens
// Estimated cost per hotel: ~$0.01 (much more cost-effective than GPT-4)
```

## Performance Requirements
- Lighthouse Score: 90+
- LCP: <2.5s
- FCP: <1.5s
- CLS: <0.1
- Animation FPS: 60fps

## SEO Strategy
- 400+ words unique content per page
- Schema markup (Hotel, LocalBusiness, FAQPage)
- Meta descriptions with keywords
- OpenGraph images with gradient backgrounds
- XML sitemap generation
- Internal linking (5-10 per page)

## Development Workflow
1. Set up Next.js project with TypeScript
2. Implement complete design system with animations
3. Set up Supabase database and schemas
4. Build Playwright scraper for Google Reviews
5. Implement AI summary generation pipeline
6. Create page templates with full design system
7. Generate static pages for all content
8. Deploy to Vercel with analytics

## Task Management

This project uses a comprehensive task tracking system to manage the 104 implementation tasks across 6 phases.

### Task Files
- **TASKS.md**: Complete task breakdown with progress tracking
- **GitHub Issues**: Major milestones and phase tracking
- **TodoWrite tool**: Session-specific task management in Claude Code

### Progress Commands
```bash
# View all tasks
cat TASKS.md

# Count completed tasks
grep -c "- \[x\]" TASKS.md

# Show incomplete tasks only
grep "- \[ \]" TASKS.md

# Mark task complete (edit file directly)
# Change [ ] to [x] for completed tasks

# Create GitHub issues for phases
gh issue create --title "Phase 1: Project Foundation" --body-file .github/ISSUE_TEMPLATE/phase-template.md
```

### Progress Tracking
Tasks are organized into 6 phases with clear dependencies. Update TASKS.md as work progresses to maintain visibility across Claude Code sessions.

## Important Notes
- MVP focuses on 3 cities: Singapore, London, New York (90 hotels total)
- No user accounts, search functionality, or dynamic filtering in MVP
- Design system implementation is critical for differentiation
- All interactive elements should have hover states and animations
- Performance must be maintained despite rich visual design
