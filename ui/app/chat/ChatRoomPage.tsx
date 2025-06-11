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
  Image,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';
import { useChatStore } from '@/store/chatStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Message {
  messageId: number;
  messageText: string;
  sender: { id: number; name: string };
  sentAt: string;
}

export default function ChatRoomPage() {
  const { conversationId, resetConversationId } = useChatStore();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [partnerName, setPartnerName] = useState('');
  const [myName, setMyName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfiles, setUserProfiles] = useState<
    Record<number, { nickname: string; profileImageUrl: string }>
  >({});

  useEffect(() => {
    const restoreId = async () => {
      if (!conversationId) {
        const lastId = await AsyncStorage.getItem('lastConversationId');
        if (lastId) {
          useChatStore.getState().setConversationId(lastId);
        } else {
          router.replace('/chat'); 
        }
      }
    };
    restoreId();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`);
        const meName = res.data.me?.name;
        setMyName(meName || '');

        const sortedMessages = res.data.messages.sort(
          (a: Message, b: Message) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(sortedMessages);

        const senderIds = [...new Set(sortedMessages.map((m: Message) => m.sender.id))];
        senderIds.forEach(fetchUserProfile);

        const other = sortedMessages.find((msg) => msg.sender.name !== meName);
        if (other) setPartnerName(other.sender.name);
      } catch (err) {
        console.error('❌ 메시지 불러오기 실패:', err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const socket = connectSocket();
    socket.emit('enter', { cid: Number(conversationId) });

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.messageId === msg.messageId)) return prev;
        if (msg.sender.id === userId) return prev;
        return [...prev, msg];
      });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.emit('leave', { cid: Number(conversationId) });
      socket.off('newMessage', handleNewMessage);
    };
  }, [conversationId, userId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/profile');
        setUserId(res.data.user?.id);
      } catch (err) {
        console.error('❌ 유저 정보 불러오기 실패:', err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };

  const sendText = () => {
    if (!text.trim() || !conversationId) return;

    const newMessage: Message = {
      messageId: Date.now(),
      messageText: text,
      sender: { id: userId || -1, name: myName },
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    const socket = connectSocket();
    socket.emit('text', {
      cid: Number(conversationId),
      text,
    });

    setText('');
  };

  const fetchUserProfile = async (uid: number) => {
    if (userProfiles[uid]) return;
    try {
      const res = await api.get(`/user/info/${uid}`);
      const profile = res.data.profile;
      setUserProfiles((prev) => ({
        ...prev,
        [uid]: {
          nickname: res.data.nickname,
          profileImageUrl: profile?.profile_image_url || '',
        },
      }));
    } catch (err) {
      console.error(`❌ 프로필 로드 실패 (ID: ${uid}):`, err);
    }
  };

  const handleBack = async () => {
    resetConversationId();
    await AsyncStorage.removeItem('lastConversationId');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >

      <BackButton onPress={handleBack} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((msg) => {
          const isMine = msg.sender.id === userId;
          const profile = userProfiles[msg.sender.id];
          return (
            <View
              key={msg.messageId}
              style={[
                styles.messageRow,
                isMine ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {!isMine && (
                <View style={styles.profileSection}>
                  <Image
                    source={
                      msg.sender.id === 0
                        ? require('@/assets/images/beta.png')
                        : profile?.profileImageUrl
                        ? { uri: profile.profileImageUrl }
                        : require('@/assets/images/example.jpg')
                    }
                    style={styles.avatar}
                  />
                </View>
              )}
              <View>
                {!isMine && (
                  <Text style={styles.nickname}>
                    {profile?.nickname || msg.sender.name}
                  </Text>
                )}
                <View style={styles.bubble}>
                  <Text style={styles.messageText}>{msg.messageText}</Text>
                </View>
                <Text style={styles.time}>
                  {new Date(msg.sentAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.iconButton}>
          <Svg width={24} height={24} viewBox="0 -960 960 960" fill="#696969">
            <Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
          </Svg>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity style={[styles.iconButton, styles.sendButton]} onPress={sendText}>
          <Svg width={24} height={24} viewBox="0 -960 960 960" fill="#fff">
            <Path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
          </Svg>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  messageList: { paddingHorizontal: 20, paddingBottom: 20 },
  messageRow: { marginVertical: 10, maxWidth: '75%', flexDirection: 'row' },
  myMessage: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  theirMessage: { alignSelf: 'flex-start' },
  profileSection: { marginRight: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.GRAY,
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: 6,
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: COLORS.BLACK,
  },
});
