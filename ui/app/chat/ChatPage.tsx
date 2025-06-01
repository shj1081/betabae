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
    id: number; 
    nickname: string;
    profileImageUrl?: string;
  };
  unreadCount: number;
  lastMessage?: {
    messageText: string;
    sentAt?: string;
  };
}

export default function ChatPage() {
  const [tab, setTab] = useState('All');
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const tabs = ['All', 'BetaBae', 'RealBae'];

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        const convs: ChatPartner[] = res.data.conversations;

        for (const conv of convs) {
          if (conv.chatPartner?.id && conv.chatPartner.id !== 0) {
            fetchUserProfile(conv.chatPartner.id);
          }
        }

        const sorted = convs.sort((a, b) => {
          const aTime = new Date(a.lastMessage?.sentAt || 0).getTime();
          const bTime = new Date(b.lastMessage?.sentAt || 0).getTime();
          return bTime - aTime;
        });

        setConversations(sorted);
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

  const fetchUserProfile = async (userId: number) => {
    if (userProfiles[userId]) return;
    try {
      const res = await api.get(`/user/info/${userId}`);
      const imageUrl = res.data.profile?.profile_image_url || '';
      setUserProfiles((prev) => ({ ...prev, [userId]: imageUrl }));
    } catch (err) {
      console.error(`❌ 사용자 ${userId} 프로필 이미지 불러오기 실패`, err);
    }
  };

  const filtered = conversations.filter((conv) => {
    if (tab === 'All') return true;
    if (tab === 'BetaBae') return conv.type === 'BETA_BAE';
    if (tab === 'RealBae') return conv.type === 'REAL_BAE';
    return true;
  });

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const ampm = hours < 12 ? 'AM' : 'PM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${year}-${month}-${day} ${ampm} ${hour12}:${minutes}`;
  };

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
                      : userProfiles[conv.chatPartner.id]
                      ? { uri: userProfiles[conv.chatPartner.id] }
                      : require('@/assets/images/example.jpg')
                  }
                  style={styles.avatar}
                  onError={() => console.warn('이미지 로드 실패:', conv.chatPartner.id)}
                />
                <View>
                  <Text style={styles.nickname}>{conv.chatPartner.nickname || '이름 없음'}</Text>
                  <Text style={styles.message} numberOfLines={1}>
                    {conv.lastMessage?.messageText || '...'}
                  </Text>
                </View>
              </View>

              <View style={styles.rightColumn}>
                <Text style={styles.time}>{formatTime(conv.lastMessage?.sentAt)}</Text>
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
