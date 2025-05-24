// Content format types for rich text and links
export interface TextFormat {
  processed?: string;
}

export interface LinkFormat {
  url?: string;
  title?: string;
  internal?: boolean;
}

// Simplified content image type for Next.js Image component
export interface ContentImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
}
