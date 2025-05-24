import { createClient } from 'contentful-management'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config({ path: '.env' })

async function cleanupContentful() {
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
    console.log('Starting Contentful cleanup...')
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Delete all entries
    console.log('\nDeleting entries...')
    const entries = await environment.getEntries()
    for (const entry of entries.items) {
      if (entry.isPublished()) {
        await entry.unpublish()
      }
      await entry.delete()
    }
    console.log(`Deleted ${entries.items.length} entries`)

    // Delete all assets
    console.log('\nDeleting assets...')
    const assets = await environment.getAssets()
    for (const asset of assets.items) {
      if (asset.isPublished()) {
        await asset.unpublish()
      }
      await asset.delete()
    }
    console.log(`Deleted ${assets.items.length} assets`)

    // Delete all content types
    console.log('\nDeleting content types...')
    const contentTypes = await environment.getContentTypes()
    for (const contentType of contentTypes.items) {
      if (contentType.isPublished()) {
        await contentType.unpublish()
      }
      await contentType.delete()
    }
    console.log(`Deleted ${contentTypes.items.length} content types`)

    console.log('\nContentful cleanup completed successfully!')
    console.log('\nTo start fresh:')
    console.log('1. Run: npm run setup-contentful')
    console.log('2. Run: npm run create-landing')

  } catch (error) {
    console.error('Error cleaning up Contentful:', error)
    process.exit(1)
  }
}

cleanupContentful()
