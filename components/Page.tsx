import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import Heading from '@/components/heading/Heading'
import Image from 'next/image'

interface PageProps {
  page: Entry<any>
}

export default function Page({ page }: PageProps) {
  const fields = page.fields
  const { title, mediaPage, body } = fields

  const resolvedMedia = resolveContentfulImage(mediaPage as ContentfulImage)
  const bodyProcessed = body ? resolveRichText(body) : null

  return (
    <article className="mb-8">
      <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
        {resolvedMedia && (
          <div className="relative aspect-[16/9] mb-6">
            <Image
              src={resolvedMedia.url}
              alt={resolvedMedia.alt}
              width={resolvedMedia.width}
              height={resolvedMedia.height}
              className="w-full h-full object-cover rounded-lg"
              priority={true}
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        )}
        <div className="mx-auto max-w-2xl">
          <Heading level={1} title={title as string} className="mb-8" />
          {bodyProcessed && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: bodyProcessed }}
            />
          )}
        </div>
      </div>
    </article>
  )
}
