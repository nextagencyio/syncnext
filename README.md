# Next.js Contentful CMS

A modern Next.js application integrated with Contentful CMS for content management. This project demonstrates a headless CMS approach using Next.js 15 with App Router and Contentful for content delivery.

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

## Getting Started

### Prerequisites
- Node.js 20 or higher
- Contentful account with Space ID and Management Token

### Installation

Clone the repository:
```bash
git clone <repository-url>
cd nextjs-contentful-cms
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

Set up Contentful content types:
```bash
npm run setup-contentful
```

Create sample content:
```bash
npm run create-homepage    # Creates the homepage (slug: 'home')
npm run create-landing     # Creates additional demo landing pages
npm run create-pages       # Creates sample pages
npm run create-menus       # Creates navigation menus
```

### Development

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) to see your homepage.

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

## License

This project is licensed under the MIT License.

