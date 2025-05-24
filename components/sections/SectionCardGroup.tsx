import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import CardGroup, { CustomCardProps } from '@/components/card-group/CardGroup'
import Image from 'next/image'

interface SectionCardGroupProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionCardGroup({ section, modifier }: SectionCardGroupProps) {
  const fields = section.fields
  const { title, summary, cards } = fields

  // Convert Contentful cards to CustomCardProps format
  const cardProps: CustomCardProps[] = []

  if (cards && Array.isArray(cards)) {
    (cards as Entry<any>[]).forEach((card: Entry<any>) => {
      if (card && card.fields) {
        const { title: cardTitle, summary: cardSummary, linkTitle, linkUrl, media, tags } = card.fields
        const resolvedMedia = resolveContentfulImage(media as ContentfulImage)

        cardProps.push({
          type: 'custom',
          media: resolvedMedia ? (
            <Image
              src={resolvedMedia.url}
              alt={resolvedMedia.alt}
              width={resolvedMedia.width}
              height={resolvedMedia.height}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : undefined,
          heading: {
            title: cardTitle as string,
            url: linkUrl as string || undefined,
          },
          tags: Array.isArray(tags) ? tags as string[] : undefined,
          summaryText: cardSummary as string,
          link: linkTitle && linkUrl ? {
            title: linkTitle as string,
            url: linkUrl as string,
          } : undefined,
        })
      }
    })
  }

  return (
    <CardGroup
      title={title as string}
      cards={cardProps}
      modifier={modifier}
    />
  )
}
