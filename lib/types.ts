// Content format types for rich text and links
export interface TextFormat {
  processed?: string;
  value?: string;
}

export interface LinkFormat {
  url?: string;
  title?: string;
  internal?: boolean;
}

// Media image type for unified image handling
export interface MediaImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
}

// Simplified content image type for Next.js Image component
export interface ContentImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
}
