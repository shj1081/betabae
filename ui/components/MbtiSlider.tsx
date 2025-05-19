import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import COLORS from '@/constants/colors';

interface MbtiSliderProps {
  labelLeft: string;
  labelRight: string;
  value: number;
  onChange: (value: number) => void;
}

const MbtiSlider = ({ labelLeft, labelRight, value, onChange }: MbtiSliderProps) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{labelLeft}</Text>
        <Text style={styles.label}>{labelRight}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor="#C52B67"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#EBEBEB"
        step={1}
      />
      <Text style={styles.percent}>
        {labelLeft}: {value}%, {labelRight}: {100 - value}%
      </Text>
    </View>
  );
};

export default MbtiSlider;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
    paddingHorizontal: 22,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
  },
  percent: {
    marginTop: 6,
    textAlign: 'center',
    color: COLORS.DARK_GRAY,
    fontSize: 13,
  },
});
