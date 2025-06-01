import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
    <View style={styles.wrapper}>
      <Text style={styles.label}>Birthday</Text>
      <View style={styles.row}>
        <View style={styles.column}>
          <Picker
            selectedValue={year}
            onValueChange={(val) => onChange(val, month, day)}
            style={styles.picker}
          >
            <Picker.Item label="Year" value={0} />
            {years.map((y) => (
              <Picker.Item key={y} label={`${y}`} value={y} />
            ))}
          </Picker>
        </View>

        <View style={styles.column}>
          <Picker
            selectedValue={month}
            onValueChange={(val) => onChange(year, val, day)}
            style={styles.picker}
          >
            <Picker.Item label="Month" value={0} />
            {months.map((m) => (
              <Picker.Item key={m} label={`${m}`} value={m} />
            ))}
          </Picker>
        </View>

        <View style={styles.column}>
          <Picker
            selectedValue={day}
            onValueChange={(val) => onChange(year, month, val)}
            style={styles.picker}
          >
            <Picker.Item label="Day" value={0} />
            {days.map((d) => (
              <Picker.Item key={d} label={`${d}`} value={d} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

export default BirthdayField;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 30,
    marginHorizontal: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: COLORS.BLACK,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  picker: {
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    color: COLORS.BLACK,
  },
});
