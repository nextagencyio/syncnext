import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'

// Load environment variables from .env.
dotenv.config({ path: '.env' })

async function createPages() {
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

    console.log('Creating Privacy Policy and Terms of Service pages...')

    // Helper function to create rich text content.
    const createRichText = (sections: { heading: string; content: string; isH3?: boolean }[]) => ({
      nodeType: 'document',
      data: {},
      content: sections.flatMap(section => [
        {
          nodeType: section.isH3 ? 'heading-3' : 'heading-2',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: section.heading,
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
              value: section.content,
              marks: [],
              data: {},
            },
          ],
        },
      ]),
    })

    // Privacy Policy content.
    const privacyPolicyContent = createRichText([
      {
        heading: 'Information We Collect',
        content: 'At SyncNext, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal information.',
      },
      {
        heading: 'Types of Information Collected',
        content: 'We collect the following types of information:',
        isH3: true,
      },
      {
        heading: 'How We Use Your Information',
        content: 'We use your information to provide and maintain our service, notify you about changes, allow you to participate in interactive features, and provide customer support.',
        isH3: true,
      },
      {
        heading: 'Data Protection',
        content: 'We implement a variety of security measures to maintain the safety of your personal information including encryption of sensitive data, regular security audits, and restricted access to personal information.',
        isH3: true,
      },
      {
        heading: 'Your Rights',
        content: 'You have the right to access your personal data, correct inaccurate information, request deletion of your data, and object to processing of your data.',
        isH3: true,
      },
      {
        heading: 'Third-Party Disclosure',
        content: 'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except as described in this Privacy Policy.',
        isH3: true,
      },
      {
        heading: 'Cookies',
        content: 'We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. You can control cookies through your browser settings.',
        isH3: true,
      },
      {
        heading: 'Updates to This Policy',
        content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.',
        isH3: true,
      },
      {
        heading: 'Contact Us',
        content: 'If you have any questions about this Privacy Policy, please contact us at privacy@syncnext.com.',
        isH3: true,
      },
    ])

    // Terms of Service content.
    const termsOfServiceContent = createRichText([
      {
        heading: 'Acceptance of Terms',
        content: 'By accessing and using SyncNext, you accept and agree to be bound by the terms and provisions of this agreement.',
      },
      {
        heading: 'Use License',
        content: 'Permission is granted to temporarily use SyncNext for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
        isH3: true,
      },
      {
        heading: 'Prohibited Uses',
        content: 'Under this license you may not modify or copy the materials, use the materials for any commercial purpose, attempt to decompile or reverse engineer any software, remove any copyright or other proprietary notations, or transfer the materials to another person.',
        isH3: true,
      },
      {
        heading: 'Disclaimer',
        content: 'The materials on SyncNext are provided on an "as is" basis. SyncNext makes no warranties, expressed or implied, and hereby disclaims all other warranties including implied warranties of merchantability, fitness for a particular purpose, or non-infringement.',
        isH3: true,
      },
      {
        heading: 'Limitations',
        content: 'In no event shall SyncNext or its suppliers be liable for any damages arising out of the use or inability to use the materials on SyncNext, even if SyncNext has been notified of the possibility of such damage.',
        isH3: true,
      },
      {
        heading: 'Accuracy of Materials',
        content: 'The materials appearing on SyncNext could include technical, typographical, or photographic errors. SyncNext does not warrant that any materials are accurate, complete or current.',
        isH3: true,
      },
      {
        heading: 'Links',
        content: 'SyncNext has not reviewed all sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement.',
        isH3: true,
      },
      {
        heading: 'Modifications',
        content: 'SyncNext may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the current version of these terms.',
        isH3: true,
      },
      {
        heading: 'Governing Law',
        content: 'These terms and conditions are governed by and construed in accordance with applicable laws and you irrevocably submit to the exclusive jurisdiction of the courts.',
        isH3: true,
      },
    ])

    // Pages to create.
    const pages = [
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: privacyPolicyContent,
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: termsOfServiceContent,
      },
    ]

    // Create or update each page.
    for (const pageData of pages) {
      // Check if page already exists.
      const existingPages = await environment.getEntries({
        content_type: 'page',
        'fields.slug': pageData.slug,
      })

      if (existingPages.items.length > 0) {
        console.log(`${pageData.title} page already exists. Skipping...`)
        continue
      } else {
        // Create new page.
        const newPage = await environment.createEntry('page', {
          fields: {
            title: { 'en-US': pageData.title },
            slug: { 'en-US': pageData.slug },
            body: { 'en-US': pageData.content },
          },
        })

        await newPage.publish()
        console.log(`${pageData.title} page created successfully!`)
      }
    }

    console.log('✅ Privacy Policy and Terms of Service pages are now available')
    console.log('   - Privacy Policy: /privacy-policy')
    console.log('   - Terms of Service: /terms-of-service')
  } catch (error) {
    console.error('Error creating pages:', error)
    process.exit(1)
  }
}

createPages()
