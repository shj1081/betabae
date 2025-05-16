import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';

interface Message {
  messageId: number;
  messageText: string;
  sender: { name: string };
  sentAt: string;
}

export default function ChatRoomPage() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [partnerName, setPartnerName] = useState('');
  const [myName, setMyName] = useState('You'); // 기본값을 'You'로

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`);
        const sortedMessages = res.data.messages.sort(
          (a: Message, b: Message) =>
            new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        setMessages(sortedMessages);

        const last = sortedMessages.at(-1);
        if (last?.sender.name !== 'You') {
          setPartnerName(last.sender.name);
        }
      } catch (err) {
        console.error('❌ 메시지 불러오기 실패:', err);
      }
    };

    fetchMessages();

    const socket = connectSocket();
    socket.emit('enter', { cid: Number(conversationId) });

    socket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.emit('leave', { cid: Number(conversationId) });
      socket.off('newMessage');
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendText = () => {
    if (!text.trim()) return;

    const newMessage: Message = {
      messageId: Date.now(),
      messageText: text,
      sender: { name: myName },
      sentAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);

    const socket = connectSocket();
    socket.emit('text', {
      cid: Number(conversationId),
      text,
    });

    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>{partnerName || 'Chat'}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((msg) => {
          const isMine = msg.sender.name === myName;
          return (
            <View
              key={msg.messageId}
              style={[styles.messageRow, isMine ? styles.myMessage : styles.theirMessage]}
            >
              {!isMine && <Text style={styles.nickname}>{msg.sender.name}</Text>}
              <View style={styles.bubble}>
                <Text style={styles.messageText}>{msg.messageText}</Text>
              </View>
              <Text style={styles.time}>
                {new Date(msg.sentAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendText}>
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: COLORS.BLACK,
  },
  messageList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageRow: {
    marginVertical: 10,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  nickname: {
    fontSize: 12,
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  bubble: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.BLACK,
  },
  time: {
    fontSize: 11,
    color: COLORS.DARK_GRAY,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    fontSize: 18,
    color: COLORS.BLACK,
    fontWeight: '700',
  },
});
