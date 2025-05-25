import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import CardGroup, { CustomCardProps } from '@/components/card-group/CardGroup'
import { getImage } from '../helpers/Utilities'

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
          media: resolvedMedia ? getImage(
            resolvedMedia,
            'w-full h-full object-cover',
            ['i169medium', 'i169large']
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
