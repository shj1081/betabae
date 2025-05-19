import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Alert, ActivityIndicator } from 'react-native';
import MatchingButton from '@/components/MatchingButton';
import BottomTabBar from '@/components/BottomTabBar';
import COLORS from '@/constants/colors';
import api from '@/lib/api';

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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  realBaeRequesterConsent: boolean;
  realBaeRequestedConsent: boolean;
}

export default function AlarmPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAndMatches = async () => {
      try {
        const userRes = await api.get('/user/profile');
        const id = userRes.data.user?.id;
        setUserId(id);
        console.log('user id:', id);

        const pendingRes = await api.get('/match/received');
        const acceptedRes = await api.get('/match');

        const pending = pendingRes.data.matches;

        const acceptedFiltered = acceptedRes.data.matches.filter((match: MatchItem) => {
          if (match.status !== 'ACCEPTED') return false;
          if (id === match.requester.id && match.realBaeRequestedConsent && !match.realBaeRequesterConsent) return true;
          if (id === match.requested.id && match.realBaeRequesterConsent && !match.realBaeRequestedConsent) return true;
          return false;
        });

        setMatches([...pending, ...acceptedFiltered]);
      } catch (err) {
        console.error('load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMatches();
  }, []);

  const handleDecision = async (matchId: number, action: 'accept' | 'reject') => {
    try {
      setProcessingId(matchId);
      await api.post(`/match/${matchId}/${action}`);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err: any) {
      console.error(`❌ Match ${action} error:`, err);
      Alert.alert('Error', err.response?.data?.message || 'fail');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }: { item: MatchItem }) => {
    let message = '';

    if (item.status === 'PENDING') {
      message = `${item.requester.nickname} sent matching request.`;
    } else if (item.status === 'ACCEPTED' && userId !== null) {
      const isRequester = userId === item.requester.id;
      const isRequested = userId === item.requested.id;

      if (
        (isRequester && item.realBaeRequestedConsent && !item.realBaeRequesterConsent) ||
        (isRequested && item.realBaeRequesterConsent && !item.realBaeRequestedConsent)
      ) {
        message = `${isRequester ? item.requested.nickname : item.requester.nickname} is wanting RealBae Chat💌.`;
      }
    }

    return (
      <View style={styles.notification}>
        <Image source={require('@/assets/images/black.png')} style={styles.avatar} />
        <View style={styles.textSection}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.time}>just a moment ago</Text>
        </View>
        {item.status === 'PENDING' && (
          <MatchingButton
            onAccept={() => handleDecision(item.id, 'accept')}
            onReject={() => handleDecision(item.id, 'reject')}
            disabled={processingId === item.id}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={matches}
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
    marginBottom: 50,
    color: COLORS.BLACK,
  },
  list: {
    paddingBottom: 80,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    paddingVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginBottom: 10,
  },
  textSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginLeft: 20,
  },
  message: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  time: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    marginLeft: 600,
    marginRight: 100,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
  },
});
