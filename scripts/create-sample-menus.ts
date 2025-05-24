import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config({ path: '.env' })

async function createSampleMenus() {
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

    console.log('Creating sample menu items and menus...')

    // Create main menu items
    const homeMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Home' },
        url: { 'en-US': '/' },
        order: { 'en-US': 1 },
      },
    })
    await homeMenuItem.publish()
    console.log('Home menu item created')

    const featuresMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Features' },
        url: { 'en-US': '/features' },
        order: { 'en-US': 2 },
      },
    })
    await featuresMenuItem.publish()
    console.log('Features menu item created')

    const pricingMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Pricing' },
        url: { 'en-US': '/pricing' },
        order: { 'en-US': 3 },
      },
    })
    await pricingMenuItem.publish()
    console.log('Pricing menu item created')

    const resourcesMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Resources' },
        url: { 'en-US': '/resources' },
        order: { 'en-US': 4 },
      },
    })
    await resourcesMenuItem.publish()
    console.log('Resources menu item created')

    const getStartedMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Get Started' },
        url: { 'en-US': '/get-started' },
        order: { 'en-US': 5 },
      },
    })
    await getStartedMenuItem.publish()
    console.log('Get Started menu item created')

    const contactMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Contact' },
        url: { 'en-US': '/contact' },
        order: { 'en-US': 6 },
      },
    })
    await contactMenuItem.publish()
    console.log('Contact menu item created')

    // Create main menu
    const mainMenu = await environment.createEntry('menu', {
      fields: {
        name: { 'en-US': 'Main Navigation' },
        identifier: { 'en-US': 'main' },
        items: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: homeMenuItem.sys.id } },
            { sys: { type: 'Link', linkType: 'Entry', id: featuresMenuItem.sys.id } },
            { sys: { type: 'Link', linkType: 'Entry', id: pricingMenuItem.sys.id } },
            { sys: { type: 'Link', linkType: 'Entry', id: resourcesMenuItem.sys.id } },
            { sys: { type: 'Link', linkType: 'Entry', id: getStartedMenuItem.sys.id } },
            { sys: { type: 'Link', linkType: 'Entry', id: contactMenuItem.sys.id } },
          ],
        },
      },
    })
    await mainMenu.publish()
    console.log('Main menu created')

    // Create footer menu items
    const privacyMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Privacy Policy' },
        url: { 'en-US': '/privacy-policy' },
        order: { 'en-US': 1 },
      },
    })
    await privacyMenuItem.publish()
    console.log('Privacy Policy menu item created')

    const termsMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Terms of Service' },
        url: { 'en-US': '/terms-of-service' },
        order: { 'en-US': 2 },
      },
    })
    await termsMenuItem.publish()
    console.log('Terms of Service menu item created')

    const footerContactMenuItem = await environment.createEntry('menuItem', {
      fields: {
        title: { 'en-US': 'Contact Us' },
        url: { 'en-US': '/contact' },
        order: { 'en-US': 3 },
      },
    })
    await footerContactMenuItem.publish()
    console.log('Footer Contact menu item created')

    // Create footer menu
    const footerMenu = await environment.createEntry('menu', {
      fields: {
        name: { 'en-US': 'Footer Navigation' },
        identifier: { 'en-US': 'footer' },
        items: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: privacyMenuItem.sys.id } },
            { sys: { type: 'Link', linkType: 'Entry', id: termsMenuItem.sys.id } },
            { sys: { type: 'Link', linkType: 'Entry', id: footerContactMenuItem.sys.id } },
          ],
        },
      },
    })
    await footerMenu.publish()
    console.log('Footer menu created')

    console.log('✅ Sample menus created successfully!')
    console.log('\nCreated:')
    console.log('- Main menu with Home, Features, Pricing, Resources, Get Started, Contact')
    console.log('- Footer menu with Privacy Policy, Terms of Service, Contact Us')
  } catch (error) {
    console.error('Error creating sample menus:', error)
    process.exit(1)
  }
}

createSampleMenus()
