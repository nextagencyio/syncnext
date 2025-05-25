import RecentCards from '@/components/recent-cards/RecentCards';
import { getImage } from '@/components/helpers/Utilities';
import { Entry } from 'contentful';

interface SectionRecentPostsProps {
  section: Entry<any>;
  modifier?: string;
}

export default function SectionRecentPosts({ section, modifier }: SectionRecentPostsProps) {
  const articles = (section.fields.articles as Entry<any>[]) || [];

  const recentCardResults = articles.map((article: Entry<any>) => {
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

    return {
      id: article.sys.id,
      path: `/articles/${article.fields.slug}`,
      title: article.fields.title as string,
      summary: excerpt,
      media: mediaElement,
      metadata: {
        date: new Date().toLocaleDateString(),
        tags: [],
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

// GraphQL fragment for recent posts sections
export const recentPostsSectionFragment = `
  fragment RecentPostsSection on LandingSection {
    type
    title
    recentPosts {
      databaseId
      title
      slug
      excerpt
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
    }
  }
`;
