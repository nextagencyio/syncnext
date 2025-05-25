import { imageStyles, ImageStyleName, ImageStyle } from './image-styles';

export default function loader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // If the source is an SVG or starts with a relative path, return it as-is
  if (src.endsWith('.svg') || src.startsWith('/')) {
    return src;
  }

  // Parse the style from the query string
  const [path, query] = src.split('?');
  const params = new URLSearchParams(query);
  const styleName = params.get('style') as ImageStyleName | null;

  // Get style configuration if available
  const style = styleName && styleName in imageStyles
    ? imageStyles[styleName]
    : null;

  if (style && styleName) {
    // Determine if we should crop based on style configuration
    const shouldCrop = 'crop' in style ? style.crop : true;
    console.log('Image loader - Style:', styleName, 'Should crop:', shouldCrop);

    // Build URL parameters
    const urlParams = new URLSearchParams();
    urlParams.set('url', path);
    urlParams.set('width', style.width.toString());
    urlParams.set('height', style.height.toString());
    urlParams.set('quality', (style.quality || quality || 90).toString());
    urlParams.set('style', styleName);
    urlParams.set('crop', shouldCrop.toString());

    const finalUrl = `/api/image?${urlParams.toString()}`;
    console.log('Image loader - Final URL:', finalUrl);
    return finalUrl;
  }

  // If no style is specified, use the requested width and maintain aspect ratio
  const aspectRatio = width <= 767 ? 4 / 3 : 2 / 1;  // 4:3 for mobile, 2:1 for desktop
  const imageHeight = Math.round(width * aspectRatio);

  const urlParams = new URLSearchParams();
  urlParams.set('url', path);
  urlParams.set('width', width.toString());
  urlParams.set('height', imageHeight.toString());
  urlParams.set('quality', (quality || 90).toString());
  urlParams.set('crop', 'true');

  return `/api/image?${urlParams.toString()}`;
}
