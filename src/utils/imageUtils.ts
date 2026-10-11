/**
 * Responsive image utilities for high-performance asset loading.
 * Preserves original images while delivering optimized WebP responsive variants.
 */

export interface ResponsiveImageDetails {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

const PROPERTY_IMAGE_DIMENSIONS: Record<string, { width: number; height: number; aspect: string }> = {
  '1': { width: 1448, height: 1086, aspect: '1448 / 1086' },
  '2': { width: 1448, height: 1086, aspect: '1448 / 1086' },
  '3': { width: 1448, height: 1086, aspect: '1448 / 1086' },
  '4': { width: 1254, height: 1254, aspect: '1 / 1' },
  '5': { width: 1086, height: 1448, aspect: '1086 / 1448' },
  '6': { width: 1448, height: 1086, aspect: '1448 / 1086' },
  '7': { width: 1086, height: 1448, aspect: '1086 / 1448' },
  '8': { width: 1448, height: 1086, aspect: '1448 / 1086' },
  '9': { width: 1448, height: 1086, aspect: '1448 / 1086' },
  '10': { width: 1448, height: 1086, aspect: '1448 / 1086' },
};

/**
 * Extracts property image index (1-10) from image URL if applicable
 */
export function getPropertyImageIndex(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:^|\/)(\d{1,2})\.png(?:[?#]|$)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 10) return String(num);
  }
  return null;
}

/**
 * Returns responsive WebP URLs and srcSet for a given property image
 */
export function getResponsiveImageDetails(
  src: string,
  targetWidth: 480 | 800 | 1200 | 'full' = 800
): ResponsiveImageDetails {
  const index = getPropertyImageIndex(src);
  if (!index) {
    return { src };
  }

  const dim = PROPERTY_IMAGE_DIMENSIONS[index];
  const webpUrl = `/optimized/${index}-${targetWidth}w.webp`;
  const fullWebpUrl = `/optimized/${index}-full.webp`;
  const primarySrc = targetWidth === 'full' ? fullWebpUrl : webpUrl;

  const srcSet = [
    `/optimized/${index}-480w.webp 480w`,
    `/optimized/${index}-800w.webp 800w`,
    `/optimized/${index}-1200w.webp 1200w`,
    `/optimized/${index}-full.webp ${dim?.width || 1448}w`,
  ].join(', ');

  return {
    src: primarySrc,
    srcSet,
    width: dim?.width,
    height: dim?.height,
    aspectRatio: dim?.aspect,
  };
}
