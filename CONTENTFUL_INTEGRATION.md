# Contentful Integration Guide

This project now includes full Contentful integration with React components for rendering different content types.

## Overview

The integration provides three main content types that correspond to React components:

- **Landing Pages** - Dynamic pages with flexible section arrays
- **Pages** - Basic pages with title, featured image, and body content
- **Articles** - Blog articles with title, subhead, lead, featured image, and body

## Components

### Main Page Components

Located in `/components/`:

- `Landing.tsx` - Renders landing pages with dynamic sections
- `Page.tsx` - Renders basic pages
- `Article.tsx` - Renders blog articles

### Section Components

Located in `/components/sections/`:

- `SectionRenderer.tsx` - Dynamically renders the appropriate section component
- Individual section components (Hero, Text, Card, etc.)

## Content Types

### Landing Page
- **Fields**: title, slug, sections (array of section references)
- **Usage**: Dynamic pages built from reusable sections
- **Component**: `<Landing landing={entry} />`

### Page
- **Fields**: title, slug, mediaPage (featured image), body (rich text)
- **Usage**: Simple pages like About, Contact, Services
- **Component**: `<Page page={entry} />`

### Article
- **Fields**: title, slug, subhead, lead (rich text), media (featured image), body (rich text)
- **Usage**: Blog posts, news articles, case studies
- **Component**: `<Article article={entry} />`

## Section Types

The following section types are available for building landing pages:

- **Hero** - Hero sections with title, heading, media, and CTAs
- **Text** - Rich text content with layout options
- **Card/CardGroup** - Individual cards or collections of cards
- **Accordion** - Expandable FAQ sections
- **Gallery** - Image galleries
- **Pricing** - Pricing tables
- **Carousel** - Image/content carousels
- **Quote** - Testimonials
- **Media** - Simple media display
- **Embed** - Third-party embeds
- **Newsletter** - Newsletter signup forms
- **LogoCollection** - Logo grids
- **SideBySide** - Two-column layouts

## Usage Examples

### Fetching Content

```typescript
import { getEntryBySlug } from '@/utils/contentful'

// Get a landing page
const landingPage = await getEntryBySlug('landing', 'home')

// Get a regular page
const aboutPage = await getEntryBySlug('page', 'about-us')

// Get an article
const article = await getEntryBySlug('article', 'my-blog-post')
```

### Rendering Components

```tsx
import { Landing, Page, Article } from '@/components'

// Render a landing page
<Landing landing={landingPageEntry} />

// Render a page
<Page page={pageEntry} />

// Render an article
<Article article={articleEntry} />
```

### Dynamic Routing

The app uses a catch-all route at `app/[[...slug]]/page.tsx` that automatically:

1. Fetches content from all content types based on the slug
2. Determines the content type
3. Renders the appropriate component

This means URLs like:
- `/home` - Could be a landing page
- `/about-us` - Could be a regular page
- `/blog/my-article` - Could be an article

## Scripts

Use the following npm scripts to manage your Contentful content:

```bash
# Setup content types
npm run setup-contentful

# Create demo landing page with sections
npm run create-landing

# Create sample pages and articles
npm run create-pages

# Clean up content only (preserve structure)
npm run cleanup-content

# Clean up everything including content types
npm run cleanup-all
```

## Environment Variables

Make sure your `.env` file contains:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

## Rich Text Handling

Rich text content from Contentful is automatically converted to HTML using the `resolveRichText` utility function. This supports:

- Paragraphs
- Headings (H1-H6)
- Lists (ordered and unordered)
- Text formatting (bold, italic, underline, code)
- Blockquotes
- Horizontal rules

## Image Optimization

All images use Next.js `Image` component for automatic optimization:

- Automatic format conversion (WebP/AVIF)
- Responsive sizing with `sizes` attribute
- Lazy loading by default
- Priority loading for above-the-fold images

## TypeScript Support

All components are fully typed with TypeScript interfaces that match the Contentful field structure.

## Development Workflow

1. **Setup**: Run `npm run setup-contentful` to create content types
2. **Content**: Create content in Contentful or use demo scripts
3. **Development**: Content is automatically fetched and rendered
4. **Build**: Static generation works with `generateStaticParams`

## Next Steps

- Add more section types as needed
- Customize styling and layouts
- Add preview mode for draft content
- Implement search and filtering
- Add internationalization support
