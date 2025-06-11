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
import PopupWindow from '@/components/PopupWindow';
import COLORS from '@/constants/colors';

export default function SignupBasicPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [gender, setGender] = useState('');

  const [showPopup, setShowPopup] = useState(false);

  const handlePopupClose = () => setShowPopup(false);

  const handleNext = () => {
    if (!phone.trim() || !year || !month || !day || !gender) {
      setShowPopup(true);
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
            value={phone}
            onChangeText={setPhone}
          />

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
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.buttonWrapper}>
        <CompleteButton title="Next" onPress={handleNext} />
      </View>

      <PopupWindow
        visible={showPopup}
        title="Error"
        message="Please fill out all fields."
        onCancel={handlePopupClose}
        onConfirm={handlePopupClose}
      />
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
    marginBottom: 80,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
