import React from 'react';
import { Text, Pressable, StyleSheet, GestureResponderEvent, ViewStyle, } from 'react-native';
import COLORS from '@/constants/colors';

interface Props {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const CompleteButton = ({ title, onPress, style, disabled }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        style,
        disabled && styles.disabled,
        pressed && styles.pressedButton, 
      ]}
    >
      {({ pressed }) => (
        <Text style={[styles.text, pressed && styles.pressedText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default CompleteButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.MAIN,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 14,
    transform: [{ scale: 1 }],
  },
  text: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  pressedButton: {
    backgroundColor: COLORS.SUB,
    transform: [{ scale: 0.98 }], 
  },
  pressedText: {
    color: COLORS.WHITE,
  },
});
