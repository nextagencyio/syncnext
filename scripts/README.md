# Contentful Scripts

This directory contains scripts for managing your Contentful space, specifically for recreating Drupal paragraph types as Contentful content types.

## Prerequisites

Before running any scripts, you need to set up your environment variables. Create a `.env.local` file in the project root with your Contentful credentials:

```env
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here
CONTENTFUL_SPACE_ID=your_space_id_here
```

### Getting Contentful Credentials

1. **Space ID**: Found in your Contentful space settings under "General settings"
2. **Management Token**: Create one in your Contentful space under "Settings" > "API keys" > "Content management tokens"

## Scripts Overview

### 1. `setup-contentful.ts`
**Purpose**: Creates all content types in your Contentful space based on your React components.

**What it creates**:
- All content types (Hero, Text, Card, Accordion, Gallery, Pricing, etc.)
- Landing Page content type that can reference all section types
- Proper field mappings that match your React component props
- Relationship validations between content types

**Usage**:
```bash
npm run setup-contentful
```

### 2. `create-landing-page.ts`
**Purpose**: Creates a comprehensive demo landing page with all content types and every field populated with realistic sample data.

**Features**:
- Uses local `card.webp` image for all media content
- Creates entries for every content type with full sample data
- Generates a timestamped landing page for easy identification
- Includes professional business copy and realistic content

**Usage**:
```bash
npm run create-landing
```

### 3. `cleanup-contentful.ts`
**Purpose**: Cleans your Contentful space with two modes of operation.

**Two cleanup modes**:

#### Content Only (Default)
Deletes all entries and assets but preserves content types structure.
```bash
npm run cleanup-content
```

#### Complete Cleanup
**⚠️ WARNING**: This will permanently delete ALL content AND structure in your Contentful space!
```bash
npm run cleanup-all
```

**What each mode deletes**:
- **Content Only**: All entries, All assets (preserves content types)
- **Complete**: All entries, All assets, All content types

## Recommended Workflow

### Initial Setup (First Time)
1. Set up your `.env.local` file with Contentful credentials
2. Ensure `card.webp` exists in the `/scripts` directory
3. Run the setup script to create content types:
   ```bash
   npm run setup-contentful
   ```
4. Create comprehensive demo content:
   ```bash
   npm run create-landing
   ```

### Development Workflow
- **To add new content types**: Update `setup-contentful.ts` and run it again
- **To reset content only**: Clear entries/assets and recreate demo content:
  ```bash
  npm run cleanup-content
  npm run create-landing
  ```
- **To reset everything**: Complete cleanup, setup, then create demo content:
  ```bash
  npm run cleanup-all
  npm run setup-contentful
  npm run create-landing
  ```

### Content Types Created

The setup script creates content types that mirror your React components:

- **Hero** - Hero sections with title, heading, media, and CTAs
- **Text** - Rich text content with layout options and multiple CTAs
- **Card** - Individual cards with media, title, summary, and tags
- **CardGroup** - Collections of cards with title and summary
- **Accordion** / **AccordionItem** - Expandable FAQ sections
- **Gallery** - Image galleries with titles and descriptions
- **Pricing** / **PricingCard** - Pricing tables and individual plans
- **Carousel** / **CarouselItem** - Image/content carousels
- **Quote** - Testimonials with author, job title, logo, and photos
- **Media** - Simple media display components
- **Embed** - Third-party embeds and scripts
- **Newsletter** - Newsletter signup forms
- **CardGroup** - Groups of cards with title and summary
- **LogoCollection** - Logo grids/collections
- **SideBySide** - Two-column layouts with content and media

### Landing Page Structure

The **Landing Page** content type serves as a flexible container that can reference any content type in its `sections` field, allowing you to build dynamic page layouts by combining different components.

## Demo Content Created

When you run `npm run create-landing`, the script creates a comprehensive demo landing page with:

### **Complete Sample Sections:**
✅ **Hero** - Welcome message with background image and CTAs
✅ **Text** - Company story with rich formatting and eyebrow text
✅ **Card Group** - 3 service cards (Web Development, Mobile Apps, Cloud Solutions)
✅ **Accordion** - FAQ section with 3 common business questions
✅ **Gallery** - Portfolio showcase with 6 images
✅ **Pricing** - 3-tier pricing structure (Starter, Professional, Enterprise)
✅ **Media** - Featured project highlight
✅ **Carousel** - 3 rotating content items showcasing company values
✅ **Quote** - Customer testimonial with author photo and company logo
✅ **Embed** - Social media widget with styled HTML
✅ **Newsletter** - Email subscription with compelling copy
✅ **Logo Collection** - "Trusted by Industry Leaders" section
✅ **Side-by-Side** - Two-column layout with headings and content

### **Professional Sample Data:**
- Realistic business copy and messaging
- Proper Rich Text formatting for Contentful
- Professional pricing tiers and feature lists
- FAQ content that businesses actually use
- Proper link structures and CTAs
- All fields populated with meaningful content

## Assets and Media

The scripts use a local `card.webp` file located in the `/scripts` directory as the placeholder image for all media content. This provides:

- **Consistent branding** across all demo content
- **Faster execution** (no external API calls)
- **Offline capability** for development
- **Control over image quality** and format

Make sure the `card.webp` file exists in your `/scripts` directory before running the create-landing script.

## Troubleshooting

### "Cannot use import statement outside a module"
- This error occurs with `ts-node`. The scripts are configured to use `tsx` instead.
- If you see this error, make sure your package.json scripts use `tsx` not `ts-node`.

### "Please provide CONTENTFUL_MANAGEMENT_TOKEN and CONTENTFUL_SPACE_ID"
- Ensure your `.env.local` file exists in the project root
- Verify your environment variable names match exactly
- Check that your Contentful management token has the necessary permissions

### "Content type already exists"
- This is normal behavior. The scripts check for existing content types before creating new ones.
- To update existing content types, you may need to run the cleanup script first.

### "ENOENT: no such file or directory, open 'card.webp'"
- Ensure the `card.webp` file exists in the `/scripts` directory
- The file path should be `/scripts/card.webp` relative to your project root

### Rich Text Validation Errors
- The scripts include proper Rich Text formatting with all required `data` properties
- If you see validation errors, ensure you're using the latest version of the scripts

## Output Example

After running `npm run create-landing`, you'll see output like:

```
Creating placeholder image...
Placeholder image created and configured

Creating Hero section...
Creating Text section...
Creating Card entries...
Creating Card Group...
Creating Accordion Items...
Creating Accordion...
...

🎉 Complete landing page created successfully!
Landing Page Entry ID: 7A8B9C0D1E2F3G4H5I6J7K
Landing Page Slug: demo-landing-1703123456789
Total sections created: 13
Image created: 1

You can now view the page at: http://localhost:3000/demo-landing-1703123456789
```

## Notes

- All scripts use the `master` environment in Contentful
- Content types are automatically published after creation
- The scripts handle dependencies between content types (e.g., accordion items before accordions)
- Field validations ensure proper relationships between content types
- Rich Text fields include proper formatting with all required properties
- The demo creates a timestamped landing page for easy identification
