import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry, Asset } from 'contentful'
import Gallery from '@/components/gallery/Gallery'
import Image from 'next/image'

interface SectionGalleryProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionGallery({ section, modifier }: SectionGalleryProps) {
  const fields = section.fields
  const { title, gallerySummary, mediaItem } = fields

  // Convert Contentful media items to React nodes
  const mediaItems: React.ReactNode[] = []
  const mediaIds: string[] = []

  if (mediaItem && Array.isArray(mediaItem)) {
    (mediaItem as Asset[]).forEach((asset: Asset) => {
      if (asset && asset.fields) {
        const resolvedMedia = resolveContentfulImage(asset as ContentfulImage)
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
      title={title as string}
      summary={resolveRichText(gallerySummary)}
      mediaItems={mediaItems}
      mediaIds={mediaIds}
      containerClassName={modifier}
    />
  )
}
