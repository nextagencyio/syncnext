import { resolveRichText } from '@/utils/contentful'
import { Entry } from 'contentful'
import Pricing, { PricingCardProps } from '@/components/pricing/Pricing'

interface SectionPricingProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionPricing({ section, modifier }: SectionPricingProps) {
  const fields = section.fields
  const { eyebrow, pricingTitle, pricingSummary, pricingCards } = fields

  // Convert Contentful pricing cards to PricingCardProps format
  const cards: PricingCardProps[] = []

  if (pricingCards && Array.isArray(pricingCards)) {
    (pricingCards as Entry<any>[]).forEach((card: Entry<any>) => {
      if (card && card.fields) {
        const { title, eyebrow: cardEyebrow, featuresText, linkTitle, linkUrl, suffix } = card.fields

        // Convert features text to array (assuming it's newline-separated)
        const features = featuresText ? (featuresText as string).split('\n').filter(f => f.trim()) : []

        cards.push({
          eyebrow: cardEyebrow as string || '',
          title: title as string,
          monthlyLabel: suffix as string || '',
          features,
          ctaText: linkTitle as string || 'Get Started',
          ctaLink: linkUrl as string || '#',
        })
      }
    })
  }

  return (
    <Pricing
      eyebrow={eyebrow as string}
      title={pricingTitle as string}
      summary={resolveRichText(pricingSummary)}
      cards={cards}
      modifier={modifier}
    />
  )
}
