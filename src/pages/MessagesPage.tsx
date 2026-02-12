import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { handleAvatarError } from '@/lib/utils';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@animaapp/playground-react-sdk';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { isMockMode } from '@/utils/mockMode';
import { supabase } from '@/lib/supabase';
import type { Message, UserProfile } from '@/types/schema';

// Derived conversation type for UI
type DerivedConversation = {
  id: string;
  participantId: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
};

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Auth
  const realAuth = isMockMode() ? null : useAuth();
  const mockAuth = isMockMode() ? useMockAuth() : null;
  const { user } = (isMockMode() ? mockAuth : realAuth)!;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || hasFetched.current) return;
      setIsLoading(true);
      
      // Fetch messages where sender_id = current OR receiver_id = current
      const { data: msgs, error } = await supabase
        .from('Message')
        .select('*')
        .or(`senderId.eq.${user.id},receiverId.eq.${user.id}`)
        .order('createdAt', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (msgs) {
        setMessages(msgs as Message[]);
        hasFetched.current = true;

        // Extract unique user IDs to fetch profiles
        const userIds = new Set<string>();
        msgs.forEach((m: Message) => {
          if (m.senderId !== user.id) userIds.add(m.senderId);
          if (m.receiverId !== user.id) userIds.add(m.receiverId);
        });
        
        if (userIds.size > 0) {
          const { data: profilesData } = await supabase
            .from('UserProfile')
            .select('*')
            .in('userId', Array.from(userIds));
            
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

    fetchMessages();

    // Realtime listener for new messages
    const channel = supabase
      .channel('realtime-messages-inbox')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only add if relevant to current user
          if (newMessage.senderId === user?.id || newMessage.receiverId === user?.id) {
            setMessages((prev) => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Derive conversations from messages
  const derivedConversations: DerivedConversation[] = [];
  const conversationMap = new Map<string, Message[]>();

  messages.forEach(msg => {
    // Group by conversationId if available, or fallback to partner ID logic
    // Assuming conversationId is reliable
    if (!conversationMap.has(msg.conversationId)) {
      conversationMap.set(msg.conversationId, []);
    }
    conversationMap.get(msg.conversationId)?.push(msg);
  });

  conversationMap.forEach((msgs, convId) => {
    // Sort messages by date (they should be already sorted by fetch, but good to be safe)
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const lastMsg = msgs[msgs.length - 1];
    
    // Determine the other participant
    // If I am sender, other is receiver. If I am receiver, other is sender.
    const otherId = lastMsg.senderId === user?.id ? lastMsg.receiverId : lastMsg.senderId;
    
    // Calculate unread count (messages I received that are not read)
    const unreadCount = msgs.filter(m => m.receiverId === user?.id && !m.read).length;

    if (otherId) {
      derivedConversations.push({
        id: convId,
        participantId: otherId,
        lastMessage: lastMsg.content || (lastMsg.type === 'image' ? 'Sent an image' : lastMsg.type === 'video' ? 'Sent a video' : 'Sent a message'),
        lastMessageAt: new Date(lastMsg.createdAt),
        unreadCount
      });
    }
  });

  // Sort conversations by last message time descending
  derivedConversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

  // Helper to get participant details
  const getParticipant = (userId: string) => {
    const profile = profiles[userId];
    if (profile) {
      return {
        name: profile.username || 'User',
        avatar: profile.profilePictureUrl || 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
        username: profile.username || 'user'
      };
    }
    return { name: 'User', avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png', username: 'user' };
  };

  const filteredConversations = derivedConversations.filter(conv => {
    const participant = getParticipant(conv.participantId);
    return participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           participant.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
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
          {isLoading && !hasFetched.current ? (
            <div className="p-4 text-center text-tertiary-foreground">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-tertiary-foreground">
              <p>No messages yet.</p>
              <p className="text-sm mt-2">Start a conversation from a profile.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const participant = getParticipant(conv.participantId);
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
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className={`text-body-sm truncate max-w-[90%] ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-tertiary-foreground'}`}>
                        {conv.lastMessage}
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
