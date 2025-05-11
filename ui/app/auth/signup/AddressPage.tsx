import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import BackButton from '@/components/BackButton';
import AddressBox from '@/components/AddressBox';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/lib/api';

export default function AddressPage() {
  const router = useRouter();

  const { email, password, legal_name, birthday, gender } = useLocalSearchParams();

  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  const handleNext = async () => {
    if (!province || !city) {
      Alert.alert('입력 오류', '주소를 모두 선택해주세요.');
      return;
    }

    try {
      router.push({
        pathname: '/auth/signup/NicknamePage',
        params: {
          email,
          password,
          legal_name,
          birthday,
          gender,
          province,
          city,
        },
      });
    } catch (err) {
      console.error('❌ 저장 실패:', err);
      Alert.alert('에러', '서버 저장 중 문제가 발생했습니다.');
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

          <Text style={styles.title}>Enter your address.</Text>

          <AddressBox
            province={province}
            city={city}
            setProvince={setProvince}
            setCity={setCity}
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
  buttonWrapper: {
    marginTop: 20,
    marginHorizontal: 10,
  },
});
