import { resolveContentfulImage, resolveRichText } from '@/utils/contentful'
import { SideBySideEntry, ContentfulImage } from '@/lib/contentful-types'
import Sidebyside, { BulletProps } from '@/components/sidebyside/Sidebyside'
import { StatCardProps } from '@/components/stat-card/StatCard'
import { LinkFormat } from '@/lib/types'
import { transformStatsItem, transformBullet, type StatsItemType, type BulletType } from './transformers'
import { getImage } from '../helpers/Utilities'

interface SectionSideBySideProps {
  section: SideBySideEntry
  modifier?: string
}

interface StatFeature extends StatCardProps {
  type: 'stat'
}

type Feature = BulletProps | StatFeature
type SectionFeature = StatsItemType | BulletType

export default function SectionSideBySide({ section, modifier }: SectionSideBySideProps) {
  const { eyebrow, title, summary, linkTitle, linkUrl, media, features, layout } = section.fields

  // Resolve media
  const resolvedMedia = resolveContentfulImage(media as ContentfulImage)
  const mediaElement = resolvedMedia ? getImage(
    resolvedMedia,
    'w-full h-auto rounded-lg',
    ['i43medium', 'i43medium']
  ) : null;

  // Build link object
  const link: LinkFormat | undefined = linkTitle && linkUrl ? {
    url: linkUrl,
    title: linkTitle,
  } : undefined

  // Transform features
  const featureItems: Feature[] = []

  if (features && Array.isArray(features)) {
    features.forEach((feature: any) => {
      if (feature && feature.fields && feature.sys?.contentType?.sys?.id) {
        const contentType = feature.sys.contentType.sys.id

        if (contentType === 'statsItem') {
          const statCard = transformStatsItem(feature)
          featureItems.push({
            ...statCard,
            border: false,
            layout: 'left',
          } as StatFeature)
        }
        else if (contentType === 'bullet') {
          featureItems.push(transformBullet(feature))
        }
      }
    })
  }

  return (
    <Sidebyside
      eyebrow={eyebrow ?? ''}
      layout={layout}
      title={title ?? ''}
      summary={summary ? resolveRichText(summary) : ''}
      link={link}
      media={mediaElement}
      modifier={modifier}
      features={featureItems}
    />
  )
}
