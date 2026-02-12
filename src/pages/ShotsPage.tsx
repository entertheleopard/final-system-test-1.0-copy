import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useShareActions } from '@/contexts/ShareContext';
import InstagramLayout from '@/components/InstagramLayout';
import CommentsSheet from '@/components/CommentsSheet';
import ShotItem from '@/components/ShotItem';
import { getRandomMockImage } from '@/lib/utils';
import type { Post } from '@/types/social';

export default function ShotsPage() {
  const { user } = useAuth();
  const { openShare } = useShareActions();
  
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  const shots: Post[] = [
    {
      id: 's1',
      authorId: 'user1',
      authorName: 'creative_artist',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      content: 'Check out this amazing creation! 🎨',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      mediaType: 'image', // Using image for reliable mock rendering
      likes: 12340,
      comments: 456,
      reposts: 234,
      saves: 890,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: 's2',
      authorId: 'user2',
      authorName: 'digital_dreams',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
      content: 'Abstract vibes ✨',
      mediaUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop',
      mediaType: 'image',
      likes: 8920,
      comments: 321,
      reposts: 156,
      saves: 678,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: 's3',
      authorId: 'user3',
      authorName: 'modern_creator',
      authorAvatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png',
      content: 'Geometric perfection 🔷',
      mediaUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
      mediaType: 'image',
      likes: 15670,
      comments: 567,
      reposts: 289,
      saves: 1234,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(),
    },
  ];

  const [shotsData, setShotsData] = useState(shots);

  // Initialize active post
  useEffect(() => {
    if (shotsData.length > 0 && !activePostId) {
      setActivePostId(shotsData[0].id);
    }
  }, [shotsData, activePostId]);

  // Handle scroll snap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute('data-post-id');
            if (postId) {
              setActivePostId(postId);
            }
          }
        });
      },
      {
        threshold: 0.6, // Trigger when 60% visible
      }
    );

    const elements = container.querySelectorAll('[data-post-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [shotsData]);

  const handleLike = (shotId: string) => {
    setShotsData(shotsData.map(shot =>
      shot.id === shotId
        ? { ...shot, isLiked: !shot.isLiked, likes: shot.isLiked ? shot.likes - 1 : shot.likes + 1 }
        : shot
    ));
  };

  const handleSave = (shotId: string) => {
    setShotsData(shotsData.map(shot =>
      shot.id === shotId
        ? { ...shot, isSaved: !shot.isSaved, saves: shot.isSaved ? shot.saves - 1 : shot.saves + 1 }
        : shot
    ));
  };

  const activePost = shotsData.find(p => p.id === activePostId) || shotsData[0];

  return (
    <InstagramLayout>
      {/* Scroll Container */}
      <div 
        ref={containerRef}
        className="h-[calc(100vh-4rem)] lg:h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar"
      >
        {shotsData.map((shot) => (
          <ShotItem
            key={shot.id}
            shot={shot}
            isActive={activePostId === shot.id}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted(!isMuted)}
            onLike={handleLike}
            onComment={(id) => {
              setActivePostId(id);
              setShowComments(true);
            }}
            onShare={(post) => {
              setActivePostId(post.id);
              openShare(post);
            }}
            onSave={handleSave}
            currentUserId={user?.id}
          />
        ))}
      </div>

      {/* Comments Sheet */}
      {showComments && activePost && (
        <CommentsSheet post={activePost} onClose={() => setShowComments(false)} />
      )}
    </InstagramLayout>
  );
}
