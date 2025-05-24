import { Entry } from 'contentful'

interface SectionEmbedProps {
  section: Entry<any>
  modifier?: string
}

export default function SectionEmbed({ section, modifier }: SectionEmbedProps) {
  const fields = section.fields
  const { title, script } = fields

  return (
    <div className={modifier ?? 'container mx-auto my-6 lg:my-15'}>
      {title && (
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-bold">{title as string}</h2>
        </div>
      )}
      <div
        className="embed-content"
        dangerouslySetInnerHTML={{ __html: script as string }}
      />
    </div>
  )
}
