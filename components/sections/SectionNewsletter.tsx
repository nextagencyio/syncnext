import { resolveRichText } from '@/utils/contentful'
import { NewsletterEntry } from '@/lib/contentful-types'
import Newsletter from '@/components/newsletter/Newsletter'

export interface NewsletterSection {
  type: 'newsletter'
  newsletterTitle: string
  summary: string
}

interface SectionNewsletterProps {
  section: NewsletterEntry
  modifier?: string
}

export default function SectionNewsletter({ section, modifier }: SectionNewsletterProps) {
  const { newsletterTitle, summary } = section.fields

  return (
    <Newsletter
      title={newsletterTitle}
      summary={summary ? resolveRichText(summary) : undefined}
      modifier={modifier}
    />
  )
}
