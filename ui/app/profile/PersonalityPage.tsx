import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import BackButton from '@/components/BackButton';
import CompleteButton from '@/components/CompleteButton';
import LikertSlider from '@/components/LikertSlider';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import { useRouter } from 'expo-router';

export default function PersonalityPage() {
  const router = useRouter();
  const [q1, setQ1] = useState(3);
  const [q2, setQ2] = useState(3);
  const [q3, setQ3] = useState(3);
  const [q4, setQ4] = useState(3);
  const [q5, setQ5] = useState(3);

  const handleNext = async () => {
    const answers = [q1, q2, q3, q4, q5];

    try {
      const response = await api.post('/user/personality/score', { answers });
      console.log('✅ 저장 성공:', response.data);

      router.push('/profile/PersonalityResultPage');
    } catch (err: any) {
      console.error('❌ 저장 실패:', err.response?.data || err.message);
      Alert.alert('저장 실패', '서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        <Text style={styles.title}>5 Personality Test</Text>
        <Text style={styles.subtitle}>"I see myself as someone who..."</Text>

        <LikertSlider
          question="1. Gets nervous easily"
          value={q1}
          onChange={setQ1}
        />
        <LikertSlider
          question="2. Is outgoing, sociable"
          value={q2}
          onChange={setQ2}
        />
        <LikertSlider
          question="3. Is reserved"
          value={q3}
          onChange={setQ3}
        />
        <LikertSlider
          question="4. Has an active imagination"
          value={q4}
          onChange={setQ4}
        />
        <LikertSlider
          question="5. Is generally trusting"
          value={q5}
          onChange={setQ5}
        />

        <View style={styles.buttonWrapper}>
          <CompleteButton title="Next" onPress={handleNext} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 22,
    marginBottom: 25,
    color: COLORS.BLACK,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 22,
    marginBottom: 16,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    marginHorizontal: 10,
    marginTop: 20,
  },
});
