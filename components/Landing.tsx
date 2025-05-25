import Heading from '@/components/heading/Heading'
import { SectionRenderer } from '@/components/sections'
import { LandingPageEntry, SectionEntry } from '@/lib/contentful-types'
import React from 'react'

interface LandingProps {
  landing: LandingPageEntry
  hidePageTitle?: boolean
}

export default function Landing({ landing, hidePageTitle = false }: LandingProps) {
  const { title, sections } = landing.fields

  return (
    <div className="landing-page">
      {!hidePageTitle && title && (
        <Heading level={1} title={title} className="container mb-10" />
      )}
      {sections && Array.isArray(sections) && (
        <>
          {sections.map((section: SectionEntry, index: number) => (
            <React.Fragment key={`section-${section.sys.id}-${index}`}>
              <SectionRenderer section={section} />
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  )
}
