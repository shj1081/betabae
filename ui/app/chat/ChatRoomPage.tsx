import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';
import PopupWindow from '@/components/PopupWindow';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';
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
  const [userProfiles, setUserProfiles] = useState<Record<number, { nickname: string; profileImageUrl: string }>>({});
  const [pressedMessageId, setPressedMessageId] = useState<number | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

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

        const senderIds = [...new Set(sortedMessages.map((m) => m.sender.id))];
        senderIds.forEach(fetchUserProfile);
      } catch (err) {
        console.error('❌ 메시지 불러오기 실패:', err);
      }
    };
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    const socket = connectSocket();
    if (!conversationId) return;
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

  useEffect(() => {
    if (!userId) return;
    const other = messages.find((msg) => msg.sender.id !== userId);
    if (other) {
      const profile = userProfiles[other.sender.id];
      setPartnerName(profile?.nickname || other.sender.name);
    }
  }, [messages, userId, userProfiles]);

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
    socket.emit('text', { cid: Number(conversationId), text });
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

const handleHeartClick = async (messageText: string) => {
  if (!conversationId) return;
  const payload = {
    chatId: Number(conversationId),
    messageText,
  };
  console.log('request payload:', payload);
  try {
    const res = await api.post('/llm-clone/real-bae-thought', payload);
    setAnalysisResult(res.data.response);
    setIsAnalysisVisible(true);
  } catch (err) {
    console.error('Error:', err);
    setAnalysisResult('Analyze error');
    setIsAnalysisVisible(true);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.headerRow}>
        <BackButton onPress={handleBack} />
        <View style={styles.headerCenter}>
          <Text style={styles.partnerName}>{partnerName}</Text>
        </View>
        <TouchableOpacity style={styles.questionButton} onPress={() => setIsGuideVisible(true)}>
          <Text style={styles.questionMark}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.messageList} onContentSizeChange={scrollToBottom}>
        {messages.map((msg) => {
          const isMine = msg.sender.id === userId;
          const profile = userProfiles[msg.sender.id];
          const isHovered = hoveredMessageId === msg.messageId;

          return (
            <View
              key={msg.messageId}
              style={[styles.messageRow, isMine ? styles.myMessage : styles.theirMessage]}
              onMouseEnter={() => setHoveredMessageId(msg.messageId)}
              onMouseLeave={() => setHoveredMessageId(null)}
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

              <View style={styles.messageContainer}>
                {!isMine && <Text style={styles.nickname}>{profile?.nickname || msg.sender.name}</Text>}

                <View style={styles.bubbleRow}>
                  <Pressable
                    onPressIn={() => setPressedMessageId(msg.messageId)}
                    onPressOut={() => setPressedMessageId(null)}
                    style={[styles.bubble, pressedMessageId === msg.messageId && styles.pressedMessage]}
                  >
                    <Text style={styles.messageText}>{msg.messageText}</Text>
                  </Pressable>

                  {isHovered && !isMine && (
                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={() => handleHeartClick(msg.messageText)}
                    >
                      <Text style={{ fontSize: 12 }}>❤️</Text>
                    </TouchableOpacity>
                  )}
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
          placeholder="Enter a message..."
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity style={[styles.iconButton, styles.sendButton]} onPress={sendText}>
          <Svg width={24} height={24} viewBox="0 -960 960 960" fill="#fff">
            <Path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
          </Svg>
        </TouchableOpacity>
      </View>

      <PopupWindow
        visible={isGuideVisible}
        title="What is RealBae Thinking?"
        message="Go to the chat you want and press the heart button."
        onCancel={() => setIsGuideVisible(false)}
        onConfirm={() => setIsGuideVisible(false)}
      />

      <PopupWindow
        visible={isAnalysisVisible}
        title="What is RealBae Thinking?"
        message={analysisResult}
        onCancel={() => setIsAnalysisVisible(false)}
        onConfirm={() => setIsAnalysisVisible(false)}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  partnerName: { fontSize: 18, fontWeight: 'bold', color: COLORS.BLACK },
  questionButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: { fontSize: 20, color: COLORS.DARK_GRAY, fontWeight: '600' },
  messageList: { paddingHorizontal: 20, paddingBottom: 20 },
  messageRow: { marginVertical: 10, maxWidth: '75%', flexDirection: 'row' },
  myMessage: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  theirMessage: { alignSelf: 'flex-start' },
  profileSection: { marginRight: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  nickname: { fontSize: 12, color: COLORS.BLACK, marginBottom: 4 },
  bubble: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleWithHeart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heartButton: {
    marginTop: 12,
    marginLeft: 0,
    padding: 4,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 20,
  },
  pressedMessage: { backgroundColor: '#C9C9C9' },
  messageText: { fontSize: 15, color: COLORS.BLACK },
  time: { fontSize: 11, color: COLORS.DARK_GRAY, marginTop: 4, marginLeft: 5 },
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
  sendButton: { backgroundColor: COLORS.BLACK },
    messageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
