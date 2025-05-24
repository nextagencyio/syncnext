import { resolveRichText } from '@/utils/contentful'
import { Entry } from 'contentful'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SectionNewsletterProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionNewsletter({ section, modifier }: SectionNewsletterProps) {
  const fields = section.fields
  const { newsletterTitle, summary } = fields

  return (
    <div className={modifier ?? 'container mx-auto my-6 lg:my-15'}>
      <div className="max-w-2xl mx-auto text-center">
        {newsletterTitle && (
          <h2 className="text-3xl font-bold mb-4">{newsletterTitle as string}</h2>
        )}
        {summary && (
          <div className="text-lg text-gray-600 mb-6">
            <div dangerouslySetInnerHTML={{ __html: resolveRichText(summary) }} />
          </div>
        )}
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1"
            required
          />
          <Button type="submit" className="whitespace-nowrap">
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  )
}
