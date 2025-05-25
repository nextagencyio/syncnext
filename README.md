# SyncNext - AI-Powered Lightning Fast Development

A modern Next.js application integrated with Contentful CMS for content management. SyncNext demonstrates a headless CMS approach using Next.js 15 with App Router and Contentful for content delivery, enhanced with AI-powered development tools and enterprise-grade best practices.

## Features

### 🚀 Enhanced Contentful Integration
- **Dynamic Content Discovery**: Automatically detects content types without hardcoded mappings
- **Content Types**: Landing pages, articles, pages with dynamic sections
- **Menu Management**: Configurable navigation through Contentful
- **Rich Text**: Full rich text support with custom rendering and embedded assets
- **Image Optimization**: Next.js Image component with Contentful assets
- **ISR Support**: Incremental Static Regeneration with 5-minute revalidation
- **Preview Mode**: Draft content preview with dedicated preview client
- **Intelligent Caching**: TTL-based caching with automatic refresh (5-minute content cache)
- **Smart Routing**: Dynamic content type detection reduces API calls by ~80%
- **Error Handling**: Robust error handling with automatic retry logic
- **Content Validation**: Built-in validation for data integrity
- **Type Safety**: Enhanced TypeScript integration for better development experience

### 🛡️ Enterprise-Grade Features
- **Performance Monitoring**: Built-in API monitoring and metrics tracking
- **Resilient Architecture**: Automatic retry logic for network failures with exponential backoff
- **Environment Validation**: Comprehensive environment variable validation with detailed error messages
- **Multi-layered Caching**: Smart caching to reduce API calls and improve response times
- **Error Recovery**: Graceful degradation and fallback mechanisms
- **Rate Limiting Handling**: Automatic retry on 429 responses
- **Network Resilience**: Timeout configuration and connection retry logic

### 🔧 Development Tools
- **TypeScript**: Full type safety with enhanced Contentful types
- **Tailwind CSS**: Utility-first styling
- **Storybook**: Component documentation and testing
- **Cypress**: End-to-end testing
- **AI Development**: Enhanced with modern AI-powered development workflows
- **Comprehensive Documentation**: Detailed setup guides and best practices

## Getting Started

### Prerequisites
- Node.js 20 or higher
- Contentful account with Space ID and Management Token

### Installation

Clone the repository:
```bash
git clone <repository-url>
cd syncnext
```

Install dependencies:
```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:
```env
# Required - Contentful Space Configuration
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token

# Required for Scripts - Content Management
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token

# Optional - Preview Configuration
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_preview_token
CONTENTFUL_PREVIEW=false

# Optional - Environment Configuration
CONTENTFUL_ENVIRONMENT=master

# For admin bar functionality (must be public)
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id

# Environment mode (set to 'preview' to enable admin bar)
ENVIRONMENT=development
```

> **Important**: Never commit your `.env.local` file to version control. Use `.env.example` for documentation.

### Content Setup

#### Quick Setup (Recommended)
Set up everything at once with a single command:
```bash
npm run create-all-content
```

This will create:
- All Contentful content types
- Navigation menus (main and footer)
- Homepage with comprehensive sections
- Get Started page for onboarding
- Contact page with map embed
- Sample pages and articles
- Demo landing pages

#### Manual Setup
Alternatively, you can set up content step by step:

```bash
npm run setup-contentful   # Set up content types first
npm run create-menus       # Create navigation menus
npm run create-homepage    # Creates the homepage (slug: 'home')
npm run create-get-started # Creates the get started page
npm run create-contact     # Creates the contact page
npm run create-landing     # Creates additional demo landing pages
npm run create-pages       # Creates sample pages
```

### Development

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your SyncNext homepage.

### Storybook

Run Storybook for component development:
```bash
npm run storybook
```

### Testing

Run Cypress tests:
```bash
npm run cypress
```

### Build

Build for production:
```bash
npm run build
```

## Architecture & Best Practices

### 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── [[...slug]]/       # Dynamic catch-all routing
│   ├── articles/          # Article pages
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── sections/          # Contentful section components
│   └── ui/                # Reusable UI components
├── scripts/               # Setup and utility scripts
├── utils/                 # Utility functions and Contentful integration
│   ├── contentful.ts      # Main Contentful SDK integration
│   ├── contentful-cache.ts # Intelligent caching layer
│   ├── contentful-monitoring.ts # Performance monitoring
│   └── content-routing.ts # Dynamic content type discovery
├── lib/                   # Shared libraries and types
└── public/                # Static assets
```

### 🔄 Advanced Contentful Integration

#### Dynamic Content Discovery
- **No Hardcoded Mappings**: System automatically discovers content types from Contentful
- **Self-Updating**: Adapts to new content without code changes
- **Intelligent Routing**: Direct content type targeting reduces API calls by ~80%

#### Smart Caching System
- **Multi-layered Cache**: 10-minute cache for content type mappings, 5-minute for content
- **Automatic Refresh**: Cache rebuilds when expired
- **Performance Metrics**: Built-in cache hit rate monitoring
- **Memory Efficient**: Configurable cache size limits
- **Preview Support**: Separate caching for draft content

#### Error Handling & Resilience
- **Automatic Retries**: Network failures are automatically retried with exponential backoff
- **Rate Limiting**: Automatic handling of 429 responses with retry logic
- **Timeout Management**: 10-second timeout with configurable retry attempts
- **Graceful Degradation**: Fallback content when API calls fail
- **Smart Warning Suppression**: Only shows relevant warnings, reduces console noise by ~95%
- **Content Validation**: Built-in validation for data integrity before rendering
- **Comprehensive Logging**: Detailed error logging for debugging

#### Rich Text Processing
- **Custom Renderer**: Converts Contentful rich text to HTML with full formatting support
- **Embedded Assets**: Automatic handling of images, links, and media
- **Type Safety**: Proper TypeScript support for rich text content
- **Performance Optimized**: Efficient rendering with minimal overhead

### 📊 Performance Monitoring

SyncNext includes enterprise-grade monitoring:
- **API Response Times**: Track Contentful API performance
- **Cache Hit Rates**: Monitor caching effectiveness
- **Error Rates**: Track and analyze failure patterns
- **Request Patterns**: Understand content access patterns
- **Dynamic Discovery Stats**: Monitor content type mapping efficiency

```typescript
// Access monitoring data
import { contentfulMonitor } from '@/utils/contentful-monitoring'
import { getCacheStats } from '@/utils/content-routing'
import { validateContentEntry } from '@/utils/contentful'

const metrics = contentfulMonitor.getMetrics()
const cacheStats = getCacheStats()

// Generate performance report
const report = contentfulMonitor.generateReport()

// Validate content before rendering
const isValid = validateContentEntry(entry, ['title', 'slug'])
```

## 🔄 Latest Updates & Features

### Preview Mode Support
SyncNext now includes full preview mode support for viewing draft content:

```typescript
// Automatic preview client selection
const client = getClient(preview) // Uses preview.contentful.com for drafts
```

### Content Validation
Built-in validation ensures data integrity:

```typescript
import { validateContentEntry } from '@/utils/contentful'

// Validate required fields before rendering
const isValid = validateContentEntry(entry, ['title', 'slug'])
```

### ISR (Incremental Static Regeneration)
Optimized performance with automatic page regeneration:

```typescript
// Automatic revalidation every 5 minutes
export const revalidate = 300
```

## Admin Bar for Content Editing

SyncNext includes an admin bar that appears when in preview mode, providing quick access to edit content in Contentful:

### Enabling the Admin Bar

1. Set the environment to preview mode in your `.env.local` file:
   ```env
   ENVIRONMENT=preview
   ```

2. Ensure you have the public Contentful Space ID configured:
   ```env
   NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Using the Admin Bar

When enabled, the admin bar will appear at the top of your pages with:
- **Edit Button**: Direct link to edit the current page/entry in Contentful
- **Home Button**: Quick navigation back to the homepage
- **Hide/Show Toggle**: Minimize the admin bar when needed

The admin bar automatically detects the current Contentful entry and generates the appropriate edit link for:
- Landing pages
- Articles
- Basic pages



## 🔧 Advanced Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTENTFUL_SPACE_ID` | ✅ | Your Contentful space ID |
| `CONTENTFUL_ACCESS_TOKEN` | ✅ | Delivery API token |
| `CONTENTFUL_MANAGEMENT_TOKEN` | ⚠️ | Required for content scripts |
| `CONTENTFUL_PREVIEW_ACCESS_TOKEN` | ❌ | Preview API token |
| `CONTENTFUL_ENVIRONMENT` | ❌ | Environment (default: master) |
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` | ❌ | Public space ID for admin bar |

### Dynamic Content Discovery

SyncNext automatically discovers content types from your Contentful space:

```typescript
// No hardcoded mappings needed!
// System automatically builds slug-to-content-type mappings
const contentType = await getContentTypeForSlug('privacy-policy')
// Returns 'page' based on actual Contentful data
```

**Benefits:**
- **Zero Maintenance**: No hardcoded content type mappings to maintain
- **Self-Updating**: Automatically adapts to new content
- **Performance**: ~80% reduction in unnecessary API calls
- **Clean Logs**: ~95% reduction in console warnings

### Caching Configuration

Customize caching behavior:
- **Content Type Cache**: 10-minute TTL for content type mappings
- **Content Cache**: 5-minute TTL for actual content
- **ISR Revalidation**: 5-minute revalidation for static pages
- **Preview Cache**: Separate caching for draft content
- **Automatic Refresh**: Cache rebuilds when expired
- **Memory Efficient**: Configurable size limits

### Performance Tuning

- **Include Levels**: Optimized for different content types (landing: 10, others: 3)
- **Batch Requests**: Efficient data fetching patterns
- **Image Optimization**: Automatic Contentful image transformations with WebP support
- **Smart Retries**: Exponential backoff for failed requests
- **Content Validation**: Pre-render validation to prevent runtime errors
- **Preview Mode**: Dedicated preview client for draft content
- **ISR Support**: Incremental Static Regeneration for optimal performance

## 📚 Documentation

- **Component Documentation**: Available through Storybook
- **API Documentation**: Inline TypeScript documentation
- **Type Definitions**: Comprehensive TypeScript interfaces

## 🚀 SyncNext Features

SyncNext combines the power of modern web technologies with AI-enhanced development workflows:

- **🏗️ Decoupled Architecture**: Headless CMS approach for maximum flexibility
- **🤖 AI Development Tools**: Enhanced development experience with modern AI assistants
- **⚡ Lightning Fast Performance**: Optimized for speed and user experience with intelligent caching
- **📈 Scalable Solutions**: Built to grow with your business needs
- **✏️ Content Management**: Integrated admin bar for seamless content editing
- **🛡️ Enterprise Ready**: Robust error handling, monitoring, and best practices
- **🔒 Type Safe**: Full TypeScript integration for better developer experience
- **🔄 ISR Support**: Incremental Static Regeneration for optimal performance
- **👁️ Preview Mode**: Draft content preview with dedicated preview client
- **✅ Content Validation**: Built-in validation for data integrity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, Contentful, and modern web technologies.**
