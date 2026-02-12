import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { handleAvatarError } from '@/lib/utils';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@animaapp/playground-react-sdk';
import { useMockQuery } from '@/hooks/useMockQuery';
import { isMockMode, MOCK_USERS } from '@/utils/mockMode';
import type { Conversation } from '@/types/schema';

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure no auto-redirect logic exists here
  
  // Auth
  const { user, isPending: isAuthPending } = useAuth();

  // Fetch Conversations
  const realQuery = isMockMode() ? null : useQuery('Conversation', { where: { participantIds: user?.id || '' } });
  const mockQuery = isMockMode() ? useMockQuery('Conversation', { where: { participantIds: user?.id || '' } }) : null;
  const { data: conversationsData, isPending } = (isMockMode() ? mockQuery : realQuery)!;
  const conversations = (conversationsData || []) as Conversation[];

  // Helper to get other participant details
  const getParticipant = (participantIds: string[]) => {
    const otherId = participantIds.find(id => id !== user?.id);
    if (!otherId) return { name: 'Unknown', avatar: '', username: 'unknown' };
    
    const found = MOCK_USERS.find(u => u.id === otherId);
    return found || { name: 'User', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png', username: 'user' };
  };

  const filteredConversations = conversations.filter(conv => {
    const participant = getParticipant(conv.participantIds);
    return participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           participant.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  if (isAuthPending) {
    return (
      <InstagramLayout hideBottomNav>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </InstagramLayout>
    );
  }

  if (!user) return null;

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
          {isPending ? (
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
                      src={participant.profilePictureUrl || "https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png"}
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
