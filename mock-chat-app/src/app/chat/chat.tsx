'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { client } from '@/lib/api';
import { connectSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Conversation {
  conversationId: string;
  chatPartner: {
    nickname: string;
  };
  unreadCount: number;
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await client.get('/chat/conversations');
        setConversations(res.data.conversations);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    const socket = connectSocket();
    socket.on('chatListUpdate', data => {
      setConversations(data.conversations);
    });

    return () => {
      socket.off('chatListUpdate');
    };
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat Conversations</h1>
      {conversations.map(conv => (
        <Card
          key={conv.conversationId}
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => router.push(`/chat/${conv.conversationId}`)}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-lg">{conv.chatPartner.nickname}</div>
            {conv.unreadCount > 0 && (
              <Badge variant="destructive">{conv.unreadCount}</Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

