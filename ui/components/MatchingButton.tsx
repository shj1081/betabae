import React from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';
import COLORS from '@/constants/colors';

interface Props {
  onReject: (event: GestureResponderEvent) => void;
  onAccept: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
}

const MatchingButton = ({ onReject, onAccept, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={onReject}
        style={({ pressed }) => [
          styles.button,
          styles.reject,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.text, styles.rejectText]}>Reject</Text>
      </Pressable>

      <Pressable
        onPress={onAccept}
        style={({ pressed }) => [
          styles.button,
          styles.accept,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.text, styles.acceptText]}>Accept</Text>
      </Pressable>
    </View>
  );
};

export default MatchingButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 2,
  },
  reject: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BLACK,
  },
  accept: {
    backgroundColor: COLORS.BLACK,
    borderColor: COLORS.BLACK,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  rejectText: {
    color: COLORS.BLACK,
  },
  acceptText: {
    color: COLORS.WHITE,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
