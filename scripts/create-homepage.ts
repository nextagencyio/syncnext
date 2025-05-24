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
  const imagePath = path.resolve(__dirname, 'card.webp')
  const imageData = fs.readFileSync(imagePath)

  const upload = await environment.createUpload({
    file: imageData
  })

  const asset = await environment.createAsset({
    fields: {
      title: {
        'en-US': 'Homepage Hero Image'
      },
      description: {
        'en-US': 'Main hero image for the homepage'
      },
      file: {
        'en-US': {
          contentType: 'image/webp',
          fileName: 'homepage-hero.webp',
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

async function createHomepage() {
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

    // Check if homepage already exists
    const existingPages = await environment.getEntries({
      content_type: 'landing',
      'fields.slug': 'home',
    })

    if (existingPages.items.length > 0) {
      console.log('Homepage already exists! Unpublishing and deleting existing homepage...')
      for (const page of existingPages.items) {
        try {
          if (page.isPublished()) {
            await page.unpublish()
          }
          await page.delete()
          console.log(`Deleted existing homepage: ${page.sys.id}`)
        } catch (error) {
          console.log(`Could not delete page ${page.sys.id}, it may have references`)
        }
      }
    }

    const imageId = await createPlaceholderImageIfNeeded(environment)
    const entries = []

    // 1. Create Hero section for homepage
    console.log('\nCreating Homepage Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': 'Homepage Hero'
        },
        heading: {
          'en-US': createRichTextWithFormatting('Welcome to Our Modern CMS Platform', true)
        },
        heroLayout: {
          'en-US': 'image_bottom_split'
        },
        linkTitle: {
          'en-US': 'Get Started'
        },
        linkUrl: {
          'en-US': '/get-started'
        },
        link2Title: {
          'en-US': 'Learn More'
        },
        link2Url: {
          'en-US': '/about'
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
          'en-US': createRichText('Discover the power of modern content management with our headless CMS solution. Build faster, scale effortlessly, and deliver exceptional digital experiences.')
        }
      }
    })
    await heroEntry.publish()
    entries.push(heroEntry.sys.id)
    console.log('Homepage Hero created')

    // 2. Create intro text section
    console.log('Creating intro text section...')
    const textEntry = await environment.createEntry('text', {
      fields: {
        title: {
          'en-US': 'Modern Content Management'
        },
        body: {
          'en-US': createRichText('Our platform combines the flexibility of a headless CMS with the power of modern web technologies. Create, manage, and deliver content across any device or platform with ease.')
        },
        textLayout: {
          'en-US': 'centered'
        },
        eyebrow: {
          'en-US': 'Why Choose Us'
        },
        linkTitle: {
          'en-US': 'Explore Features'
        },
        linkUrl: {
          'en-US': '/features'
        }
      }
    })
    await textEntry.publish()
    entries.push(textEntry.sys.id)
    console.log('Intro text section created')

    // 3. Create key features cards
    console.log('Creating key features cards...')
    const featureCards = []

    const card1 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Lightning Fast'
        },
        summary: {
          'en-US': 'Built for speed with Next.js and optimized for performance across all devices.'
        },
        linkTitle: {
          'en-US': 'Learn More'
        },
        linkUrl: {
          'en-US': '/performance'
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
          'en-US': ['Performance', 'Speed']
        }
      }
    })
    await card1.publish()
    featureCards.push(card1.sys.id)

    const card2 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Developer Friendly'
        },
        summary: {
          'en-US': 'Modern development tools, TypeScript support, and comprehensive documentation.'
        },
        linkTitle: {
          'en-US': 'Documentation'
        },
        linkUrl: {
          'en-US': '/docs'
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
          'en-US': ['Development', 'TypeScript']
        }
      }
    })
    await card2.publish()
    featureCards.push(card2.sys.id)

    const card3 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Scalable Architecture'
        },
        summary: {
          'en-US': 'Headless architecture that grows with your business and adapts to your needs.'
        },
        linkTitle: {
          'en-US': 'Architecture'
        },
        linkUrl: {
          'en-US': '/architecture'
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
          'en-US': ['Architecture', 'Scalability']
        }
      }
    })
    await card3.publish()
    featureCards.push(card3.sys.id)

    // Create Card Group
    const cardGroupEntry = await environment.createEntry('cardGroup', {
      fields: {
        title: {
          'en-US': 'Key Features'
        },
        summary: {
          'en-US': createRichText('Everything you need to build modern, scalable applications.')
        },
        cards: {
          'en-US': featureCards.map(id => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id
            }
          }))
        }
      }
    })
    await cardGroupEntry.publish()
    entries.push(cardGroupEntry.sys.id)
    console.log('Key features card group created')

    // 4. Create CTA section
    console.log('Creating CTA section...')
    const ctaEntry = await environment.createEntry('text', {
      fields: {
        title: {
          'en-US': 'Ready to Get Started?'
        },
        body: {
          'en-US': createRichText('Join thousands of developers and content creators who are building amazing experiences with our platform.')
        },
        textLayout: {
          'en-US': 'centered'
        },
        linkTitle: {
          'en-US': 'Start Building'
        },
        linkUrl: {
          'en-US': '/get-started'
        },
        link2Title: {
          'en-US': 'Contact Sales'
        },
        link2Url: {
          'en-US': '/contact'
        }
      }
    })
    await ctaEntry.publish()
    entries.push(ctaEntry.sys.id)
    console.log('CTA section created')

    // 5. Create the homepage landing page
    console.log('\nCreating homepage landing page...')
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'Homepage'
        },
        slug: {
          'en-US': 'home'
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
    console.log('Homepage landing page created and published!')

    console.log('\n🎉 Homepage created successfully!')
    console.log(`Landing Page Entry ID: ${landingPage.sys.id}`)
    console.log(`Landing Page Slug: home`)
    console.log(`Total sections created: ${entries.length}`)
    console.log('\nSections included:')
    console.log('✅ Hero section with call-to-action')
    console.log('✅ Introduction text with centered layout')
    console.log('✅ Key features card group')
    console.log('✅ Call-to-action section')
    console.log('\nYou can now view the homepage at: http://localhost:8080/')

  } catch (error) {
    console.error('Error creating homepage:', error)
    process.exit(1)
  }
}

createHomepage()
