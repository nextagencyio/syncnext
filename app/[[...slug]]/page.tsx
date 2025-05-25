import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { getEntryBySlug, getEntriesByType } from '@/utils/contentful'
import { getContentTypeForSlug, extractArticleSlug, getContentTypePriority } from '@/utils/content-routing'
import { LandingPageEntry, PageEntry, ArticleEntry } from '@/lib/contentful-types'
import Landing from '@/components/Landing'
import PageComponent from '@/components/Page'
import Article from '@/components/Article'

// Enable dynamic rendering for Contentful
export const dynamic = 'force-dynamic'

// Add ISR support for better performance
export const revalidate = 300 // Revalidate every 5 minutes

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

    const params: { slug: string[] }[] = []

    // Add landing pages and regular pages
    const regularPages = [...landingPages, ...pages]
    regularPages.forEach((page) => {
      params.push({
        slug: (page.fields.slug as string).split('/').filter(segment => segment !== ''),
      })
    })

    // Add articles with 'articles/' prefix
    articles.forEach((article) => {
      params.push({
        slug: ['articles', article.fields.slug as string],
      })
    })

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
    // Check if this is an article URL and extract the article slug
    const articleSlug = extractArticleSlug(slug)
    if (articleSlug) {
      const article = await getEntryBySlug('article', articleSlug)
      if (article) {
        return { content: article, type: 'article' }
      }
      return null
    }

    // Determine the most likely content type for this slug
    const expectedContentType = await getContentTypeForSlug(slug)

    if (expectedContentType) {
      // We know what content type this should be, so check it directly
      const content = await getEntryBySlug(expectedContentType, slug)
      if (content) {
        return { content, type: expectedContentType }
      }
    } else {
      // Unknown slug - try content types in priority order
      const contentTypePriority = getContentTypePriority()

      for (const contentType of contentTypePriority) {
        const content = await getEntryBySlug(contentType, slug)
        if (content) {
          return { content, type: contentType }
        }
      }
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
          <Landing landing={content as LandingPageEntry} hidePageTitle={true} />
        </main>
      )

    case 'page':
      return <PageComponent page={content as PageEntry} />

    case 'article':
      return <Article article={content as ArticleEntry} />

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
