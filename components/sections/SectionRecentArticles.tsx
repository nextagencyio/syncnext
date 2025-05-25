import RecentCards from '@/components/recent-cards/RecentCards';
import { getImage } from '@/components/helpers/Utilities';
import { getEntriesByType } from '@/utils/contentful';
import { RecentArticlesEntry, ArticleEntry } from '@/lib/contentful-types';

interface SectionRecentArticlesProps {
  section: RecentArticlesEntry;
  modifier?: string;
}

export default async function SectionRecentArticles({ section, modifier }: SectionRecentArticlesProps) {
  // Dynamically fetch recent articles
  const articles = await getEntriesByType('article');

  // Sort by published date (newest first) and take first 6
  const sortedArticles = articles
    .filter((article: any) => article.fields && article.fields.publishedDate)
    .sort((a: any, b: any) => {
      const dateA = new Date(a.fields.publishedDate as string);
      const dateB = new Date(b.fields.publishedDate as string);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 6);

  const recentCardResults = sortedArticles.map((article: any) => {
    // Extract excerpt from lead rich text field
    const lead = article.fields.lead as any;
    const excerpt = lead?.content?.[0]?.content?.[0]?.value || '';

    const media = article.fields.media as any;
    const mediaElement = media ? getImage(
      {
        url: `https:${media.fields.file.url}`,
        alt: media.fields.title || article.fields.title
      },
      'w-full h-full object-cover',
      ['i169medium', 'i169large']
    ) : null;

    // Format tags as objects with name and slug
    const tags = (article.fields.tags as string[] || []).map(tag => ({
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
    }));

    // Format the published date
    const publishedDate = article.fields.publishedDate as string;
    const formattedDate = publishedDate ? new Date(publishedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : '';

    return {
      id: article.sys.id,
      path: `/articles/${article.fields.slug}`,
      title: article.fields.title as string,
      summary: excerpt,
      media: mediaElement,
      metadata: {
        date: formattedDate,
        tags: tags,
      },
    };
  });

  return (
    <div className="container mx-auto my-6 lg:my-25">
      {section.fields.title && (
        <h2 className="text-3xl font-bold mb-8">{section.fields.title as string}</h2>
      )}
      <RecentCards results={recentCardResults} />
    </div>
  );
}


