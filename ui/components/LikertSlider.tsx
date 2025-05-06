import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import COLORS from '@/constants/colors';

interface LikertSliderProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
}

const LikertSlider = ({ question, value, onChange }: LikertSliderProps) => {
  const marks = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.labelRow}>
        <Text style={styles.label}>Disagree</Text>
        <Text style={styles.label}>Agree</Text>
      </View>

      <View style={styles.trackWrapper}>
        <Slider
          value={value}
          onValueChange={onChange}
          minimumValue={1}
          maximumValue={5}
          step={1}
          minimumTrackTintColor="#C52B67"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#EBEBEB"
          style={styles.slider}
        />

        <View style={styles.tickContainer}>
          {marks.map((_, i) => (
            <View key={i} style={styles.tick} />
          ))}
        </View>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  trackWrapper: {
    position: 'relative',
    paddingVertical: 12,
  },
  slider: {
    height: 40,
  },
  tickContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  tick: {
    width: 2,
    height: 10,
    backgroundColor: COLORS.DARK_GRAY,
  },
});
