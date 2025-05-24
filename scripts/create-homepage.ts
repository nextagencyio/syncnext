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
        'en-US': 'Homepage Hero Image'
      },
      description: {
        'en-US': 'Main hero image for the homepage'
      },
      file: {
        'en-US': {
          contentType: 'image/png',
          fileName: 'homepage-hero.png',
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

// Helper function to create logo assets from the images directory
async function createLogoAssets(environment: any) {
  const logoFiles = [
    { name: 'nextjs.png', title: 'Next.js Logo' },
    { name: 'react.png', title: 'React Logo' },
    { name: 'tailwind.png', title: 'Tailwind CSS Logo' },
    { name: 'contentful.png', title: 'Contentful Logo' },
    { name: 'storybook.png', title: 'Storybook Logo' },
    { name: 'shadcn.png', title: 'shadcn/ui Logo' },
    { name: 'graphql.png', title: 'GraphQL Logo' },
  ]

  const logoAssetIds = []

  for (const logoFile of logoFiles) {
    try {
      const imagePath = path.resolve(__dirname, 'images', logoFile.name)
      const imageData = fs.readFileSync(imagePath)

      const upload = await environment.createUpload({
        file: imageData
      })

      const asset = await environment.createAsset({
        fields: {
          title: {
            'en-US': logoFile.title
          },
          description: {
            'en-US': `${logoFile.title} for logo collection`
          },
          file: {
            'en-US': {
              contentType: 'image/png',
              fileName: logoFile.name,
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
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for processing

      const processedAsset = await environment.getAsset(asset.sys.id)
      const publishedAsset = await processedAsset.publish()
      logoAssetIds.push(publishedAsset.sys.id)

      console.log(`Created logo asset: ${logoFile.title}`)
    } catch (error) {
      console.error(`Error creating logo asset ${logoFile.name}:`, error)
    }
  }

  return logoAssetIds
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
    const logoAssetIds = await createLogoAssets(environment)
    const entries = []

    // 1. Create Hero section for homepage
    console.log('\nCreating Homepage Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': '*Empower* Your Web Development with *SyncNext*'
        },
        heroLayout: {
          'en-US': 'image_top'
        },
        linkTitle: {
          'en-US': 'Start'
        },
        linkUrl: {
          'en-US': '/get-started'
        },
        link2Title: {
          'en-US': 'Explore'
        },
        link2Url: {
          'en-US': '/features'
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
          'en-US': createRichText('Experience the next-gen platform that seamlessly integrates modern CMS with innovative front-end technologies. Elevate your projects with unmatched flexibility and performance.')
        }
      }
    })
    await heroEntry.publish()
    entries.push(heroEntry.sys.id)
    console.log('Homepage Hero created')

    // 2. Create Side by Side section - Unmatched Advantages with statsItems
    console.log('Creating advantages side-by-side section...')

    // Create statsItem entries for this section
    const statsItem1 = await createStatsItem(
      environment,
      'Decoupled Architecture',
      'Harness the power of headless CMS to separate the front and back-end for optimal flexibility.',
      'Network'
    )

    const statsItem2 = await createStatsItem(
      environment,
      'AI Development Tools',
      'Leverage cutting-edge AI assistants and smart code generators to accelerate your development.',
      'Bot'
    )

    const sideBySideEntry = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Unmatched Advantages of SyncNext'
        },
        summary: {
          'en-US': createRichText('Elevate Your Web Development with SyncNext\'s Cutting Edge Features')
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
                id: statsItem1
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: statsItem2
              }
            }
          ]
        },
        layout: {
          'en-US': 'right'
        }
      }
    })
    await sideBySideEntry.publish()
    entries.push(sideBySideEntry.sys.id)
    console.log('Advantages side-by-side section created')

    // 3. Create innovative features card group
    console.log('Creating innovative features card group...')
    const featureCards = []

    const card1 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Unlock the Power of Modern Web Solutions'
        },
        summary: {
          'en-US': 'Experience seamless integration and flexibility with our Decoupled Architecture.'
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
          'en-US': ['Modern', 'Solutions']
        }
      }
    })
    await card1.publish()
    featureCards.push(card1.sys.id)

    const card2 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Experience Seamless Integration and Flexibility'
        },
        summary: {
          'en-US': 'Leverage the power of React and Node.js to dramatically improve your website\'s efficiency and speed.'
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
          'en-US': ['Integration', 'Flexibility']
        }
      }
    })
    await card2.publish()
    featureCards.push(card2.sys.id)

    const card3 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Achieve Blazing Fast Performance'
        },
        summary: {
          'en-US': 'That Keeps Your Users Engaged and Satisfied'
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
    await card3.publish()
    featureCards.push(card3.sys.id)

    // Create Card Group
    const cardGroupEntry = await environment.createEntry('cardGroup', {
      fields: {
        title: {
          'en-US': 'Discover the Future of Web Development with SyncNext\'s Innovative Features'
        },
        summary: {
          'en-US': createRichText('Explore the powerful features that make SyncNext the perfect choice for modern web development.')
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
    console.log('Innovative features card group created')

    // 4. Create Logo Collection section with multiple logos
    console.log('Creating technology logos collection...')
    const logoCollectionEntry = await environment.createEntry('logoCollection', {
      fields: {
        title: {
          'en-US': 'Trusted Open Source Technology'
        },
        logos: {
          'en-US': logoAssetIds.map(assetId => ({
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: assetId
            }
          }))
        }
      }
    })
    await logoCollectionEntry.publish()
    entries.push(logoCollectionEntry.sys.id)
    console.log('Technology logos collection created')

    // 5. Create another Side by Side section - Elevate Skills with bullet points
    console.log('Creating skills elevation side-by-side section...')

    // Create bullet entries for this section
    const bullet1 = await createBullet(
      environment,
      'Code',
      'Modern CMS Integration: Seamlessly connect your content management with cutting-edge front-end technologies.'
    )

    const bullet2 = await createBullet(
      environment,
      'Rocket',
      'Powerful Development: Create scalable and innovative web solutions with enhanced performance.'
    )

    const bullet3 = await createBullet(
      environment,
      'Star',
      'Future-Ready: Join the SyncNext ecosystem to unlock new possibilities in web development.'
    )

    const sideBySideEntry2 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Elevate Your Web Development Skills with SyncNext'
        },
        summary: {
          'en-US': createRichText('Join the SyncNext ecosystem to unlock new possibilities in web development. Our platform combines the best of modern CMS with cutting-edge front-end technologies, enabling you to create powerful, scalable, and innovative web solutions.')
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
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: bullet3
              }
            }
          ]
        },
        layout: {
          'en-US': 'left'
        }
      }
    })
    await sideBySideEntry2.publish()
    entries.push(sideBySideEntry2.sys.id)
    console.log('Skills elevation side-by-side section created')

    // 6. Create accelerate text section
    console.log('Creating accelerate development text section...')
    const textEntry = await environment.createEntry('text', {
      fields: {
        title: {
          'en-US': 'Accelerate Your Web Development Journey'
        },
        body: {
          'en-US': createRichText('Start building faster, more efficient websites today. Explore SyncNext\'s capabilities and see how it can transform your development process.')
        },
        textLayout: {
          'en-US': 'buttons-right'
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
          'en-US': '/learn-more'
        }
      }
    })
    await textEntry.publish()
    entries.push(textEntry.sys.id)
    console.log('Accelerate development text section created')

    // 7. Create newsletter section
    console.log('Creating newsletter section...')
    const newsletterEntry = await environment.createEntry('newsletter', {
      fields: {
        newsletterTitle: {
          'en-US': 'Stay Informed with SyncNext'
        },
        summary: {
          'en-US': createRichText('Get the latest product updates, feature releases, and optimization tips delivered straight to your inbox.')
        }
      }
    })
    await newsletterEntry.publish()
    entries.push(newsletterEntry.sys.id)
    console.log('Newsletter section created')

    // 8. Create final Side by Side section - Essential Features with mixed features
    console.log('Creating essential features side-by-side section...')

    // Create mixed features for this section
    const statsItem3 = await createStatsItem(
      environment,
      'Key Features',
      'Explore our innovative tools designed to enhance your web development journey, from AI-assisted coding to seamless React integration.',
      'Star'
    )

    const bullet4 = await createBullet(
      environment,
      'Zap',
      'Accelerate Your Projects: Leverage SyncNext\'s powerful features to reduce development time and deliver high-performance websites faster than ever.'
    )

    const sideBySideEntry3 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Discover the Essential Features That Make SyncNext Stand Out in Web Development'
        },
        summary: {
          'en-US': createRichText('SyncNext offers a powerful blend of flexibility and performance, enabling seamless integration and unparalleled user experience.')
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
                id: statsItem3
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: bullet4
              }
            }
          ]
        },
        layout: {
          'en-US': 'right'
        }
      }
    })
    await sideBySideEntry3.publish()
    entries.push(sideBySideEntry3.sys.id)
    console.log('Essential features side-by-side section created')

    // 9. Create the homepage landing page
    console.log('\nCreating homepage landing page...')
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'SyncNext - AI-Powered Lightning Fast Development'
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

    console.log('\n🎉 SyncNext Homepage created successfully!')
    console.log(`Landing Page Entry ID: ${landingPage.sys.id}`)
    console.log(`Landing Page Slug: home`)
    console.log(`Total sections created: ${entries.length}`)
    console.log('\nSections included:')
    console.log('✅ Hero section with SyncNext branding')
    console.log('✅ Unmatched advantages side-by-side')
    console.log('✅ Innovative features card group')
    console.log('✅ Technology logos collection')
    console.log('✅ Skills elevation side-by-side')
    console.log('✅ Accelerate development text section')
    console.log('✅ Newsletter signup')
    console.log('✅ Essential features side-by-side')
    console.log('\nYou can now view the homepage at: http://localhost:8080/')

  } catch (error) {
    console.error('Error creating homepage:', error)
    process.exit(1)
  }
}

createHomepage()
