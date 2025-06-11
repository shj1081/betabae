import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MatchingButton from '@/components/MatchingButton'; 
import BottomTabBar from '@/components/BottomTabBar';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import { Svg, Path } from 'react-native-svg';

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

  const [userProfiles, setUserProfiles] = useState<{ [key: number]: string }>({});


  useEffect(() => {
    const fetchUserAndMatches = async () => {
      try {
        const userRes = await api.get('/user/profile');
        const id = userRes.data.user?.id;
        setUserId(id);

        const pendingRes = await api.get('/match/received');
        const pending: MatchItem[] = pendingRes.data.matches;

        const acceptedRes = await api.get('/match');
        const acceptedFiltered: MatchItem[] = acceptedRes.data.matches.filter(
          (match: MatchItem) => {
            if (match.status !== 'ACCEPTED') return false;
            if (
              id === match.requester.id &&
              match.realBaeRequestedConsent &&
              !match.realBaeRequesterConsent
            ) {
              return true;
            }
            if (
              id === match.requested.id &&
              match.realBaeRequesterConsent &&
              !match.realBaeRequestedConsent
            ) {
              return true;
            }
            return false;
          }
        );

        const allMatches = [...pending, ...acceptedFiltered];
        setMatches(allMatches);
      } catch (err) {
        console.error('load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMatches();
  }, []);

  useEffect(() => {
    if (userId == null) return;

    const partnerIds: number[] = [];
    matches.forEach((item) => {
      if (item.status === 'PENDING') {
        partnerIds.push(item.requester.id);
      }
      if (item.status === 'ACCEPTED') {
        const isRequester = userId === item.requester.id;
        const isRequested = userId === item.requested.id;

        if (
          isRequester &&
          item.realBaeRequestedConsent &&
          !item.realBaeRequesterConsent
        ) {
          partnerIds.push(item.requested.id);
        }
        if (
          isRequested &&
          item.realBaeRequesterConsent &&
          !item.realBaeRequestedConsent
        ) {
          partnerIds.push(item.requester.id);
        }
      }
    });

    const uniquePartnerIds = Array.from(new Set(partnerIds));
    uniquePartnerIds.forEach((pid) => {
      if (!userProfiles[pid]) {
        fetchUserProfile(pid);
      }
    });
  }, [matches, userId]);

  const fetchUserProfile = async (uid: number) => {
    try {
      const res = await api.get(`/user/info/${uid}`);
      const profile = res.data.profile;
      const imageUrl: string = profile?.profile_image_url || '';
      setUserProfiles((prev) => ({ ...prev, [uid]: imageUrl }));
    } catch (err) {
      console.error(`❌ Failed to load profile for user ${uid}`, err);
      setUserProfiles((prev) => ({ ...prev, [uid]: '' }));
    }
  };

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

  const handleAcceptRealBae = async (matchId: number) => {
    try {
      setProcessingId(matchId);
      await api.post(`/match/${matchId}/real-bae/accept`);
      Alert.alert('Accepted', 'You accepted RealBae chat 💌');
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      console.error(`❌ Accept RealBae error:`, err);
      Alert.alert('Error', 'Failed to accept RealBae');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRealBae = async (matchId: number) => {
    try {
      setProcessingId(matchId);
      await api.post(`/match/${matchId}/real-bae/reject`);
      Alert.alert('Rejected', 'You rejected RealBae chat 💔');
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      console.error(`❌ Reject RealBae error:`, err);
      Alert.alert('Error', 'Failed to reject RealBae');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }: { item: MatchItem }) => {
    let message = '';
    let partnerId: number | null = null;
    let isRealBaeRequest = false;

    if (item.status === 'PENDING') {
      message = `${item.requester.nickname} sent matching request.`;
      partnerId = item.requester.id;
    } else if (item.status === 'ACCEPTED' && userId !== null) {
      const isRequester = userId === item.requester.id;
      const isRequested = userId === item.requested.id;

      const needsRealBaeFromRequester =
        isRequester && item.realBaeRequestedConsent && !item.realBaeRequesterConsent;
      const needsRealBaeFromRequested =
        isRequested && item.realBaeRequesterConsent && !item.realBaeRequestedConsent;

      if (needsRealBaeFromRequester || needsRealBaeFromRequested) {
        const otherNickname = isRequester ? item.requested.nickname : item.requester.nickname;
        message = `${otherNickname} is wanting RealBae Chat 💌`;
        partnerId = isRequester ? item.requested.id : item.requester.id;
        isRealBaeRequest = true;
      }
    }

    const profileUrl = partnerId != null ? userProfiles[partnerId] : '';
    const hasProfile = Boolean(profileUrl && profileUrl.length > 0);

    return (
      <View style={styles.notification}>
        {hasProfile ? (
          <Image source={{ uri: profileUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}

        <View style={styles.textSection}>
          <Text style={styles.message} numberOfLines={1} ellipsizeMode="tail">
            {message}
          </Text>
        </View>

        {!isRealBaeRequest && item.status === 'PENDING' && (
          <MatchingButton
            onAccept={() => handleDecision(item.id, 'accept')}
            onReject={() => handleDecision(item.id, 'reject')}
            disabled={processingId === item.id}
            style={{ marginLeft: 12 }}
          />
        )}

        {isRealBaeRequest && (
          <MatchingButton
            onAccept={() => handleAcceptRealBae(item.id)}
            onReject={() => handleRejectRealBae(item.id)}
            disabled={processingId === item.id}
            style={{ marginLeft: 12 }}
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
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <Svg width={96} height={96} viewBox="0 0 256 256" fill="none">
                <Path
                  d="M12,2c-0.828,0 -1.5,0.672 -1.5,1.5v0.69531c-2.58682,0.66678 -4.5,3.00949 -4.5,5.80469v6l-1.53516,1.15625h-0.00195c-0.28839,0.18363 -0.46297,0.50186 -0.46289,0.84375c0,0.55228 0.44772,1 1,1h7h7c0.55228,0 1,-0.44772 1,-1c0.00008,-0.34189 -0.17451,-0.66012 -0.46289,-0.84375l-1.53711,-1.15625v-6c0,-2.7952 -1.91318,-5.1379 -4.5,-5.80469v-0.69531c0,-0.828 -0.672,-1.5 -1.5,-1.5zM10,20c0,1.1 0.9,2 2,2c1.1,0 2,-0.9 2,-2z"
                  fill="#EBEBEB"
                  transform="scale(10.66667)"
                />
              </Svg>
              <Text style={styles.emptyText}>There are no new notifications.</Text>
            </View>
          }
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    paddingVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.DARK_GRAY,
  },
  textSection: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  message: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 24,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
    textAlign: 'center',
  },

});
