import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import InputField from '@/components/InputField';
import MultipleButton from '@/components/MultipleButton';
import CompleteButton from '@/components/CompleteButton';
import BackButton from '@/components/BackButton';
import PopupWindow from '@/components/PopupWindow';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function BasicInfoPage() {
  const router = useRouter();
  const [job, setJob] = useState('');
  const [height, setHeight] = useState('');
  const [religion, setReligion] = useState('');
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');

  const [showPopup, setShowPopup] = useState(false);
  const handlePopupClose = () => setShowPopup(false);

  const handleNext = () => {
    if (!job || !height || !religion || !smoking || !drinking) {
      setShowPopup(true);
      return;
    }
    
    router.push('/profile/AddressPage');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton />

          <Text style={styles.title}>Enter your basic information.</Text>

          <InputField
            label="Job"
            placeholder="Please check your job."
            value={job}
            onChangeText={setJob}
          />

          <InputField 
            label="Height"
            placeholder="Please enter your height."
            value={height}
            onChangeText={setHeight}
          />

          <MultipleButton
            label="Religion"
            selected={religion}
            onSelect={setReligion}
            options={[
              'No',
              'Buddhism',
              'Christianity',
              'Islam',
              'Catholicism',
              'Else',
            ]}
          />

          <MultipleButton
            label="Smoking"
            selected={smoking}
            onSelect={setSmoking}
            options={[
              'Never',
              'Sometimes',
              'Often',
              'Every day',
              'Electronic cigarette',
              'No smoking',
            ]}
          />

          <MultipleButton
            label="Drinking"
            selected={drinking}
            onSelect={setDrinking}
            options={[
              'Never',
              'Sometimes',
              'Often',
              'Every day',
              'No smoking',
            ]}
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
  flex: {
    flex: 1,
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
  heightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  heightInput: {
    flex: 1,
  },
  cm: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginRight: 22,
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
