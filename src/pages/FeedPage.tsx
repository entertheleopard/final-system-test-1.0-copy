import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostCard from '@/components/PostCard';
import StoryCircle from '@/components/StoryCircle';
import FullscreenMediaModal from '@/components/FullscreenMediaModal';
import CommentsSheet from '@/components/CommentsSheet';
import { useToast } from '@/hooks/use-toast';
import { getRandomMockImage } from '@/lib/utils';
import type { Post, Story } from '@/types/social';

export default function FeedPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentPost, setCommentPost] = useState<Post | null>(null);

  const stories: Story[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'creative_artist',
      userAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      mediaUrl: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      mediaType: 'image',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isViewed: false,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'digital_dreams',
      userAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
      mediaUrl: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
      mediaType: 'image',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isViewed: true,
    },
  ];

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'live-1',
      authorId: 'user_live',
      authorName: 'live_creator',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png',
      content: '🔴 LIVE NOW: Digital Art Workshop! Join in!',
      mediaUrl: getRandomMockImage(3),
      mediaType: 'image',
      likes: 542,
      comments: 120,
      reposts: 15,
      saves: 40,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: '1',
      authorId: 'user1',
      authorName: 'creative_artist',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      content: 'Exploring new dimensions of digital art 🎨✨',
      mediaUrl: getRandomMockImage(4),
      mediaType: 'image',
      likes: 1234,
      comments: 89,
      reposts: 45,
      saves: 234,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      authorId: 'user2',
      authorName: 'digital_dreams',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
      content: 'Abstract thoughts manifested 💭',
      mediaUrl: getRandomMockImage(5),
      mediaType: 'image',
      likes: 892,
      comments: 56,
      reposts: 23,
      saves: 178,
      isLiked: true,
      isSaved: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: '3',
      authorId: 'user3',
      authorName: 'modern_creator',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png',
      content: 'Geometric harmony in motion',
      mediaUrl: getRandomMockImage(6),
      mediaType: 'image',
      likes: 2341,
      comments: 145,
      reposts: 67,
      saves: 456,
      isLiked: false,
      isSaved: true,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setCommentPost(post);
    }
  };

  const handleMediaClick = (post: Post) => {
    if (post.id.startsWith('live-')) {
      navigate(`/live/watch/${post.id}`);
    } else {
      setSelectedPost(post);
    }
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post =>
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
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
        : post
    ));
  };

  const handleAddStory = () => {
    toast({
      title: 'Add Story',
      description: 'Story creation coming soon!',
    });
  };

  const handleStoryClick = (story: Story) => {
    toast({
      title: 'Story Viewer',
      description: 'Story viewing coming soon!',
    });
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        {/* Stories */}
        <div className="bg-white border border-border rounded-lg p-4 mb-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <StoryCircle isAddStory onClick={handleAddStory} />
            {stories.map(story => (
              <StoryCircle
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(story)}
              />
            ))}
          </div>
        </div>

        {/* Feed */}
        <div>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onRepost={handleRepost}
              onSave={handleSave}
              onMediaClick={handleMediaClick}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {selectedPost && (
        <FullscreenMediaModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Comments Sheet */}
      {commentPost && (
        <CommentsSheet
          post={commentPost}
          onClose={() => setCommentPost(null)}
        />
      )}
    </InstagramLayout>
  );
}
