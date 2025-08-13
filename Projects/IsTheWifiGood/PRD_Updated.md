You're absolutely right! Let me revise the PRD to properly include the design system in the MVP scope (it's critical for differentiation) and fix the web scraping scope issue.

# Product Requirements Document: "Is The Wi-Fi Good?" - Directory MVP V1

**Author:** [Your Name]  
**Version:** 3.1  
**Date:** 2025-01-11  
**Product Type:** Specialized Directory Website

---

## 1. Executive Summary

### 1.1. Product Definition
"Is The Wi-Fi Good?" is a specialized directory website focused on hotel Wi-Fi quality for business travelers. This is a content-driven, SEO-optimized directory that provides structured, trustworthy data about hotel internet connectivity across major business travel destinations.

### 1.2. Business Model
- **Primary:** Organic search traffic → Affiliate revenue (future)
- **Secondary:** Newsletter audience building → B2B data product (future)
- **Long-term:** API access for enterprise customers

### 1.3. Core Thesis
By focusing exclusively on Wi-Fi quality and building the most comprehensive, trustworthy dataset in this niche, we can capture significant search traffic and build a defensible business around a specific, high-value pain point.

---

## 2. Problem & Solution

### 2.1. The Problem
Business travelers and remote workers waste hours reading through unstructured reviews trying to determine if a hotel's Wi-Fi will support their work needs. Current solutions are inadequate:
- **Review sites** bury Wi-Fi information in general reviews
- **Booking platforms** only show "Free Wi-Fi" as a binary checkbox
- **No standardization** exists for comparing connectivity quality

### 2.2. The Solution
A dedicated directory that:
- Aggregates and analyzes thousands of Wi-Fi-specific review mentions
- Provides AI-generated, standardized summaries for each hotel
- Creates programmatic pages targeting specific search intents
- Delivers instant, trustworthy answers to "Will the Wi-Fi work for my needs?"

### 2.3. What This Is (and Isn't)

**This IS:**
- A directory website with programmatically generated pages
- A content/SEO-driven business similar to Levels.fyi or NomadList
- A trusted source of structured Wi-Fi quality data
- A lean, fast-to-market MVP that can launch in 2 weeks

**This IS NOT:**
- A SaaS platform requiring user accounts
- A booking platform competing with OTAs
- A social network or review platform
- A complex web application requiring extensive development

---

## 3. Target Audience

### 3.1. Primary Audience
**Business Travelers** (ages 28-55)
- Travel 5+ times per year for work
- Depend on reliable internet for video calls, file uploads, VPN access
- Book hotels themselves or influence booking decisions
- Value efficiency and reliable information

### 3.2. Secondary Audiences
- **Digital Nomads:** Need long-term reliable connectivity
- **Remote Workers:** Working from hotels while traveling
- **Travel Managers:** Booking for employees, need quality assurance

### 3.3. User Intent Keywords
Users find us by searching:
- "singapore hotels good wifi"
- "marriott vs hilton wifi london"
- "hotels reliable internet video calls NYC"
- "marina bay hotels fast internet"

---

## 4. MVP Scope & Features

### 4.1. MVP Scope (Week 1-2 Launch)

**IN SCOPE:**
- 3 cities: Singapore, London, New York
- 30 hotels per city (90 total)
- **Web scraping with Playwright** (Google Reviews focus)
- AI-generated Wi-Fi quality summaries
- 200+ programmatically generated pages
- Static site generation (Next.js)
- **Complete design system implementation**
- **Beautiful, modern UI with animations**
- Substack newsletter integration
- Basic analytics (Google Analytics)
- SEO optimization (meta tags, schema markup, sitemap)

**OUT OF SCOPE for MVP:**
- User accounts or authentication
- Search functionality (navigation only)
- Dynamic filtering or sorting
- Hotel pricing information
- User-submitted reviews
- Hotel detail pages (link directly to hotel websites)
- Mobile app or PWA features
- Complex scraping (Booking.com, Trip.com - Google Reviews only for MVP)

### 4.2. Core Features

#### 4.2.1. Directory Pages
- **City Hub Pages** (3 pages): Overview of all hotels in a city
- **Use Case Pages** (15 pages): Hotels for specific needs (video-calls, streaming, etc.)
- **Neighborhood Pages** (30 pages): Hotels by area within each city
- **Comparison Pages** (15 pages): Chain vs chain comparisons
- **Speed Tier Pages** (12 pages): Hotels by connection quality level

#### 4.2.2. Data Display
Each hotel entry shows:
- Hotel name and neighborhood
- AI-generated Wi-Fi summary (2-3 sentences)
- **Animated WiFi strength indicator** (1-5 bars)
- **Gradient quality score badge** with hover effects
- **Key highlights in gradient pill format**
- Last updated date

#### 4.2.3. Design System Features
- **Animated gradient hero section**
- **Floating navigation with backdrop blur**
- **Hotel cards with hover lift animations**
- **Smooth transitions (300ms global)**
- **Custom color system with WiFi quality indicators**
- **Typography hierarchy with Inter font**
- **Glass morphism effects on key elements**

#### 4.2.4. Newsletter Integration
- Substack embed in footer of every page
- "WiFi Weekly" newsletter with curated insights
- No popups or aggressive capture methods

---

## 5. Design System & User Experience (MVP CRITICAL)

### 5.1. Design Philosophy
The design system is **essential to MVP success** - it differentiates us from boring directories and builds trust immediately.

- **Modern & Premium:** Stand out from typical directories
- **Data-Dense but Beautiful:** Inspired by Levels.fyi aesthetic
- **Trust Through Polish:** Professional design = trustworthy data
- **Performance with Beauty:** Fast loads despite rich visuals
- **Scannable Elegance:** Information hierarchy with style

### 5.2. Core Design System

#### 5.2.1. Color Palette
```css
/* Primary Colors */
--primary-500: #0052FF;
--primary-600: #0047E0;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #FAFBFC;
--bg-tertiary: #F3F4F6;
--bg-card-hover: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

/* WiFi Quality Indicators (Critical for UX) */
--wifi-excellent: #10B981; /* Emerald */
--wifi-good: #3B82F6;      /* Blue */
--wifi-moderate: #F59E0B;   /* Amber */
--wifi-poor: #EF4444;       /* Red */

/* Text */
--text-primary: #0F172A;
--text-secondary: #475569;
--text-tertiary: #94A3B8;

/* Accent Gradients */
--accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.18);
```

#### 5.2.2. Component Library
```jsx
Core Components (All with animations):
- HotelCard: Shadow on hover, lift animation, gradient overlay
- WiFiStrengthBars: Animated fill based on score
- ScoreBadge: Floating with rotation on hover
- CityGrid: Emoji flags, gradient backgrounds
- NavigationBar: Fixed, floating with backdrop blur
- Hero: Animated gradient background with mesh overlay
- HighlightPills: Gradient backgrounds, hover effects
- Footer: Clean with integrated newsletter
```

#### 5.2.3. Animation Specifications
```css
/* Global transitions */
* { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

/* Hover effects */
.card:hover { transform: translateY(-4px); }
.badge:hover { transform: rotate(6deg); }

/* Gradient animations */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Fade in animations */
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
```

#### 5.2.4. Typography System
```css
Font Stack:
- Headings: 'Cal Sans', 'Inter', system-ui
- Body: 'Inter', system-ui, sans-serif
- Monospace: 'JetBrains Mono' (for data)

Sizing:
- Base: 18px
- H1: 3rem (48px)
- H2: 2rem (32px)
- H3: 1.5rem (24px)
- Body: 1.125rem (18px)
- Small: 0.875rem (14px)
```

### 5.3. Key UI Patterns

#### 5.3.1. Hotel Card Design
```jsx
Visual Structure:
┌─────────────────────────────────┐
│ [Hotel Name]              [4.5] │ <- Floating badge
│ 📍 Marina Bay                   │
│                                 │
│ "Excellent speeds throughout... │
│ dedicated business network..."  │
│                                 │
│ ▓▓▓▓▓ WiFi Strength           │ <- Animated bars
│                                 │
│ [✓ 24/7 Support] [✓ 200+ Mbps] │ <- Gradient pills
└─────────────────────────────────┘
   ↑ Lifts on hover with shadow
```

#### 5.3.2. Hero Section
```jsx
Visual Structure:
┌─────────────────────────────────┐
│ Animated Gradient Background    │
│   + Mesh Pattern Overlay        │
│                                 │
│  Never Suffer From             │
│  BAD HOTEL WIFI AGAIN          │ <- Gradient text
│                                 │
│  [🇸🇬 Singapore] [🇬🇧 London]   │ <- City cards
│  [🇺🇸 New York]                │    with hover lift
└─────────────────────────────────┘
```

---

## 6. Data Acquisition Strategy (IN SCOPE FOR MVP)

### 6.1. Web Scraping Implementation

#### 6.1.1. Primary Tool: Playwright
**Scope:** Google Reviews scraping is **IN SCOPE** for MVP
```javascript
Technology Stack:
- Playwright for browser automation
- Local execution (no cloud complexity)
- Sequential processing (1 hotel at a time)
- Rate limiting: 8-10 seconds between requests
```

#### 6.1.2. Scraping Targets (Week 1)
```markdown
Priority 1 (MVP):
✅ Google Reviews/Maps - PRIMARY SOURCE
- Most accessible
- Good WiFi mention density
- Less aggressive anti-scraping

Priority 2 (Post-MVP):
⏳ Trip.com - Future enhancement
⏳ Booking.com - Future enhancement
```

#### 6.1.3. Scraping Process
```javascript
Day 1-2: Google Reviews Collection
- Target: 10-20 WiFi mentions per hotel
- Fallback: Manual collection if blocked
- Storage: Raw JSON in Supabase
- Expected yield: 70-80% of hotels with sufficient data

Day 3: Gap Filling
- Manual research for hotels with <5 mentions
- Reddit searches
- Hotel website research
- Brand standard assumptions
```

### 6.2. AI Summary Generation (Days 4-5)

```javascript
// GPT-4 Processing Pipeline
const generateSummary = async (reviews) => {
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
  
  return await openai.createCompletion({
    model: "gpt-4-mini",
    prompt,
    max_tokens: 500
  });
};
```

---

## 7. Directory Structure & Information Architecture

### 7.1. URL Structure
```
/                                          # Homepage with animated hero
/cities/singapore                         # City hub with all hotels
/singapore-hotels-video-calls            # Use case page
/singapore-marina-bay-hotels-wifi        # Neighborhood page
/compare/singapore-marriott-vs-hilton    # Comparison page
/singapore-hotels-excellent-wifi         # Speed tier page
/guide/[seo-focused-content]             # Blog content
```

### 7.2. Navigation Structure
- **Floating Nav Bar:** Cities | Use Cases | Compare | Guide
- **Visual City Grid:** Homepage centerpiece with animations
- **Footer:** Complete sitemap, newsletter signup
- **No search in MVP:** Pure navigation-based discovery

---

## 8. Technical Implementation

### 8.1. Technology Stack
```javascript
Core Stack:
- Framework: Next.js 14 (App Router)
- Database: Supabase (PostgreSQL)
- Styling: Tailwind CSS + Custom CSS animations
- Scraping: Playwright (local execution)
- AI: OpenAI GPT-4-mini
- Hosting: Vercel
- Newsletter: Substack (embedded)
- Analytics: Google Analytics 4
- Icons: Lucide React
- Fonts: Inter (Google Fonts)
```

### 8.2. Implementation Timeline

**Week 1: Foundation & Data**
```
Monday-Tuesday:
✅ Next.js project setup
✅ Complete design system implementation
✅ Component library with animations
✅ Database schema

Wednesday-Thursday:
✅ Playwright scraping setup
✅ Google Reviews data collection
✅ Raw data storage

Friday:
✅ AI summary generation
✅ Data QA and cleanup
```

**Week 2: Build & Polish**
```
Monday-Tuesday:
✅ Implement all page templates
✅ Apply design system fully
✅ Add all animations and transitions

Wednesday-Thursday:
✅ Generate 200+ static pages
✅ SEO optimization
✅ Test all hover states and animations

Friday:
✅ Production deployment
✅ Google Search Console
✅ Launch!
```

### 8.3. Performance Requirements
Despite rich visuals, maintain:
- Lighthouse Score: 90+
- LCP: <2.5s
- FCP: <1.5s
- CLS: <0.1
- Animation FPS: 60fps

---

## 9. Content Strategy & Programmatic SEO

### 9.1. Page Templates (All with Full Design System)

Each template includes:
- Animated page transitions
- Gradient accents
- Hover effects on all interactive elements
- Visual WiFi indicators
- Consistent color coding for quality

#### Template Example: City Hub
```jsx
Features:
- Animated hero with city name
- Grid of hotel cards with hover lifts
- WiFi quality color coding
- Smooth scroll animations
- Interactive neighborhood filter (visual)
```

### 9.2. SEO Requirements
- 400+ words unique content per page
- Schema markup (Hotel, LocalBusiness, FAQPage)
- Meta descriptions with keywords
- OpenGraph images with gradient backgrounds
- XML sitemap
- Internal linking (5-10 per page)

---

## 10. Launch Checklist

### Design System Implementation
- [ ] All components built with animations
- [ ] Color system applied consistently
- [ ] Typography hierarchy implemented
- [ ] Hover states on all interactive elements
- [ ] Gradient backgrounds on hero/cards
- [ ] WiFi strength indicators animated
- [ ] Mobile responsive design
- [ ] Dark mode consideration (future)

### Data Collection
- [ ] Playwright scraper tested and working
- [ ] 90 hotels scraped from Google Reviews
- [ ] AI summaries generated
- [ ] Quality scores assigned
- [ ] Manual gaps filled

### Technical
- [ ] All 200+ pages generated
- [ ] SEO meta tags on all pages
- [ ] Performance tested (<2.5s load)
- [ ] Analytics installed
- [ ] Newsletter integrated

---

## 11. Success Metrics

### Launch Week
- Design quality feedback from 10+ users
- All animations working smoothly
- No broken pages or components
- Positive initial user reactions to design

### Month 1
- **Visual Engagement:** >2 min average session
- **Design Compliments:** Unprompted positive feedback
- **Social Shares:** Screenshots shared on social media
- **Newsletter Signups:** 100+ (attracted by quality)

### Month 3
- **Brand Recognition:** Direct traffic >10%
- **Return Visitors:** >20% return rate
- **Quality Perception:** Reviews mention "beautiful" or "well-designed"
- **Organic Backlinks:** From design/travel blogs

---

## Appendix A: Playwright Scraping Configuration

```javascript
// config/scraper.js
const scraperConfig = {
  browser: {
    headless: false, // Run visible for MVP to monitor
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  },
  
  targets: {
    googleReviews: {
      enabled: true,
      rateLimit: 8000, // 8 seconds between hotels
      retries: 2,
      timeout: 30000
    },
    tripcom: {
      enabled: false // Post-MVP
    },
    booking: {
      enabled: false // Post-MVP
    }
  },
  
  extraction: {
    minReviews: 5,
    keywords: ['wifi', 'wi-fi', 'internet', 'connection', 'speed'],
    maxReviewAge: 730 // days (2 years)
  }
};
```

---

## Appendix B: Design System Component Specifications

```jsx
// Complete Component List with Visual Specs

1. HotelCard
   - Background: White with 0.08 opacity shadow
   - Hover: -4px translateY, 0.12 opacity shadow
   - Border: 1px solid gray-100, hover:blue-200
   - Gradient overlay on hover (blue-500/5 to purple-500/5)
   - Score badge: Floating, -top-3 -right-3, rotate on hover

2. WiFiStrengthIndicator
   - 5 bars with increasing height (12px to 28px)
   - Color based on score (emerald/blue/amber)
   - Staggered animation on load (100ms delay each)
   - Smooth fill transition (500ms)

3. Hero Section
   - Min height: 500px
   - Gradient: blue-400 via purple-500 to pink-500
   - Animation: gradient-shift 15s infinite
   - Mesh overlay: 30% opacity
   - Text: White with drop-shadow-2xl

4. Navigation Bar
   - Position: Fixed top-4
   - Background: white/80 with backdrop-blur-md
   - Border-radius: 9999px (full)
   - Shadow: shadow-lg
   - Logo: Gradient text (blue-600 to purple-600)

5. City Grid Cards
   - Padding: 2rem
   - Background: White
   - Border-radius: 1.5rem (rounded-3xl)
   - Shadow: shadow-xl, hover:shadow-2xl
   - Hover: -8px translateY
   - Decorative dot: Scales 150% on hover
```

---