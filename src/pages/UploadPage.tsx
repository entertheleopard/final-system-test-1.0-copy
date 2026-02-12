import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import MediaSelector from '@/components/upload/MediaSelector';
import PhotoEditor from '@/components/upload/PhotoEditor';
import VideoEditor from '@/components/upload/VideoEditor';
import CaptionEditor from '@/components/upload/CaptionEditor';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useMutation } from '@animaapp/playground-react-sdk';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';
import { cn } from '@/lib/utils';
import type { MediaFile, EditedMedia } from '@/types/upload';

type UploadStep = 'select' | 'edit' | 'caption';

export default function UploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auth
  const realAuth = isMockMode() ? null : useAuth();
  const mockAuth = isMockMode() ? useMockAuth() : null;
  const { user } = (isMockMode() ? mockAuth : realAuth)!;

  // Mutation
  const realMutation = isMockMode() ? null : useMutation('Post');
  const mockMutation = isMockMode() ? useMockMutation('Post') : null;
  const { create, isPending } = (isMockMode() ? mockMutation : realMutation)!;

  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [editedMedia, setEditedMedia] = useState<EditedMedia[]>([]);

  const handleMediaSelected = (files: MediaFile[]) => {
    setSelectedMedia(files);
    setCurrentStep('edit');
  };

  const handleEditComplete = (edited: EditedMedia[]) => {
    setEditedMedia(edited);
    setCurrentStep('caption');
  };

  const handlePublish = async (caption: string, location?: string, tags?: string[]) => {
    if (!user || editedMedia.length === 0) return;

    try {
      const mediaItem = editedMedia[0];
      
      await create({
        authorId: user.id,
        authorName: user.name || 'User',
        authorAvatar: user.profilePictureUrl || 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
        content: caption,
        mediaUrl: mediaItem.finalUrl,
        mediaType: mediaItem.type,
        likes: 0,
        comments: 0,
        reposts: 0,
        saves: 0
      });

      toast({
        title: 'Post published',
        description: 'Your post has been shared successfully',
      });
      navigate('/ladder');
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'caption') {
      setCurrentStep('edit');
    } else if (currentStep === 'edit') {
      setCurrentStep('select');
      setSelectedMedia([]);
    } else {
      navigate(-1);
    }
  };

  return (
    <InstagramLayout hideBottomNav>
      <div 
        className={cn(
          "w-full flex flex-col bg-background min-h-[100dvh]",
          // Ensure safe area padding at the bottom
          "pb-safe-bottom"
        )}
      >
        {currentStep === 'select' && (
          <div className="flex-1 flex flex-col h-[100dvh]">
            <MediaSelector onMediaSelected={handleMediaSelected} onCancel={() => navigate(-1)} />
          </div>
        )}

        {currentStep === 'edit' && selectedMedia.length > 0 && (
          <div className="flex-1 flex flex-col h-[100dvh]">
            {selectedMedia[0].type === 'image' ? (
              <PhotoEditor
                media={selectedMedia}
                onComplete={handleEditComplete}
                onBack={handleBack}
              />
            ) : (
              <VideoEditor
                media={selectedMedia}
                onComplete={handleEditComplete}
                onBack={handleBack}
              />
            )}
          </div>
        )}

        {currentStep === 'caption' && editedMedia.length > 0 && (
          <div className="flex-1 flex flex-col">
            <CaptionEditor
              media={editedMedia}
              onPublish={handlePublish}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </InstagramLayout>
  );
}
