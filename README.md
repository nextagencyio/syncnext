# SyncNext - AI-Powered Lightning Fast Development

A modern Next.js application integrated with Contentful CMS for content management. SyncNext demonstrates a headless CMS approach using Next.js 15 with App Router and Contentful for content delivery, enhanced with AI-powered development tools.

## Features

### Contentful Integration
- **Content Types**: Landing pages, articles, pages with dynamic sections
- **Menu Management**: Configurable navigation through Contentful
- **Rich Text**: Full rich text support with custom rendering
- **Image Optimization**: Next.js Image component with Contentful assets
- **Static Generation**: Pre-built pages for optimal performance

### Development Tools
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Storybook**: Component documentation and testing
- **Cypress**: End-to-end testing
- **AI Development**: Enhanced with modern AI-powered development workflows

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

Create a `.env` file in the root directory:
```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_preview_token
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

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

Visit [http://localhost:8080](http://localhost:8080) to see your SyncNext homepage.

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

## Project Structure

```
├── app/                    # Next.js App Router
├── components/             # React components
├── scripts/               # Setup and utility scripts
├── utils/                 # Utility functions and Contentful integration
├── lib/                   # Shared libraries and types
└── public/                # Static assets
```

## SyncNext Features

SyncNext combines the power of modern web technologies with AI-enhanced development workflows:

- **Decoupled Architecture**: Headless CMS approach for maximum flexibility
- **AI Development Tools**: Enhanced development experience with modern AI assistants
- **Lightning Fast Performance**: Optimized for speed and user experience
- **Scalable Solutions**: Built to grow with your business needs

## License

This project is licensed under the MIT License.
