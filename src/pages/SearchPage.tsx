import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostDetailModal from '@/components/PostDetailModal';
import { Search, X, User, Hash, TrendingUp } from 'lucide-react';
import { handleAvatarError, handleImageError, getRandomMockImage } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/social';

export default function SearchPage() {
  const navigate = useNavigate();
  const { createNotification } = useNotifications();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'top' | 'accounts' | 'tags'>('top');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Auto-switch to tags tab if query starts with #
  useEffect(() => {
    if (query.startsWith('#')) {
      setActiveTab('tags');
    } else if (query.length > 0 && activeTab === 'tags' && !query.startsWith('#')) {
      setActiveTab('accounts');
    }
  }, [query]);

  // Mock Data
  const mockAccounts = [
    { id: 'user1', username: 'creative_artist', name: 'Creative Artist', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png', followers: '12.5K' },
    { id: 'user2', username: 'digital_dreams', name: 'Digital Dreams', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png', followers: '8.2K' },
    { id: 'user3', username: 'modern_creator', name: 'Modern Creator', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png', followers: '45.1K' },
    { id: 'user4', username: 'visual_arts', name: 'Visual Arts', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_4.png', followers: '3.2K' },
    { id: 'user5', username: 'design_daily', name: 'Design Daily', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png', followers: '98.4K' },
  ];

  const mockTags = [
    { id: 't1', name: 'digitalart', posts: '1.2M' },
    { id: 't2', name: 'creative', posts: '890K' },
    { id: 't3', name: 'inspiration', posts: '5.4M' },
    { id: 't4', name: 'design', posts: '3.1M' },
    { id: 't5', name: 'artistsoninstagram', posts: '2.8M' },
  ];

  const [trendingPosts, setTrendingPosts] = useState<Post[]>(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: `trend-${i}`,
      authorId: `user-${i}`,
      authorName: `creator_${i}`,
      authorAvatar: `https://c.animaapp.com/mlix9h3omwDIgk/img/ai_${(i % 5) + 1}.png`,
      content: 'Trending content #art #design',
      mediaUrl: getRandomMockImage(i),
      mediaType: 'image',
      likes: Math.floor(Math.random() * 5000) + 500,
      comments: Math.floor(Math.random() * 100),
      reposts: Math.floor(Math.random() * 50),
      saves: Math.floor(Math.random() * 200),
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    }))
  );

  const handleLike = (postId: string) => {
    setTrendingPosts(currentPosts => currentPosts.map(post => {
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

  const filteredAccounts = mockAccounts.filter(acc => 
    acc.username.toLowerCase().includes(query.toLowerCase()) || 
    acc.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTags = mockTags.filter(tag => 
    tag.name.toLowerCase().includes(query.replace('#', '').toLowerCase())
  );

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleHashtagClick = (tagName: string) => {
    navigate(`/hashtag/${tagName}`);
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto h-screen flex flex-col bg-background">
        {/* Search Header */}
        <div className="p-4 border-b border-border">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-tertiary-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-10 py-2 bg-tertiary rounded-lg text-body text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 text-tertiary-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('top')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'top' ? 'text-foreground border-b-2 border-foreground' : 'text-tertiary-foreground'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'accounts' ? 'text-foreground border-b-2 border-foreground' : 'text-tertiary-foreground'
            }`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors ${
              activeTab === 'tags' ? 'text-foreground border-b-2 border-foreground' : 'text-tertiary-foreground'
            }`}
          >
            Hashtags
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'accounts' && (
            <div className="divide-y divide-border">
              {filteredAccounts.map(account => (
                <div 
                  key={account.id}
                  onClick={() => navigate(`/profile/${account.id}`)}
                  className="flex items-center gap-3 p-4 hover:bg-tertiary transition-colors cursor-pointer"
                >
                  <img 
                    src={account.avatar} 
                    alt={account.username} 
                    className="w-12 h-12 rounded-full object-cover border border-border"
                    onError={handleAvatarError}
                  />
                  <div className="flex-1">
                    <p className="text-body font-semibold text-foreground">{account.username}</p>
                    <p className="text-caption text-tertiary-foreground">{account.name} • {account.followers} followers</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="divide-y divide-border">
              {filteredTags.map(tag => (
                <div 
                  key={tag.id}
                  onClick={() => handleHashtagClick(tag.name)}
                  className="flex items-center gap-4 p-4 hover:bg-tertiary transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-tertiary border border-border flex items-center justify-center">
                    <Hash className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-semibold text-foreground">#{tag.name}</p>
                    <p className="text-caption text-tertiary-foreground">{tag.posts} posts</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'top' && (
            <div className="p-1">
              {/* Trending Section */}
              {!query && (
                <div className="mb-4 px-3 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-body font-semibold text-foreground">Trending Now</h3>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-1">
                {trendingPosts.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => handlePostClick(post)}
                    className="aspect-square relative group cursor-pointer bg-tertiary overflow-hidden"
                  >
                    <AvatarImage 
                      src={post.mediaUrl} 
                      alt="Trending" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          allPosts={trendingPosts}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onRepost={() => {}}
          onSave={() => {}}
        />
      )}
    </InstagramLayout>
  );
}
