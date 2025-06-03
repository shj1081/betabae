import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import BottomTabBar from '@/components/BottomTabBar';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import ListFilterTab from '@/components/ListFilterTab';
import TalkButton from '@/components/TalkButton';

interface MatchItem {
  id: number;
  requester: {
    id: number;
    legal_name: string;
    nickname: string;
  };
  requested: {
    id: number;
    legal_name: string;
    nickname: string;
  };
  status: string;
  requesterConsent: boolean;
  requestedConsent: boolean;
  realBaeRequesterConsent: boolean;
  realBaeRequestedConsent: boolean;
}

interface UserProfile {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export default function ListPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'liked' | 'likedMe'>('liked');
  const [userProfiles, setUserProfiles] = useState<{ [key: number]: UserProfile }>({});

  useEffect(() => {
    const fetchUserAndMatches = async () => {
      try {
        const userRes = await api.get('/user/profile');
        const id = userRes.data.user?.id ?? null;
        setUserId(id);

        const matchRes = await api.get('/match');
        setMatches(matchRes.data.matches);
      } catch (err) {
        console.error('❌ 매칭 정보 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndMatches();
  }, []);

  const fetchUserProfile = async (uid: number) => {
    if (userProfiles[uid]) return;

    try {
      const res = await api.get(`/user/info/${uid}`);
      const profile = res.data.profile;
      setUserProfiles((prev) => ({
        ...prev,
        [uid]: {
          id: uid,
          nickname: res.data.nickname,
          profileImageUrl: profile?.profile_image_url || '',
        },
      }));
    } catch (err) {
      console.error(`❌ Failed to load profile for user ${uid}`, err);
    }
  };

  useEffect(() => {
    if (userId === null) return;
    const allUserIds = matches.flatMap((m) => [m.requester.id, m.requested.id]);
    const uniqueIds = Array.from(new Set(allUserIds));
    uniqueIds.forEach((uid) => fetchUserProfile(uid));
  }, [matches, userId]);

  const handleAcceptRealBae = async (matchId: number) => {
    try {
      await api.post(`/match/${matchId}/real-bae/accept`);
      Alert.alert('Accepted', 'You accepted RealBae chat 💌');
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      console.error(`❌ Accept error:`, err);
      Alert.alert('Error', 'Failed to accept RealBae');
    }
  };

  const filteredMatches = matches.filter((match) => {
    if (selectedTab === 'liked' && userId !== null) {
      return match.requester.id === userId;
    } else if (selectedTab === 'likedMe' && userId !== null) {
      return match.requested.id === userId;
    }
    return false;
  });

  const renderItem = ({ item }: { item: MatchItem }) => {
    const isRequester = selectedTab === 'liked';
    const targetUser = isRequester ? item.requested : item.requester;
    const profile = userProfiles[targetUser.id];
    const statusUpper = item.status.toUpperCase().trim();

    if (statusUpper === 'REJECTED') {
      return (
        <View style={styles.notificationRow}>
          <View style={styles.userSection}>
            {profile?.profileImageUrl ? (
              <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <Text style={styles.message}>{targetUser.nickname}</Text>
          </View>
          <View style={styles.statusBadgeRejected}>
            <Text style={styles.statusTextRejected}>Rejected</Text>
          </View>
        </View>
      );
    }

    if (statusUpper === 'PENDING') {
      return (
        <View style={styles.notificationRow}>
          <View style={styles.userSection}>
            {profile?.profileImageUrl ? (
              <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <Text style={styles.message}>{targetUser.nickname}</Text>
          </View>
          <View style={styles.statusBadgeWaiting}>
            <Text style={styles.statusTextWaiting}>Waiting</Text>
          </View>
        </View>
      );
    }

    if (statusUpper === 'ACCEPTED') {
      if (item.realBaeRequesterConsent && item.realBaeRequestedConsent) {
        return (
          <View style={styles.notificationRow}>
            <View style={styles.userSection}>
              {profile?.profileImageUrl ? (
                <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
              <Text style={styles.message}>{targetUser.nickname}</Text>
            </View>
            <View style={styles.statusBadgeMatched}>
              <Text style={styles.statusTextMatched}>Matched</Text>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.notificationRow}>
          <View style={styles.userSection}>
            {profile?.profileImageUrl ? (
              <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <Text style={styles.message}>{targetUser.nickname}</Text>
          </View>
          <TalkButton
            title="Talk with RealBae"
            onPress={() => handleAcceptRealBae(item.id)}
            style={{ marginLeft: 'auto' }}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List</Text>
      <ListFilterTab selected={selectedTab} onSelect={setSelectedTab} />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
        />
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
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 22,
    color: COLORS.BLACK,
  },
  list: {
    paddingBottom: 80,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    paddingVertical: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  message: {
    fontSize: 18,
    color: COLORS.BLACK,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
  },
  statusBadgeRejected: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.MAIN,
  },
  statusTextRejected: {
    color: COLORS.MAIN,
    fontWeight: '600',
  },
  statusBadgeWaiting: {
    backgroundColor: COLORS.LIGHT_GRAY, 
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusTextWaiting: {
    color: '#fff',
    fontWeight: '600',
  },
  statusBadgeMatched: {
    backgroundColor: COLORS.LIGHT_GRAY, 
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusTextMatched: {
    color: '#fff',
    fontWeight: '600',
  },
});
