import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env
dotenv.config({ path: '.env' })

// Helper function to create properly formatted rich text
function createRichText(content: string | string[]) {
  const paragraphs = Array.isArray(content) ? content : [content]

  return {
    nodeType: 'document',
    data: {},
    content: paragraphs.map(text => ({
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
    }))
  }
}

// Helper function to create rich text with formatting
function createRichTextWithFormatting(content: string, bold: boolean = false) {
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
            value: content,
            marks: bold ? [{ type: 'bold' }] : [],
            data: {}
          }
        ]
      }
    ]
  }
}

// Helper function to create statsItem entries
async function createStatsItem(environment: any, heading: string, body: string, icon: string) {
  const statsItem = await environment.createEntry('statsItem', {
    fields: {
      heading: { 'en-US': heading },
      body: { 'en-US': body },
      icon: { 'en-US': icon }
    }
  })
  await statsItem.publish()
  return statsItem.sys.id
}

// Helper function to create bullet entries
async function createBullet(environment: any, icon: string, summary: string) {
  const bullet = await environment.createEntry('bullet', {
    fields: {
      icon: { 'en-US': icon },
      summary: { 'en-US': summary }
    }
  })
  await bullet.publish()
  return bullet.sys.id
}

async function createPlaceholderImageIfNeeded(environment: any) {
  const placeholderImageId = process.env.CONTENTFUL_PLACEHOLDER_IMAGE_ID

  if (placeholderImageId) {
    try {
      const asset = await environment.getAsset(placeholderImageId)
      console.log('Using existing placeholder image:', asset.sys.id)
      return asset.sys.id
    } catch (error) {
      console.log('Existing placeholder image not found, creating new one...')
    }
  }

  // Create new placeholder image
  console.log('Creating placeholder image...')
  const imagePath = path.resolve(__dirname, 'card.webp')
  const imageData = fs.readFileSync(imagePath)

  const upload = await environment.createUpload({
    file: imageData
  })

  const asset = await environment.createAsset({
    fields: {
      title: {
        'en-US': 'Get Started Page Image'
      },
      description: {
        'en-US': 'Image for get started page'
      },
      file: {
        'en-US': {
          contentType: 'image/webp',
          fileName: 'get-started.webp',
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
  await new Promise(resolve => setTimeout(resolve, 3000))

  const processedAsset = await environment.getAsset(asset.sys.id)
  const publishedAsset = await processedAsset.publish()

  console.log('Placeholder image created:', publishedAsset.sys.id)
  return publishedAsset.sys.id
}

async function createGetStartedPage() {
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

    // Check if get-started page already exists
    const existingPages = await environment.getEntries({
      content_type: 'landing',
      'fields.slug': 'get-started',
    })

    if (existingPages.items.length > 0) {
      console.log('Get Started page already exists! Unpublishing and deleting existing page...')
      for (const page of existingPages.items) {
        try {
          if (page.isPublished()) {
            await page.unpublish()
          }
          await page.delete()
          console.log(`Deleted existing get-started page: ${page.sys.id}`)
        } catch (error) {
          console.log(`Could not delete page ${page.sys.id}, it may have references`)
        }
      }
    }

    const imageId = await createPlaceholderImageIfNeeded(environment)
    const entries = []

    // 1. Create Hero section
    console.log('\nCreating Get Started Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': 'Get Started Hero'
        },
        heading: {
          'en-US': createRichTextWithFormatting('Get Started', true)
        },
        heroLayout: {
          'en-US': 'image_bottom'
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
        summary: {
          'en-US': createRichText('Whether you\'re a designer or a developer, SyncNext provides the perfect foundation to start customizing to your specific needs.')
        }
      }
    })
    await heroEntry.publish()
    entries.push(heroEntry.sys.id)
    console.log('Get Started Hero created')

    // 2. Create Side by Side section - For Designers with bullets
    console.log('Creating SyncNext for Designers section...')

    // Create bullet entries for designers section
    const designerBullet1 = await createBullet(
      environment,
      'Figma',
      'Figma Templates: Access a variety of community templates built on Bootstrap 5.'
    )

    const designerBullet2 = await createBullet(
      environment,
      'Palette',
      'Design System: Leverage consistent design patterns and components for rapid prototyping.'
    )

    const designersSideBySide = await environment.createEntry('sideBySide', {
      fields: {
        eyebrow: {
          'en-US': 'For Designers'
        },
        title: {
          'en-US': 'SyncNext for Designers'
        },
        summary: {
          'en-US': createRichText('Leverage a variety of Figma community templates built on Bootstrap 5 to jumpstart your design process.')
        },
        linkTitle: {
          'en-US': 'View Templates'
        },
        linkUrl: {
          'en-US': '/design-templates'
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
        features: {
          'en-US': [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: designerBullet1
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: designerBullet2
              }
            }
          ]
        },
        layout: {
          'en-US': 'right'
        }
      }
    })
    await designersSideBySide.publish()
    entries.push(designersSideBySide.sys.id)
    console.log('SyncNext for Designers section created')

    // 3. Create Side by Side section - For Developers with stats
    console.log('Creating SyncNext for Developers section...')

    // Create stats and bullet entries for developers section
    const devStatsItem = await createStatsItem(
      environment,
      'Open Source',
      'Visit our GitHub repository to download the SyncNext project template and start building your site today.',
      'Github'
    )

    const devBullet = await createBullet(
      environment,
      'Terminal',
      'Modern Stack: Built with React, Next.js, and TypeScript for optimal performance.'
    )

    const developersSideBySide = await environment.createEntry('sideBySide', {
      fields: {
        eyebrow: {
          'en-US': 'For Developers'
        },
        title: {
          'en-US': 'SyncNext for Developers'
        },
        summary: {
          'en-US': createRichText('Visit our GitHub repository to download the SyncNext project template and start building your site today.')
        },
        linkTitle: {
          'en-US': 'View on GitHub'
        },
        linkUrl: {
          'en-US': 'https://github.com/syncnext'
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
        features: {
          'en-US': [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: devStatsItem
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: devBullet
              }
            }
          ]
        },
        layout: {
          'en-US': 'left'
        }
      }
    })
    await developersSideBySide.publish()
    entries.push(developersSideBySide.sys.id)
    console.log('SyncNext for Developers section created')

    // 4. Create the get-started landing page
    console.log('\nCreating get-started landing page...')
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'Get Started'
        },
        slug: {
          'en-US': 'get-started'
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
    console.log('Get Started landing page created and published!')

    console.log('\n🎉 SyncNext Get Started page created successfully!')
    console.log(`Landing Page Entry ID: ${landingPage.sys.id}`)
    console.log(`Landing Page Slug: get-started`)
    console.log(`Total sections created: ${entries.length}`)
    console.log('\nSections included:')
    console.log('✅ Hero section')
    console.log('✅ SyncNext for Designers side-by-side')
    console.log('✅ SyncNext for Developers side-by-side')
    console.log('\nYou can now view the page at: http://localhost:8080/get-started')

  } catch (error) {
    console.error('Error creating get-started page:', error)
    process.exit(1)
  }
}

createGetStartedPage()

