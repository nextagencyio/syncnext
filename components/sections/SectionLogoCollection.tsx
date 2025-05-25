import { resolveContentfulImage } from '@/utils/contentful'
import { LogoCollectionEntry, ContentfulImage } from '@/lib/contentful-types'
import LogoCollection, { Logo } from '@/components/logo-collection/LogoCollection'
import { getImage } from '../helpers/Utilities'

interface SectionLogoCollectionProps {
  section: LogoCollectionEntry
  modifier?: string
}

export default function SectionLogoCollection({ section, modifier }: SectionLogoCollectionProps) {
  const { title, logos } = section.fields

  // Convert Contentful logos to Logo format
  const logoData: Logo[] = []

  if (logos && Array.isArray(logos)) {
    logos.forEach((asset: ContentfulImage, index: number) => {
      if (asset && asset.fields) {
        const resolvedMedia = resolveContentfulImage(asset)
        if (resolvedMedia) {
          logoData.push({
            name: `${resolvedMedia.title || 'Logo'} ${index + 1}`,
            media: getImage(
              resolvedMedia,
              "max-w-[100px] md:max-w-[120px] h-auto",
              ["thumbnail", "thumbnail"]
            ),
          })
        }
      }
    })
  }

  return (
    <div className={modifier}>
      <LogoCollection
        title={title || ''}
        logos={logoData}
      />
    </div>
  )
}
