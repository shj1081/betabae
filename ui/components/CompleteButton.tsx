import React from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';

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
    backgroundColor: '#C52B67',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    transform: [{ scale: 1 }],
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  pressedButton: {
    backgroundColor: '#C13448',
    transform: [{ scale: 0.995 }], 
  },
  pressedText: {
    color: '#fff'
  },
});
