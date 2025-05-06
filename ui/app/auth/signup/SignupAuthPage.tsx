import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import BackButton from '@/components/BackButton';
import InputField from '@/components/InputField';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';

export default function SignupAuthPage () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validate = () => {
    let valid = true;

    if (email === 'abc@naver.com') {
      setEmailError('The Email already exists.');
      valid = false;
    } else {
      setEmailError('');
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&*!()\-+=.\/])[A-Za-z\d@#$%^&*!()\-+=.\/]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        'Passwords must contain at least one alpha one numeric and one ( @#$^&*()-+=./ ) character.'
      );
      valid = false;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    } else {
      setConfirmError('');
    }

    return valid;
  };

  const handleNext = () => {
    if (validate()) {
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton onPress={() => {}} />
          <Text style={styles.title}>Welcome to BetaBae !</Text>

          <InputField
            label="Email"
            placeholder="Please enter."
            value={email}
            onChangeText={setEmail}
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

          <InputField
            label="Password"
            placeholder="Please enter."
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

          <InputField
            label="Password Confirm"
            placeholder="Please enter."
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {confirmError ? <Text style={styles.error}>{confirmError}</Text> : null}

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
    marginTop: -20,
    marginBottom: 20,
    fontSize: 13,
  },
  buttonWrapper: {
    marginTop: 10,
    marginHorizontal: 10,
  },
});
