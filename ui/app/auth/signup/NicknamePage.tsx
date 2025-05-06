import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import BackButton from '@/components/BackButton';
import InputField from '@/components/InputField';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function NicknamePage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleComplete = () => {
    if (nickname === 'taken') {
      setError('The nickname already exists.');
    } else {
      setError('');

    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton onPress={() => router.back()} />

          <Text style={styles.title}>Enter your nickname.</Text>

          <InputField
            label="Nickname"
            placeholder="Please enter."
            value={nickname}
            onChangeText={setNickname}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonWrapper}>
            <CompleteButton title="Complete" onPress={handleComplete} />
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
