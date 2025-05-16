import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';
import BackButton from '@/components/BackButton';
import InputField from '@/components/InputField';
import BirthdayField from '@/components/BirthdayField';
import ToggleButton from '@/components/ToggleButton';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';

export default function SignupBasicPage () {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [gender, setGender] = useState('');

  const handleNext = () => {
    if (!year || !month || !day || !gender) {
      alert('Enter all fields.');
      return;
    }

    const birthday = `${year.toString().padStart(4, '0')}-${month
      .toString()
      .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    useProfileStore.getState().setProfile({
      birthday,
      gender: gender.toUpperCase() as 'MALE' | 'FEMALE',
    });

    router.push('/profile/BasicInfoPage');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton />

          <Text style={styles.title}>Welcome to BetaBae!</Text>

          <InputField
            label="Phone Number"
            placeholder="010-xxxx-xxxx"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.fieldLabel}>Birthday</Text>
          <BirthdayField
            year={year}
            month={month}
            day={day}
            onChange={(y, m, d) => {
              setYear(y);
              setMonth(m);
              setDay(d);
            }}
          />

          <ToggleButton
            label="Gender"
            options={['Male', 'Female']}
            selected={gender}
            onSelect={setGender}
          />

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
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginHorizontal: 22,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    marginTop: 20,
    marginHorizontal: 10,
  },
});
