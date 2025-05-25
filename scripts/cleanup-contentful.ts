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

    // Delete all entries with pagination
    console.log('\nDeleting entries...')
    let totalEntriesDeleted = 0
    let hasMoreEntries = true

    while (hasMoreEntries) {
      const entries = await environment.getEntries({ limit: 100 })

      if (entries.items.length === 0) {
        hasMoreEntries = false
        break
      }

      for (const entry of entries.items) {
        try {
          if (entry.isPublished()) {
            await entry.unpublish()
          }
          await entry.delete()
          totalEntriesDeleted++
        } catch (error) {
          console.warn(`Failed to delete entry ${entry.sys.id}:`, error)
        }
      }

      console.log(`Deleted ${entries.items.length} entries (total: ${totalEntriesDeleted})`)

      // Small delay to allow Contentful to process deletions
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`Total entries deleted: ${totalEntriesDeleted}`)

    // Delete all assets with pagination
    console.log('\nDeleting assets...')
    let totalAssetsDeleted = 0
    let hasMoreAssets = true

    while (hasMoreAssets) {
      const assets = await environment.getAssets({ limit: 100 })

      if (assets.items.length === 0) {
        hasMoreAssets = false
        break
      }

      for (const asset of assets.items) {
        try {
          if (asset.isPublished()) {
            await asset.unpublish()
          }
          await asset.delete()
          totalAssetsDeleted++
        } catch (error) {
          console.warn(`Failed to delete asset ${asset.sys.id}:`, error)
        }
      }

      console.log(`Deleted ${assets.items.length} assets (total: ${totalAssetsDeleted})`)

      // Small delay to allow Contentful to process deletions
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`Total assets deleted: ${totalAssetsDeleted}`)

    // Only delete content types if --structure flag is passed
    if (deleteStructure) {
      console.log('\nWaiting for deletions to propagate...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      console.log('\nDeleting content types...')
      let totalContentTypesDeleted = 0
      let hasMoreContentTypes = true

      while (hasMoreContentTypes) {
        const contentTypes = await environment.getContentTypes({ limit: 100 })

        if (contentTypes.items.length === 0) {
          hasMoreContentTypes = false
          break
        }

        for (const contentType of contentTypes.items) {
          try {
            if (contentType.isPublished()) {
              await contentType.unpublish()
            }
            await contentType.delete()
            totalContentTypesDeleted++
          } catch (error) {
            console.warn(`Failed to delete content type ${contentType.sys.id}:`, error)
          }
        }

        console.log(`Deleted ${contentTypes.items.length} content types (total: ${totalContentTypesDeleted})`)

        // Small delay to allow Contentful to process deletions
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`Total content types deleted: ${totalContentTypesDeleted}`)
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
