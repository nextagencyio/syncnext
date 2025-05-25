import { resolveRichText } from '@/utils/contentful'
import { PricingEntry, PricingCardEntry } from '@/lib/contentful-types'
import Pricing, { PricingCardProps } from '@/components/pricing/Pricing'

interface SectionPricingProps {
  section: PricingEntry
  modifier?: string
}

export default function SectionPricing({ section, modifier }: SectionPricingProps) {
  const { eyebrow, pricingTitle, pricingSummary, pricingCards } = section.fields

  // Convert Contentful pricing cards to PricingCardProps format
  const cards: PricingCardProps[] = []

  if (pricingCards && Array.isArray(pricingCards)) {
    pricingCards.forEach((card: PricingCardEntry) => {
      if (card && card.fields) {
        const { title, eyebrow: cardEyebrow, featuresText, linkTitle, linkUrl, suffix } = card.fields

        // Convert features text to array (assuming it's newline-separated)
        const features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : []

        cards.push({
          eyebrow: cardEyebrow || '',
          title: title || '',
          monthlyLabel: suffix || '',
          features,
          ctaText: linkTitle || 'Get Started',
          ctaLink: linkUrl || '#',
        })
      }
    })
  }

  return (
    <Pricing
      eyebrow={eyebrow}
      title={pricingTitle}
      summary={resolveRichText(pricingSummary)}
      cards={cards}
      modifier={modifier}
    />
  )
}
