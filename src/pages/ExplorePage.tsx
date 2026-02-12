import { useState } from 'react';
import InstagramLayout from '@/components/InstagramLayout';
import FullscreenMediaModal from '@/components/FullscreenMediaModal';
import { handleImageError, resolveMedia, getRandomMockImage } from '@/lib/utils';
import type { Post } from '@/types/social';

export default function ExplorePage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const explorePosts: Post[] = [
    {
      id: 'e1',
      authorId: 'user1',
      authorName: 'creative_artist',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      content: 'Discover amazing art',
      mediaUrl: getRandomMockImage(0),
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
      mediaUrl: getRandomMockImage(1),
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
      mediaUrl: getRandomMockImage(2),
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
      mediaUrl: getRandomMockImage(3),
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
      mediaUrl: getRandomMockImage(4),
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
      mediaUrl: getRandomMockImage(5),
      mediaType: 'image',
      likes: 2345,
      comments: 123,
      reposts: 45,
      saves: 345,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
  ];

  return (
    <InstagramLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <h1 className="text-h1 font-bold text-foreground mb-4 sm:mb-6">Journey</h1>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {explorePosts.map(post => {
            const media = resolveMedia(post);
            return (
              <div
                key={post.id}
                className="aspect-square bg-tertiary cursor-pointer relative group overflow-hidden"
                onClick={() => setSelectedPost(post)}
              >
                {media?.type === 'video' ? (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={media?.url}
                    alt={post.content}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-h4 font-semibold">{post.likes.toLocaleString()}</span>
                    <span className="text-body-sm">likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-h4 font-semibold">{post.comments}</span>
                    <span className="text-body-sm">comments</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {selectedPost && (
        <FullscreenMediaModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </InstagramLayout>
  );
}
