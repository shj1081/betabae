import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '@/components/BackButton';
import LikertSlider from '@/components/LikertSlider';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';

export default function SeriousnessPage () {
  const router = useRouter();
  const [seriousness, setSeriousness] = useState(3); 

  const handleNext = () => {
    router.push('/profile/ClonePage');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />

        <Text style={styles.title}>Indicate the seriousness of a relationship.</Text>

        <LikertSlider
          question=""
          value={seriousness}
          onChange={setSeriousness}
        />
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <CompleteButton title="Complete" onPress={handleNext} />
      </View>
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
