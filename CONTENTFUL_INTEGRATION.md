# Contentful Integration Guide

This guide explains how to set up and use Contentful CMS with this Next.js application.

## Overview

The application integrates with Contentful to provide a flexible content management system with three main content types:

- **Landing Pages**: Dynamic pages with configurable sections
- **Pages**: Simple pages with title, featured image, and body content
- **Articles**: Blog-style content with metadata and rich content
- **Menus**: Dynamic navigation menus for header and footer

## Environment Setup

Create a `.env` file in the root directory with your Contentful credentials:

```env
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_ACCESS_TOKEN=your_delivery_api_token_here
CONTENTFUL_MANAGEMENT_TOKEN=your_management_api_token_here
```

### Where to find these tokens:

1. **Space ID**: Contentful → Settings → General Settings
2. **Access Token**: Contentful → Settings → API Keys → Content Delivery API
3. **Management Token**: Contentful → Settings → API Keys → Content Management API

## Quick Start

1. **Setup content types**:
   ```bash
   npm run setup-contentful
   ```

2. **Create sample content**:
   ```bash
   npm run create-landing    # Creates a sample landing page
   npm run create-pages      # Creates sample pages and articles
   npm run create-menus      # Creates navigation menus
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

## Content Types

### Landing Pages (`landing`)

Dynamic pages built with configurable sections.

**Fields**:
- `title` (Text): Page title
- `slug` (Text): URL slug (unique)
- `sections` (Array of References): Array of section components

**Available Sections**:
- Hero, Text, Card Group, Gallery, Carousel
- Quote, Accordion, Pricing, Media, Newsletter
- Logo Collection, Side by Side, Embed

**Example URL**: `/demo-landing-123456789`

### Pages (`page`)

Simple content pages with basic structure.

**Fields**:
- `title` (Text): Page title
- `slug` (Text): URL slug (unique)
- `mediaPage` (Media): Featured image
- `body` (Rich Text): Page content

**Example URL**: `/about-us`

### Articles (`article`)

Blog-style content with enhanced metadata.

**Fields**:
- `title` (Text): Article title
- `slug` (Text): URL slug (unique)
- `subhead` (Text): Article subtitle
- `lead` (Rich Text): Article summary/lead
- `media` (Media): Featured image
- `body` (Rich Text): Full article content

**Example URL**: `/latest-tech-trends`

### Menu Items (`menuItem`)

Individual navigation items.

**Fields**:
- `title` (Text): Display text
- `url` (Text): Link URL
- `order` (Number): Sort order
- `children` (Array of References): Child menu items for dropdowns

### Menus (`menu`)

Navigation menu containers.

**Fields**:
- `name` (Text): Menu display name
- `identifier` (Text): Unique identifier ('main' or 'footer')
- `items` (Array of References): Menu items

## Navigation System

The application uses Contentful-managed menus for all navigation:

### Main Navigation
Controlled by the menu with `identifier: 'main'`

### Footer Navigation
Controlled by the menu with `identifier: 'footer'`

### Menu Requirements
Both main and footer menus should be created in Contentful for proper navigation display. If menus are not available, navigation areas will be empty until menus are created.

## Usage Examples

### Creating a Landing Page

1. Create section components (Hero, Text, etc.)
2. Create a Landing Page entry
3. Add sections to the landing page
4. Set a unique slug

### Creating a Menu

1. Create Menu Items with titles and URLs
2. Set order numbers for sorting
3. Create a Menu with identifier 'main' or 'footer'
4. Add Menu Items to the Menu

### Custom Sections

Each section type has specific fields. For example:

**Hero Section**:
- Title, Heading, Summary
- Media, Links
- Layout options

**Card Group**:
- Title, Summary
- Array of Card entries

## Component Integration

The application automatically renders content based on type:

```typescript
// Dynamic routing handles all content types
switch (contentType) {
  case 'landing':
    return <Landing landing={content} />
  case 'page':
    return <Page page={content} />
  case 'article':
    return <Article article={content} />
}
```

## Available Scripts

### Setup and Content Creation
```bash
npm run setup-contentful     # Creates all content types
npm run create-landing       # Creates sample landing page
npm run create-pages         # Creates sample pages and articles
npm run create-menus         # Creates navigation menus
```

### Content Management
```bash
npm run cleanup-content      # Removes all content (preserves structure)
npm run cleanup-all          # Removes content and content types
```

## Development Workflow

1. **Content Types**: Use `setup-contentful` to create/update structure
2. **Content Creation**: Use Contentful web interface or scripts
3. **Development**: Run `npm run dev` and content appears automatically
4. **Menus**: Update navigation through Contentful interface

## Menu Management

### Adding Menu Items
1. Go to Contentful → Content
2. Create new Menu Item entries
3. Add to existing Menu or create new Menu

### Menu Structure
Menus support hierarchical structure:
- Top-level items appear in main navigation
- Child items create dropdown menus
- Order field controls display sequence

### Dynamic Updates
Menu changes in Contentful appear immediately (no code deployment needed). **Note**: Menus must be created in Contentful for navigation to appear.

## Rich Text Content

The system supports full rich text editing with:
- Headings (H1-H6)
- Paragraphs with formatting
- Lists (ordered/unordered)
- Links and emphasis
- Blockquotes and horizontal rules

## Image Optimization

All images are automatically optimized using Next.js Image component:
- Responsive sizing
- Lazy loading
- WebP conversion
- Proper alt text from Contentful

## Static Generation

The application pre-generates all pages at build time:
- Fast loading times
- SEO optimization
- Automatic sitemap generation

## Troubleshooting

### Common Issues

**"No content found"**: Check Contentful space ID and access tokens

**"No navigation menus"**: Create Menu entries with identifiers 'main' and 'footer' in Contentful

**Build errors**: Ensure all referenced content is published in Contentful

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages and content fetching logs.

## Advanced Features

### Custom Sections
Add new section types by:
1. Creating new content type in `setup-contentful.ts`
2. Building React component in `/components/sections/`
3. Adding to SectionRenderer switch statement

### Menu Customization
Customize menu rendering in:
- `/components/Header.tsx` (main navigation)
- `/components/Footer.tsx` (footer navigation)

### Content Relationships
Use Contentful's reference fields to create:
- Related articles
- Content hierarchies
- Cross-content linking

This integration provides a powerful, flexible CMS solution while maintaining the performance benefits of Next.js static generation.
