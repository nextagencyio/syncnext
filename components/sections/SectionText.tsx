import Text, { TextProps } from '@/components/text/Text'
import { resolveRichText } from '@/utils/contentful'
import { TextEntry } from '@/lib/contentful-types'

interface SectionTextProps {
  section: TextEntry
  modifier?: string
}

export default function SectionText({ section, modifier }: SectionTextProps) {
  const { title, body, textLayout, eyebrow, linkTitle, linkUrl, link2Title, link2Url } = section.fields

  const textProps: Partial<TextProps> = {
    title: title,
    body: body ? resolveRichText(body) : undefined,
    textLayout: textLayout || undefined,
    eyebrow: eyebrow,
    link: linkTitle && linkUrl ? {
      title: linkTitle,
      url: linkUrl,
    } : undefined,
    link2: link2Title && link2Url ? {
      title: link2Title,
      url: link2Url,
    } : undefined,
  }

  return (
    <Text
      {...textProps}
      modifier={modifier}
    />
  )
}
