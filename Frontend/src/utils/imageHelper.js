// Image helper - All images are now WebP format
// Original PNG/JPG files are deleted after conversion

// Preload critical images
export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Check WebP support (for fallback handling)
export const supportsWebP = () => {
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

// Get image with WebP extension
export const getWebPImage = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If already .webp, return as is
  if (imagePath.endsWith('.webp')) return imagePath;
  
  // Replace extension with .webp
  return imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
};
