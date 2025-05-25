import { resolveContentfulImage, resolveRichText } from '@/utils/contentful'
import { ArticleEntry, ContentfulImage } from '@/lib/contentful-types'
import Image from 'next/image'

interface ArticleProps {
  article: ArticleEntry
}

export default function Article({ article }: ArticleProps) {
  const { title, lead, media, body, tags } = article.fields

  const resolvedMedia = media ? resolveContentfulImage(media as ContentfulImage) : null
  const leadProcessed = lead ? resolveRichText(lead) : null
  const bodyProcessed = body ? resolveRichText(body) : null

  return (
    <article className="mb-8" data-post-id={article.sys.id}>
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
          {tags && Array.isArray(tags) && tags.length > 0 && (
            <div className="uppercase mb-2 text-sm tracking-wide">
              {tags.join(', ')}
            </div>
          )}
          <h1 className="text-4xl font-bold mb-8">{title}</h1>
          {leadProcessed && (
            <div
              className="prose prose-lg lead mb-4"
              dangerouslySetInnerHTML={{ __html: leadProcessed }}
            />
          )}
          {bodyProcessed && (
            <div
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: bodyProcessed }}
            />
          )}
        </div>
      </div>
    </article>
  )
}
