import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFallbackAvatar = () => {
  // Brand purple background with white user icon
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='100%25' height='100%25'%3E%3Crect width='24' height='24' fill='%239333ea'/%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
};

export const getFallbackImage = () => {
  // Dark gray background with purple image icon
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239333ea' stroke-width='1' stroke-linecap='round' stroke-linejoin='round' style='background-color:%231a1a1a'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E`;
};

export const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = getFallbackAvatar();
  e.currentTarget.onerror = null;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = getFallbackImage();
  e.currentTarget.onerror = null;
};

export function resolveMedia(post: any): { url: string; type: 'image' | 'video' } | null {
  if (!post) return null;

  // Check for video fields first
  if (post.videoUrl) return { url: post.videoUrl, type: 'video' };
  if (post.video) return { url: post.video, type: 'video' };
  
  // Check for image fields
  if (post.imageUrl) return { url: post.imageUrl, type: 'image' };
  if (post.image) return { url: post.image, type: 'image' };
  
  // Check for generic media field
  if (post.mediaUrl) return { url: post.mediaUrl, type: post.mediaType || 'image' };
  if (post.media) return { url: post.media, type: post.mediaType || 'image' };
  if (post.url) return { url: post.url, type: post.type || 'image' };

  // Check for assets array
  if (post.assets && Array.isArray(post.assets) && post.assets.length > 0) {
    const asset = post.assets[0];
    // Handle if asset is string or object
    if (typeof asset === 'string') {
      return { url: asset, type: 'image' };
    }
    return { 
      url: asset.url || asset.src || asset.uri, 
      type: asset.type || 'image' 
    };
  }

  return null;
}

export const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop', // Abstract 1
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop', // Neon
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop', // Landscape
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop', // Portrait
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop', // Square-ish
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop', // Fluid
  'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop', // Dark
  'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?q=80&w=800&auto=format&fit=crop', // Gradient
  'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=800&auto=format&fit=crop', // Rain
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop', // Cyberpunk
];

export const getRandomMockImage = (index?: number) => {
  if (typeof index === 'number') {
    return MOCK_IMAGES[index % MOCK_IMAGES.length];
  }
  return MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
};
