// Content routing utilities to optimize Contentful API calls
// Dynamic approach - no hardcoded mappings

import { createClient } from 'contentful'

// Cache for content type mappings discovered from Contentful
let contentTypeCache: Map<string, string> | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Create a lightweight client for content discovery
const discoveryClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  timeout: 5000,
})

/**
 * Builds a dynamic mapping of slugs to content types by querying Contentful
 */
async function buildContentTypeMapping(): Promise<Map<string, string>> {
  const mapping = new Map<string, string>()

  try {
    // Get all content types that have slug fields
    const contentTypes = ['landing', 'page', 'article']

    // Fetch a sample of entries from each content type to build the mapping
    const promises = contentTypes.map(async (contentType) => {
      try {
        const entries = await discoveryClient.getEntries({
          content_type: contentType,
          select: ['fields.slug'] as const,
          limit: 100, // Get up to 100 entries per content type
        })

        entries.items.forEach((entry) => {
          const slug = entry.fields.slug as string
          if (slug) {
            mapping.set(slug, contentType)
          }
        })
      } catch (error) {
        console.warn(`Could not fetch entries for content type ${contentType}:`, error)
      }
    })

    await Promise.all(promises)

    // Cache the mapping
    contentTypeCache = mapping
    cacheTimestamp = Date.now()

    console.log(`Built content type mapping with ${mapping.size} entries`)

  } catch (error) {
    console.error('Error building content type mapping:', error)
  }

  return mapping
}

/**
 * Gets the cached content type mapping, rebuilding if necessary
 */
async function getContentTypeMapping(): Promise<Map<string, string>> {
  // Check if cache is valid
  if (contentTypeCache && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return contentTypeCache
  }

  // Rebuild cache
  return await buildContentTypeMapping()
}

/**
 * Determines the content type for a given slug using dynamic discovery
 * @param slug The slug to check
 * @returns The content type or null if unknown
 */
export async function getContentTypeForSlug(slug: string): Promise<'landing' | 'page' | 'article' | null> {
  // Handle article URLs with articles/ prefix
  if (slug.startsWith('articles/')) {
    return 'article'
  }

  try {
    const mapping = await getContentTypeMapping()
    const contentType = mapping.get(slug)

    if (contentType && ['landing', 'page', 'article'].includes(contentType)) {
      return contentType as 'landing' | 'page' | 'article'
    }
  } catch (error) {
    console.warn('Error getting content type for slug:', error)
  }

  return null
}

/**
 * Gets the priority order for content types to check for unknown slugs
 * Based on common usage patterns
 */
export function getContentTypePriority(): ('landing' | 'page' | 'article')[] {
  return ['landing', 'page', 'article']
}

/**
 * Checks if a missing entry warning should be suppressed
 * Uses dynamic logic instead of hardcoded rules
 */
export async function shouldSuppressWarning(contentType: string, slug: string): Promise<boolean> {
  // Don't warn for articles when not in articles/ path
  if (contentType === 'article' && !slug.startsWith('articles/')) {
    return true
  }

  try {
    const mapping = await getContentTypeMapping()
    const expectedContentType = mapping.get(slug)

    // If we know what content type this slug should be, suppress warnings for other types
    if (expectedContentType && expectedContentType !== contentType) {
      return true
    }
  } catch (error) {
    // If we can't determine the expected type, don't suppress warnings
    return false
  }

  return false
}

/**
 * Extracts article slug from articles/ path
 * @param slug The full slug
 * @returns The article slug or null if not an article path
 */
export function extractArticleSlug(slug: string): string | null {
  if (slug.startsWith('articles/')) {
    return slug.replace('articles/', '')
  }
  return null
}

/**
 * Invalidates the content type cache
 * Useful when content has been updated
 */
export function invalidateContentTypeCache(): void {
  contentTypeCache = null
  cacheTimestamp = 0
}

/**
 * Gets cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    cacheSize: contentTypeCache?.size || 0,
    cacheAge: contentTypeCache ? Date.now() - cacheTimestamp : 0,
    isValid: contentTypeCache && (Date.now() - cacheTimestamp) < CACHE_TTL,
  }
}
