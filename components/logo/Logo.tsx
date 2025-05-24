import React, { FC } from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  modifier?: string;
  siteLogo?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: FC<LogoProps> = ({
  modifier = '',
  textColor = 'text-foreground',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: { icon: 'h-5 w-5', text: 'text-lg' },
    md: { icon: 'h-7 w-7', text: 'text-2xl' },
    lg: { icon: 'h-9 w-9', text: 'text-3xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${modifier}`}>
      <Zap className={`${currentSize.icon} text-primary flex-shrink-0`} />
      <span className={`font-bold ${currentSize.text} ${textColor} tracking-tight leading-none`}>
        sync<span className="text-primary">next</span>
      </span>
    </div>
  );
};

export default Logo;
