import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import BackButton from '@/components/BackButton';
import PhotoUploader from '@/components/PhotoUploader';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';

export default function PhotoRegisterPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const nickname = useProfileStore((state) => state.nickname);
  const introduce = useProfileStore((state) => state.introduce);
  const birthday = useProfileStore((state) => state.birthday);
  const gender = useProfileStore((state) => state.gender);
  const mbti = useProfileStore((state) => state.mbti);
  const interests = useProfileStore((state) => state.interests);
  const province = useProfileStore((state) => state.province);
  const city = useProfileStore((state) => state.city);

  const handleNext = async () => {
    if (photos.length < 1) {
      Alert.alert('Please upload at least 1 photo.');
      return;
    }

    try {
      setUploading(true);
      const photo = photos[0];
      const formData = new FormData();

      if (photo.file) {
        formData.append('profileImage', photo.file);
      } else if (photo.uri?.startsWith('file://')) {
        formData.append('profileImage', {
          uri: photo.uri,
          name: photo.fileName || 'profile.jpg',
          type: photo.type || 'image/jpeg',
        } as any);
      } else {
        Alert.alert('지원되지 않는 이미지 형식입니다.');
        return;
      }

      formData.append('nickname', nickname);
      formData.append('introduce', introduce);
      formData.append('birthday', birthday);
      formData.append('gender', gender);
      formData.append('mbti', mbti);
      formData.append('province', province);
      formData.append('city', city);

      // 👉 3. 관심사 (interests)
      interests.forEach((interest) => {
        formData.append('interests', interest); // 서버가 배열 지원 시 이렇게 개별로 append
      });

      // 👉 4. formData 확인 로그
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      // 👉 5. 전송
      const res = await api.put('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          delete headers.common;
          return data;
        },
      });

      console.log('✅ 프로필 등록 성공:', res.data);
      Alert.alert('✅ 프로필이 등록되었습니다!');
      router.push('/profile/PersonalityPage');
    } catch (err: any) {
      console.error('❌ Upload failed:', err);
      Alert.alert('Upload failed', err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        <Text style={styles.title}>
          Register a photo that shows{'\n'}your face well. (at least 1)
        </Text>

        <PhotoUploader onPhotosChange={setPhotos} />

        <View style={styles.buttonWrapper}>
          <CompleteButton
            title={uploading ? 'Uploading...' : 'Next'}
            onPress={handleNext}
            disabled={uploading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
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
    marginHorizontal: 10,
    marginTop: 30,
  },
});
