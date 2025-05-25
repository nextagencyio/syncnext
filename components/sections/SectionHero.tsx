import Hero, { HeroProps } from '@/components/hero/Hero'
import { resolveContentfulImage, resolveRichText } from '@/utils/contentful'
import { HeroEntry, ContentfulImage } from '@/lib/contentful-types'
import { getImage } from '../helpers/Utilities'

interface SectionHeroProps {
  section: HeroEntry
  modifier?: string
}

// Helper function to convert asterisk formatting to strong tags
function formatTitle(title: string): string {
  return title.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
}

export default function SectionHero({ section, modifier }: SectionHeroProps) {
  const { title, heroLayout, linkTitle, linkUrl, link2Title, link2Url, media, summary } = section.fields

  // Convert Contentful data to the format expected by the Hero component
  const resolvedMedia = media ? resolveContentfulImage(media as ContentfulImage) : null

  const heroProps: Partial<HeroProps> = {
    heroLayout: heroLayout || undefined,
    media: resolvedMedia ? getImage(
      resolvedMedia,
      'max-w-full h-auto',
      ['heros', 'herol']
    ) : null,
    heading: title ? formatTitle(title) : undefined,
    summary: summary ? resolveRichText(summary) : undefined,
    link: linkTitle && linkUrl ? {
      title: linkTitle,
      url: linkUrl,
    } : undefined,
    link2: link2Title && link2Url ? {
      title: link2Title,
      url: link2Url,
    } : undefined,
  }

  return (
    <Hero
      {...heroProps}
      modifier={modifier}
    />
  )
}
