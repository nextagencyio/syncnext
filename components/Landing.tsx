import { Entry } from 'contentful'
import Heading from '@/components/heading/Heading'
import { SectionRenderer } from '@/components/sections'
import React from 'react'

interface LandingProps {
  landing: Entry<any>
  hidePageTitle?: boolean
}

export default function Landing({ landing, hidePageTitle = false }: LandingProps) {
  const fields = landing.fields
  const { title, sections } = fields

  return (
    <div className="landing-page">
      {!hidePageTitle && title && (
        <Heading level={1} title={title as string} className="container mb-10" />
      )}
      {sections && Array.isArray(sections) && (
        <>
          {(sections as Entry<any>[]).map((section: Entry<any>, index: number) => (
            <React.Fragment key={`section-${section.sys.id}-${index}`}>
              <SectionRenderer section={section} />
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  )
}
