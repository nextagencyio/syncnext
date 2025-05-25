import { processImage } from '@/lib/image-processor';
import { NextRequest, NextResponse } from 'next/server';
import { imageStyles, ImageStyleName } from '@/lib/image-styles';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const width = parseInt(searchParams.get('width') || '0', 10);
  const height = parseInt(searchParams.get('height') || '0', 10);
  const quality = parseInt(searchParams.get('quality') || '90', 10);
  const style = searchParams.get('style') as ImageStyleName | null;

  // Determine if we should crop based on style
  let crop = true; // Default to true
  if (style && style in imageStyles) {
    const styleConfig = imageStyles[style];
    if ('crop' in styleConfig) {
      crop = styleConfig.crop;
    }
  } else if (searchParams.has('crop')) {
    // If no style or style doesn't specify crop, use the crop parameter if provided
    crop = searchParams.get('crop') === 'true';
  }

  if (!url || !width || !height) {
    return new NextResponse('Missing required parameters', { status: 400 });
  }

  try {
    const processedImage = await processImage(url, width, height, quality, crop);
    return new NextResponse(processedImage, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return new NextResponse('Error processing image', { status: 500 });
  }
}
