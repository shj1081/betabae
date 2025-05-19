import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import ResultBar from '@/components/ResultBar';
import CompleteButton from '@/components/CompleteButton';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';
import api from '@/lib/api'; 

export default function PersonalityResultPage() {
  const router = useRouter();
  const [scores, setScores] = useState<any>(null);

  useEffect(() => {
    const fetchPersonality = async () => {
      try {
        const res = await api.get('/user/personality'); 
        setScores(res.data);
      } catch (err: any) {
        console.error('❌ 성격 정보 불러오기 실패:', err.response?.data || err.message);
        Alert.alert('불러오기 실패', '성격 정보를 가져오는 데 실패했습니다.');
      }
    };

    fetchPersonality();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton />
          <Text style={styles.title}>Your score</Text>

          {scores && (
            <>
              <ResultBar
                leftLabel="Openness"
                rightLabel="Conservativity"
                percentage={scores.openness * 20}
                color="#DB816D"
              />
              <ResultBar
                leftLabel="Conscientiousness"
                rightLabel="Impulsiveness"
                percentage={scores.conscientiousness * 20}
                color="#E1A652"
              />
              <ResultBar
                leftLabel="Extraversion"
                rightLabel="Introversion"
                percentage={scores.extraversion * 20}
                color="#3D6B3D"
              />
              <ResultBar
                leftLabel="Agreeableness"
                rightLabel="Hostility"
                percentage={scores.agreeableness * 20}
                color="#1F2D61"
              />
              <ResultBar
                leftLabel="Neuroticism"
                rightLabel="Stability"
                percentage={scores.neuroticism * 20}
                color="#754E51"
              />
            </>
          )}

          <View style={styles.buttonWrapper}>
            <CompleteButton title="Next" onPress={() => router.push('/profile/LoveLanguagePage')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 22,
    marginVertical: 20,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    marginTop: 30,
    marginHorizontal: 10,
  },
});
