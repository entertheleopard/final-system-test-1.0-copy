import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@animaapp/playground-react-sdk';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { isMockMode } from '@/utils/mockMode';
import type { UserStory, StoryItem, StoryDuration } from '@/types/stories';

type StoriesContextType = {
  stories: Record<string, UserStory>;
  addStory: (file: File, type: 'image' | 'video', durationHours: StoryDuration, segment?: { start: number; end: number }) => Promise<void>;
  deleteStory: (storyId: string) => void;
  markAsViewed: (userId: string, storyId: string) => void;
  getStoriesForUser: (userId: string) => UserStory | undefined;
  hasActiveStory: (userId: string) => boolean;
  viewerState: { isOpen: boolean; initialUserId: string | null };
  openViewer: (userId: string) => void;
  closeViewer: () => void;
};

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

// Mock initial stories
const INITIAL_STORIES: Record<string, UserStory> = {
  'user1': {
    userId: 'user1',
    username: 'creative_artist',
    avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
    items: [
      {
        id: 's1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
        isViewed: false,
      },
      {
        id: 's2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000),
        isViewed: false,
      }
    ]
  },
  'user2': {
    userId: 'user2',
    username: 'digital_dreams',
    avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
    items: [
      {
        id: 's3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
        isViewed: false, // Reset to false to show purple ring
      }
    ]
  },
  'user3': {
    userId: 'user3',
    username: 'modern_creator',
    avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png',
    items: [
      {
        id: 's4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000),
        isViewed: false,
      }
    ]
  },
  'user4': {
    userId: 'user4',
    username: 'visual_arts',
    avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_4.png',
    items: [
      {
        id: 's5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago (Newest)
        expiresAt: new Date(Date.now() + 23.75 * 60 * 60 * 1000),
        isViewed: false,
      }
    ]
  },
  'user5': {
    userId: 'user5',
    username: 'design_daily',
    avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
    items: [
      {
        id: 's6',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000),
        isViewed: false,
      }
    ]
  },
  'user6': {
    userId: 'user6',
    username: 'pixel_perfect',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    items: [
      {
        id: 's7',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
        expiresAt: new Date(Date.now() + 23.25 * 60 * 60 * 1000),
        isViewed: false,
      }
    ]
  },
  'user7': {
    userId: 'user7',
    username: 'art_collective',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
    items: [
      {
        id: 's8',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000),
        isViewed: false,
      }
    ]
  },
  'user8': {
    userId: 'user8',
    username: 'motion_graphics',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    items: [
      {
        id: 's9',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
        duration: 5,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        isViewed: false,
      }
    ]
  }
};

export function StoriesProvider({ children }: { children: ReactNode }) {
  const realAuth = isMockMode() ? null : useAuth();
  const mockAuth = isMockMode() ? useMockAuth() : null;
  const { user } = (isMockMode() ? mockAuth : realAuth)!;
  
  const [stories, setStories] = useState<Record<string, UserStory>>(INITIAL_STORIES);

  // Clean up expired stories periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setStories(prev => {
        const next = { ...prev };
        let changed = false;
        
        Object.keys(next).forEach(userId => {
          const activeItems = next[userId].items.filter(item => item.expiresAt > now);
          if (activeItems.length !== next[userId].items.length) {
            if (activeItems.length === 0) {
              delete next[userId];
            } else {
              next[userId] = { ...next[userId], items: activeItems };
            }
            changed = true;
          }
        });
        
        return changed ? next : prev;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const addStory = async (file: File, type: 'image' | 'video', durationHours: StoryDuration, segment?: { start: number; end: number }) => {
    if (!user) return;

    const url = URL.createObjectURL(file);
    
    // Determine duration: use segment length if available, otherwise default
    let duration = type === 'video' ? 15 : 5;
    if (segment) {
      duration = segment.end - segment.start;
    }

    const newItem: StoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      url,
      duration,
      segment,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000),
      isViewed: false,
    };

    setStories(prev => {
      const userStories = prev[user.id] || {
        userId: user.id,
        username: user.name || 'You',
        avatar: user.profilePictureUrl || 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
        items: []
      };

      return {
        ...prev,
        [user.id]: {
          ...userStories,
          items: [...userStories.items, newItem]
        }
      };
    });
  };

  const deleteStory = (storyId: string) => {
    if (!user) return;
    setStories(prev => {
      const userStories = prev[user.id];
      if (!userStories) return prev;

      const updatedItems = userStories.items.filter(item => item.id !== storyId);
      
      if (updatedItems.length === 0) {
        const { [user.id]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [user.id]: {
          ...userStories,
          items: updatedItems
        }
      };
    });
  };

  const markAsViewed = (userId: string, storyId: string) => {
    setStories(prev => {
      if (!prev[userId]) return prev;

      const items = prev[userId].items.map(item => 
        item.id === storyId ? { ...item, isViewed: true } : item
      );

      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          items
        }
      };
    });
  };

  const getStoriesForUser = (userId: string) => {
    return stories[userId];
  };

  const hasActiveStory = (userId: string) => {
    const userStory = stories[userId];
    if (!userStory) return false;
    return userStory.items.some(item => item.expiresAt > new Date());
  };

  const [viewerState, setViewerState] = useState<{ isOpen: boolean; initialUserId: string | null }>({
    isOpen: false,
    initialUserId: null,
  });

  const openViewer = (userId: string) => {
    setViewerState({ isOpen: true, initialUserId: userId });
  };

  const closeViewer = () => {
    setViewerState({ isOpen: false, initialUserId: null });
  };

  return (
    <StoriesContext.Provider value={{ 
      stories, 
      addStory, 
      deleteStory, 
      markAsViewed, 
      getStoriesForUser, 
      hasActiveStory,
      viewerState,
      openViewer,
      closeViewer
    }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
}
