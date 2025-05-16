import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import SelfIntroInput from '@/components/SelfIntroInput';
import BackButton from '@/components/BackButton';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';
import api from '@/lib/api';

const SelfIntroPage = () => {
  const router = useRouter();
  const [selfIntro, setSelfIntro] = useState('');

    const handleComplete = async () => {
    const trimmed = selfIntro.trim();
    if (!trimmed) {
        Alert.alert('입력 오류', '자기소개를 입력해주세요.');
        return;
    }
    useProfileStore.getState().setProfile({ introduce: trimmed });

    router.push('/profile/PhotoRegisterPage');
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <BackButton />
        <Text style={styles.title}>Write a self-introduction that{'\n'}reveals yourself.</Text>
        <SelfIntroInput
          value={selfIntro}
          onChangeText={setSelfIntro}
        />
        <CompleteButton
          title="Next"
          onPress={handleComplete}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelfIntroPage;

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
    marginBottom: 40,
    color: COLORS.BLACK,
  },
});
