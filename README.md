# Drupal Decoupled Integrations: Next.js demo project

## Introduction

This is a starter project for a Next.js app that connects to a Drupal using GraphQL. Is a port of the features from our Remix Drupal demo project.

## Features

### Drupal Integration
- [x] GraphQL API integration
- [x] Previews
- [x] View revisions
- [x] Support taxonomy terms
- [ ] Meta tags for SEO

### Contentful Integration
- [x] Full Contentful CMS integration
- [x] Dynamic content types (Landing, Page, Article)
- [x] Dynamic menu management
- [x] Reusable section components
- [x] Rich text rendering
- [x] Image optimization with Next.js
- [x] TypeScript support
- [x] Content management scripts

## Get Started

### Clone Next.js demo project
```bash
npx create-next-app@latest --example "https://github.com/octahedroid/drupal-decoupled/tree/main/examples/next-graphql"
```

### Copy `.env.example`

```bash
cp .env.example .env
```

Update values read copied file for instructions

### Development

Run the dev server:

```bash
yarn dev
```

### Sync GraphQL Changes

Run the gql:sync script

```bash
yarn gql:sync
```

## Contentful Integration

This project includes a complete Contentful integration with React components for rendering different content types. See [CONTENTFUL_INTEGRATION.md](./CONTENTFUL_INTEGRATION.md) for detailed documentation.

### Quick Start with Contentful

1. Set up your Contentful credentials in `.env`
2. Create content types: `npm run setup-contentful`
3. Create demo content: `npm run create-landing && npm run create-pages && npm run create-menus`
4. Visit your pages at the generated URLs

## Next.js docs
📖 See the [Next.js docs](https://nextjs.org/docs) for details on supported features.

