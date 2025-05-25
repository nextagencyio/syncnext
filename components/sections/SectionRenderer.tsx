import { SectionEntry } from '@/lib/contentful-types'
import SectionHero from './SectionHero'
import SectionText from './SectionText'
import SectionCard from './SectionCard'
import SectionCardGroup from './SectionCardGroup'
import SectionGallery from './SectionGallery'
import SectionMedia from './SectionMedia'
import SectionQuote from './SectionQuote'
import SectionEmbed from './SectionEmbed'
import SectionNewsletter from './SectionNewsletter'
import SectionAccordion from './SectionAccordion'
import SectionPricing from './SectionPricing'
import SectionCarousel from './SectionCarousel'
import SectionLogoCollection from './SectionLogoCollection'
import SectionSideBySide from './SectionSideBySide'
import SectionRecentArticles from './SectionRecentArticles'

interface SectionRendererProps {
  section: SectionEntry
  modifier?: string
}

export default function SectionRenderer({ section, modifier }: SectionRendererProps) {
  const contentType = section.sys.contentType.sys.id

  switch (contentType) {
    case 'hero':
      return <SectionHero section={section as any} modifier={modifier} />

    case 'text':
      return <SectionText section={section as any} modifier={modifier} />

    case 'card':
      return <SectionCard section={section as any} modifier={modifier} />

    case 'cardGroup':
      return <SectionCardGroup section={section as any} modifier={modifier} />

    case 'gallery':
      return <SectionGallery section={section as any} modifier={modifier} />

    case 'media':
      return <SectionMedia section={section as any} modifier={modifier} />

    case 'quote':
      return <SectionQuote section={section as any} modifier={modifier} />

    case 'embed':
      return <SectionEmbed section={section as any} modifier={modifier} />

    case 'newsletter':
      return <SectionNewsletter section={section as any} modifier={modifier} />

    case 'accordion':
      return <SectionAccordion section={section as any} modifier={modifier} />

    case 'pricing':
      return <SectionPricing section={section as any} modifier={modifier} />

    case 'carousel':
      return <SectionCarousel section={section as any} modifier={modifier} />

    case 'logoCollection':
      return <SectionLogoCollection section={section as any} modifier={modifier} />

    case 'sideBySide':
      return <SectionSideBySide section={section as any} modifier={modifier} />

    case 'recentArticles':
      return <SectionRecentArticles section={section as any} modifier={modifier} />

    default:
      console.warn(`Unknown section type: ${contentType}`)
      return (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-sm text-red-600">
            Unknown section type: {contentType}
          </p>
        </div>
      )
  }
}
