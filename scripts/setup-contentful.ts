import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config({ path: '.env' })

// This script sets up the content types in Contentful
async function setupContentful() {
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

    // Check if content types exist
    const contentTypes = await environment.getContentTypes()
    const existingTypes = new Set(contentTypes.items.map((type: any) => type.sys.id))

    // Helper function to create text field
    const textField = (id: string, name: string, required = false) => ({
      id,
      name,
      type: 'Text',
      required,
      localized: false,
    })

    // Helper function to create symbol field
    const symbolField = (id: string, name: string, required = false) => ({
      id,
      name,
      type: 'Symbol',
      required,
      localized: false,
    })

    // Helper function to create rich text field
    const richTextField = (id: string, name: string, required = false) => ({
      id,
      name,
      type: 'RichText',
      required,
      localized: false,
    })

    // Helper function to create asset link field
    const assetLinkField = (id: string, name: string, required = false) => ({
      id,
      name,
      type: 'Link',
      linkType: 'Asset',
      required,
      localized: false,
    })

    // Helper function to create entry link field
    const entryLinkField = (id: string, name: string, linkContentTypes: string[], required = false) => ({
      id,
      name,
      type: 'Link',
      linkType: 'Entry',
      required,
      localized: false,
      validations: [
        {
          linkContentType: linkContentTypes,
        },
      ],
    })

    // Helper function to create array of entry links
    const entryArrayField = (id: string, name: string, linkContentTypes: string[], required = false) => ({
      id,
      name,
      type: 'Array',
      required,
      localized: false,
      items: {
        type: 'Link',
        linkType: 'Entry',
        validations: [
          {
            linkContentType: linkContentTypes,
          },
        ],
      },
    })

    // Create Hero content type
    if (!existingTypes.has('hero')) {
      const heroContentType = await environment.createContentTypeWithId('hero', {
        name: 'Hero',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title', true),
          richTextField('heading', 'Heading'),
          symbolField('heroLayout', 'Hero Layout'),
          symbolField('linkTitle', 'Link Title'),
          symbolField('linkUrl', 'Link URL'),
          symbolField('link2Title', 'Link 2 Title'),
          symbolField('link2Url', 'Link 2 URL'),
          assetLinkField('media', 'Media'),
          richTextField('summary', 'Summary'),
        ],
      })
      await heroContentType.publish()
      console.log('Hero content type created and published')
    }
    else {
      console.log('Hero content type already exists')
    }

    // Create Text content type
    if (!existingTypes.has('text')) {
      const textContentType = await environment.createContentTypeWithId('text', {
        name: 'Text',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          richTextField('body', 'Body'),
          symbolField('textLayout', 'Text Layout'),
          symbolField('eyebrow', 'Eyebrow'),
          symbolField('linkTitle', 'Link Title'),
          symbolField('linkUrl', 'Link URL'),
          symbolField('link2Title', 'Link 2 Title'),
          symbolField('link2Url', 'Link 2 URL'),
        ],
      })
      await textContentType.publish()
      console.log('Text content type created and published')
    }
    else {
      console.log('Text content type already exists')
    }

    // Create Card content type
    if (!existingTypes.has('card')) {
      const cardContentType = await environment.createContentTypeWithId('card', {
        name: 'Card',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          textField('summary', 'Summary'),
          symbolField('linkTitle', 'Link Title'),
          symbolField('linkUrl', 'Link URL'),
          assetLinkField('media', 'Media'),
          {
            id: 'tags',
            name: 'Tags',
            type: 'Array',
            required: false,
            localized: false,
            items: {
              type: 'Symbol',
            },
          },
        ],
      })
      await cardContentType.publish()
      console.log('Card content type created and published')
    }
    else {
      console.log('Card content type already exists')
    }

    // Create AccordionItem content type
    if (!existingTypes.has('accordionItem')) {
      const accordionItemContentType = await environment.createContentTypeWithId('accordionItem', {
        name: 'Accordion Item',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title', true),
          richTextField('body', 'Body'),
          symbolField('linkTitle', 'Link Title'),
          symbolField('linkUrl', 'Link URL'),
        ],
      })
      await accordionItemContentType.publish()
      console.log('AccordionItem content type created and published')
    }
    else {
      console.log('AccordionItem content type already exists')
    }

    // Create Accordion content type
    if (!existingTypes.has('accordion')) {
      const accordionContentType = await environment.createContentTypeWithId('accordion', {
        name: 'Accordion',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          entryArrayField('accordionItem', 'Accordion Items', ['accordionItem']),
        ],
      })
      await accordionContentType.publish()
      console.log('Accordion content type created and published')
    }
    else {
      console.log('Accordion content type already exists')
    }

    // Create Gallery content type
    if (!existingTypes.has('gallery')) {
      const galleryContentType = await environment.createContentTypeWithId('gallery', {
        name: 'Gallery',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          richTextField('gallerySummary', 'Gallery Summary'),
          {
            id: 'mediaItem',
            name: 'Media Items',
            type: 'Array',
            required: false,
            localized: false,
            items: {
              type: 'Link',
              linkType: 'Asset',
            },
          },
        ],
      })
      await galleryContentType.publish()
      console.log('Gallery content type created and published')
    }
    else {
      console.log('Gallery content type already exists')
    }

    // Create PricingCard content type
    if (!existingTypes.has('pricingCard')) {
      const pricingCardContentType = await environment.createContentTypeWithId('pricingCard', {
        name: 'Pricing Card',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          symbolField('eyebrow', 'Eyebrow'),
          textField('featuresText', 'Features Text'),
          symbolField('linkTitle', 'Link Title'),
          symbolField('linkUrl', 'Link URL'),
          symbolField('suffix', 'Suffix'),
        ],
      })
      await pricingCardContentType.publish()
      console.log('PricingCard content type created and published')
    }
    else {
      console.log('PricingCard content type already exists')
    }

    // Create Pricing content type
    if (!existingTypes.has('pricing')) {
      const pricingContentType = await environment.createContentTypeWithId('pricing', {
        name: 'Pricing',
        displayField: 'pricingTitle',
        fields: [
          symbolField('eyebrow', 'Eyebrow'),
          symbolField('pricingTitle', 'Title'),
          richTextField('pricingSummary', 'Summary'),
          entryArrayField('pricingCards', 'Pricing Cards', ['pricingCard']),
        ],
      })
      await pricingContentType.publish()
      console.log('Pricing content type created and published')
    }
    else {
      console.log('Pricing content type already exists')
    }

    // Create Media content type
    if (!existingTypes.has('media')) {
      const mediaContentType = await environment.createContentTypeWithId('media', {
        name: 'Media',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          assetLinkField('media', 'Media'),
        ],
      })
      await mediaContentType.publish()
      console.log('Media content type created and published')
    }
    else {
      console.log('Media content type already exists')
    }

    // Create CarouselItem content type
    if (!existingTypes.has('carouselItem')) {
      const carouselItemContentType = await environment.createContentTypeWithId('carouselItem', {
        name: 'Carousel Item',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          textField('summary', 'Summary'),
          assetLinkField('media', 'Media'),
        ],
      })
      await carouselItemContentType.publish()
      console.log('CarouselItem content type created and published')
    }
    else {
      console.log('CarouselItem content type already exists')
    }

    // Create Carousel content type
    if (!existingTypes.has('carousel')) {
      const carouselContentType = await environment.createContentTypeWithId('carousel', {
        name: 'Carousel',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          entryArrayField('carouselItem', 'Carousel Items', ['carouselItem']),
        ],
      })
      await carouselContentType.publish()
      console.log('Carousel content type created and published')
    }
    else {
      console.log('Carousel content type already exists')
    }

    // Create Quote content type
    if (!existingTypes.has('quote')) {
      const quoteContentType = await environment.createContentTypeWithId('quote', {
        name: 'Quote',
        displayField: 'author',
        fields: [
          symbolField('author', 'Author'),
          symbolField('jobTitle', 'Job Title'),
          assetLinkField('logo', 'Logo'),
          textField('quote', 'Quote'),
          assetLinkField('thumb', 'Thumbnail'),
        ],
      })
      await quoteContentType.publish()
      console.log('Quote content type created and published')
    }
    else {
      console.log('Quote content type already exists')
    }

    // Create Embed content type
    if (!existingTypes.has('embed')) {
      const embedContentType = await environment.createContentTypeWithId('embed', {
        name: 'Embed',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          textField('script', 'Script/Embed Code'),
        ],
      })
      await embedContentType.publish()
      console.log('Embed content type created and published')
    }
    else {
      console.log('Embed content type already exists')
    }

    // Create Newsletter content type
    if (!existingTypes.has('newsletter')) {
      const newsletterContentType = await environment.createContentTypeWithId('newsletter', {
        name: 'Newsletter',
        displayField: 'newsletterTitle',
        fields: [
          symbolField('newsletterTitle', 'Title'),
          richTextField('summary', 'Summary'),
        ],
      })
      await newsletterContentType.publish()
      console.log('Newsletter content type created and published')
    }
    else {
      console.log('Newsletter content type already exists')
    }



    // Create CardGroup content type
    if (!existingTypes.has('cardGroup')) {
      const cardGroupContentType = await environment.createContentTypeWithId('cardGroup', {
        name: 'Card Group',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          richTextField('summary', 'Summary'),
          entryArrayField('cards', 'Cards', ['card']),
        ],
      })
      await cardGroupContentType.publish()
      console.log('CardGroup content type created and published')
    }
    else {
      console.log('CardGroup content type already exists')
    }

    // Create LogoCollection content type
    if (!existingTypes.has('logoCollection')) {
      const logoCollectionContentType = await environment.createContentTypeWithId('logoCollection', {
        name: 'Logo Collection',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          {
            id: 'logos',
            name: 'Logos',
            type: 'Array',
            required: false,
            localized: false,
            items: {
              type: 'Link',
              linkType: 'Asset',
            },
          },
        ],
      })
      await logoCollectionContentType.publish()
      console.log('LogoCollection content type created and published')
    }
    else {
      console.log('LogoCollection content type already exists')
    }



    // Create SideBySide content type
    if (!existingTypes.has('sideBySide')) {
      const sideBySideContentType = await environment.createContentTypeWithId('sideBySide', {
        name: 'Side by Side',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          richTextField('leftContent', 'Left Content'),
          richTextField('rightContent', 'Right Content'),
          assetLinkField('leftMedia', 'Left Media'),
          assetLinkField('rightMedia', 'Right Media'),
          symbolField('layout', 'Layout'),
        ],
      })
      await sideBySideContentType.publish()
      console.log('SideBySide content type created and published')
    }
    else {
      console.log('SideBySide content type already exists')
    }

    // Create Landing content type if it doesn't exist
    if (!existingTypes.has('landing')) {
      const allSectionTypes = [
        'hero', 'text', 'card', 'accordion',
        'gallery', 'pricing', 'media', 'carousel',
        'quote', 'embed', 'newsletter',
        'cardGroup', 'logoCollection', 'sideBySide',
      ]

      const landingContentType = await environment.createContentTypeWithId('landing', {
        name: 'Landing Page',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title', true),
          {
            id: 'slug',
            name: 'Slug',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [
              {
                unique: true,
              },
            ],
          },
          {
            id: 'sections',
            name: 'Sections',
            type: 'Array',
            required: false,
            localized: false,
            items: {
              type: 'Link',
              linkType: 'Entry',
              validations: [
                {
                  linkContentType: allSectionTypes,
                },
              ],
            },
          },
        ],
      })

      await landingContentType.publish()
      console.log('Landing Page content type created and published')
    }
    else {
      // Update the existing Landing content type to include all paragraph types
      const landingContentType = await environment.getContentType('landing')

      // Update the sections field to include all section types
      const sectionsField = landingContentType.fields.find((field: any) => field.id === 'sections')
      if (sectionsField && sectionsField.items && sectionsField.items.validations) {
        const allSectionTypes = [
          'hero', 'text', 'card', 'accordion',
          'gallery', 'pricing', 'media', 'carousel',
          'quote', 'embed', 'newsletter',
          'cardGroup', 'logoCollection', 'sideBySide',
        ]

        sectionsField.items.validations = [
          {
            linkContentType: allSectionTypes,
          },
        ]

        const updatedLanding = await landingContentType.update()
        await updatedLanding.publish()
        console.log('Landing Page content type updated with all section types')
      }
    }

    // Create Page content type
    if (!existingTypes.has('page')) {
      const pageContentType = await environment.createContentTypeWithId('page', {
        name: 'Page',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title', true),
          {
            id: 'slug',
            name: 'Slug',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [
              {
                unique: true,
              },
            ],
          },
          assetLinkField('mediaPage', 'Featured Image'),
          richTextField('body', 'Body Content'),
        ],
      })
      await pageContentType.publish()
      console.log('Page content type created and published')
    }
    else {
      console.log('Page content type already exists')
    }

    // Create Article content type
    if (!existingTypes.has('article')) {
      const articleContentType = await environment.createContentTypeWithId('article', {
        name: 'Article',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title', true),
          {
            id: 'slug',
            name: 'Slug',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [
              {
                unique: true,
              },
            ],
          },
          symbolField('subhead', 'Subhead'),
          richTextField('lead', 'Lead/Summary'),
          assetLinkField('media', 'Featured Image'),
          richTextField('body', 'Body Content'),
        ],
      })
      await articleContentType.publish()
      console.log('Article content type created and published')
    }
    else {
      console.log('Article content type already exists')
    }

    // Create MenuItem content type
    if (!existingTypes.has('menuItem')) {
      const menuItemContentType = await environment.createContentTypeWithId('menuItem', {
        name: 'Menu Item',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title', true),
          symbolField('url', 'URL', true),
          {
            id: 'order',
            name: 'Order',
            type: 'Integer',
            required: false,
            localized: false,
          },
          entryArrayField('children', 'Child Menu Items', ['menuItem']),
        ],
      })
      await menuItemContentType.publish()
      console.log('MenuItem content type created and published')
    }
    else {
      console.log('MenuItem content type already exists')
    }

    // Create Menu content type
    if (!existingTypes.has('menu')) {
      const menuContentType = await environment.createContentTypeWithId('menu', {
        name: 'Menu',
        displayField: 'name',
        fields: [
          symbolField('name', 'Menu Name', true),
          {
            id: 'identifier',
            name: 'Identifier',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [
              {
                unique: true,
              },
              {
                in: ['main', 'footer'],
              },
            ],
          },
          entryArrayField('items', 'Menu Items', ['menuItem']),
        ],
      })
      await menuContentType.publish()
      console.log('Menu content type created and published')
    }
    else {
      console.log('Menu content type already exists')
    }

    console.log('All content types setup completed successfully!')
  } catch (error) {
    console.error('Error setting up content types:', error)
    process.exit(1)
  }
}

setupContentful()
