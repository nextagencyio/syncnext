import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from 'next/link';

interface RecentCardProps {
  id: string;
  path: string;
  title: string;
  summary: string;
  media: ReactNode;
  tags?: string[];
  publishedDate?: string;
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
            <CardHeader>
              <CardTitle className='text-3xl'>
                <Link href={article.path} className="hover:underline">
                  {article.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                {article.summary}
              </p>
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {article.publishedDate && (
                <p className="text-xs text-gray-500">
                  {new Date(article.publishedDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
