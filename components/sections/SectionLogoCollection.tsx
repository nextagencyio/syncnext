import { resolveContentfulImage, ContentfulImage } from '@/utils/contentful'
import { Entry, Asset } from 'contentful'
import LogoCollection, { Logo } from '@/components/logo-collection/LogoCollection'
import { getImage } from '../helpers/Utilities'

interface SectionLogoCollectionProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionLogoCollection({ section, modifier }: SectionLogoCollectionProps) {
  const fields = section.fields
  const { title, logos } = fields

  // Convert Contentful logos to Logo format
  const logoData: Logo[] = []

  if (logos && Array.isArray(logos)) {
    (logos as Asset[]).forEach((asset: Asset, index: number) => {
      if (asset && asset.fields) {
        const resolvedMedia = resolveContentfulImage(asset as ContentfulImage)
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
        title={title as string}
        logos={logoData}
      />
    </div>
  )
}
