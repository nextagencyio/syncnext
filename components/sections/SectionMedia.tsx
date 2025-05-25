import { resolveContentfulImage } from '@/utils/contentful'
import { MediaEntry, ContentfulImage } from '@/lib/contentful-types'
import Image from 'next/image'

interface SectionMediaProps {
  section: MediaEntry
  modifier?: string
}

export default function SectionMedia({ section, modifier }: SectionMediaProps) {
  const fields = section.fields
  const { title, media } = fields

  const resolvedMedia = resolveContentfulImage(media as ContentfulImage)

  if (!resolvedMedia) {
    return null
  }

  return (
    <div className={modifier ?? 'container mx-auto my-6 lg:my-15'}>
      {title && (
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-bold">{title as string}</h2>
        </div>
      )}
      <div className="flex justify-center">
        <Image
          src={resolvedMedia.url}
          alt={resolvedMedia.alt}
          width={resolvedMedia.width}
          height={resolvedMedia.height}
          className="max-w-full h-auto rounded-lg shadow-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
        />
      </div>
    </div>
  )
}
