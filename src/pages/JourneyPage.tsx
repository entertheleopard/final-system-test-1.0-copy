import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostDetailModal from '@/components/PostDetailModal';
import JourneyGridItem from '@/components/JourneyGridItem';
import { useToast } from '@/hooks/use-toast';
import { getRandomMockImage } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/social';

export default function JourneyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const { user } = useAuth();
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [explorePosts, setExplorePosts] = useState<Post[]>([
    {
      id: 'e1',
      authorId: 'user1',
      authorName: 'creative_artist',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      content: 'Discover amazing art',
      mediaUrl: getRandomMockImage(5), // Landscape
      mediaType: 'image',
      likes: 5432,
      comments: 234,
      reposts: 89,
      saves: 678,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: 'e2',
      authorId: 'user2',
      authorName: 'digital_dreams',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
      content: 'Trending now',
      mediaUrl: getRandomMockImage(6), // Portrait
      mediaType: 'image',
      likes: 3421,
      comments: 156,
      reposts: 67,
      saves: 445,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: 'e3',
      authorId: 'user3',
      authorName: 'modern_creator',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png',
      content: 'Popular this week',
      mediaUrl: getRandomMockImage(7), // Square
      mediaType: 'image',
      likes: 6789,
      comments: 345,
      reposts: 123,
      saves: 890,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: 'e4',
      authorId: 'user4',
      authorName: 'visual_artist',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_4.png',
      content: 'Explore creativity',
      mediaUrl: getRandomMockImage(8), // Abstract
      mediaType: 'image',
      likes: 4567,
      comments: 189,
      reposts: 78,
      saves: 567,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: 'e5',
      authorId: 'user5',
      authorName: 'art_enthusiast',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
      content: 'Featured content',
      mediaUrl: getRandomMockImage(9), // Neon
      mediaType: 'image',
      likes: 7890,
      comments: 456,
      reposts: 234,
      saves: 1234,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: 'e6',
      authorId: 'user6',
      authorName: 'design_master',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      content: 'Inspiration daily',
      mediaUrl: getRandomMockImage(0),
      mediaType: 'image',
      likes: 2345,
      comments: 123,
      reposts: 45,
      saves: 345,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
  ]);

  const handleLike = (postId: string) => {
    setExplorePosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        const isLiking = !post.isLiked;
        if (isLiking && user) {
          createNotification({
            type: 'like',
            fromUserId: user.id,
            toUserId: post.authorId,
            postId: post.id,
            previewText: 'liked your post'
          });
        }
        return { ...post, isLiked: isLiking, likes: isLiking ? post.likes + 1 : post.likes - 1 };
      }
      return post;
    }));
  };

  const handleRepost = (postId: string) => {
    setExplorePosts(explorePosts.map(post =>
      post.id === postId
        ? { ...post, reposts: post.reposts + 1 }
        : post
    ));
    toast({
      title: 'Reposted',
      description: 'Post shared to your profile',
    });
  };

  const handleSave = (postId: string) => {
    setExplorePosts(explorePosts.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
        : post
    ));
  };

  return (
    <InstagramLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-h1 font-bold text-foreground">Journey</h1>
          <button 
            onClick={() => navigate('/search')}
            className="p-2 bg-tertiary rounded-full hover:bg-secondary transition-colors"
          >
            <Search className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Masonry Layout */}
        <div className="columns-2 md:columns-3 gap-1 sm:gap-2 space-y-1 sm:space-y-2">
          {explorePosts.map(post => (
            <JourneyGridItem 
              key={post.id} 
              post={post} 
              onClick={setSelectedPost} 
            />
          ))}
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          allPosts={explorePosts}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onRepost={handleRepost}
          onSave={handleSave}
        />
      )}
    </InstagramLayout>
  );
}
