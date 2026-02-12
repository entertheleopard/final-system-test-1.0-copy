/**
 * Mock mode detection and configuration
 * Enables the app to run without backend services in preview/testing environments
 */

export const isMockMode = () => {
  // Enable mock mode if:
  // 1. No backend is configured
  // 2. Running in preview/development
  // 3. Network requests are failing
  return true; // Always enable for preview mode
};

export const MOCK_USERS = [
  {
    id: 'mock-user-1',
    email: 'demo@invoque.art',
    name: 'Demo User',
    username: 'demo_user',
    bio: 'Digital artist exploring the boundaries of creativity 🎨✨',
    website: 'https://invoque.art',
    profilePictureUrl: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
  },
  {
    id: 'mock-user-2',
    email: 'sarah@invoque.art',
    name: 'Sarah Jenkins',
    username: 'sarah_j_art',
    bio: 'Lover of colors and shapes 🌈. Creating daily.',
    website: 'https://sarahart.com',
    profilePictureUrl: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
  },
  {
    id: 'mock-user-3',
    email: 'mike@invoque.art',
    name: 'Mike Ross',
    username: 'mike_design',
    bio: 'Minimalist designer. Less is more.',
    website: 'https://mikedesign.io',
    profilePictureUrl: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
  }
];

export const MOCK_USER = MOCK_USERS[0]; // Default logged in user

export const MOCK_DELAY = 300; // Simulate network delay

export const mockDelay = (ms: number = MOCK_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms));
