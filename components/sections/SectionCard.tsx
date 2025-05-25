import { resolveContentfulImage, resolveRichText } from '@/utils/contentful'
import { CardEntry, ContentfulImage } from '@/lib/contentful-types'
import { CustomCardProps } from '@/components/card-group/CardGroup'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from 'next/link'
import Image from 'next/image'

interface SectionCardProps {
  section: CardEntry
  modifier?: string
}

export default function SectionCard({ section, modifier }: SectionCardProps) {
  const { title, summary, linkTitle, linkUrl, media, tags } = section.fields

  // Convert Contentful data to the format expected by CustomCard
  const resolvedMedia = media ? resolveContentfulImage(media as ContentfulImage) : null

  return (
    <div className={modifier ?? 'container mx-auto my-2 lg:my-25'}>
      <Card className="card h-full flex flex-col">
        {resolvedMedia && (
          <AspectRatio ratio={16 / 9}>
            <Image
              src={resolvedMedia.url}
              alt={resolvedMedia.alt}
              width={resolvedMedia.width}
              height={resolvedMedia.height}
              className="w-full h-full object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </AspectRatio>
        )}
        <CardContent className="flex-grow pt-6">
          {tags && Array.isArray(tags) && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className='badge'>{tag}</Badge>
              ))}
            </div>
          )}
          <CardHeader className="p-0">
            <CardTitle className="card-title text-xl mb-3">
              {title}
            </CardTitle>
          </CardHeader>
          {summary && <p className="text-gray-600">{summary}</p>}
        </CardContent>
        {linkTitle && linkUrl && (
          <CardFooter>
            <Button asChild variant="default" className="w-full md:w-auto">
              <Link href={linkUrl}>
                {linkTitle}
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
