import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { getEntryBySlug, getEntriesByType, LandingPageEntry } from '@/utils/contentful'
import SectionRenderer from '@/components/sections/SectionRenderer'

// Enable dynamic rendering for Contentful
export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string[] }>
type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * Generates static parameters for all landing pages.
 * @returns Promise<{ slug: string[] }[]> Array of slug parameters for static generation.
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  try {
    const landingPages = await getEntriesByType('landing')

    return landingPages.map((page) => ({
      slug: (page.fields.slug as string).split('/').filter(segment => segment !== ''),
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

/**
 * Fetches page data for the current route.
 * @param props Route parameters.
 * @returns Promise containing the page data.
 */
async function getPageData(props: {
  params: Params
  searchParams?: SearchParams
}) {
  const params = await props.params
  const slug = params.slug?.join('/') || 'home'

  try {
    const landingPage = await getEntryBySlug('landing', slug) as LandingPageEntry

    if (!landingPage) {
      return null
    }

    return landingPage
  } catch (error) {
    console.error('Error fetching page data:', error)
    return null
  }
}

/**
 * Generates metadata for the current page.
 * @param props Route parameters.
 * @param parent Parent metadata.
 * @returns Promise<Metadata> Page metadata.
 */
export async function generateMetadata(
  props: { params: Params; searchParams: SearchParams },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const landingPage = await getPageData({ params: props.params })

  return {
    title: landingPage?.fields.title || 'Page Not Found',
  }
}

/**
 * Main page component that renders Contentful landing pages.
 * @param props Object containing route parameters.
 * @returns React component for the landing page.
 */
export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const landingPage = await getPageData({ params: props.params })

  if (!landingPage) {
    notFound()
  }

  const { title, sections } = landingPage.fields

  return (
    <div className="landing-page">
      {/* Optional: Add page title if needed
      <h1 className="sr-only">{title}</h1>
      */}

      {sections && sections.length > 0 ? (
        sections.map((section, index) => (
          <SectionRenderer
            key={section.sys.id}
            section={section}
            modifier={`section-${index}`}
          />
        ))
      ) : (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Content Available</h2>
          <p className="text-gray-600">
            This page does not have any sections configured.
          </p>
        </div>
      )}
    </div>
  )
}
