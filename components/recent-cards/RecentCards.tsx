import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

interface RecentCardProps {
  id: string;
  path: string;
  title: string;
  summary: string;
  media: ReactNode;
  metadata?: {
    date: string;
    tags: Array<{
      name: string;
      slug: string;
    }>;
  };
}

interface RecentCardsProps {
  results: RecentCardProps[];
}

export default function RecentCards({ results }: RecentCardsProps) {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {results.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <Link href={article.path}>
              <AspectRatio ratio={16 / 9}>
                {article.media}
              </AspectRatio>
            </Link>
            <CardHeader className="space-y-4">
              {article.metadata?.date && (
                <time className="text-sm text-muted-foreground">
                  {article.metadata.date}
                </time>
              )}
              <CardTitle className='text-3xl'>
                <Link href={article.path} className="hover:underline">
                  {article.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: article.summary }}
              />
              {article.metadata?.tags && article.metadata.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {article.metadata.tags.map((tag) => (
                    <Badge
                      key={tag.slug}
                      variant="secondary"
                      className="font-normal hover:bg-secondary/80"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
