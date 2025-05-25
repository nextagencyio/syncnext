export interface ImageStyle {
  width: number;
  height: number;
  quality?: number;
  priority?: boolean;
  crop?: boolean;  // false for scaling, true for cropping (default)
}

export const imageStyles = {
  // Hero image styles (l = large, m = medium, s = small)
  herol: {
    width: 1536,
    height: 768,
    quality: 90,
    priority: true,
  },
  herolx2: {
    width: 3072,
    height: 1536,
    quality: 90,
    priority: true,
  },
  herom: {
    width: 768,
    height: 384,
    quality: 90,
    priority: true,
  },
  heromx2: {
    width: 1536,
    height: 768,
    quality: 90,
    priority: true,
  },
  heros: {
    width: 720,
    height: 540,
    quality: 85,
    priority: true,
  },
  herosx2: {
    width: 1440,
    height: 1080,
    quality: 85,
    priority: true,
  },

  // 1:1 image styles
  i11large: {
    width: 800,
    height: 800,
    quality: 85,
  },
  i11medium: {
    width: 400,
    height: 400,
    quality: 85,
  },

  // 4:3 image styles
  i43large: {
    width: 1280,
    height: 960,
    quality: 85,
  },
  i43medium: {
    width: 960,
    height: 720,
    quality: 85,
  },

  // 16:9 image styles
  i169large: {
    width: 1280,
    height: 720,
    quality: 85,
  },
  i169medium: {
    width: 960,
    height: 540,
    quality: 85,
  },

  // Generic sizes
  large: {
    width: 1280,
    height: 720,
    quality: 85,
    crop: false,
  },
  medium: {
    width: 960,
    height: 540,
    quality: 85,
    crop: false,
  },

  // Thumbnail styles
  thumbnail: {
    width: 320,
    height: 320,
    quality: 80,
    crop: false,
  },
} as const;

export type ImageStyleName = keyof typeof imageStyles;
