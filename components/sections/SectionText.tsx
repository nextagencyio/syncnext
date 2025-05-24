import Text, { TextProps } from '@/components/text/Text'
import { resolveRichText } from '@/utils/contentful'
import { Entry } from 'contentful'

interface SectionTextProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionText({ section, modifier }: SectionTextProps) {
  const fields = section.fields
  const { title, body, textLayout, eyebrow, linkTitle, linkUrl, link2Title, link2Url } = fields

  const textProps: Partial<TextProps> = {
    title: title as string,
    body: body ? resolveRichText(body) : undefined,
    textLayout: (textLayout as 'default' | 'centered' | 'buttons-right') || undefined,
    eyebrow: eyebrow as string,
    link: linkTitle && linkUrl ? {
      title: linkTitle as string,
      url: linkUrl as string,
    } : undefined,
    link2: link2Title && link2Url ? {
      title: link2Title as string,
      url: link2Url as string,
    } : undefined,
  }

  return (
    <Text
      {...textProps}
      modifier={modifier}
    />
  )
}
