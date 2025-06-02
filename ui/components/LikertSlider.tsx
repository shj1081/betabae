import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import COLORS from '@/constants/colors';

interface LikertSliderProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
}

const LikertSlider = ({ question, value, onChange }: LikertSliderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={1}
        maximumValue={5}
        step={1}
        minimumTrackTintColor={COLORS.MAIN}
        maximumTrackTintColor="#ccc"
        thumbTintColor={COLORS.LIGHT_GRAY}
        style={styles.slider}
      />

      <View style={styles.labelRow}>
        <Text style={styles.label}>Disagree</Text>
        <Text style={styles.label}>Agree</Text>
      </View>
    </View>
  );
};

export default LikertSlider;

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 15,
    color: COLORS.BLACK,
    marginBottom: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
});
