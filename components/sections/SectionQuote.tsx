import { resolveContentfulImage } from '@/utils/contentful'
import { QuoteEntry, ContentfulImage } from '@/lib/contentful-types'
import Image from 'next/image'

interface SectionQuoteProps {
  section: QuoteEntry
  modifier?: string
}

export default function SectionQuote({ section, modifier }: SectionQuoteProps) {
  const { author, jobTitle, logo, quote, thumb } = section.fields

  const logoImage = logo ? resolveContentfulImage(logo as ContentfulImage) : null
  const thumbImage = thumb ? resolveContentfulImage(thumb as ContentfulImage) : null

  return (
    <div className={modifier ?? 'container mx-auto my-6 lg:my-15'}>
      <div className="max-w-4xl mx-auto text-center">
        <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-900 mb-8">
          &ldquo;{quote}&rdquo;
        </blockquote>

        <div className="flex items-center justify-center gap-4">
          {thumbImage && (
            <Image
              src={thumbImage.url}
              alt={thumbImage.alt}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="text-left">
            <div className="font-semibold text-lg text-gray-900">
              {author}
            </div>
            {jobTitle && (
              <div className="text-gray-600">
                {jobTitle}
              </div>
            )}
          </div>
          {logoImage && (
            <Image
              src={logoImage.url}
              alt={logoImage.alt}
              width={100}
              height={40}
              className="h-10 w-auto ml-4"
            />
          )}
        </div>
      </div>
    </div>
  )
}
