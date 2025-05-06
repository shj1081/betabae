import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import BackButton from '@/components/BackButton';
import MbtiSlider from '@/components/MbtiSlider';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function MbtiPage() {
  const router = useRouter();
  const [ie, setIe] = useState(50);
  const [sn, setSn] = useState(50);
  const [tf, setTf] = useState(50);
  const [jp, setJp] = useState(50);

  const handleNext = () => {
    // TODO: 추후 MBTI 문자 변환 및 저장 처리

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton onPress={() => router.back()} />
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
