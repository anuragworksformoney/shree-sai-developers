import React from 'react';

interface LogoProps {
  variant?: 'header' | 'footer' | 'compact';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'header', className = '' }) => {
  const heightClass = {
    header: 'h-10 sm:h-12 md:h-14',
    footer: 'h-12 sm:h-14 md:h-16',
    compact: 'h-9 sm:h-10',
  }[variant] || 'h-10 sm:h-12';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/shree_sai_brand_logo.png"
        alt="SHREE SAI DEVELOPERS - Builders & Developers"
        className={`${heightClass} w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/logo.png';
        }}
      />
    </div>
  );
};

export default Logo;
