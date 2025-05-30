import React, { ReactNode } from 'react';

export interface Logo {
  name: string;
  media: ReactNode;
}

export interface LogoCollectionProps {
  title: string;
  logos: Logo[];
}

export default function LogoCollection({ title, logos }: LogoCollectionProps) {
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-6 md:mb-0 md:w-1/5 md:pr-4 md:flex-shrink-0 text-center md:text-left">
            {title}
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:flex md:flex-wrap md:justify-end md:items-center md:gap-8 md:w-5/6">
            {logos.map((logo) => (
              <div key={logo.name} className="flex items-center justify-center md:justify-start">
                {React.isValidElement(logo.media) && (
                  React.cloneElement(logo.media as React.ReactElement, {
                    className: "max-w-[100px] md:max-w-[120px] h-auto",
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
