import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import ChatFilterTab from '@/components/ChatFilterTab';
import BottomTabBar from '@/components/BottomTabBar';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';
import api from '@/lib/api';
import { connectSocket } from '@/lib/socket';

interface ChatPartner {
  conversationId: string;
  type: 'BETA_BAE' | 'REAL_BAE';
  chatPartner: {
    nickname: string;
    profileImageUrl?: string;
  };
  unreadCount: number;
  lastMessage?: {
    messageText: string;
  };
  lastMessageTime?: string;
}

export default function ChatPage() {
  const [tab, setTab] = useState('All');
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const tabs = ['All', 'BetaBae', 'RealBae'];

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        console.log('📦 conversations:', res.data.conversations);
        setConversations(res.data.conversations);
      } catch (err) {
        console.error('❌ 채팅 목록 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const socket = connectSocket();
    socket.on('chatListUpdate', (data: { conversations: ChatPartner[] }) => {
      setConversations(data.conversations);
    });

    return () => {
      socket.off('chatListUpdate');
    };
  }, []);

  const filtered = conversations.filter((conv) => {
    if (tab === 'All') return true;
    if (tab === 'BetaBae') return conv.type === 'BETA_BAE';
    if (tab === 'RealBae') return conv.type === 'REAL_BAE';
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <ChatFilterTab tabs={tabs} selectedTab={tab} onTabChange={setTab} />
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filtered.map((conv) => (
            <TouchableOpacity
              key={conv.conversationId}
              style={styles.chatCard}
              onPress={() => router.push(`/chat/chatroom/${conv.conversationId}`)}
            >
              <View style={styles.leftRow}>
                <Image
                  source={
                    conv.type === 'BETA_BAE'
                      ? require('@/assets/images/beta.png')
                      : conv.chatPartner.profileImageUrl && typeof conv.chatPartner.profileImageUrl === 'string'
                      ? { uri: conv.chatPartner.profileImageUrl }
                      : require('@/assets/images/example.jpg')
                  }
                  style={styles.avatar}
                  onError={() => console.warn('이미지 로드 실패:', conv.chatPartner.profileImageUrl)}
                />
                <View>
                  <Text style={styles.nickname}>{conv.chatPartner.nickname || '이름 없음'}</Text>
                  <Text style={styles.message} numberOfLines={1}>
                    {conv.lastMessage?.messageText || '...'}
                  </Text>
                </View>
              </View>

              <View style={styles.rightColumn}>
                <Text style={styles.time}>{conv.lastMessageTime || 'PM 3:30'}</Text>
                {conv.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{conv.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: 60,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 22,
    marginBottom: 20,
    color: COLORS.BLACK,
  },
  chatCard: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: COLORS.GRAY,
  },
  nickname: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  message: {
    fontSize: 13,
    color: COLORS.DARK_GRAY,
    marginTop: 3,
    maxWidth: 200,
  },
  time: {
    fontSize: 12,
    color: COLORS.DARK_GRAY,
    marginBottom: 6,
  },
  badge: {
    backgroundColor: COLORS.SUB,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
