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

  // Check if we should delete content types (structure) as well
  const deleteStructure = process.argv.includes('--structure')

  const client = createClient({
    accessToken,
  })

  try {
    if (deleteStructure) {
      console.log('Starting Contentful FULL cleanup (content + structure)...')
    }
    else {
      console.log('Starting Contentful content cleanup (preserving structure)...')
    }

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

    // Only delete content types if --structure flag is passed
    if (deleteStructure) {
      console.log('\nDeleting content types...')
      const contentTypes = await environment.getContentTypes()
      for (const contentType of contentTypes.items) {
        if (contentType.isPublished()) {
          await contentType.unpublish()
        }
        await contentType.delete()
      }
      console.log(`Deleted ${contentTypes.items.length} content types`)
    }
    else {
      console.log('\nContent types preserved (use --structure flag to delete them)')
    }

    console.log('\nContentful cleanup completed successfully!')

    if (deleteStructure) {
      console.log('\nTo start fresh:')
      console.log('1. Run: npm run setup-contentful')
      console.log('2. Run: npm run create-landing')
    }
    else {
      console.log('\nTo create new content:')
      console.log('1. Run: npm run create-landing')
    }

  } catch (error) {
    console.error('Error cleaning up Contentful:', error)
    process.exit(1)
  }
}

cleanupContentful()
