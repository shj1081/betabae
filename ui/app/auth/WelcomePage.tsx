import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import COLORS from '@/constants/colors';
import ProfileRegisterButton from '@/components/ProfileRegisterButton';
import { useRouter } from 'expo-router';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome !</Text>
      <ProfileRegisterButton onPress={() => router.push('/profile/BasicInfoPage')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 22,
    marginBottom: 20,
    color: COLORS.BLACK,
  },
});
