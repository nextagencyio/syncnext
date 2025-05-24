import { Entry } from 'contentful'
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

interface SectionRendererProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionRenderer({ section, modifier }: SectionRendererProps) {
  const contentType = section.sys.contentType.sys.id

  switch (contentType) {
    case 'hero':
      return <SectionHero section={section} modifier={modifier} />

    case 'text':
      return <SectionText section={section} modifier={modifier} />

    case 'card':
      return <SectionCard section={section} modifier={modifier} />

    case 'cardGroup':
      return <SectionCardGroup section={section} modifier={modifier} />

    case 'gallery':
      return <SectionGallery section={section} modifier={modifier} />

    case 'media':
      return <SectionMedia section={section} modifier={modifier} />

    case 'quote':
      return <SectionQuote section={section} modifier={modifier} />

    case 'embed':
      return <SectionEmbed section={section} modifier={modifier} />

    case 'newsletter':
      return <SectionNewsletter section={section} modifier={modifier} />

    case 'accordion':
      return <SectionAccordion section={section} modifier={modifier} />

    case 'pricing':
      return <SectionPricing section={section} modifier={modifier} />

    case 'carousel':
      return <SectionCarousel section={section} modifier={modifier} />

    case 'logoCollection':
      return <SectionLogoCollection section={section} modifier={modifier} />

    case 'sideBySide':
      return <SectionSideBySide section={section} modifier={modifier} />

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
