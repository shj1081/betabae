import React from 'react';
import { View, StyleSheet } from 'react-native';
import TestChatApp from '../test-chat';

export default function TestChatScreen() {
  return (
    <View style={styles.container}>
      <TestChatApp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
