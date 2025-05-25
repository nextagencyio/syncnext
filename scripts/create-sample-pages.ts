import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import path from 'path'

// Load environment variables from .env
dotenv.config({ path: '.env' })

// This script creates sample page entries
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
    const imagePath = path.join(__dirname, 'images', 'card.png')

    // Check if image exists
    try {
      fs.accessSync(imagePath)
      console.log('Using existing card.png file')
    } catch (error) {
      console.error('card.png file not found in scripts/images directory. Please ensure the file exists.')
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
            contentType: 'image/png',
            fileName: `sample-page-${Date.now()}.png`,
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

    console.log('\n🎉 Sample pages created successfully!')
    console.log('\n📄 Pages Created:')
    console.log(`- About Us: ${aboutPage.sys.id} (slug: ${aboutPage.fields.slug['en-US']})`)
    console.log(`- Services: ${servicesPage.sys.id} (slug: ${servicesPage.fields.slug['en-US']})`)
    console.log(`- Contact: ${contactPage.sys.id} (slug: ${contactPage.fields.slug['en-US']})`)

    console.log(`\n📷 Assets Created: 1`)
    console.log('\nYou can now use these pages in your Next.js application!')
    console.log('\nTo create articles, run: npm run create-articles')

  } catch (error) {
    console.error('Error creating sample pages:', error)
    process.exit(1)
  }
}

createSamplePages()
