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
import PopupWindow from '@/components/PopupWindow';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';

export default function PhotoRegisterPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const handlePopupClose = () => setShowPopup(false);

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
      setShowPopup(true);
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
        Alert.alert('unacceptable format.');
        return;
      }

      formData.append('nickname', nickname);
      formData.append('introduce', introduce);
      formData.append('birthday', birthday);
      formData.append('gender', gender);
      formData.append('mbti', mbti);
      formData.append('province', province);
      formData.append('city', city);

      interests.forEach((interest) => {
        formData.append('interests', interest); 
      });

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      const res = await api.put('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          delete headers.common;
          return data;
        },
      });

      console.log('✅ Profile register Success:', res.data);
      Alert.alert('✅ Profile Registered!');
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

      </ScrollView>
      <View style={styles.buttonWrapper}>
        <CompleteButton
          title={uploading ? 'Uploading...' : 'Next'}
          onPress={handleNext}
          disabled={uploading}
        />
      </View>

      <PopupWindow
        visible={showPopup}
        title="Error"
        message="Please register your profile photo."
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
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
