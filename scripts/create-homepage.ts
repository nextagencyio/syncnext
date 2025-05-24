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
          'en-US': createRichTextWithFormatting('Empower Your Web Development with SyncNext', true)
        },
        heroLayout: {
          'en-US': 'image_top'
        },
        linkTitle: {
          'en-US': 'Start'
        },
        linkUrl: {
          'en-US': '#get-started'
        },
        link2Title: {
          'en-US': 'Explore'
        },
        link2Url: {
          'en-US': '#features'
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

    // 2. Create Side by Side section - Unmatched Advantages
    console.log('Creating advantages side-by-side section...')
    const sideBySideEntry = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Unmatched Advantages of SyncNext'
        },
        leftContent: {
          'en-US': createRichText([
            'Elevate Your Web Development with SyncNext\'s Cutting Edge Features',
            '',
            'Decoupled Architecture: Harness the power of headless CMS to separate the front and back-end for optimal flexibility.',
            '',
            'AI Development Tools: Leverage cutting-edge AI assistants and smart code generators to accelerate your development.'
          ])
        },
        rightContent: {
          'en-US': createRichText('')
        },
        leftMedia: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageId
            }
          }
        },
        layout: {
          'en-US': 'image_right'
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
          'en-US': ['Architecture', 'Integration']
        }
      }
    })
    await card1.publish()
    featureCards.push(card1.sys.id)

    const card2 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Seamless Integration & Flexibility'
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
          'en-US': ['React', 'Performance']
        }
      }
    })
    await card2.publish()
    featureCards.push(card2.sys.id)

    const card3 = await environment.createEntry('card', {
      fields: {
        title: {
          'en-US': 'Blazing Fast Performance'
        },
        summary: {
          'en-US': 'Deliver lightning-quick load times and smooth interactions that keep your audience coming back.'
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

    // 4. Create Logo Collection section
    console.log('Creating technology logos collection...')
    const logoCollectionEntry = await environment.createEntry('logoCollection', {
      fields: {
        title: {
          'en-US': 'Trusted Open Source Technology'
        },
        logos: {
          'en-US': [
            {
              sys: {
                type: 'Link',
                linkType: 'Asset',
                id: imageId
              }
            }
          ]
        }
      }
    })
    await logoCollectionEntry.publish()
    entries.push(logoCollectionEntry.sys.id)
    console.log('Technology logos collection created')

    // 5. Create another Side by Side section - Elevate Skills
    console.log('Creating skills elevation side-by-side section...')
    const sideBySideEntry2 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Elevate Your Web Development Skills with SyncNext'
        },
        leftContent: {
          'en-US': createRichText('')
        },
        rightContent: {
          'en-US': createRichText('Join the SyncNext ecosystem to unlock new possibilities in web development. Our platform combines the best of modern CMS with cutting-edge front-end technologies, enabling you to create powerful, scalable, and innovative web solutions.')
        },
        rightMedia: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageId
            }
          }
        },
        layout: {
          'en-US': 'image_left'
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

    // 8. Create final Side by Side section - Essential Features
    console.log('Creating essential features side-by-side section...')
    const sideBySideEntry3 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Discover the Essential Features That Make SyncNext Stand Out'
        },
        leftContent: {
          'en-US': createRichText([
            'SyncNext offers a powerful blend of flexibility and performance, enabling seamless integration and unparalleled user experience.',
            '',
            'Key Features: Explore our innovative tools designed to enhance your web development journey, from AI-assisted coding to seamless React integration.',
            '',
            'Accelerate Your Projects: Leverage SyncNext\'s powerful features to reduce development time and deliver high-performance websites faster than ever.'
          ])
        },
        rightContent: {
          'en-US': createRichText('')
        },
        leftMedia: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageId
            }
          }
        },
        layout: {
          'en-US': 'image_right'
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
