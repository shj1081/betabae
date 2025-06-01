import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import TalkButton from '@/components/TalkButton';
import COLORS from '@/constants/colors';
import BottomTabBar from '@/components/BottomTabBar';
import api from '@/lib/api';

interface MatchItem {
  id: number;
  requester: {
    id: number;
    legal_name: string;
    profile: {
      nickname: string;
    };
  };
  requested: {
    id: number;
    legal_name: string;
    profile: {
      nickname: string;
    };
  };
  status: string;
}

interface UserItem {
  matchId: number;
  nickname: string;
  avatar: any;
}

export default function ListPage() {
  const [matchList, setMatchList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const profileRes = await api.get('/user/profile');
        const myId = profileRes.data.profile.id;

        const res = await api.get('/match');
        const acceptedMatches: MatchItem[] = res.data.matches.filter(
          (match: MatchItem) => match.status === 'ACCEPTED'
        );

        const userItems: UserItem[] = acceptedMatches.map((match) => {
        const isRequester = match.requester.id === myId ? match.requested.id : match.requester.id;
        const otherUser = isRequester ? match.requested : match.requester;

        return {
          matchId: match.id,
          nickname: otherUser?.profile?.nickname || otherUser.legal_name,
          avatar: require('@/assets/images/black.png'),
        };
      });

        setMatchList(userItems);
      } catch (error) {
        console.error('❌ 매칭 목록 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleConsent = async (matchId: number) => {
    try {
      await api.post(`/match/${matchId}/real-bae/accept`, {
        consent: true,
      });
      Alert.alert('✅ Success', 'You have consented to the RealBae chat.');
    } catch (error: any) {
      console.error('❌ Consent failed:', error);
      Alert.alert('❌ Error', error.response?.data?.message || 'Something went wrong.');
    }
  };

  const renderItem = ({ item }: { item: UserItem }) => (
    <View style={styles.item}>
      <Image source={item.avatar} style={styles.avatar} />
      <Text style={styles.nickname}>{item.nickname}</Text>
      <TalkButton title="Consent" onPress={() => handleConsent(item.matchId)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.BLACK} />
      ) : (
        <FlatList
          data={matchList}
          keyExtractor={(item) => String(item.matchId)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 100 }}
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
    marginBottom: 50,
    color: COLORS.BLACK,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
  },
});
