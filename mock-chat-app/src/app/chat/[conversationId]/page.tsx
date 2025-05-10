'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { client } from '@/lib/api';
import { connectSocket } from '@/lib/socket';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Message {
  messageId: number;
  messageText: string;
  sender: {
    name: string;
  };
  attachment?: {
    url: string;
  };
}

export default function ChatRoomPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await client.get(`/chat/conversations/${conversationId}/messages`);
        setMessages(res.data.messages);

        // 마지막 메시지에서 상대 이름 가져오기
        const last = res.data.messages.at(-1);
        if (last?.sender.name !== 'You') {
          setPartnerName(last.sender.name);
        }

        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();

    const socket = connectSocket();
    socket.emit('enter', { cid: Number(conversationId) });
    socket.on('newMessage', msg => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.emit('leave', { cid: Number(conversationId) });
      socket.off('newMessage');
    };
  }, [conversationId]);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendText = () => {
    if (!text.trim()) return;
    setSending(true);

    const socket = connectSocket();
    socket.emit('text', {
      cid: Number(conversationId),
      text,
    });

    setText('');
    setSending(false);
  };

  const sendImage = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('messageText', '');
      await client.post(`/chat/conversations/${conversationId}/messages/image`, formData);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to send image:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <header className="p-4 border-b text-lg font-semibold">{partnerName || 'Chat'}</header>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map(msg => (
          <div
            key={msg.messageId}
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender.name === 'You'
                ? 'ml-auto bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            {msg.attachment?.url ? (
              <img src={msg.attachment.url} alt="image" className="max-w-full rounded-md" />
            ) : (
              <p className="whitespace-pre-line">{msg.messageText}</p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t flex gap-2 items-center">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={sendImage}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </Button>
        <Button onClick={sendText} disabled={sending || !text.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}

