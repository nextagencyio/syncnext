import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import StatCard, { StatCardProps } from '../stat-card/StatCard';
import { LinkFormat } from '@/lib/types';

export interface CardGroupProps {
  title?: string;
  cards: (StatCardProps | CustomCardProps)[];
  modifier?: string;
}

export interface CustomCardProps {
  type: 'custom';
  media?: React.ReactNode;
  mediaLink?: string;
  heading: LinkFormat;
  tags?: string[];
  summaryText?: string;
  link?: LinkFormat;
}

export default function CardGroup({ title, cards, modifier }: CardGroupProps) {
  const gridCols = cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={modifier ?? 'container mx-auto my-2 lg:my-25'}>
      <div className="space-y-6">
        {title && (
          <h2 className="text-3xl font-bold text-center mb-6 md:mb-8 w-full md:w-4/5 lg:w-3/5 mx-auto">{title}</h2>
        )}
        <div className={`grid grid-cols-1 ${gridCols} lg:gap-6`}>
          {cards.map((card, index) => (
            <div key={index} className="mb-4">
              {card.type === 'stat' ? (
                <StatCard {...card} border={false} />
              ) : (
                <CustomCard {...card} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CustomCard = ({ media, mediaLink, heading, tags = [], summaryText = '', link }: CustomCardProps) => {
  return (
    <Card className="card h-full flex flex-col">
      {mediaLink && media ? (
        <Link href={mediaLink}>
          <AspectRatio ratio={16 / 9}>
            {media}
          </AspectRatio>
        </Link>
      ) : media ? (
        <AspectRatio ratio={16 / 9}>
          {media}
        </AspectRatio>
      ) : null}
      <CardContent className="flex-grow pt-6">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className='badge'>{tag}</Badge>
            ))}
          </div>
        )}
        <CardHeader className="p-0">
          <CardTitle className="card-title text-xl mb-3">
            {heading.url ? (
              <Link href={heading.url} className="hover:underline">
                {heading.title}
              </Link>
            ) : (
              heading.title
            )}
          </CardTitle>
        </CardHeader>
        {summaryText && <p className="text-gray-600">{summaryText}</p>}
      </CardContent>
      {link && link.url && (
        <CardFooter>
          <Button asChild variant="default" className="w-full md:w-auto">
            <Link href={link.url}>
              {link.title}
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

