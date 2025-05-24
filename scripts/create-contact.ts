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
  const imagePath = path.resolve(__dirname, 'images', 'card.png')
  const imageData = fs.readFileSync(imagePath)

  const upload = await environment.createUpload({
    file: imageData
  })

  const asset = await environment.createAsset({
    fields: {
      title: {
        'en-US': 'Contact Page Image'
      },
      description: {
        'en-US': 'Image for contact page'
      },
      file: {
        'en-US': {
          contentType: 'image/png',
          fileName: 'contact.png',
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

async function createContactPage() {
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

    // Check if contact page already exists
    const existingPages = await environment.getEntries({
      content_type: 'landing',
      'fields.slug': 'contact',
    })

    if (existingPages.items.length > 0) {
      console.log('Contact page already exists! Unpublishing and deleting existing page...')
      for (const page of existingPages.items) {
        try {
          if (page.isPublished()) {
            await page.unpublish()
          }
          await page.delete()
          console.log(`Deleted existing contact page: ${page.sys.id}`)
        } catch (error) {
          console.log(`Could not delete page ${page.sys.id}, it may have references`)
        }
      }
    }

    const imageId = await createPlaceholderImageIfNeeded(environment)
    const entries = []

    // 1. Create Hero section
    console.log('\nCreating Contact Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': 'Contact Hero'
        },
        heading: {
          'en-US': createRichTextWithFormatting('Contact Us', true)
        },
        heroLayout: {
          'en-US': 'image_top'
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
          'en-US': createRichText('Have a question about SyncNext? We\'re here to help! Drop us a message and we\'ll get back to you soon.')
        }
      }
    })
    await heroEntry.publish()
    entries.push(heroEntry.sys.id)
    console.log('Contact Hero created')

    // 2. Create Embed section for map
    console.log('Creating map embed section...')
    const embedEntry = await environment.createEntry('embed', {
      fields: {
        title: {
          'en-US': 'Location Map'
        },
        script: {
          'en-US': '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50704.05332036616!2d-122.12246645666515!3d37.413396126075966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb7495bec0189%3A0x42d5d96b3d3ba747!2sMountain%20View%2C%20CA!5e0!3m2!1sen!2sus!4v1677532753348!5m2!1sen!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
        }
      }
    })
    await embedEntry.publish()
    entries.push(embedEntry.sys.id)
    console.log('Map embed section created')

    // 3. Create the contact landing page
    console.log('\nCreating contact landing page...')
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'Contact Us'
        },
        slug: {
          'en-US': 'contact'
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
    console.log('Contact landing page created and published!')

    console.log('\n🎉 SyncNext Contact page created successfully!')
    console.log(`Landing Page Entry ID: ${landingPage.sys.id}`)
    console.log(`Landing Page Slug: contact`)
    console.log(`Total sections created: ${entries.length}`)
    console.log('\nSections included:')
    console.log('✅ Hero section')
    console.log('✅ Google Maps embed')
    console.log('\nYou can now view the page at: http://localhost:8080/contact')

  } catch (error) {
    console.error('Error creating contact page:', error)
    process.exit(1)
  }
}

createContactPage()
