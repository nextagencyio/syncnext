import { resolveContentfulImage, resolveRichText } from '@/utils/contentful'
import { CardGroupEntry, ContentfulImage } from '@/lib/contentful-types'
import CardGroup, { CustomCardProps, CardGroupProps } from '@/components/card-group/CardGroup'
import { StatCardProps } from '@/components/stat-card/StatCard'
import { transformStatsItem } from './transformers/transformStatsItem'
import { getImage } from '../helpers/Utilities'

interface SectionCardGroupProps {
  section: CardGroupEntry
  modifier?: string
}

export default function SectionCardGroup({ section, modifier }: SectionCardGroupProps) {
  const { title, summary, cards } = section.fields

  // Convert Contentful cards to appropriate format (CustomCardProps or StatCardProps)
  const cardProps: (CustomCardProps | StatCardProps)[] = []

  if (cards && Array.isArray(cards)) {
    cards.forEach((card: any) => {
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
              title: cardTitle,
              url: linkUrl || undefined,
            },
            tags: Array.isArray(tags) ? tags : undefined,
            summaryText: cardSummary,
            link: linkTitle && linkUrl ? {
              title: linkTitle,
              url: linkUrl,
            } : undefined,
          })
        }
      }
    })
  }

  return (
    <CardGroup
      title={title}
      cards={cardProps}
      modifier={modifier}
    />
  )
}
