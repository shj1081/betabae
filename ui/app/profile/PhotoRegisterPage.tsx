import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import BackButton from '@/components/BackButton';
import PhotoUploader from '@/components/PhotoUploader';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';

export default function PhotoRegisterPage () {

  const handleNext = () => {

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton onPress={() => {}} />

        <Text style={styles.title}>
          Register a photo that shows{'\n'}your face well. (at least 3)
        </Text>

        <PhotoUploader />

        <View style={styles.buttonWrapper}>
          <CompleteButton title="Next" onPress={handleNext} />
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
