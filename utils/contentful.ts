import { createClient, Entry, Asset } from 'contentful'
import * as dotenv from 'dotenv'
import { withCache, contentfulCache } from './contentful-cache'
import { shouldSuppressWarning } from './content-routing'

// Load environment variables
dotenv.config({ path: '.env' })

// Validate required environment variables
const requiredEnvVars = {
  CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
  CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Contentful environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file and ensure all required variables are set.'
  )
}

// Create a Contentful client instance
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  // Add timeout and retry configuration
  timeout: 10000, // 10 second timeout
  retryOnError: true,
})

// Create preview client for draft content
const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN || process.env.CONTENTFUL_ACCESS_TOKEN!,
  host: 'preview.contentful.com',
  timeout: 10000,
  retryOnError: true,
})

// Helper to get the appropriate client
function getClient(preview = false) {
  return preview && process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ? previewClient : client
}

// Utility functions for error handling and retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const isRetryableError = (error: any): boolean => {
  // Retry on network errors, timeouts, and 5xx server errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
    return true
  }

  // Check for HTTP status codes that indicate temporary issues
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true
  }

  // Retry on rate limiting (429)
  if (error.response?.status === 429) {
    return true
  }

  return false
}

// Type definitions for our content types
export interface ContentfulImage extends Asset {
  fields: {
    title: string
    description: string
    file: {
      url: string
      details: {
        size: number
        image: {
          width: number
          height: number
        }
      }
      fileName: string
      contentType: string
    }
  }
}

export interface LandingPageEntry extends Entry<any> {
  fields: {
    title: string
    slug: string
    sections: Entry<any>[]
  }
}

// Helper function to get an entry by slug with enhanced error handling and caching
export async function getEntryBySlug(contentType: string, slug: string, retries = 3): Promise<Entry<any> | null> {
  const cacheKey = contentfulCache.generateKey('getEntryBySlug', { contentType, slug })

  return withCache(cacheKey, async () => {
    try {
      // Use higher include level for landing pages since they have deeply nested references
      const includeLevel = contentType === 'landing' ? 10 : 3

      const entries = await getClient(false).getEntries({
        content_type: contentType,
        'fields.slug': slug,
        include: includeLevel, // Include linked entries up to specified levels deep
      })

      if (entries.items.length === 0) {
        // Only log warnings for unexpected missing content
        const suppressWarning = await shouldSuppressWarning(contentType, slug)
        if (!suppressWarning) {
          console.warn(`No entry found for content type "${contentType}" with slug "${slug}"`)
        }
        return null
      }

      return entries.items[0]
    } catch (error) {
      console.error(`Error fetching entry by slug (${contentType}/${slug}):`, error)

      // Retry logic for network errors
      if (retries > 0 && isRetryableError(error)) {
        console.log(`Retrying... (${retries} attempts remaining)`)
        await delay(1000) // Wait 1 second before retry
        return getEntryBySlug(contentType, slug, retries - 1)
      }

      return null
    }
  })
}

// Helper function to get all entries of a specific content type with enhanced error handling
export async function getEntriesByType(contentType: string, retries = 3) {
  try {
    // Use higher include level for articles to get their media assets
    const includeLevel = contentType === 'article' ? 3 : 2

    const entries = await getClient(false).getEntries({
      content_type: contentType,
      include: includeLevel,
    })

    return entries.items
  } catch (error) {
    console.error(`Error fetching entries by type (${contentType}):`, error)

    // Retry logic for network errors
    if (retries > 0 && isRetryableError(error)) {
      console.log(`Retrying getEntriesByType... (${retries} attempts remaining)`)
      await delay(1000) // Wait 1 second before retry
      return getEntriesByType(contentType, retries - 1)
    }

    return []
  }
}

// Helper function to validate content structure
export function validateContentEntry(entry: Entry<any>, requiredFields: string[] = []): boolean {
  if (!entry || !entry.fields) {
    console.warn('Invalid entry: missing fields')
    return false
  }

  const missingFields = requiredFields.filter(field => !entry.fields[field])
  if (missingFields.length > 0) {
    console.warn(`Entry ${entry.sys.id} missing required fields: ${missingFields.join(', ')}`)
    return false
  }

  return true
}

// Helper function to resolve Contentful images to a format compatible with existing components
export function resolveContentfulImage(asset: ContentfulImage | undefined) {
  if (!asset || !asset.fields?.file) {
    return null
  }

  return {
    url: `https:${asset.fields.file.url}`,
    alt: asset.fields.title || asset.fields.description || '',
    width: asset.fields.file.details?.image?.width || 800,
    height: asset.fields.file.details?.image?.height || 600,
    title: asset.fields.title || '',
  }
}

// Helper function to resolve rich text content to HTML
export function resolveRichText(richTextContent: any): string {
  if (!richTextContent) return ''

  // If it's already a string, return it
  if (typeof richTextContent === 'string') {
    return richTextContent
  }

  // If it doesn't have content, return empty
  if (!richTextContent.content) return ''

  // Convert Contentful rich text nodes to HTML
  return richTextContent.content
    .map((node: any) => {
      switch (node.nodeType) {
        case 'paragraph':
          if (node.content && node.content.length > 0) {
            const content = node.content
              .map((textNode: any) => {
                if (textNode.nodeType === 'text') {
                  let text = textNode.value || ''
                  // Apply marks (bold, italic, etc.)
                  if (textNode.marks && textNode.marks.length > 0) {
                    textNode.marks.forEach((mark: any) => {
                      switch (mark.type) {
                        case 'bold':
                          text = `<strong>${text}</strong>`
                          break
                        case 'italic':
                          text = `<em>${text}</em>`
                          break
                        case 'underline':
                          text = `<u>${text}</u>`
                          break
                        case 'code':
                          text = `<code>${text}</code>`
                          break
                      }
                    })
                  }
                  return text
                }
                return ''
              })
              .join('')
            return `<p>${content}</p>`
          }
          return ''

        case 'heading-1':
          const h1Content = node.content
            ?.map((textNode: any) => textNode.value || '')
            .join('')
          return `<h1>${h1Content}</h1>`

        case 'heading-2':
          const h2Content = node.content
            ?.map((textNode: any) => textNode.value || '')
            .join('')
          return `<h2>${h2Content}</h2>`

        case 'heading-3':
          const h3Content = node.content
            ?.map((textNode: any) => textNode.value || '')
            .join('')
          return `<h3>${h3Content}</h3>`

        case 'heading-4':
          const h4Content = node.content
            ?.map((textNode: any) => textNode.value || '')
            .join('')
          return `<h4>${h4Content}</h4>`

        case 'heading-5':
          const h5Content = node.content
            ?.map((textNode: any) => textNode.value || '')
            .join('')
          return `<h5>${h5Content}</h5>`

        case 'heading-6':
          const h6Content = node.content
            ?.map((textNode: any) => textNode.value || '')
            .join('')
          return `<h6>${h6Content}</h6>`

        case 'unordered-list':
          const ulItems = node.content
            ?.map((listItem: any) => {
              if (listItem.nodeType === 'list-item' && listItem.content) {
                const itemContent = listItem.content
                  .map((paragraph: any) => {
                    if (paragraph.nodeType === 'paragraph' && paragraph.content) {
                      return paragraph.content
                        .map((textNode: any) => textNode.value || '')
                        .join('')
                    }
                    return ''
                  })
                  .join('')
                return `<li>${itemContent}</li>`
              }
              return ''
            })
            .join('')
          return `<ul>${ulItems}</ul>`

        case 'ordered-list':
          const olItems = node.content
            ?.map((listItem: any) => {
              if (listItem.nodeType === 'list-item' && listItem.content) {
                const itemContent = listItem.content
                  .map((paragraph: any) => {
                    if (paragraph.nodeType === 'paragraph' && paragraph.content) {
                      return paragraph.content
                        .map((textNode: any) => textNode.value || '')
                        .join('')
                    }
                    return ''
                  })
                  .join('')
                return `<li>${itemContent}</li>`
              }
              return ''
            })
            .join('')
          return `<ol>${olItems}</ol>`

        case 'blockquote':
          const quoteContent = node.content
            ?.map((paragraph: any) => {
              if (paragraph.nodeType === 'paragraph' && paragraph.content) {
                return paragraph.content
                  .map((textNode: any) => textNode.value || '')
                  .join('')
              }
              return ''
            })
            .join('')
          return `<blockquote>${quoteContent}</blockquote>`

        case 'hr':
          return '<hr>'

        default:
          return ''
      }
    })
    .join('')
}

// Menu-related types
export interface MenuItemEntry extends Entry<any> {
  fields: {
    title: string
    url: string
    order?: number
    children?: MenuItemEntry[]
  }
}

export interface MenuEntry extends Entry<any> {
  fields: {
    name: string
    identifier: string
    items: MenuItemEntry[]
  }
}

// Helper function to get a menu by identifier
export async function getMenuByIdentifier(identifier: 'main' | 'footer'): Promise<MenuEntry | null> {
  try {
    const entries = await getClient(false).getEntries({
      content_type: 'menu',
      'fields.identifier': identifier,
      include: 3, // Include linked menu items and their children
    })

    if (entries.items.length === 0) {
      return null
    }

    return entries.items[0] as MenuEntry
  } catch (error) {
    console.error(`Error fetching menu with identifier ${identifier}:`, error)
    return null
  }
}

// Helper function to transform Contentful menu to the format expected by components
export function transformContentfulMenu(menu: MenuEntry | null) {
  if (!menu) {
    return null
  }

  return {
    menu: {
      name: menu.fields.name,
      items: menu.fields.items
        ?.sort((a, b) => (a.fields.order || 0) - (b.fields.order || 0))
        .map((item) => ({
          title: item.fields.title,
          url: item.fields.url,
          children: item.fields.children
            ?.sort((a, b) => (a.fields.order || 0) - (b.fields.order || 0))
            .map((child) => ({
              title: child.fields.title,
              url: child.fields.url,
            })) || [],
        })) || [],
    },
  }
}

export default getClient()
