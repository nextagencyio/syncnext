import Hero, { HeroProps } from '@/components/hero/Hero'
import { resolveContentfulImage, resolveRichText, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import Image from 'next/image'

interface SectionHeroProps {
  section: Entry<any>
  modifier?: string
}

// Helper function to convert asterisk formatting to strong tags
function formatTitle(title: string): string {
  return title.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
}

export default function SectionHero({ section, modifier }: SectionHeroProps) {
  const fields = section.fields
  const { title, heroLayout, linkTitle, linkUrl, link2Title, link2Url, media, summary } = fields

  // Convert Contentful data to the format expected by the Hero component
  const resolvedMedia = resolveContentfulImage(media as ContentfulImage)

  const heroProps: Partial<HeroProps> = {
    heroLayout: (heroLayout as 'image_top' | 'image_bottom' | 'image_bottom_split') || undefined,
    media: resolvedMedia ? (
      <Image
        src={resolvedMedia.url}
        alt={resolvedMedia.alt}
        width={resolvedMedia.width}
        height={resolvedMedia.height}
        className="max-w-full h-auto"
        priority={true}
      />
    ) : null,
    heading: title ? formatTitle(title as string) : undefined,
    summary: summary ? resolveRichText(summary) : undefined,
    link: linkTitle && linkUrl ? {
      title: linkTitle as string,
      url: linkUrl as string,
    } : undefined,
    link2: link2Title && link2Url ? {
      title: link2Title as string,
      url: link2Url as string,
    } : undefined,
  }

  return (
    <Hero
      {...heroProps}
      modifier={modifier}
    />
  )
}
