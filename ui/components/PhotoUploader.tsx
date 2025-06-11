import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

const MAX_PHOTOS = 6;

interface Props {
  onPhotosChange: (photos: ImagePicker.ImagePickerAsset[]) => void;
}

const PhotoUploader = ({ onPhotosChange }: Props) => {
  const [photos, setPhotos] = useState<(ImagePicker.ImagePickerAsset | null)[]>(
    Array(MAX_PHOTOS).fill(null)
  );

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const updated = [...photos];
      updated[index] = result.assets[0];
      setPhotos(updated);

      const validAssets = updated.filter(Boolean) as ImagePicker.ImagePickerAsset[];
      onPhotosChange(validAssets);
    }
  };

  return (
    <View style={styles.grid}>
      {photos.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.photoBox}
          onPress={() => pickImage(idx)}
        >
          {item ? (
            <Image source={{ uri: item.uri }} style={styles.image} />
          ) : (
            <Ionicons name="camera-outline" size={28} color="black" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PhotoUploader;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 20,
  },
  photoBox: {
    width: '30%', 
    aspectRatio: 1, 
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
