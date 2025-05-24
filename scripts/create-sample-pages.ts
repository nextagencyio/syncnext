import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import path from 'path'

// Load environment variables from .env
dotenv.config({ path: '.env' })

// This script creates sample page and article entries
async function createSamplePages() {
  // Replace these with your actual values
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

    // Helper function to create rich text content
    const createRichText = (content: string) => ({
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
              marks: [],
              data: {},
            },
          ],
        },
      ],
    })

    // Helper function to create rich text with headings
    const createRichTextWithHeading = (heading: string, content: string) => ({
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
              data: {},
            },
          ],
        },
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: content,
              marks: [],
              data: {},
            },
          ],
        },
      ],
    })

    // Use local image file
    const imagePath = path.join(__dirname, 'card.webp')

    // Check if image exists
    try {
      fs.accessSync(imagePath)
      console.log('Using existing card.webp file')
    } catch (error) {
      console.error('card.webp file not found in scripts directory. Please ensure the file exists.')
      process.exit(1)
    }

    // Create placeholder image
    console.log('Creating placeholder image...')
    const imageBuffer = fs.readFileSync(imagePath)

    // Create upload
    const upload = await environment.createUpload({
      file: imageBuffer.buffer.slice(imageBuffer.byteOffset, imageBuffer.byteOffset + imageBuffer.byteLength) as ArrayBuffer
    })

    // Create asset
    const asset = await environment.createAsset({
      fields: {
        title: {
          'en-US': 'Sample Page Image',
        },
        description: {
          'en-US': 'Placeholder image for sample pages and articles',
        },
        file: {
          'en-US': {
            contentType: 'image/webp',
            fileName: `sample-page-${Date.now()}.webp`,
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: upload.sys.id
              }
            }
          },
        },
      },
    })

    // Process and publish the asset
    await asset.processForAllLocales()
    await new Promise(resolve => setTimeout(resolve, 3000)) // Wait for processing

    const processedAsset = await environment.getAsset(asset.sys.id)
    await processedAsset.publish()
    console.log('Placeholder image created and configured')

    // Create sample pages
    console.log('Creating sample pages...')

    // About Page
    const aboutPage = await environment.createEntry('page', {
      fields: {
        title: { 'en-US': 'About Our Company' },
        slug: { 'en-US': `about-us-${Date.now()}` },
        mediaPage: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: asset.sys.id,
            },
          },
        },
        body: {
          'en-US': createRichTextWithHeading(
            'Our Story',
            'Founded in 2020, our company has been at the forefront of digital innovation, helping businesses transform their operations through cutting-edge technology solutions. Our team of experienced professionals combines technical expertise with creative vision to deliver exceptional results for our clients.\n\nWe believe in building long-lasting partnerships with our clients, understanding their unique challenges, and crafting tailored solutions that drive real business value. From small startups to large enterprises, we have the experience and dedication to help organizations thrive in today\'s digital landscape.'
          ),
        },
      },
    })
    await aboutPage.publish()

    // Services Page
    const servicesPage = await environment.createEntry('page', {
      fields: {
        title: { 'en-US': 'Our Services' },
        slug: { 'en-US': `services-${Date.now()}` },
        mediaPage: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: asset.sys.id,
            },
          },
        },
        body: {
          'en-US': createRichTextWithHeading(
            'What We Offer',
            'We provide comprehensive digital solutions to help your business succeed in the modern marketplace. Our services include web development, mobile applications, cloud infrastructure, and digital marketing strategies.\n\nOur expert team works closely with you to understand your business goals and deliver solutions that exceed expectations. Whether you need a simple website or a complex enterprise system, we have the skills and experience to bring your vision to life.'
          ),
        },
      },
    })
    await servicesPage.publish()

    // Contact Page
    const contactPage = await environment.createEntry('page', {
      fields: {
        title: { 'en-US': 'Contact Us' },
        slug: { 'en-US': `contact-${Date.now()}` },
        body: {
          'en-US': createRichTextWithHeading(
            'Get In Touch',
            'Ready to start your next project? We\'d love to hear from you. Reach out to our team and let\'s discuss how we can help transform your business with innovative digital solutions.\n\nOur team is available to answer your questions and provide expert guidance on your digital transformation journey. Contact us today to schedule a consultation and discover what we can achieve together.'
          ),
        },
      },
    })
    await contactPage.publish()

    // Create sample articles
    console.log('Creating sample articles...')

    // Article 1: Technology Trends
    const techTrendsArticle = await environment.createEntry('article', {
      fields: {
        title: { 'en-US': 'Top Technology Trends Shaping 2024' },
        slug: { 'en-US': `tech-trends-2024-${Date.now()}` },
        subhead: { 'en-US': 'TECHNOLOGY INSIGHTS' },
        lead: {
          'en-US': createRichText(
            'Discover the emerging technologies and digital innovations that are transforming businesses across industries this year.'
          ),
        },
        media: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: asset.sys.id,
            },
          },
        },
        body: {
          'en-US': createRichTextWithHeading(
            'The Digital Revolution Continues',
            'As we progress through 2024, several key technology trends are reshaping how businesses operate and compete. Artificial Intelligence and Machine Learning continue to drive automation and decision-making processes, while cloud computing evolves to support increasingly complex workloads.\n\nThe rise of edge computing is bringing processing power closer to data sources, reducing latency and improving performance for real-time applications. Meanwhile, cybersecurity remains a top priority as organizations adapt to new threats and regulatory requirements.\n\nBusinesses that embrace these technologies early will have a significant competitive advantage in the marketplace.'
          ),
        },
      },
    })
    await techTrendsArticle.publish()

    // Article 2: Digital Marketing
    const digitalMarketingArticle = await environment.createEntry('article', {
      fields: {
        title: { 'en-US': 'Building Effective Digital Marketing Strategies' },
        slug: { 'en-US': `digital-marketing-strategies-${Date.now()}` },
        subhead: { 'en-US': 'MARKETING INSIGHTS' },
        lead: {
          'en-US': createRichText(
            'Learn how to create comprehensive digital marketing campaigns that drive engagement, generate leads, and grow your business.'
          ),
        },
        media: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: asset.sys.id,
            },
          },
        },
        body: {
          'en-US': createRichTextWithHeading(
            'The Foundation of Success',
            'Successful digital marketing requires a strategic approach that combines multiple channels and tactics. Social media marketing, content creation, search engine optimization, and paid advertising all play crucial roles in reaching your target audience.\n\nThe key is to understand your customers\' journey and create touchpoints that guide them from awareness to conversion. By leveraging data analytics and performance metrics, you can continuously optimize your campaigns for better results.\n\nRemember that digital marketing is not just about technology – it\'s about creating meaningful connections with your audience and providing value at every interaction.'
          ),
        },
      },
    })
    await digitalMarketingArticle.publish()

    // Article 3: Web Development
    const webDevArticle = await environment.createEntry('article', {
      fields: {
        title: { 'en-US': 'Modern Web Development Best Practices' },
        slug: { 'en-US': `web-development-best-practices-${Date.now()}` },
        subhead: { 'en-US': 'DEVELOPMENT GUIDE' },
        lead: {
          'en-US': createRichText(
            'Explore the latest techniques and frameworks that are defining modern web development and creating exceptional user experiences.'
          ),
        },
        media: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: asset.sys.id,
            },
          },
        },
        body: {
          'en-US': createRichTextWithHeading(
            'Building for the Future',
            'Modern web development has evolved far beyond simple HTML and CSS. Today\'s developers work with sophisticated frameworks like React, Vue, and Angular to create dynamic, interactive applications that provide exceptional user experiences.\n\nResponsive design, performance optimization, and accessibility are no longer optional – they\'re essential requirements for any successful web project. Progressive Web Apps (PWAs) are bridging the gap between web and mobile applications, offering native-like experiences through web browsers.\n\nAs web technologies continue to advance, staying current with best practices and emerging trends is crucial for creating applications that meet users\' expectations and business requirements.'
          ),
        },
      },
    })
    await webDevArticle.publish()

    console.log('\n🎉 Sample pages and articles created successfully!')
    console.log('\n📄 Pages Created:')
    console.log(`- About Us: ${aboutPage.sys.id} (slug: about-us-${Date.now()})`)
    console.log(`- Services: ${servicesPage.sys.id} (slug: services-${Date.now()})`)
    console.log(`- Contact: ${contactPage.sys.id} (slug: contact-${Date.now()})`)

    console.log('\n📰 Articles Created:')
    console.log(`- Tech Trends: ${techTrendsArticle.sys.id} (slug: tech-trends-2024-${Date.now()})`)
    console.log(`- Digital Marketing: ${digitalMarketingArticle.sys.id} (slug: digital-marketing-strategies-${Date.now()})`)
    console.log(`- Web Development: ${webDevArticle.sys.id} (slug: web-development-best-practices-${Date.now()})`)

    console.log(`\n📷 Assets Created: 1`)
    console.log('\nYou can now use these pages and articles in your Next.js application!')

  } catch (error) {
    console.error('Error creating sample pages:', error)
    process.exit(1)
  }
}

createSamplePages()
