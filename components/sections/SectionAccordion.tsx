import { resolveRichText } from '@/utils/contentful'
import { AccordionEntry, AccordionItemEntry } from '@/lib/contentful-types'
import Accordion, { AccordionItemData } from '@/components/accordion/Accordion'

interface SectionAccordionProps {
  section: AccordionEntry
  modifier?: string
}

export default function SectionAccordion({ section, modifier }: SectionAccordionProps) {
  const { title, accordionItem } = section.fields

  // Convert Contentful accordion items to AccordionItemData format
  const items: AccordionItemData[] = []

  if (accordionItem && Array.isArray(accordionItem)) {
    accordionItem.forEach((item: AccordionItemEntry) => {
      if (item && item.fields) {
        const { title: itemTitle, body, linkTitle, linkUrl } = item.fields

        items.push({
          id: item.sys.id,
          title: itemTitle,
          body: resolveRichText(body),
          link: linkTitle && linkUrl ? {
            title: linkTitle,
            url: linkUrl,
          } : undefined,
        })
      }
    })
  }

  return (
    <Accordion
      title={title}
      items={items}
      modifier={modifier}
    />
  )
}
