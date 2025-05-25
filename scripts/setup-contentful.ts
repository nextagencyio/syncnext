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
        description: 'A prominent section typically used at the top of pages with a large heading, summary text, and call-to-action buttons.',
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
        description: 'A flexible text section for displaying formatted content with optional links and layout options.',
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
        description: 'A card component for displaying content with a title, summary, media, and optional tags.',
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
        description: 'An individual item within an accordion section with a title and expandable content.',
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
        description: 'A collapsible content section containing multiple accordion items for organizing information.',
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
        description: 'A media gallery section for displaying multiple images or assets in a grid layout.',
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
        description: 'An individual pricing card within a pricing section showing plan details and features.',
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
        description: 'A pricing section that displays multiple pricing cards with features and call-to-action buttons.',
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
        description: 'A simple media section for displaying a single image, video, or other media asset.',
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
        description: 'An individual item within a carousel with title, summary, and media content.',
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
        description: 'A rotating carousel section containing multiple carousel items that users can navigate through.',
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
        description: 'A testimonial or quote section featuring an author, their job title, company logo, and quote text.',
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
        description: 'A section for embedding external content like videos, forms, or third-party widgets using custom code.',
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
        description: 'A newsletter signup section with a title and summary to encourage email subscriptions.',
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
        description: 'A group of cards displayed together, supporting both regular cards and statistics items.',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
          richTextField('summary', 'Summary'),
          entryArrayField('cards', 'Cards', ['card', 'statsItem']),
        ],
      })
      await cardGroupContentType.publish()
      console.log('CardGroup content type created and published')
    }
    else {
      // Update the existing CardGroup content type to support both card and statsItem
      const cardGroupContentType = await environment.getContentType('cardGroup')

      // Update the cards field to include both card and statsItem types
      const cardsField = cardGroupContentType.fields.find((field: any) => field.id === 'cards')
      if (cardsField && cardsField.items && cardsField.items.validations) {
        const supportedTypes = ['card', 'statsItem']

        cardsField.items.validations = [
          {
            linkContentType: supportedTypes,
          },
        ]

        const updatedCardGroup = await cardGroupContentType.update()
        await updatedCardGroup.publish()
        console.log('CardGroup content type updated to support both card and statsItem entries')
      }
      else {
        console.log('CardGroup content type already exists')
      }
    }

    // Create LogoCollection content type
    if (!existingTypes.has('logoCollection')) {
      const logoCollectionContentType = await environment.createContentTypeWithId('logoCollection', {
        name: 'Logo Collection',
        description: 'A section for displaying multiple company or partner logos in a grid layout.',
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

    // Create StatsItem content type
    if (!existingTypes.has('statsItem')) {
      const statsItemContentType = await environment.createContentTypeWithId('statsItem', {
        name: 'Stats Item',
        description: 'A statistics item displaying a key metric with an icon, heading, and descriptive text.',
        displayField: 'heading',
        fields: [
          symbolField('heading', 'Heading', true),
          textField('body', 'Body'),
          symbolField('icon', 'Icon'),
          assetLinkField('media', 'Media'),
        ],
      })
      await statsItemContentType.publish()
      console.log('StatsItem content type created and published')
    }
    else {
      console.log('StatsItem content type already exists')
    }

    // Create Bullet content type
    if (!existingTypes.has('bullet')) {
      const bulletContentType = await environment.createContentTypeWithId('bullet', {
        name: 'Bullet',
        description: 'A bullet point item with an icon and summary text, typically used in feature lists.',
        displayField: 'summary',
        fields: [
          symbolField('icon', 'Icon', true),
          textField('summary', 'Summary', true),
        ],
      })
      await bulletContentType.publish()
      console.log('Bullet content type created and published')
    }
    else {
      console.log('Bullet content type already exists')
    }

    // Create SideBySide content type
    if (!existingTypes.has('sideBySide')) {
      const sideBySideContentType = await environment.createContentTypeWithId('sideBySide', {
        name: 'Side by Side',
        description: 'A two-column layout section with content on one side and media or features on the other.',
        displayField: 'title',
        fields: [
          symbolField('eyebrow', 'Eyebrow'),
          symbolField('title', 'Title'),
          richTextField('summary', 'Summary'),
          symbolField('linkTitle', 'Link Title'),
          symbolField('linkUrl', 'Link URL'),
          assetLinkField('media', 'Media'),
          entryArrayField('features', 'Features', ['statsItem', 'bullet']),
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
        'cardGroup', 'logoCollection', 'sideBySide', 'recentArticles',
      ]

      const landingContentType = await environment.createContentTypeWithId('landing', {
        name: 'Landing Page',
        description: 'A complete landing page composed of multiple sections arranged in a specific order.',
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
          'cardGroup', 'logoCollection', 'sideBySide', 'recentArticles',
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
        description: 'A standard page with a title, optional featured image, and rich text content.',
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
        description: 'A blog article or news post with title, summary, featured image, content, tags, and publish date.',
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
          {
            id: 'publishedDate',
            name: 'Published Date',
            type: 'Date',
            required: false,
            localized: false,
          },
        ],
      })
      await articleContentType.publish()
      console.log('Article content type created and published')
    }
    else {
      // Update existing article content type to add tags and publishedDate if they don't exist
      const articleContentType = await environment.getContentType('article')
      let needsUpdate = false

      // Check if tags field exists
      const tagsField = articleContentType.fields.find((field: any) => field.id === 'tags')
      if (!tagsField) {
        articleContentType.fields.push({
          id: 'tags',
          name: 'Tags',
          type: 'Array',
          required: false,
          localized: false,
          items: {
            type: 'Symbol',
          },
        })
        needsUpdate = true
      }

      // Check if publishedDate field exists
      const publishedDateField = articleContentType.fields.find((field: any) => field.id === 'publishedDate')
      if (!publishedDateField) {
        articleContentType.fields.push({
          id: 'publishedDate',
          name: 'Published Date',
          type: 'Date',
          required: false,
          localized: false,
        })
        needsUpdate = true
      }

      if (needsUpdate) {
        const updatedArticle = await articleContentType.update()
        await updatedArticle.publish()
        console.log('Article content type updated with tags and publishedDate fields')
      } else {
        console.log('Article content type already exists with all fields')
      }
    }

    // Create or update RecentArticles content type
    if (!existingTypes.has('recentArticles')) {
      const recentArticlesContentType = await environment.createContentTypeWithId('recentArticles', {
        name: 'Recent Articles',
        description: 'A section that displays recent articles dynamically',
        displayField: 'title',
        fields: [
          symbolField('title', 'Title'),
        ],
      })
      await recentArticlesContentType.publish()
      console.log('RecentArticles content type created and published')
    }
    else {
      // Check if the existing recentArticles content type needs to be updated
      const recentArticlesContentType = await environment.getContentType('recentArticles')
      let needsUpdate = false

      // Check if it still has the old articles field
      const articlesField = recentArticlesContentType.fields.find((field: any) => field.id === 'articles')
      if (articlesField && !articlesField.omitted) {
        console.log('RecentArticles content type has old articles field - it should be updated manually')
      }

      // Update name and description if needed
      if (recentArticlesContentType.name !== 'Recent Articles') {
        recentArticlesContentType.name = 'Recent Articles'
        needsUpdate = true
      }

      if (recentArticlesContentType.description !== 'A section that displays recent articles dynamically') {
        recentArticlesContentType.description = 'A section that displays recent articles dynamically'
        needsUpdate = true
      }

      if (needsUpdate) {
        const updatedContentType = await recentArticlesContentType.update()
        await updatedContentType.publish()
        console.log('RecentArticles content type metadata updated')
      } else {
        console.log('RecentArticles content type already exists and is up to date')
      }
    }

    // Create MenuItem content type
    if (!existingTypes.has('menuItem')) {
      const menuItemContentType = await environment.createContentTypeWithId('menuItem', {
        name: 'Menu Item',
        description: 'An individual navigation menu item with a title, URL, and optional child menu items.',
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
        description: 'A navigation menu containing multiple menu items, identified by a unique identifier.',
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
