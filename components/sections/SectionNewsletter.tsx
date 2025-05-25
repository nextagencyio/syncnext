import { resolveRichText } from '@/utils/contentful'
import { Entry } from 'contentful'
import Newsletter from '@/components/newsletter/Newsletter'

export interface NewsletterSection {
  type: 'newsletter'
  newsletterTitle: string
  summary: string
}

interface SectionNewsletterProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionNewsletter({ section, modifier }: SectionNewsletterProps) {
  const fields = section.fields
  const { newsletterTitle, summary } = fields

  return (
    <Newsletter
      title={newsletterTitle as string}
      summary={summary ? resolveRichText(summary) : undefined}
      modifier={modifier}
    />
  )
}
