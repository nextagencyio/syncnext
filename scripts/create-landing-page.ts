import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env
dotenv.config({ path: '.env' })

async function updateEnvFile(filePath: string, assetId: string) {
  try {
    let content = ''
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8')
    }

    // Check if CONTENTFUL_PLACEHOLDER_IMAGE_ID already exists
    if (content.includes('CONTENTFUL_PLACEHOLDER_IMAGE_ID=')) {
      // Replace existing value
      content = content.replace(
        /CONTENTFUL_PLACEHOLDER_IMAGE_ID=.*/,
        `CONTENTFUL_PLACEHOLDER_IMAGE_ID=${assetId}`
      )
    } else {
      // Add new line if file is not empty and doesn't end with newline
      if (content && !content.endsWith('\n')) {
        content += '\n'
      }
      // Add new variable
      content += `CONTENTFUL_PLACEHOLDER_IMAGE_ID=${assetId}\n`
    }

    fs.writeFileSync(filePath, content)
    console.log(`Updated ${filePath} with placeholder image ID`)
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error)
  }
}

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

// Helper function to create rich text with headings
function createRichTextWithHeading(heading: string, content: string) {
  return {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'heading-2',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: heading,
            marks: [],
            data: {}
          }
        ]
      },
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: content,
            marks: [],
            data: {}
          }
        ]
      }
    ]
  }
}

async function createPlaceholderImage(environment: any) {
  console.log('Creating placeholder image...')

  // Read local image file
  const imagePath = path.resolve(__dirname, 'images', 'card.png')
  const imageData = fs.readFileSync(imagePath)

  // Create upload
  const upload = await environment.createUpload({
    file: imageData
  })

  // Create asset
  const asset = await environment.createAsset({
    fields: {
      title: {
        'en-US': 'Demo Placeholder Image'
      },
      description: {
        'en-US': 'Reusable placeholder image for all demo content'
      },
      file: {
        'en-US': {
          contentType: 'image/png',
          fileName: 'card.png',
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

  // Process and publish the asset
  await asset.processForAllLocales()
  await new Promise(resolve => setTimeout(resolve, 3000)) // Wait for processing

  const processedAsset = await environment.getAsset(asset.sys.id)
  const publishedAsset = await processedAsset.publish()

  // Update env file with the image ID
  const rootEnvPath = path.resolve('.env')
  await updateEnvFile(rootEnvPath, publishedAsset.sys.id)

  console.log('Placeholder image created and configured')
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

async function createComprehensiveLandingPage() {
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

    const imageId = await createPlaceholderImage(environment)
    const logoAssetIds = await createLogoAssets(environment)

    const entries = []

    // 1. Create Hero section
    console.log('\nCreating Hero section...')
    const heroEntry = await environment.createEntry('hero', {
      fields: {
        title: {
          'en-US': 'Transform Your Business with Our Innovative Solutions'
        },
        heroLayout: {
          'en-US': 'default'
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
          'en-US': createRichText('Discover how our cutting-edge technology can revolutionize your workflow and drive unprecedented growth for your organization.')
        }
      }
    })
    await heroEntry.publish()
    entries.push(heroEntry.sys.id)
    console.log('Hero section created')

    // 2. Create Text section
    console.log('Creating Text section...')
    const textEntry = await environment.createEntry('text', {
      fields: {
        title: {
          'en-US': 'Our Story'
        },
        body: {
          'en-US': createRichText([
            'Founded in 2020, our company has been at the forefront of digital innovation. We believe in creating solutions that not only meet today\'s challenges but anticipate tomorrow\'s opportunities.',
            'Our team of experts brings together decades of experience in technology, design, and business strategy to deliver exceptional results for our clients.'
          ])
        },
        textLayout: {
          'en-US': 'centered'
        },
        eyebrow: {
          'en-US': 'About Us'
        },
        linkTitle: {
          'en-US': 'Read More'
        },
        linkUrl: {
          'en-US': '/story'
        },
        link2Title: {
          'en-US': 'Contact Us'
        },
        link2Url: {
          'en-US': '/contact'
        }
      }
    })
    await textEntry.publish()
    entries.push(textEntry.sys.id)
    console.log('Text section created')

    // 3. Create Cards for Card Group
    console.log('Creating Card entries...')
    const cardEntries = []
    const cardData = [
      {
        title: 'Web Development',
        summary: 'Custom web applications built with modern technologies and best practices.',
        linkTitle: 'Learn More',
        linkUrl: '/services/web-development',
        tags: ['React', 'Next.js', 'TypeScript']
      },
      {
        title: 'Mobile Apps',
        summary: 'Native and cross-platform mobile applications for iOS and Android.',
        linkTitle: 'View Portfolio',
        linkUrl: '/services/mobile-apps',
        tags: ['React Native', 'iOS', 'Android']
      },
      {
        title: 'Cloud Solutions',
        summary: 'Scalable cloud infrastructure and deployment strategies.',
        linkTitle: 'Get Started',
        linkUrl: '/services/cloud',
        tags: ['AWS', 'Azure', 'DevOps']
      }
    ]

    for (let i = 0; i < cardData.length; i++) {
      const card = cardData[i]
      const cardEntry = await environment.createEntry('card', {
        fields: {
          title: { 'en-US': card.title },
          summary: { 'en-US': card.summary },
          linkTitle: { 'en-US': card.linkTitle },
          linkUrl: { 'en-US': card.linkUrl },
          media: {
            'en-US': {
              sys: {
                type: 'Link',
                linkType: 'Asset',
                id: imageId
              }
            }
          },
          tags: { 'en-US': card.tags }
        }
      })
      await cardEntry.publish()
      cardEntries.push(cardEntry.sys.id)
    }

    // 4. Create Card Group
    console.log('Creating Card Group...')
    const cardGroupEntry = await environment.createEntry('cardGroup', {
      fields: {
        title: {
          'en-US': 'Our Services'
        },
        summary: {
          'en-US': createRichText('We offer comprehensive digital solutions to help your business thrive in the modern landscape.')
        },
        cards: {
          'en-US': cardEntries.map(id => ({
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
    console.log('Card Group created')

    // 5. Create Accordion Items
    console.log('Creating Accordion Items...')
    const accordionItemEntries = []
    const faqData = [
      {
        title: 'What makes your services unique?',
        body: 'We combine cutting-edge technology with deep industry expertise to deliver solutions that are not only innovative but also practical and scalable.'
      },
      {
        title: 'How long does a typical project take?',
        body: 'Project timelines vary based on scope and complexity, but most projects are completed within 8-12 weeks from initial consultation to launch.'
      },
      {
        title: 'Do you provide ongoing support?',
        body: 'Yes, we offer comprehensive support packages including maintenance, updates, and technical assistance to ensure your solution continues to perform optimally.'
      }
    ]

    for (const faq of faqData) {
      const accordionItemEntry = await environment.createEntry('accordionItem', {
        fields: {
          title: { 'en-US': faq.title },
          body: {
            'en-US': createRichText(faq.body)
          },
          linkTitle: { 'en-US': 'Contact Support' },
          linkUrl: { 'en-US': '/support' }
        }
      })
      await accordionItemEntry.publish()
      accordionItemEntries.push(accordionItemEntry.sys.id)
    }

    // 6. Create Accordion
    console.log('Creating Accordion...')
    const accordionEntry = await environment.createEntry('accordion', {
      fields: {
        title: {
          'en-US': 'Frequently Asked Questions'
        },
        accordionItem: {
          'en-US': accordionItemEntries.map(id => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id
            }
          }))
        }
      }
    })
    await accordionEntry.publish()
    entries.push(accordionEntry.sys.id)
    console.log('Accordion created')

    // 7. Create Gallery
    console.log('Creating Gallery...')
    const galleryEntry = await environment.createEntry('gallery', {
      fields: {
        title: {
          'en-US': 'Our Work'
        },
        gallerySummary: {
          'en-US': createRichText('Take a look at some of our recent projects and see the quality and innovation we bring to every client engagement.')
        },
        mediaItem: {
          'en-US': Array(6).fill(null).map(() => ({
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageId
            }
          }))
        }
      }
    })
    await galleryEntry.publish()
    entries.push(galleryEntry.sys.id)
    console.log('Gallery created')

    // 8. Create Pricing Cards
    console.log('Creating Pricing Cards...')
    const pricingCardEntries = []
    const pricingData = [
      {
        title: '$99',
        eyebrow: 'Starter',
        featuresText: 'Custom website design\nResponsive mobile layout\nBasic SEO optimization\n3 months support',
        linkTitle: 'Get Started',
        linkUrl: '/pricing/starter',
        suffix: '/month'
      },
      {
        title: '$299',
        eyebrow: 'Professional',
        featuresText: 'Everything in Starter\nAdvanced functionality\nE-commerce integration\nCustom CMS\n6 months support',
        linkTitle: 'Choose Pro',
        linkUrl: '/pricing/professional',
        suffix: '/month'
      },
      {
        title: 'Custom',
        eyebrow: 'Enterprise',
        featuresText: 'Everything in Professional\nDedicated project manager\nCustom integrations\nPriority support\n12 months support',
        linkTitle: 'Contact Sales',
        linkUrl: '/pricing/enterprise',
        suffix: ''
      }
    ]

    for (const pricing of pricingData) {
      const pricingCardEntry = await environment.createEntry('pricingCard', {
        fields: {
          title: { 'en-US': pricing.title },
          eyebrow: { 'en-US': pricing.eyebrow },
          featuresText: { 'en-US': pricing.featuresText },
          linkTitle: { 'en-US': pricing.linkTitle },
          linkUrl: { 'en-US': pricing.linkUrl },
          suffix: { 'en-US': pricing.suffix }
        }
      })
      await pricingCardEntry.publish()
      pricingCardEntries.push(pricingCardEntry.sys.id)
    }

    // 9. Create Pricing section
    console.log('Creating Pricing section...')
    const pricingEntry = await environment.createEntry('pricing', {
      fields: {
        eyebrow: {
          'en-US': 'Pricing Plans'
        },
        pricingTitle: {
          'en-US': 'Choose the Perfect Plan for Your Needs'
        },
        pricingSummary: {
          'en-US': createRichText('Flexible pricing options designed to scale with your business. All plans include our commitment to quality and customer satisfaction.')
        },
        pricingCards: {
          'en-US': pricingCardEntries.map(id => ({
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

    // 10. Create Media section
    console.log('Creating Media section...')
    const mediaEntry = await environment.createEntry('media', {
      fields: {
        title: {
          'en-US': 'Featured Project'
        },
        media: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageId
            }
          }
        }
      }
    })
    await mediaEntry.publish()
    entries.push(mediaEntry.sys.id)
    console.log('Media section created')

    // 11. Create Carousel Items
    console.log('Creating Carousel Items...')
    const carouselItemEntries = []
    const carouselData = [
      {
        title: 'Innovation at Scale',
        summary: 'Discover how we help enterprise clients transform their digital infrastructure.'
      },
      {
        title: 'User-Centered Design',
        summary: 'Our design philosophy puts users first, creating intuitive and engaging experiences.'
      },
      {
        title: 'Cutting-Edge Technology',
        summary: 'We leverage the latest technologies to build future-proof solutions.'
      }
    ]

    for (let i = 0; i < carouselData.length; i++) {
      const item = carouselData[i]
      const carouselItemEntry = await environment.createEntry('carouselItem', {
        fields: {
          title: { 'en-US': item.title },
          summary: { 'en-US': item.summary },
          media: {
            'en-US': {
              sys: {
                type: 'Link',
                linkType: 'Asset',
                id: imageId
              }
            }
          }
        }
      })
      await carouselItemEntry.publish()
      carouselItemEntries.push(carouselItemEntry.sys.id)
    }

    // 12. Create Carousel
    console.log('Creating Carousel...')
    const carouselEntry = await environment.createEntry('carousel', {
      fields: {
        title: {
          'en-US': 'Why Choose Us'
        },
        carouselItem: {
          'en-US': carouselItemEntries.map(id => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id
            }
          }))
        }
      }
    })
    await carouselEntry.publish()
    entries.push(carouselEntry.sys.id)
    console.log('Carousel created')

    // 13. Create Quote section
    console.log('Creating Quote section...')
    const quoteEntry = await environment.createEntry('quote', {
      fields: {
        author: {
          'en-US': 'Sarah Johnson'
        },
        jobTitle: {
          'en-US': 'CEO, TechCorp Solutions'
        },
        logo: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageId
            }
          }
        },
        quote: {
          'en-US': 'Working with this team has been transformational for our business. Their expertise and dedication exceeded our expectations at every turn.'
        },
        thumb: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageId
            }
          }
        }
      }
    })
    await quoteEntry.publish()
    entries.push(quoteEntry.sys.id)
    console.log('Quote section created')

    // 14. Create Embed section
    console.log('Creating Embed section...')
    const embedEntry = await environment.createEntry('embed', {
      fields: {
        title: {
          'en-US': 'Follow Us on Social Media'
        },
        script: {
          'en-US': '<div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px;"><p>🚀 Connect with us on social media for the latest updates!</p><div style="margin-top: 10px;"><a href="#" style="margin: 0 10px;">Twitter</a><a href="#" style="margin: 0 10px;">LinkedIn</a><a href="#" style="margin: 0 10px;">GitHub</a></div></div>'
        }
      }
    })
    await embedEntry.publish()
    entries.push(embedEntry.sys.id)
    console.log('Embed section created')

    // 15. Create Newsletter section
    console.log('Creating Newsletter section...')
    const newsletterEntry = await environment.createEntry('newsletter', {
      fields: {
        newsletterTitle: {
          'en-US': 'Stay Updated'
        },
        summary: {
          'en-US': createRichText('Subscribe to our newsletter to receive the latest insights, tips, and updates from our team of experts.')
        }
      }
    })
    await newsletterEntry.publish()
    entries.push(newsletterEntry.sys.id)
    console.log('Newsletter section created')

    // 16. Create Logo Collection with multiple logos
    console.log('Creating Logo Collection...')
    const logoCollectionEntry = await environment.createEntry('logoCollection', {
      fields: {
        title: {
          'en-US': 'Trusted by Industry Leaders'
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
    console.log('Logo Collection created')

    // 17. Create Side by Side section with new structure
    console.log('Creating Side by Side section...')

    // Create features for this section
    const statsItem1 = await createStatsItem(
      environment,
      'Technical Excellence',
      'Deep technical expertise combined with innovative design thinking for superior solutions.',
      'Award'
    )

    const bullet1 = await createBullet(
      environment,
      'Target',
      'Creative Vision: We believe the best solutions emerge when technology meets creativity.'
    )

    const bullet2 = await createBullet(
      environment,
      'TrendingUp',
      'Measurable Success: Every project is an opportunity to exceed expectations and create impact.'
    )

    const sideBySideEntry = await environment.createEntry('sideBySide', {
      fields: {
        eyebrow: {
          'en-US': 'Our Approach'
        },
        title: {
          'en-US': 'Technology Meets Creativity'
        },
        summary: {
          'en-US': createRichText('We believe that the best solutions emerge when technical excellence meets creative vision. Our team combines deep expertise with innovative design thinking to deliver exceptional results.')
        },
        linkTitle: {
          'en-US': 'Learn More'
        },
        linkUrl: {
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
        layout: {
          'en-US': 'left'
        }
      }
    })
    await sideBySideEntry.publish()
    entries.push(sideBySideEntry.sys.id)
    console.log('Side by Side section created')

    // 18. Create the comprehensive landing page
    console.log('\nCreating comprehensive landing page...')
    const timestamp = Date.now()
    const landingPage = await environment.createEntry('landing', {
      fields: {
        title: {
          'en-US': 'Complete Demo Landing Page'
        },
        slug: {
          'en-US': `demo-landing-${timestamp}`
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
    console.log('Comprehensive landing page created and published!')

    console.log('\n🎉 Complete landing page created successfully!')
    console.log(`Landing Page Entry ID: ${landingPage.sys.id}`)
    console.log(`Landing Page Slug: demo-landing-${timestamp}`)
    console.log(`Total sections created: ${entries.length}`)
    console.log(`Image created: 1`)
    console.log('\nSections included:')
    console.log('✅ Hero with full content and media')
    console.log('✅ Text section with rich content')
    console.log('✅ Card Group with 3 service cards')
    console.log('✅ Accordion with FAQ items')
    console.log('✅ Gallery with multiple images')
    console.log('✅ Pricing section with 3 tiers')
    console.log('✅ Media showcase')
    console.log('✅ Carousel with rotating content')
    console.log('✅ Customer testimonial quote')
    console.log('✅ Social media embed')
    console.log('✅ Newsletter signup')
    console.log('✅ Logo collection')
    console.log('✅ Side-by-side content layout')
    console.log(`\nYou can now view the page at: http://localhost:3000/demo-landing-${timestamp}`)

  } catch (error) {
    console.error('Error creating comprehensive landing page:', error)
    process.exit(1)
  }
}

createComprehensiveLandingPage()
