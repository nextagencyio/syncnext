import sharp from 'sharp';

export async function processImage(
  url: string,
  width: number,
  height: number,
  quality: number = 90,
  crop: boolean = true
) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!crop) {
      // For non-cropping mode, maintain aspect ratio
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height;
        const targetAspectRatio = width / height;

        if (aspectRatio > targetAspectRatio) {
          // Image is wider than target: fit to width
          height = Math.round(width / aspectRatio);
        } else {
          // Image is taller than target: fit to height
          width = Math.round(height * aspectRatio);
        }
      }
    }

    const resizeOptions = {
      fit: crop ? ('cover' as const) : ('contain' as const),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      position: 'center',
      withoutEnlargement: true
    };

    const processedImage = await sharp(buffer)
      .resize(width, height, resizeOptions)
      .toFormat('webp', { quality })
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}
