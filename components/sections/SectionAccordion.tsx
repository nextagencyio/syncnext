import { resolveRichText } from '@/utils/contentful'
import { Entry } from 'contentful'
import Accordion, { AccordionItemData } from '@/components/accordion/Accordion'

interface SectionAccordionProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionAccordion({ section, modifier }: SectionAccordionProps) {
  const fields = section.fields
  const { title, accordionItem } = fields

  // Convert Contentful accordion items to AccordionItemData format
  const items: AccordionItemData[] = []

  if (accordionItem && Array.isArray(accordionItem)) {
    (accordionItem as Entry<any>[]).forEach((item: Entry<any>) => {
      if (item && item.fields) {
        const { title: itemTitle, body, linkTitle, linkUrl } = item.fields

        items.push({
          id: item.sys.id,
          title: itemTitle as string,
          body: {
            value: resolveRichText(body)
          },
          link: linkTitle && linkUrl ? {
            title: linkTitle as string,
            url: linkUrl as string,
          } : undefined,
        })
      }
    })
  }

  return (
    <Accordion
      title={title as string}
      items={items}
      modifier={modifier}
    />
  )
}
