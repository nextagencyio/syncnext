import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
dotenv.config({ path: '.env' })

// Helper function to create rich text
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
    // Try to find existing card.webp asset
    const existingAssets = await environment.getAssets({
      'fields.title': 'Resources Hero Image - SyncNext'
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
            'en-US': 'Resources Hero Image - SyncNext'
          },
          description: {
            'en-US': 'Resources page hero image'
          },
          file: {
            'en-US': {
              contentType: 'image/jpeg',
              fileName: 'resources-hero.jpg',
              url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'
            }
          }
        }
      })

      await asset.processForAllLocales()
      await asset.publish()

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
          'en-US': 'Resources Hero Image - SyncNext'
        },
        description: {
          'en-US': 'Resources page hero image'
        },
        file: {
          'en-US': {
            contentType: 'image/png',
            fileName: 'resources-hero.png',
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

async function createResourcesPage() {
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

    // Check if resources page already exists
    const existingPages = await environment.getEntries({
      content_type: 'landing',
      'fields.slug': 'resources',
    })

    if (existingPages.items.length > 0) {
      console.log('Resources page already exists! Unpublishing and deleting existing page...')
      for (const page of existingPages.items) {
        try {
          if (page.isPublished()) {
            await page.unpublish()
          }
          await page.delete()
          console.log(`Deleted existing resources page: ${page.sys.id}`)
        } catch (error) {
          console.log(`Could not delete page ${page.sys.id}, it may have references`)
        }
      }
    }

    const imageId = await createPlaceholderImageIfNeeded(environment)
    const entries = []

    // 1. Create Hero section
    console.log('\nCreating Resources Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': 'SyncNext Resources'
        },
        summary: {
          'en-US': createRichText('Discover guides, tutorials, and insights to help you master SyncNext and build amazing web experiences.')
        },
        linkTitle: {
          'en-US': 'Browse All Resources'
        },
        linkUrl: {
          'en-US': '/blog'
        },
        link2Title: {
          'en-US': 'Get Support'
        },
        link2Url: {
          'en-US': '/support'
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
        heroLayout: {
          'en-US': 'image_top'
        }
      }
    })
    await heroEntry.publish()
    entries.push(heroEntry.sys.id)
    console.log('Resources hero section created')

    // 2. Create Recent Posts section (using text section as placeholder)
    console.log('\nCreating Recent Posts section...')
    const recentPostsEntry = await environment.createEntry('text', {
      fields: {
        title: {
          'en-US': 'Latest Resources'
        },
        body: {
          'en-US': createRichText('Stay up to date with the latest tutorials, guides, and best practices for building with SyncNext. Our resource library is constantly growing with new content to help you succeed.')
        },
        linkTitle: {
          'en-US': 'View All Articles'
        },
        linkUrl: {
          'en-US': '/blog'
        },
        link2Title: {
          'en-US': 'Subscribe to Updates'
        },
        link2Url: {
          'en-US': '/newsletter'
        },
        textLayout: {
          'en-US': 'center'
        }
      }
    })
    await recentPostsEntry.publish()
    entries.push(recentPostsEntry.sys.id)
    console.log('Recent posts section created')

    // 3. Create the resources landing page
    console.log('\nCreating resources landing page...')
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'Resources - SyncNext'
        },
        slug: {
          'en-US': 'resources'
        },
        sections: {
          'en-US': entries.map(id => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id
            }
          }))
        }
      }
    })

    await landingPage.publish()
    console.log(`\n✅ Resources page created successfully!`)
    console.log(`Page ID: ${landingPage.sys.id}`)
    console.log(`Slug: resources`)
    console.log(`Sections created: ${entries.length}`)
    console.log('\nYour resources page should now be available at: /resources')

  } catch (error) {
    console.error('Error creating resources page:', error)
    process.exit(1)
  }
}

createResourcesPage()
