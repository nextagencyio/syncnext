import { resolveContentfulImage } from '@/utils/contentful'
import { CarouselEntry, CarouselItemEntry, ContentfulImage } from '@/lib/contentful-types'
import Carousel, { CarouselItemData } from '@/components/carousel/Carousel'
import Image from 'next/image'

interface SectionCarouselProps {
  section: CarouselEntry
  modifier?: string
}

export default function SectionCarousel({ section, modifier }: SectionCarouselProps) {
  const { title, carouselItem } = section.fields

  // Convert Contentful carousel items to CarouselItemData format
  const items: CarouselItemData[] = []

  if (carouselItem && Array.isArray(carouselItem)) {
    carouselItem.forEach((item: CarouselItemEntry) => {
      if (item && item.fields) {
        const { title: itemTitle, summary, media } = item.fields
        const resolvedMedia = resolveContentfulImage(media as ContentfulImage)

        items.push({
          id: item.sys.id,
          title: itemTitle,
          summary: summary,
          media: resolvedMedia ? (
            <Image
              src={resolvedMedia.url}
              alt={resolvedMedia.alt}
              width={resolvedMedia.width}
              height={resolvedMedia.height}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : undefined,
        })
      }
    })
  }

  return (
    <div>
      {title && (
        <div className="container mx-auto mb-6 text-center">
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
      )}
      <Carousel
        items={items}
        containerClassName={modifier}
      />
    </div>
  )
}
