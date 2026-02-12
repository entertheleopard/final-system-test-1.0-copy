import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { handleAvatarError } from '@/lib/utils';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@animaapp/playground-react-sdk';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { isMockMode } from '@/utils/mockMode';
import { supabase } from '@/lib/supabase';
import type { Conversation, UserProfile } from '@/types/schema';

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Auth
  const realAuth = isMockMode() ? null : useAuth();
  const mockAuth = isMockMode() ? useMockAuth() : null;
  const { user } = (isMockMode() ? mockAuth : realAuth)!;

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setIsLoading(true);
      
      // Fetch conversations where participantIds contains user.id
      const { data: convs, error } = await supabase
        .from('Conversation')
        .select('*')
        .contains('participantIds', [user.id])
        .order('lastMessageAt', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else if (convs) {
        setConversations(convs as Conversation[]);

        // Fetch profiles for all participants
        const allParticipantIds = Array.from(new Set(convs.flatMap((c: Conversation) => c.participantIds)));
        const otherIds = allParticipantIds.filter(id => id !== user.id);
        
        if (otherIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('UserProfile')
            .select('*')
            .in('userId', otherIds);
            
          if (profilesData) {
            const profilesMap: Record<string, UserProfile> = {};
            profilesData.forEach((p: UserProfile) => {
              profilesMap[p.userId] = p;
            });
            setProfiles(profilesMap);
          }
        }
      }
      setIsLoading(false);
    };

    fetchConversations();

    // Realtime listener for new conversations or updates
    const channel = supabase
      .channel('realtime-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Conversation',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Helper to get other participant details
  const getParticipant = (participantIds: string[]) => {
    const otherId = participantIds.find(id => id !== user?.id);
    if (!otherId) return { name: 'Unknown', avatar: '', username: 'unknown' };
    
    const profile = profiles[otherId];
    if (profile) {
      return {
        name: profile.username || 'User', // Use username as name if name is missing
        avatar: profile.profilePictureUrl || 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
        username: profile.username || 'user'
      };
    }
    
    return { name: 'User', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png', username: 'user' };
  };

  const filteredConversations = conversations.filter(conv => {
    const participant = getParticipant(conv.participantIds);
    return participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           participant.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (dateStr: Date | string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  return (
    <InstagramLayout hideBottomNav>
      <div className="w-full max-w-2xl mx-auto h-[100dvh] flex flex-col bg-background">
        {/* Header */}
        <div className="relative flex items-center justify-center px-4 py-3 border-b border-border">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-4 text-foreground hover:text-tertiary-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1 className="text-body font-bold text-foreground">Messages</h1>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-tertiary rounded-lg text-body-sm text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-tertiary-foreground">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-tertiary-foreground">
              <p>No messages yet.</p>
              <p className="text-sm mt-2">Start a conversation from a profile.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const participant = getParticipant(conv.participantIds);
              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-tertiary/30 active:bg-tertiary/50 transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-14 h-14 rounded-full object-cover border border-border"
                      onError={handleAvatarError}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`text-body-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                        {participant.name}
                      </p>
                      <span className="text-caption text-tertiary-foreground flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageAt || conv.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className={`text-body-sm truncate max-w-[90%] ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-tertiary-foreground'}`}>
                        {conv.lastMessage || 'Started a conversation'}
                      </p>
                    </div>
                  </div>

                  {/* Unread Badge */}
                  {conv.unreadCount > 0 && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </InstagramLayout>
  );
}
