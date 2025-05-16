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
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export default function AlarmPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/match/received');
        setMatches(res.data.matches);
      } catch (err) {
        console.error('fail to alarm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
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

  const renderItem = ({ item }: { item: MatchItem }) => (
    <View style={styles.notification}>
      <Image source={require('@/assets/images/example.jpg')} style={styles.avatar} />
      <View style={styles.textSection}>
        <Text style={styles.message}>{item.requester.legal_name}님이 매칭 요청을 보냈습니다.</Text>
        <Text style={styles.time}>방금 전</Text>
      </View>
      <MatchingButton
        onAccept={() => handleDecision(item.id, 'accept')}
        onReject={() => handleDecision(item.id, 'reject')}
        disabled={processingId === item.id}
      />
    </View>
  );

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
    marginBottom: 20,
    color: COLORS.BLACK,
  },
  list: {
    paddingBottom: 80,
  },
  notification: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 10,
  },
  textSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  message: {
    fontSize: 16,
    color: COLORS.BLACK,
    flex: 1,
  },
  time: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 16,
  },
});
