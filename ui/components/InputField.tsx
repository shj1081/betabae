import React from 'react';
import { TextInput, View, StyleSheet, Text, TextInputProps } from 'react-native';
import COLORS from '@/constants/colors';

interface Props extends TextInputProps {
  label: string;
}

const TextField = ({ label, ...props }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#696969"
        {...props}
      />
    </View>
  );
};  

export default TextField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginHorizontal : 22,
    color: COLORS.BLACK,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal : 22,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
});