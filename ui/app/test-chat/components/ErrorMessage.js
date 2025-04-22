import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#ffeeee',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff6666',
    marginVertical: 10,
  },
  text: {
    color: '#cc0000',
    fontSize: 14,
  },
});

export default ErrorMessage;
