import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import ResultBar from '@/components/ResultBar';
import LikabilityBar from '@/components/LikabilityBar';
import { useMatchStore } from '@/store/matchStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const getAge = (birthday: string) => {
  const birth = new Date(birthday);
  const today = new Date();
  return today.getFullYear() - birth.getFullYear();
};

const formatLoveLangKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getSortedLoveLanguages = (loveLanguage: Record<string, any>) => {
  const keysToInclude = [
    'words_of_affirmation',
    'acts_of_service',
    'receiving_gifts',
    'quality_time',
    'physical_touch',
  ];

  const arr = keysToInclude.map((key) => ({
    key,
    value: typeof loveLanguage[key] === 'number' ? loveLanguage[key] : 0,
  }));

  return arr.sort((a, b) => b.value - a.value);
};

export default function UserProfileDetailPage() {
  const { selectedUserId, setSelectedUserId, resetSelectedUserId } = useMatchStore();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const restoreId = async () => {
      if (!selectedUserId) {
        const saved = await AsyncStorage.getItem('lastMatchUserId');
        if (saved) setSelectedUserId(Number(saved));
        else router.replace('/match/MatchingPage');
      }
    };
    restoreId();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    const fetchDetails = async () => {
      try {
        const userRes = await api.get(`/user/info/${selectedUserId}`);
        setUserInfo(userRes.data);

        const feedRes = await api.get('/feed');
        const matched = feedRes.data.users.find((u: any) => u.id === Number(selectedUserId));
        setScore(matched?.compatibilityScore ?? 0);
      } catch (err) {
        console.error('❌ Load error:', err.response?.data || err.message);
        Alert.alert('Error', 'Load error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedUserId]);

  const handleBack = async () => {
    resetSelectedUserId();
    await AsyncStorage.removeItem('lastMatchUserId');
    router.back();
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={COLORS.PRIMARY}
      />
    );
  }
  if (!userInfo) {
    return <Text style={{ marginTop: 100, textAlign: 'center' }}>Can't find user</Text>;
  }

  const { profile, personality, loveLanguage } = userInfo;
  const sortedLoveLangArr = getSortedLoveLanguages(loveLanguage);

  return (
    <ScrollView style={styles.container}>
      <BackButton onPress={handleBack} />

      <Text style={styles.helloText}>👋 Hello, I am ...</Text>

      <Image source={{ uri: profile.profile_image_url }} style={styles.image} />

      <View style={styles.header}>
        <Text style={styles.nickname}>
          {profile.nickname} ({getAge(profile.birthday)})
        </Text>
        <Text style={styles.location}>
          📍 {profile.province}, {profile.city}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subTitle}>Interests</Text>
        <View style={styles.tagRow}>
          {profile.interests.map((tag: string, idx: number) => (
            <View style={styles.tag} key={idx}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subTitle}>MBTI</Text>
        <Text style={styles.mbtiText}>{profile.mbti}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subTitle}>5 Personality</Text>
        <ResultBar
          leftLabel="Openness"
          rightLabel="Conservativity"
          percentage={personality.openness}
          color="#EB7B6D"
        />
        <ResultBar
          leftLabel="Conscientiousness"
          rightLabel="Impulsiveness"
          percentage={personality.conscientiousness}
          color="#E5A96F"
        />
        <ResultBar
          leftLabel="Extraversion"
          rightLabel="Introversion"
          percentage={personality.extraversion}
          color="#5D997E"
        />
        <ResultBar
          leftLabel="Agreeableness"
          rightLabel="Hostility"
          percentage={personality.agreeableness}
          color="#1C274C"
        />
        <ResultBar
          leftLabel="Neuroticism"
          rightLabel="Stability"
          percentage={personality.neuroticism}
          color="#8C5A5A"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.subTitle}>Love Language</Text>
        {sortedLoveLangArr.map((item, idx) => (
          <Text key={item.key} style={styles.infoText}>
            {idx + 1}. {formatLoveLangKey(item.key)}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subTitle}>Self Introduction</Text>
        <View style={styles.introBox}>
          <Text style={styles.introText}>
            {profile.introduce || '...'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subTitle}>Compatibility Score</Text>
        <LikabilityBar percent={score} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  helloText: { fontSize: 24, fontWeight: '600', marginVertical: 20, marginHorizontal: 22 },
  image: { width: '100%', height: 700, resizeMode: 'cover' },
  header: {
    padding: 16,
    marginHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  nickname: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  location: { fontSize: 16, color: COLORS.DARK_GRAY, marginVertical: 10 },

  section: { marginTop: 50, marginHorizontal: 40 },
  subTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  infoText: { fontSize: 14, color: COLORS.BLACK, marginBottom: 8 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    paddingHorizontal: 16,  
    paddingVertical: 8,
    marginRight: 10,
    marginTop: 10,
  },
  tagText: { fontSize: 16, color: COLORS.BLACK },
  mbtiText: { fontSize: 16, color: COLORS.BLACK },

  introBox: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingBottom: 60,
    marginTop: 10,
    minHeight: 120,
    justifyContent: 'center',
  },
  introText: {
    fontSize: 16,
    color: COLORS.BLACK,
    lineHeight: 22,
  },
});
