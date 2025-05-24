# Utils Directory Cleanup - Complete Drupal Removal

This document outlines the complete removal of Drupal integration from the project, leaving only Contentful CMS support.

## Files Removed

### Drupal-Specific Utilities
- ✅ `utils/auth.server.ts` - Drupal OAuth authentication
- ✅ `utils/client.server.ts` - Drupal GraphQL client setup
- ✅ `graphql/` directory - All Drupal GraphQL queries and fragments
- ✅ `components/helpers/ComponentResolver.tsx` - Drupal paragraph component resolver
- ✅ `components/helpers/NavigationEvents.tsx` - Drupal preview route syncing

### Fallback Menu System
- ✅ `utils/menu.ts` - Hardcoded fallback menu data (removed in favor of Contentful-only approach)

### Dependencies Removed from package.json
- ✅ `@urql/core` - GraphQL client for Drupal
- ✅ `@0no-co/graphqlsp` - GraphQL language server
- ✅ `drupal-auth-client` - Drupal OAuth client
- ✅ `drupal-decoupled` - Drupal preview utilities
- ✅ `graphql` - GraphQL core library

## Files Modified

### 1. `app/layout.tsx`
**Changes**:
- Removed all Drupal GraphQL imports and client calls
- Removed fallback menu system
- Simplified to use only Contentful menu data
- Navigation will be empty if Contentful menus are not available

**Before**:
```typescript
import { MainMenuQuery, FooterMenuQuery } from "@/graphql/queries";
import { getClientWithAuth } from "@/utils/client.server";
import { getFallbackMenuData, getFallbackFooterData } from "@/utils/menu";

// Complex Drupal client setup with fallbacks...
```

**After**:
```typescript
import { getMenuByIdentifier, transformContentfulMenu } from "@/utils/contentful";

// Simple Contentful menu data only
const [mainMenu, footerMenu] = await Promise.all([
  getMenuByIdentifier('main'),
  getMenuByIdentifier('footer'),
]);
```

### 2. `components/Footer.tsx`
**Changes**:
- Removed import of `FooterMenuQuery` from deleted GraphQL directory

### 3. `utils/routes.ts`
**Changes**:
- Updated `frontpagePath` from `/welcome` to `/` for better homepage handling

## Remaining Files (Contentful Only)

### Core Utilities
- ✅ `utils/contentful.ts` - Contentful CMS integration with menu support
- ✅ `utils/routes.ts` - Generic routing utilities
- ✅ `utils/dynamic-icon.ts` - Lucide icon helpers

### Components
- ✅ `components/Article.tsx` - Contentful article rendering
- ✅ `components/Page.tsx` - Contentful page rendering
- ✅ `components/Landing.tsx` - Contentful landing page with dynamic sections
- ✅ All section components for Contentful landing pages

## Environment Variables

### Required (Contentful Only)
```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

### No Longer Needed (Removed)
```env
# These can be removed from .env
DRUPAL_GRAPHQL_URI=...
DRUPAL_AUTH_URI=...
DRUPAL_CLIENT_ID=...
DRUPAL_CLIENT_SECRET=...
```

## Current Menu Structure

The application now uses Contentful-managed menus exclusively. Sample menus created by `npm run create-menus`:

### Main Navigation
- Home (/)
- About Us (/about-us)
- Services (/services)
- Contact (/contact)

### Footer Menu
- Privacy Policy (/privacy-policy)
- Terms of Service (/terms-of-service)
- Contact Us (/contact)

**Important**: Navigation will be empty until menus are created in Contentful. Use `npm run create-menus` to create sample menus.

## Scripts Available

All Contentful management scripts still work:

```bash
npm run setup-contentful     # Setup content types
npm run create-landing       # Create sample landing page
npm run create-pages         # Create sample pages and articles
npm run cleanup-content      # Clean up content entries
npm run cleanup-all          # Clean up content and structure
```

## Project Benefits

### ✅ Simplified Architecture
- Single CMS (Contentful) reduces complexity
- No GraphQL client configuration needed
- Fewer dependencies and smaller bundle size

### ✅ Better Performance
- Removed unused Drupal packages (8 packages removed)
- Faster builds and deploys
- Reduced complexity in menu loading

### ✅ Cleaner Codebase
- No dual-system compatibility code
- Cleaner imports and dependencies
- Focus on single content strategy

## Migration Notes

### If You Want to Re-add Drupal Later
The removed files are documented here, so Drupal integration can be restored by:
1. Adding back the deleted utilities and GraphQL files
2. Reinstalling the removed npm packages
3. Updating layout.tsx to handle both systems
4. Adding environment variables back

### Current State
- ✅ Pure Contentful integration
- ✅ All content types working (Landing, Page, Article)
- ✅ Dynamic menu system via Contentful
- ✅ Dynamic section system for landing pages
- ✅ TypeScript compilation clean
- ✅ Build successful
- ✅ Static generation working for all content

The project is now fully focused on Contentful CMS with a clean, maintainable architecture and Contentful-managed navigation.
