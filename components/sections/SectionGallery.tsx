import { resolveContentfulImage, resolveRichText } from '@/utils/contentful'
import { GalleryEntry, ContentfulImage } from '@/lib/contentful-types'
import { Asset } from 'contentful'
import Gallery from '@/components/gallery/Gallery'
import Image from 'next/image'

interface SectionGalleryProps {
  section: GalleryEntry
  modifier?: string
}

export default function SectionGallery({ section, modifier }: SectionGalleryProps) {
  const { title, gallerySummary, mediaItem } = section.fields

  // Convert Contentful media items to React nodes
  const mediaItems: React.ReactNode[] = []
  const mediaIds: string[] = []

  if (mediaItem && Array.isArray(mediaItem)) {
    mediaItem.forEach((asset: ContentfulImage) => {
      if (asset && asset.fields) {
        const resolvedMedia = resolveContentfulImage(asset)
        if (resolvedMedia) {
          mediaItems.push(
            <Image
              key={asset.sys.id}
              src={resolvedMedia.url}
              alt={resolvedMedia.alt}
              width={resolvedMedia.width}
              height={resolvedMedia.height}
              className="w-full h-full object-cover rounded"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )
          mediaIds.push(asset.sys.id)
        }
      }
    })
  }

  return (
    <Gallery
      title={title}
      summary={resolveRichText(gallerySummary)}
      mediaItems={mediaItems}
      mediaIds={mediaIds}
      containerClassName={modifier}
    />
  )
}
