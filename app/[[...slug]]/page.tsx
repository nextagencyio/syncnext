import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { getEntryBySlug, getEntriesByType, LandingPageEntry } from '@/utils/contentful'
import Landing from '@/components/Landing'
import PageComponent from '@/components/Page'
import Article from '@/components/Article'

// Enable dynamic rendering for Contentful
export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string[] }>
type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * Generates static parameters for all content types.
 * @returns Promise<{ slug: string[] }[]> Array of slug parameters for static generation.
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  try {
    // Get all content types that have slugs
    const [landingPages, pages, articles] = await Promise.all([
      getEntriesByType('landing'),
      getEntriesByType('page'),
      getEntriesByType('article'),
    ])

    const allPages = [...landingPages, ...pages, ...articles]

    const params = allPages.map((page) => ({
      slug: (page.fields.slug as string).split('/').filter(segment => segment !== ''),
    }))

    // Add empty slug array for homepage (root route)
    params.push({ slug: [] })

    return params
  } catch (error) {
    console.error('Error generating static params:', error)
    // Always include the root route even if there's an error
    return [{ slug: [] }]
  }
}

/**
 * Fetches page data for the current route.
 * @param props Route parameters.
 * @returns Promise containing the page data and its type.
 */
async function getPageData(props: {
  params: Params
  searchParams?: SearchParams
}) {
  const params = await props.params
  const slug = params.slug?.join('/') || 'home'

  try {
    // Try to find the content in different content types
    const [landingPage, page, article] = await Promise.all([
      getEntryBySlug('landing', slug),
      getEntryBySlug('page', slug),
      getEntryBySlug('article', slug),
    ])

    if (landingPage) {
      return { content: landingPage, type: 'landing' }
    }
    if (page) {
      return { content: page, type: 'page' }
    }
    if (article) {
      return { content: article, type: 'article' }
    }

    return null
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
  const pageData = await getPageData({ params: props.params })

  return {
    title: (pageData?.content.fields.title as string) || 'Page Not Found',
  }
}

/**
 * Main page component that renders Contentful content.
 * @param props Object containing route parameters.
 * @returns React component for the page.
 */
export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const pageData = await getPageData({ params: props.params })

  if (!pageData) {
    notFound()
  }

  const { content, type } = pageData

  // Get the current slug to determine if this is the homepage
  const params = await props.params
  const slug = params.slug?.join('/') || 'home'

  // Render the appropriate component based on content type
  switch (type) {
    case 'landing':
      return (
        <main data-post-id={content.sys.id} data-post-type="landing">
          <Landing landing={content} hidePageTitle={true} />
        </main>
      )

    case 'page':
      return <PageComponent page={content} />

    case 'article':
      return <Article article={content} />

    default:
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Unknown Content Type</h2>
          <p className="text-gray-600">
            Content type &ldquo;{type}&rdquo; is not supported.
          </p>
        </div>
      )
  }
}
