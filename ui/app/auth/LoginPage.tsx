import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import InputField from '@/components/InputField';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import PopupWindow from '@/components/PopupWindow';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setPopupTitle('Error');
      setPopupMessage('Please fill in both email and password.');
      setPopupVisible(true);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      setPopupTitle('Login Successful');
      setPopupMessage('You have logged in successfully!');
      setPopupVisible(true);

    } catch (error: any) {
      setPopupTitle('Error');
      setPopupMessage(error.response?.data?.message || 'An unexpected error occurred.');
      setPopupVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <Image source={require('@/assets/images/BetaBaeLogo.png')} style={styles.logoImage} />
              <Image source={require('@/assets/images/BetaBaeTitle.png')} style={styles.logoText} />
            </View>

            <InputField
              label="Email"
              placeholder="Please enter."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Password"
              placeholder="Please enter."
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?   </Text>
              <Text
                style={styles.registerLink}
                onPress={() => router.push('/auth/SignupPage')}
              >
                Register
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.buttonWrapper}>
        <CompleteButton title="Login" onPress={handleLogin} />
      </View>

      <PopupWindow
        visible={popupVisible}
        title={popupTitle}
        message={popupMessage}
        onCancel={() => setPopupVisible(false)}
        onConfirm={() => {
          setPopupVisible(false);
          if (popupTitle === 'Login Successful') {
            router.push('/match/MatchingPage'); 
          }
        }}
      />
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
    paddingBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 50,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginLeft: -10,
    resizeMode: 'contain',
  },
  logoText: {
    width: 160,
    height: 80,
    resizeMode: 'contain',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.BLACK,
    textDecorationLine: 'underline',
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
