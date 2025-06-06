import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getLucideIcon } from '@/utils/dynamic-icon';

export interface StatCardProps {
  type: 'stat';
  media?: React.ReactNode;
  heading: string;
  body?: string;
  icon?: string;
  border?: boolean;
  modifier?: string;
  layout?: 'left' | 'center';
}

const StatCard: React.FC<StatCardProps> = ({
  media,
  heading,
  body,
  icon,
  border = true,
  modifier = '',
  layout = 'center'
}) => {
  const alignmentClass = layout === 'left' ? 'text-left' : 'text-center';
  const iconClass = layout === 'left' ? 'mr-auto' : 'mx-auto';
  const IconComponent = icon ? getLucideIcon(icon) as React.FC<{ size?: number; className?: string }> : null;

  return (
    <Card className={`stat ${alignmentClass} ${!border ? 'border-0 shadow-none px-3 py-2 sm:px-4 sm:py-8 h-full' : ''} ${modifier}`}>
      <CardContent className={`${!border ? 'p-0' : ''}`}>
        {IconComponent && (
          <div className={`stat-icon ${iconClass} mb-4 max-w-[120px] sm:max-w-[200px]`}>
            <IconComponent size={56} className="mx-auto sm:hidden" />
            <IconComponent size={68} className="mx-auto hidden sm:block" />
          </div>
        )}
        {media && (
          <div className={`stat-icon ${iconClass} mb-4 max-w-[120px] sm:max-w-[200px]`}>
            {media}
          </div>
        )}
        <CardTitle className="mb-2 text-xl">{heading}</CardTitle>
        {body && <p className="mb-0 text-gray-600">{body}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;

