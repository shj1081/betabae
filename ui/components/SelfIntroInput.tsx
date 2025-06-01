import React from 'react';
import { TextInput, View, StyleSheet, Text, TextInputProps } from 'react-native';
import COLORS from '@/constants/colors';

interface Props extends TextInputProps {
  label?: string;
}

const SelfIntroInput = ({ label = 'Self Introduction', ...props }: Props) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        placeholder="Please enter."
        placeholderTextColor={COLORS.DARK_GRAY}
        {...props}
      />
    </View>
  );
};

export default SelfIntroInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    marginHorizontal : 25,
    color: COLORS.BLACK,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal : 22,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
    height: 150, 
  },
});
