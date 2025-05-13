import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Button,
} from 'react-native';
import BackButton from '@/components/BackButton';
import MbtiSlider from '@/components/MbtiSlider';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';
import api from '@/lib/api';

export default function MbtiPage() {
  const router = useRouter();
  const [ie, setIe] = useState(50);
  const [sn, setSn] = useState(50);
  const [tf, setTf] = useState(50);
  const [jp, setJp] = useState(50);

  const handleNext = async () => {
    const mbti =
      (ie <= 50 ? 'E' : 'I') +
      (sn <= 50 ? 'N' : 'S') +
      (tf <= 50 ? 'F' : 'T') +
      (jp <= 50 ? 'P' : 'J');

    useProfileStore.getState().setProfile({ mbti });

    const {
      nickname,
      introduce,
      birthday,
      gender,
      mbti: finalMbti,
      interests,
      province,
      city,
    } = useProfileStore.getState();

    const payload = {
      nickname,
      introduce,
      birthday,
      gender,
      mbti: finalMbti,
      interests,
      province,
      city,
    };

    console.log('📦 보낼 데이터:', payload);

    try {
      const response = await api.put('/user/profile', payload);
      console.log('✅ 프로필 저장 성공:', response.data);
      router.push('/profile/PersonalityPage');
    } catch (err: any) {
      console.error('❌ 프로필 저장 실패:', err.response?.data || err.message);
      alert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton />
          <Text style={styles.title}>Enter your MBTI.</Text>

          <MbtiSlider labelLeft="Introverted" labelRight="Extrovert" value={ie} onChange={setIe} />
          <MbtiSlider labelLeft="Sensing" labelRight="Intuition" value={sn} onChange={setSn} />
          <MbtiSlider labelLeft="Thinking" labelRight="Feeling" value={tf} onChange={setTf} />
          <MbtiSlider labelLeft="Judging" labelRight="Perceiving" value={jp} onChange={setJp} />

          <View style={styles.buttonWrapper}>
            <CompleteButton title="Next" onPress={handleNext} />
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
  container: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 22,
    marginBottom: 30,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    marginTop: 20,
    marginHorizontal: 10,
  },
});
