import React from 'react';
import { TextInput, View, StyleSheet, Text, TextInputProps } from 'react-native';

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
    marginHorizontal : 13,
    color: '#000',
  },
  input: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal : 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
});