import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import SelfIntroInput from '@/components/SelfIntroInput';
import BackButton from '@/components/BackButton';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';

const SelfIntroPage = () => {
  const router = useRouter();
  const [selfIntro, setSelfIntro] = useState('');

  const handleNext = async () => {
    const trimmed = selfIntro.trim();
    if (!trimmed) {
        Alert.alert('Error', 'Enter self-introduction');
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
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <CompleteButton title="Next" onPress={handleNext} />
      </View>
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
    marginBottom: 80,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
