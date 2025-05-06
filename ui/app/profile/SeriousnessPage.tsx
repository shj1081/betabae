import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import BackButton from '@/components/BackButton';
import LikertSlider from '@/components/LikertSlider';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';

export default function SeriousnessPage () {
  const [seriousness, setSeriousness] = useState(3); 

  const handleNext = () => {

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton onPress={() => {}} />

        <Text style={styles.title}>Indicate the seriousness of a relationship.</Text>

        <LikertSlider
          question=""
          value={seriousness}
          onChange={setSeriousness}
        />

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
    marginTop: 30,
    marginHorizontal: 10,
  },
});
