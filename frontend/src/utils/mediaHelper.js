/**
 * Helper to safely resolve media and document URLs for images and PDFs
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.startsWith('/api/v1/uploads/')) {
    return clean;
  }
  if (clean.startsWith('/uploads/')) {
    return `/api/v1${clean}`;
  }
  return clean;
};

export const DEFAULT_DARPAN_COVER = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
