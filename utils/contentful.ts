import { createClient, Entry, Asset } from 'contentful'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Create a Contentful client instance
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
})

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

// Helper function to get an entry by slug
export async function getEntryBySlug(contentType: string, slug: string) {
  try {
    const entries = await client.getEntries({
      content_type: contentType,
      'fields.slug': slug,
      include: 3, // Include linked entries up to 3 levels deep
    })

    if (entries.items.length === 0) {
      return null
    }

    return entries.items[0]
  } catch (error) {
    console.error('Error fetching entry by slug:', error)
    return null
  }
}

// Helper function to get all entries of a specific content type
export async function getEntriesByType(contentType: string) {
  try {
    const entries = await client.getEntries({
      content_type: contentType,
      include: 2,
    })

    return entries.items
  } catch (error) {
    console.error('Error fetching entries by type:', error)
    return []
  }
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

// Helper function to resolve rich text content
export function resolveRichText(richTextContent: any) {
  if (!richTextContent) return ''

  // Simple conversion for now - in a real app you might want to use @contentful/rich-text-react-renderer
  if (typeof richTextContent === 'string') {
    return richTextContent
  }

  if (richTextContent.content) {
    return richTextContent.content
      .map((node: any) => {
        if (node.nodeType === 'paragraph' && node.content) {
          return node.content
            .map((textNode: any) => textNode.value || '')
            .join('')
        }
        return ''
      })
      .join('\n')
  }

  return ''
}

export default client
