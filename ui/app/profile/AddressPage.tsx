import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import BackButton from '@/components/BackButton';
import AddressBox from '@/components/AddressBox';
import CompleteButton from '@/components/CompleteButton';
import PopupWindow from '@/components/PopupWindow';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';

export default function AddressPage() {
  const router = useRouter();

  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handlePopupClose = () => setShowPopup(false);

  const handleNext = () => {
    if (!province || !city) {
      setShowPopup(true);
      return;
    }

    useProfileStore.getState().setProfile({
      province,
      city,
    });

    router.push('/profile/NicknamePage');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton />

          <Text style={styles.title}>Enter your address.</Text>

          <AddressBox
            province={province}
            city={city}
            setProvince={setProvince}
            setCity={setCity}
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
