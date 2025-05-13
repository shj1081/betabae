import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '@/components/BackButton';
import InputField from '@/components/InputField';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import api from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');

  const validate = () => {
    // 알림창으로 변경해야함
    if (!name || !email || !password || !confirmPassword) {
      setError('Fill in every areas.');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&*!()\-+=.\/])[A-Za-z\d@#$%^&*!()\-+=.\/]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        'Passwords must contain at least one alpha one numeric and one ( @#$^&*()-+=./ ) character.'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = async () => {
    if (!validate()) return;

    try {
        const response = await api.post('/auth/register', {
        email,
        password,
        legal_name: name,
        });

        console.log('✅ 회원가입 성공:', response.data);

        router.push('/auth/WelcomePage');
    } catch (error: any) {
        console.error('❌ 회원가입 실패:', error.response?.data || error.message);
        if (error.response?.data?.message?.includes('email')) {
        setError('이미 사용 중인 이메일입니다.');
        } else {
        Alert.alert('에러', '회원가입 중 문제가 발생했습니다.');
        }
    }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton />

          <Text style={styles.title}>Welcome to BetaBae!</Text>

          <InputField
            label="Name"
            placeholder="Please enter."
            value={name}
            onChangeText={setName}
          />

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
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <InputField
            label="Confirm Password"
            placeholder="Please enter."
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonWrapper}>
            <CompleteButton title="Complete" onPress={handleNext} />
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
  error: {
    color: COLORS.SUB,
    marginHorizontal: 24,
    marginBottom: 20,
    fontSize: 13,
  },
  buttonWrapper: {
    marginHorizontal: 10,
    marginTop: 10,
  },
});
