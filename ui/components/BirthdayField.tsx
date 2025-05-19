import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import COLORS from '@/constants/colors';

interface Props {
  year: number;
  month: number;
  day: number;
  onChange: (year: number, month: number, day: number) => void;
}

const BirthdayField = ({ year, month, day, onChange }: Props) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDays = (y: number, m: number) => new Date(y, m, 0).getDate();
  const days = Array.from({ length: getDays(year, month) || 31 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <RNPickerSelect
        placeholder={{ label: 'Year', value: 0 }}
        value={year}
        onValueChange={(val) => onChange(val, month, day)}
        items={years.map((y) => ({ label: `${y}`, value: y }))}
        style={pickerSelectStyles}
      />
      <RNPickerSelect
        placeholder={{ label: 'Month', value: 0 }}
        value={month}
        onValueChange={(val) => onChange(year, val, day)}
        items={months.map((m) => ({ label: `${m}`, value: m }))}
        style={pickerSelectStyles}
      />
      <RNPickerSelect
        placeholder={{ label: 'Day', value: 0 }}
        value={day}
        onValueChange={(val) => onChange(year, month, val)}
        items={days.map((d) => ({ label: `${d}`, value: d }))}
        style={pickerSelectStyles}
      />
    </View>
  );
};

export default BirthdayField;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginHorizontal: 10,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.DARK_GRAY,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    color: COLORS.BLACK,
  },
  inputAndroid: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.DARK_GRAY,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    color: COLORS.BLACK,
  },
};
