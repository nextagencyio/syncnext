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

// Helper function to create heading rich text
function createHeadingRichText(text: string, level = 2) {
  return {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: `heading-${level}`,
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
    // Generate unique asset title to avoid conflicts
    const uniqueTitle = `Features Page Image - ${Date.now()}`

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
            'en-US': uniqueTitle
          },
          description: {
            'en-US': 'Features page hero image'
          },
          file: {
            'en-US': {
              contentType: 'image/jpeg',
              fileName: 'features-hero.jpg',
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
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
          'en-US': uniqueTitle
        },
        description: {
          'en-US': 'Features page hero image'
        },
        file: {
          'en-US': {
            contentType: 'image/png',
            fileName: `features-hero-${Date.now()}.png`,
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
  } catch (error) {
    console.error('Error creating placeholder image:', error)
    throw error
  }
}

// Helper function to create bullet point
async function createBullet(environment: any, icon: string, summary: string) {
  const bullet = await environment.createEntry('bullet', {
    fields: {
      icon: {
        'en-US': icon
      },
      summary: {
        'en-US': summary
      }
    }
  })
  await bullet.publish()
  return bullet.sys.id
}

// Helper function to create stats item
async function createStatsItem(environment: any, heading: string, body: string, icon: string) {
  const statsItem = await environment.createEntry('statsItem', {
    fields: {
      heading: {
        'en-US': heading
      },
      body: {
        'en-US': body
      },
      icon: {
        'en-US': icon
      }
    }
  })
  await statsItem.publish()
  return statsItem.sys.id
}

async function createFeaturesPage() {
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

    // Check if features page already exists
    const existingPages = await environment.getEntries({
      content_type: 'landing',
      'fields.slug': 'features',
    })

    if (existingPages.items.length > 0) {
      console.log('Features page already exists! Unpublishing and deleting existing page...')
      for (const page of existingPages.items) {
        try {
          if (page.isPublished()) {
            await page.unpublish()
          }
          await page.delete()
          console.log(`Deleted existing features page: ${page.sys.id}`)
        } catch (error) {
          console.log(`Could not delete page ${page.sys.id}, it may have references`)
        }
      }
    }

    const imageId = await createPlaceholderImageIfNeeded(environment)
    const entries = []

    // 1. Create Hero section
    console.log('\nCreating Features Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': 'Empower Your Web Development with SyncNext'
        },
        summary: {
          'en-US': createRichText('Discover the future of web development with SyncNext, where innovation meets reliability. Our platform offers cutting-edge tools that streamline your workflow and elevate your projects.')
        },
        linkTitle: {
          'en-US': 'Get Started'
        },
        linkUrl: {
          'en-US': '#primary-cta'
        },
        link2Title: {
          'en-US': 'Learn More'
        },
        link2Url: {
          'en-US': '#secondary-cta'
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
    console.log('Features hero section created')

    // 2. Create Customizable Components section
    console.log('\nCreating Customizable Components section...')

    // Create individual bullet points for customizable components
    const bullet1 = await createBullet(
      environment,
      'Box',
      'Streamlined workflows for faster project delivery'
    )

    const bullet2 = await createBullet(
      environment,
      'Box',
      'Streamlined workflows for faster project delivery'
    )

    const bullet3 = await createBullet(
      environment,
      'Box',
      'User-friendly interface for all skill levels'
    )

    const sideBySideEntry1 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Discover the Future of Web Development with SyncNext\'s Innovative Tools'
        },
        eyebrow: {
          'en-US': 'Customizable Components'
        },
        summary: {
          'en-US': createRichText('At SyncNext, we empower developers with cutting-edge tools and a modern tech stack, ensuring seamless integration and unparalleled performance that elevate your web projects.')
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
          'en-US': 'image_right'
        }
      }
    })
    await sideBySideEntry1.publish()
    entries.push(sideBySideEntry1.sys.id)
    console.log('Customizable components section created')

    // 3. Create Reliability section
    console.log('\nCreating Reliability section...')
    const sideBySideEntry2 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Experience Unmatched Reliability and Scalability Today'
        },
        eyebrow: {
          'en-US': 'Dependable'
        },
        summary: {
          'en-US': createRichText('At SyncNext, we prioritize reliability and scalability to ensure your web projects thrive. Our robust platform adapts seamlessly to your growing needs, empowering you to build with confidence.')
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
          'en-US': 'Explore'
        },
        linkUrl: {
          'en-US': '#explore'
        },
        layout: {
          'en-US': 'image_left'
        }
      }
    })
    await sideBySideEntry2.publish()
    entries.push(sideBySideEntry2.sys.id)
    console.log('Reliability section created')

    // 4. Create Features Stats section (Card Group)
    console.log('\nCreating Features Stats section...')

    const statsItem1 = await createStatsItem(
      environment,
      'User-friendly Interface',
      'Navigate effortlessly with our intuitive design',
      'Box'
    )

    const statsItem2 = await createStatsItem(
      environment,
      'Customizable Modules',
      'Tailor your experience with flexible module options',
      'Box'
    )

    const statsItem3 = await createStatsItem(
      environment,
      'Comprehensive Support',
      'Get assistance anytime with our dedicated support team',
      'Box'
    )

    // Create card group for features stats
    const cardGroupEntry = await environment.createEntry('cardGroup', {
      fields: {
        title: {
          'en-US': 'Discover Our Cutting-Edge Features'
        },
        cards: {
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
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: statsItem3
              }
            }
          ]
        }
      }
    })
    await cardGroupEntry.publish()
    entries.push(cardGroupEntry.sys.id)
    console.log('Features stats section created')

    // 5. Create Innovation section
    console.log('\nCreating Innovation section...')

    const statsItem4 = await createStatsItem(
      environment,
      'Seamless Integration',
      'Easily connect with various tools and services to enhance your web projects.',
      ''
    )

    const statsItem5 = await createStatsItem(
      environment,
      'Robust Security',
      'Protect your website with advanced security features and regular updates.',
      ''
    )

    const sideBySideEntry4 = await environment.createEntry('sideBySide', {
      fields: {
        title: {
          'en-US': 'Experience the Future of Web Development'
        },
        eyebrow: {
          'en-US': 'Innovate'
        },
        summary: {
          'en-US': createRichText('SyncNext empowers you to build dynamic websites with ease. Our platform combines cutting-edge technology with user-friendly features.')
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
                id: statsItem4
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: statsItem5
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
          'en-US': 'image_right'
        }
      }
    })
    await sideBySideEntry4.publish()
    entries.push(sideBySideEntry4.sys.id)
    console.log('Innovation section created')

    // 6. Create CTA section
    console.log('\nCreating CTA section...')
    const textEntry2 = await environment.createEntry('text', {
      fields: {
        title: {
          'en-US': 'Start Your Journey with SyncNext'
        },
        body: {
          'en-US': createRichText('Unlock your web development potential today with our innovative and user-friendly platform.')
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
        textLayout: {
          'en-US': 'default'
        }
      }
    })
    await textEntry2.publish()
    entries.push(textEntry2.sys.id)
    console.log('CTA section created')

    // 7. Create FAQ Accordion section
    console.log('\nCreating FAQ Accordion section...')

    // Create FAQ items
    const faqItem1 = await environment.createEntry('accordionItem', {
      fields: {
        title: {
          'en-US': 'What is SyncNext?'
        },
        body: {
          'en-US': createRichText('SyncNext is a modern web development platform that combines the power of Next.js with cutting-edge frontend technologies.')
        }
      }
    })
    await faqItem1.publish()

    const faqItem2 = await environment.createEntry('accordionItem', {
      fields: {
        title: {
          'en-US': 'Is SyncNext easy to use?'
        },
        body: {
          'en-US': createRichText('Yes! SyncNext is designed with user experience in mind, making it accessible for developers of all skill levels.')
        }
      }
    })
    await faqItem2.publish()

    const faqItem3 = await environment.createEntry('accordionItem', {
      fields: {
        title: {
          'en-US': 'What features does it offer?'
        },
        body: {
          'en-US': createRichText('SyncNext offers a comprehensive suite of features including customizable modules, responsive design tools, and robust security features.')
        }
      }
    })
    await faqItem3.publish()

    const faqItem4 = await environment.createEntry('accordionItem', {
      fields: {
        title: {
          'en-US': 'Is support available?'
        },
        body: {
          'en-US': createRichText('Absolutely! We provide dedicated support to all our users with various service level options.')
        }
      }
    })
    await faqItem4.publish()

    const faqItem5 = await environment.createEntry('accordionItem', {
      fields: {
        title: {
          'en-US': 'Can I try it?'
        },
        body: {
          'en-US': createRichText('Yes, you can try SyncNext with our free tier or request a demo to see its capabilities firsthand.')
        }
      }
    })
    await faqItem5.publish()

    // Create the accordion section
    const accordionEntry = await environment.createEntry('accordion', {
      fields: {
        title: {
          'en-US': 'FAQs'
        },
        accordionItem: {
          'en-US': [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: faqItem1.sys.id
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: faqItem2.sys.id
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: faqItem3.sys.id
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: faqItem4.sys.id
              }
            },
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: faqItem5.sys.id
              }
            }
          ]
        }
      }
    })
    await accordionEntry.publish()
    entries.push(accordionEntry.sys.id)
    console.log('FAQ accordion section created')

    // 8. Create the features landing page
    console.log('\nCreating features landing page...')
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'SyncNext Features'
        },
        slug: {
          'en-US': 'features'
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
    console.log(`\n✅ Features page created successfully!`)
    console.log(`Page ID: ${landingPage.sys.id}`)
    console.log(`Slug: features`)
    console.log(`Sections created: ${entries.length}`)
    console.log('\nYour features page should now be available at: /features')

  } catch (error) {
    console.error('Error creating features page:', error)
    process.exit(1)
  }
}

createFeaturesPage()
