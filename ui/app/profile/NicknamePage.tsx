import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import BackButton from '@/components/BackButton';
import InputField from '@/components/InputField';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!nickname) {
      setError('Please enter a nickname.');
      return;
    }

    useProfileStore.getState().setProfile({ nickname });

    router.push('/profile/InterestPage');
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton />

          <Text style={styles.title}>Enter your nickname.</Text>

          <InputField
            label="Nickname"
            placeholder="Please enter."
            value={nickname}
            onChangeText={setNickname}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
  scrollContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 22,
    marginBottom: 40,
    color: COLORS.BLACK,
  },
  errorText: {
    color: COLORS.SUB,
    marginHorizontal: 24,
    marginTop: -20,
    marginBottom: 20,
    fontSize: 13,
  },
  buttonWrapper: {
    marginHorizontal: 10,
  },
});
