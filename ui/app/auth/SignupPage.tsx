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

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validate = () => {
    let isValid = true;
    setErrors((prev) => ({ ...prev, password: '', confirmPassword: '' })); 

    const newErrors = { password: '', confirmPassword: '' };

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&*!()\-+=.\/])[A-Za-z\d@#$%^&*!()\-+=.\/]{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must include letters, numbers, and symbols.';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = async () => {
    if (!validate()) return;

    try {
        const response = await api.post('/auth/register', {
        email,
        password,
        legal_name: name,
        });

        console.log('✅ register success:', response.data);

        router.push('/auth/WelcomePage');
    } catch (error: any) {
      if (error.response?.data?.message?.includes('Email')) {
        setErrors((prev) => ({ ...prev, email: 'This email is already in use.' }));
      } else {
        Alert.alert('Error', 'Registration failed.');
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
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

          <InputField
            label="Password"
            placeholder="Please enter."
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

          <InputField
            label="Confirm Password"
            placeholder="Please enter."
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}

        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.buttonWrapper}>
        <CompleteButton title="Complete" onPress={handleNext} />
      </View>
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
    marginBottom: 80,
    color: COLORS.BLACK,
  },
  error: {
    color: COLORS.SUB,
    marginHorizontal: 24,
    marginBottom: 20,
    fontSize: 13,
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
