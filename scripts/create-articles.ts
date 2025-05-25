import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
dotenv.config({ path: '.env' })

// Helper function to create rich text from Markdown content
function createRichTextFromMarkdown(markdownContent: string) {
  // Parse Markdown content and create proper rich text structure
  const lines = markdownContent.split('\n').filter(line => line.trim())
  const content: any[] = []
  let i = 0

  while (i < lines.length) {
    const trimmedLine = lines[i].trim()

    if (trimmedLine.startsWith('## ')) {
      // Create heading-2 node
      const text = trimmedLine.replace(/^## /, '')
      content.push({
        nodeType: 'heading-2',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: text,
            marks: [],
            data: {}
          }
        ]
      })
      i++
    }
    else if (trimmedLine.startsWith('### ')) {
      // Create heading-3 node
      const text = trimmedLine.replace(/^### /, '')
      content.push({
        nodeType: 'heading-3',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: text,
            marks: [],
            data: {}
          }
        ]
      })
      i++
    }
    else if (trimmedLine.startsWith('• ')) {
      // Handle bullet points - group consecutive ones into an unordered list
      const listItems: any[] = []

      while (i < lines.length && lines[i].trim().startsWith('• ')) {
        const text = lines[i].trim().replace(/^• /, '')
        listItems.push({
          nodeType: 'list-item',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: text,
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        })
        i++
      }

      content.push({
        nodeType: 'unordered-list',
        data: {},
        content: listItems
      })
    }
    else if (trimmedLine && !trimmedLine.startsWith('#')) {
      // Regular paragraph text
      content.push({
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: trimmedLine,
            marks: [],
            data: {}
          }
        ]
      })
      i++
    }
    else {
      i++
    }
  }

  // If no content was created, create a default paragraph
  if (content.length === 0) {
    content.push({
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          nodeType: 'text',
          value: markdownContent.trim() || 'Content',
          marks: [],
          data: {}
        }
      ]
    })
  }

  return {
    nodeType: 'document',
    data: {},
    content
  }
}

// Helper function to create simple rich text
function createRichText(text: string) {
  return {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: text,
            marks: [],
            data: {}
          }
        ]
      }
    ]
  }
}

// Helper function to create placeholder image if it doesn't exist
async function createPlaceholderImageIfNeeded(environment: any): Promise<string> {
  try {
    // Try to find existing card.png asset
    const existingAssets = await environment.getAssets({
      'fields.title': 'Article Image - SyncNext'
    })

    if (existingAssets.items.length > 0) {
      return existingAssets.items[0].sys.id
    }

    // Check if card.png exists in scripts/images directory
    const imagePath = join(__dirname, 'images', 'card.png')
    let imageBuffer: Buffer

    try {
      imageBuffer = readFileSync(imagePath)
      console.log('Found card.png in scripts/images directory')
    } catch (error) {
      console.log('card.png not found in scripts/images directory, using placeholder image URL...')
      // Use a placeholder image URL instead of trying to upload
      const asset = await environment.createAsset({
        fields: {
          title: {
            'en-US': 'Article Image - SyncNext'
          },
          description: {
            'en-US': 'Default image for articles'
          },
          file: {
            'en-US': {
              contentType: 'image/jpeg',
              fileName: 'article-image.jpg',
              url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop'
            }
          }
        }
      })

      await asset.processForAllLocales()

      // Wait for processing to complete before publishing
      let processingAttempts = 0
      const maxAttempts = 10

      while (processingAttempts < maxAttempts) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          const refreshedAsset = await environment.getAsset(asset.sys.id)
          await refreshedAsset.publish()
          break
        } catch (publishError: any) {
          processingAttempts++
          if (publishError.name === 'VersionMismatch' && processingAttempts < maxAttempts) {
            console.log(`Asset processing not complete, retrying... (${processingAttempts}/${maxAttempts})`)
            continue
          }
          throw publishError
        }
      }

      return asset.sys.id
    }

    // If we have a local image file, we need to upload it first
    const upload = await environment.createUpload({
      file: imageBuffer,
      contentType: 'image/png'
    })

    // Create asset using the upload
    const asset = await environment.createAsset({
      fields: {
        title: {
          'en-US': 'Article Image - SyncNext'
        },
        description: {
          'en-US': 'Default image for articles'
        },
        file: {
          'en-US': {
            contentType: 'image/png',
            fileName: 'article-image.png',
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: upload.sys.id
              }
            }
          }
        }
      }
    })

    await asset.processForAllLocales()

    // Get the latest version before publishing
    const latestAsset = await environment.getAsset(asset.sys.id)
    await latestAsset.publish()

    return asset.sys.id
  } catch (error) {
    console.error('Error creating placeholder image:', error)
    throw error
  }
}

async function createArticles() {
  const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN
  const spaceId = process.env.CONTENTFUL_SPACE_ID

  if (!accessToken || !spaceId) {
    console.error('Please provide CONTENTFUL_MANAGEMENT_TOKEN and CONTENTFUL_SPACE_ID as environment variables')
    process.exit(1)
  }

  const client = createClient({
    accessToken,
  })

  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    const imageId = await createPlaceholderImageIfNeeded(environment)

    // Sample articles data (converted from PHP with SyncNext/Contentful branding)
    const articles = [
      {
        title: 'Getting Started with Headless Contentful',
        slug: 'getting-started-with-headless-contentful',
        content: `## Introduction to Headless Contentful

Headless Contentful is a modern approach to content management that separates the frontend from the backend.

### Benefits of Headless Contentful

• Improved performance
• Better security
• More flexibility in frontend development
• Better developer experience

### Getting Started

To get started with headless Contentful, you need to set up a Contentful space and a frontend framework like Next.js.`,
        excerpt: 'Learn how to get started with headless Contentful and leverage its benefits for your next project.',
        tags: ['Contentful', 'Headless CMS', 'Tutorial'],
        publishedDate: '2024-01-15',
      },
      {
        title: 'Building with Next.js and Contentful',
        slug: 'building-with-nextjs-and-contentful',
        content: `## Next.js and Contentful: A Powerful Combination

Next.js is a React framework that enables server-side rendering and static site generation, making it a perfect match for Contentful as a headless CMS.

### Setting Up Next.js

To set up Next.js with Contentful, you need to create a new Next.js project and configure it to fetch data from your Contentful space.

### Fetching Data from Contentful

Next.js can fetch data from Contentful using the REST API or GraphQL.`,
        excerpt: 'Discover how to build modern websites using Next.js as a frontend for Contentful.',
        tags: ['Next.js', 'Contentful', 'React'],
        publishedDate: '2024-01-20',
      },
      {
        title: 'Using GraphQL with Contentful',
        slug: 'using-graphql-with-contentful',
        content: `## GraphQL and Contentful

GraphQL is a query language for APIs that allows clients to request exactly the data they need, making it a great choice for headless Contentful.

### Setting Up GraphQL in Contentful

To use GraphQL with Contentful, you can use Contentful's built-in GraphQL API endpoint.

### Querying Data with GraphQL

GraphQL allows you to query multiple resources in a single request, reducing the number of API calls needed.`,
        excerpt: 'Learn how to use GraphQL with Contentful to build more efficient and flexible APIs.',
        tags: ['GraphQL', 'Contentful', 'API'],
        publishedDate: '2024-01-25',
      },
      {
        title: 'SyncNext Performance Optimization Guide',
        slug: 'syncnext-performance-optimization-guide',
        content: `Learn how to optimize your SyncNext site for maximum performance and user experience.

## Optimization Techniques

• Image optimization and lazy loading
• Code splitting and bundle optimization
• Caching strategies
• Performance monitoring

## Best Practices

Follow these best practices to ensure your SyncNext site performs at its best:

• Implement proper image sizing and formats
• Utilize the built-in caching mechanisms
• Monitor and optimize API queries`,
        excerpt: 'Discover techniques and best practices for optimizing your SyncNext site performance.',
        tags: ['Performance', 'Optimization', 'Best Practices'],
        publishedDate: '2024-02-01',
      },
      {
        title: 'Headless Contentful with SyncNext',
        slug: 'headless-contentful-with-syncnext',
        content: `Explore the benefits and implementation of headless Contentful using SyncNext as your frontend framework.

## Benefits of Headless

• Improved performance and scalability
• Better developer experience
• Flexible content delivery
• Enhanced security

## Implementation Guide

Learn how to set up and configure your headless Contentful site with SyncNext:

• Contentful configuration
• GraphQL schema setup
• Frontend integration
• Deployment strategies`,
        excerpt: 'Learn how to implement headless Contentful architecture with SyncNext for better performance and flexibility.',
        tags: ['Headless', 'Contentful', 'Architecture'],
        publishedDate: '2024-02-05',
      },
      {
        title: 'Creating Dynamic Layouts with SyncNext',
        slug: 'creating-dynamic-layouts-with-syncnext',
        content: `Master the art of creating flexible and dynamic layouts using SyncNext's powerful component system.

## Layout Components

• Grid systems
• Flex containers
• Responsive design patterns

## Advanced Techniques

Discover advanced layout techniques:

• Dynamic component rendering
• Conditional layouts
• Custom grid systems
• Responsive breakpoints

Learn how to combine these techniques to create powerful, flexible layouts that adapt to any content structure.`,
        excerpt: 'Explore techniques for creating flexible and dynamic layouts with SyncNext components.',
        tags: ['Layout', 'Design', 'Components'],
        publishedDate: '2024-02-10',
      },
    ]

    // Check for existing articles and optionally remove them
    console.log('Checking for existing articles...')
    const existingArticles = await environment.getEntries({
      content_type: 'article'
    })

    if (existingArticles.items.length > 0) {
      console.log(`Found ${existingArticles.items.length} existing articles. Checking for conflicts...`)

      for (const article of articles) {
        const existingArticle = existingArticles.items.find(item =>
          item.fields.slug && item.fields.slug['en-US'] === article.slug
        )

        if (existingArticle) {
          console.log(`Article '${article.title}' already exists. Skipping...`)
          continue
        }
      }
    }

    // Create each article
    let createdCount = 0
    for (const articleData of articles) {
      try {
        // Check if article already exists
        const existingArticles = await environment.getEntries({
          content_type: 'article',
          'fields.slug': articleData.slug
        })

        if (existingArticles.items.length > 0) {
          console.log(`Article '${articleData.title}' already exists. Skipping...`)
          continue
        }

        console.log(`Creating article: ${articleData.title}`)

        const article = await environment.createEntry('article', {
          fields: {
            title: {
              'en-US': articleData.title
            },
            slug: {
              'en-US': articleData.slug
            },
            lead: {
              'en-US': createRichText(articleData.excerpt)
            },
            body: {
              'en-US': createRichTextFromMarkdown(articleData.content)
            },
            media: {
              'en-US': {
                sys: {
                  type: 'Link',
                  linkType: 'Asset',
                  id: imageId
                }
              }
            },
            tags: {
              'en-US': articleData.tags
            },
            publishedDate: {
              'en-US': articleData.publishedDate
            }
          }
        })

        await article.publish()
        createdCount++

        console.log(`✅ Created article: ${articleData.title}`)
        console.log(`   Slug: ${articleData.slug}`)
        console.log(`   Entry ID: ${article.sys.id}`)

      } catch (error) {
        console.error(`❌ Error creating article '${articleData.title}':`, error)
      }
    }

    console.log(`\n🎉 Articles creation completed!`)
    console.log(`Created ${createdCount} new articles`)
    console.log(`Total articles attempted: ${articles.length}`)

    if (createdCount > 0) {
      console.log('\nYour articles should now be available in your Contentful space.')
    }

  } catch (error) {
    console.error('Error creating articles:', error)
    process.exit(1)
  }
}

createArticles()
