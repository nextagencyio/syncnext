import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import CardGroup, { CustomCardProps, CardGroupProps } from '@/components/card-group/CardGroup'
import { StatCardProps } from '@/components/stat-card/StatCard'
import { transformStatsItem } from './transformers/transformStatsItem'
import { getImage } from '../helpers/Utilities'

interface SectionCardGroupProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionCardGroup({ section, modifier }: SectionCardGroupProps) {
  const fields = section.fields
  const { title, summary, cards } = fields

  // Convert Contentful cards to appropriate format (CustomCardProps or StatCardProps)
  const cardProps: (CustomCardProps | StatCardProps)[] = []

  if (cards && Array.isArray(cards)) {
    (cards as Entry<any>[]).forEach((card: Entry<any>) => {
      if (card && card.fields && card.sys?.contentType?.sys?.id) {
        const contentType = card.sys.contentType.sys.id

        if (contentType === 'statsItem') {
          // Transform statsItem to StatCardProps
          const statCard = transformStatsItem(card)
          cardProps.push({
            ...statCard,
            border: false,
          })
        }
        else if (contentType === 'card') {
          // Transform card to CustomCardProps
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
