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
import { useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';

interface Message {
  messageId: number;
  messageText: string;
  sender: { id: number; name: string };
  sentAt: string;
}

export default function ChatRoomPage() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [partnerName, setPartnerName] = useState('');
  const [myName, setMyName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfiles, setUserProfiles] = useState<
    Record<number, { nickname: string; profileImageUrl: string }>
  >({});

  // 1) 대화 내역 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`);
        const meName = res.data.me?.name;
        setMyName(meName || '');

        const sortedMessages = res.data.messages.sort(
          (a: Message, b: Message) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(sortedMessages);

        // 보낸 사람 프로필 미리 로드
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

  // 2) WebSocket 설정 (새 메시지 수신)
  useEffect(() => {
    const socket = connectSocket();
    socket.emit('enter', { cid: Number(conversationId) });

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => {
        // 이미 있는 메시지라면 무시
        if (prev.some((m) => m.messageId === msg.messageId)) {
          return prev;
        }
        // 내가 보낸 메시지는 다시 추가하지 않음
        if (msg.sender.id === userId) {
          return prev;
        }
        return [...prev, msg];
      });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.emit('leave', { cid: Number(conversationId) });
      socket.off('newMessage', handleNewMessage);
    };
  }, [conversationId, userId]);

  // 3) 내 프로필(아이디) 가져오기
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

  // 4) 메시지 목록 변경 시 스크롤 맨 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };

  // 5) 텍스트 메시지 전송
  const sendText = () => {
    if (!text.trim()) return;

    const newMessage: Message = {
      messageId: Date.now(),
      messageText: text,
      sender: { id: userId || -1, name: myName },
      sentAt: new Date().toISOString(),
    };

    // 로컬 화면에 즉시 추가
    setMessages((prev) => [...prev, newMessage]);

    // 서버로 소켓 이벤트 전송
    const socket = connectSocket();
    socket.emit('text', {
      cid: Number(conversationId),
      text,
    });

    setText('');
  };

  // 6) 이미지 메시지 전송
  const sendImage = async () => {
    try {
      // 이미지 라이브러리 권한 요청
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('사진 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = uri.split('/').pop()!;
      const match = /\.(\w+)$/.exec(fileName);
      const fileExt = match?.[1]?.toLowerCase();

      // MIME 타입 결정
      let mimeType = 'image/*';
      if (fileExt === 'jpg' || fileExt === 'jpeg') {
        mimeType = 'image/jpeg';
      } else if (fileExt === 'png') {
        mimeType = 'image/png';
      } else if (fileExt === 'heic') {
        mimeType = 'image/heic';
      }

      // FormData 생성 (conversationId를 숫자 → 문자열로 변환)
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: mimeType,
      } as any);
      formData.append('messageText', '');

      // 실제 API 호출
      await api.post(
        `/chat/conversations/${conversationId}/messages/image`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('✅ 이미지 전송 완료');
      // (참고: 서버가 WebSocket을 통해 브로드캐스트하면, handleNewMessage 로직에서 목록이 갱신됩니다.)
    } catch (err: any) {
      console.error('❌ 이미지 전송 실패:', err.response?.data || err.message);
    }
  };

  // 7) 유저 프로필 정보 가져오기 (닉네임, 프로필 URL)
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* 상단 뒤로가기 버튼 */}
      <BackButton />

      {/* ──── 메시지 리스트 ──── */}
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

      {/* ──── 하단 입력창 ──── */}
      <View style={styles.inputRow}>
        {/* 📷 이미지 업로드 버튼 */}
        <TouchableOpacity style={styles.iconButton} onPress={sendImage}>
          <Svg width={24} height={24} viewBox="0 -960 960 960" fill="#696969">
            <Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
          </Svg>
        </TouchableOpacity>

        {/* 💬 텍스트 입력창 */}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
        />

        {/* ▶️ 텍스트 전송 버튼 */}
        <TouchableOpacity style={[styles.iconButton, styles.sendButton]} onPress={sendText}>
          <Svg width={24} height={24} viewBox="0 -960 960 960" fill="#fff">
            <Path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
          </Svg>
        </TouchableOpacity>

        {/*
          분 석 버튼 완 전 제 거
          ─────────────────
          원래 여기에 세 번째 아이콘(분석용)이 있었는데,
          요청에 따라 아예 없앴습니다.
        */}
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
