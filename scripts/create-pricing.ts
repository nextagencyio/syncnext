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
      'fields.title': 'Pricing Hero Image - SyncNext'
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
            'en-US': 'Pricing Hero Image - SyncNext'
          },
          description: {
            'en-US': 'Pricing page hero image'
          },
          file: {
            'en-US': {
              contentType: 'image/jpeg',
              fileName: 'pricing-hero.jpg',
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
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
          'en-US': 'Pricing Hero Image - SyncNext'
        },
        description: {
          'en-US': 'Pricing page hero image'
        },
        file: {
          'en-US': {
            contentType: 'image/png',
            fileName: 'pricing-hero.png',
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

// Helper function to create bullet point
async function createBullet(environment: any, title: string, text: string) {
  const bullet = await environment.createEntry('bullet', {
    fields: {
      icon: {
        'en-US': 'Check'
      },
      summary: {
        'en-US': text
      }
    }
  })
  await bullet.publish()
  return bullet.sys.id
}

// Helper function to create pricing card
async function createPricingCard(environment: any, cardData: any) {
  const pricingCard = await environment.createEntry('pricingCard', {
    fields: {
      eyebrow: {
        'en-US': cardData.eyebrow
      },
      title: {
        'en-US': cardData.title
      },
      featuresText: {
        'en-US': cardData.features.map((feature: any) => feature.text).join('\n')
      },
      linkTitle: {
        'en-US': cardData.cta_text
      },
      linkUrl: {
        'en-US': cardData.cta_link
      },
      suffix: {
        'en-US': cardData.monthly_label || ''
      }
    }
  })
  await pricingCard.publish()
  return pricingCard.sys.id
}

async function createPricingPage() {
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

    // Check if pricing page already exists
    const existingPages = await environment.getEntries({
      content_type: 'landing',
      'fields.slug': 'pricing',
    })

    if (existingPages.items.length > 0) {
      console.log('Pricing page already exists! Unpublishing and deleting existing page...')
      for (const page of existingPages.items) {
        try {
          if (page.isPublished()) {
            await page.unpublish()
          }
          await page.delete()
          console.log(`Deleted existing pricing page: ${page.sys.id}`)
        } catch (error) {
          console.log(`Could not delete page ${page.sys.id}, it may have references`)
        }
      }
    }

    const imageId = await createPlaceholderImageIfNeeded(environment)
    const entries = []

    // 1. Create Hero section
    console.log('\nCreating Pricing Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': 'Empower Your Content with SyncNext Today'
        },
        summary: {
          'en-US': createRichText('Discover the power of a decoupled CMS that adapts to your needs. With SyncNext, you can create, manage, and scale your content effortlessly.')
        },
        linkTitle: {
          'en-US': 'Get Started'
        },
        linkUrl: {
          'en-US': '#get-started'
        },
        link2Title: {
          'en-US': 'Learn More'
        },
        link2Url: {
          'en-US': '#learn-more'
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
          'en-US': 'image_bottom'
        }
      }
    })
    await heroEntry.publish()
    entries.push(heroEntry.sys.id)
    console.log('Pricing hero section created')

    // 2. Create Introduction section
    console.log('\nCreating Introduction section...')

    // Create feature bullets
    const bullet1 = await createBullet(
      environment,
      'Key Features',
      'Seamless integration, customizable solutions, and robust performance for all your content needs.'
    )

    const bullet2 = await createBullet(
      environment,
      'Why Choose',
      'Experience unmatched flexibility and control over your content delivery and management.'
    )

    const sideBySideEntry1 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Unleash Your Content with SyncNext'
        },
        eyebrow: {
          'en-US': 'Explore'
        },
        summary: {
          'en-US': createRichText('SyncNext is a powerful decoupled CMS that streamlines content management and enhances user experience. With its flexible architecture, you can easily integrate and scale your digital projects.')
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
                id: bullet1
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: bullet2
              }
            }
          ]
        },
        linkTitle: {
          'en-US': 'Learn More'
        },
        linkUrl: {
          'en-US': '#learn-more'
        },
        layout: {
          'en-US': 'right'
        }
      }
    })
    await sideBySideEntry1.publish()
    entries.push(sideBySideEntry1.sys.id)
    console.log('Introduction section created')

    // 3. Create Pricing section
    console.log('\nCreating Pricing section...')

    // Create pricing cards
    const pricingCardData = [
      {
        eyebrow: 'SyncNext Starter',
        title: 'Free',
        monthly_label: '',
        features: [
          { text: 'Full access to open source features' },
          { text: 'Community support' },
          { text: 'Documentation' },
          { text: 'AI features' },
        ],
        cta_text: 'Get Started',
        cta_link: '#',
      },
      {
        eyebrow: 'Paid Services',
        title: 'Contact Us',
        monthly_label: '',
        features: [
          { text: 'Custom development' },
          { text: 'Content migration' },
          { text: 'Ongoing support' },
          { text: 'Consulting services' },
        ],
        cta_text: 'Contact Sales',
        cta_link: '#',
      },
    ]

    const pricingCardIds = []
    for (const cardData of pricingCardData) {
      const cardId = await createPricingCard(environment, cardData)
      pricingCardIds.push(cardId)
    }

    const pricingEntry = await environment.createEntry('pricing', {
      fields: {
        eyebrow: {
          'en-US': 'Tailored SyncNext Offerings'
        },
        pricingTitle: {
          'en-US': 'Unlock the Full Potential of SyncNext'
        },
        pricingSummary: {
          'en-US': createRichText('Tailor your SyncNext experience: choose between self-managed and full-service options')
        },
        pricingCards: {
          'en-US': pricingCardIds.map(id => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id
            }
          }))
        }
      }
    })
    await pricingEntry.publish()
    entries.push(pricingEntry.sys.id)
    console.log('Pricing section created')

    // 4. Create CTA section
    console.log('\nCreating CTA section...')
    const sideBySideEntry2 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Get Started with SyncNext'
        },
        summary: {
          'en-US': createRichText('Join us today and unlock the full potential of your content management experience.')
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
        linkTitle: {
          'en-US': 'Sign Up'
        },
        linkUrl: {
          'en-US': '#sign-up'
        },
        layout: {
          'en-US': 'left'
        }
      }
    })
    await sideBySideEntry2.publish()
    entries.push(sideBySideEntry2.sys.id)
    console.log('CTA section created')

    // 5. Create the pricing landing page
    console.log('\nCreating pricing landing page...')
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'SyncNext Pricing'
        },
        slug: {
          'en-US': 'pricing'
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
    console.log(`\n✅ Pricing page created successfully!`)
    console.log(`Page ID: ${landingPage.sys.id}`)
    console.log(`Slug: pricing`)
    console.log(`Sections created: ${entries.length}`)
    console.log('\nYour pricing page should now be available at: /pricing')

  } catch (error) {
    console.error('Error creating pricing page:', error)
    process.exit(1)
  }
}

createPricingPage()
