import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import Heading from '@/components/heading/Heading'
import Image from 'next/image'

interface ArticleProps {
  article: Entry<any>
}

export default function Article({ article }: ArticleProps) {
  const fields = article.fields
  const { title, subhead, lead, media, body, tags, publishedDate } = fields

  const resolvedMedia = resolveContentfulImage(media as ContentfulImage)
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
          {subhead && (
            <div className="uppercase mb-2 text-sm tracking-wide text-gray-600">
              {subhead as string}
            </div>
          )}
          <Heading level={1} title={title as string} className="mb-4" />

          {/* Tags and Date */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-4 border-b border-gray-200">
            {tags && Array.isArray(tags) && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(tags as string[]).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {publishedDate && (
              <time className="text-sm text-gray-500">
                Published {new Date(publishedDate as string).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            )}
          </div>

          {leadProcessed && (
            <div
              className="prose prose-lg lead mb-6 text-xl text-gray-700"
              dangerouslySetInnerHTML={{ __html: leadProcessed }}
            />
          )}
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
