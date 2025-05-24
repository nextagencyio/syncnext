import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import Sidebyside from '@/components/sidebyside/Sidebyside'
import Image from 'next/image'

interface SectionSideBySideProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionSideBySide({ section, modifier }: SectionSideBySideProps) {
  const fields = section.fields
  const { title, leftContent, rightContent, leftMedia, rightMedia, layout } = fields

  // For now, we'll use a simple layout where one side has content and the other has media
  // This can be enhanced to support both left/right content and media

  const resolvedLeftMedia = resolveContentfulImage(leftMedia as ContentfulImage)
  const resolvedRightMedia = resolveContentfulImage(rightMedia as ContentfulImage)

  // Determine which side has media (prioritize left media, fall back to right)
  const mediaElement = resolvedLeftMedia ? (
    <Image
      src={resolvedLeftMedia.url}
      alt={resolvedLeftMedia.alt}
      width={resolvedLeftMedia.width}
      height={resolvedLeftMedia.height}
      className="w-full h-auto rounded-lg"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  ) : resolvedRightMedia ? (
    <Image
      src={resolvedRightMedia.url}
      alt={resolvedRightMedia.alt}
      width={resolvedRightMedia.width}
      height={resolvedRightMedia.height}
      className="w-full h-auto rounded-lg"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  ) : null

  // Use left content as primary content, with right content as summary if available
  const contentTitle = title as string || ''
  const contentSummary = leftContent ? resolveRichText(leftContent) :
    rightContent ? resolveRichText(rightContent) : ''

  if (!mediaElement) {
    // If no media, render as a simple two-column text layout
    return (
      <div className={modifier ?? 'container mx-auto my-6 lg:my-25'}>
        {title && <h2 className="text-3xl font-bold mb-6 text-center">{title as string}</h2>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {leftContent && (
            <div className="prose prose-lg">
              <div dangerouslySetInnerHTML={{ __html: resolveRichText(leftContent) }} />
            </div>
          )}
          {rightContent && (
            <div className="prose prose-lg">
              <div dangerouslySetInnerHTML={{ __html: resolveRichText(rightContent) }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Sidebyside
      title={contentTitle}
      summary={contentSummary}
      media={mediaElement}
      layout={layout as string}
      modifier={modifier}
    />
  )
}
