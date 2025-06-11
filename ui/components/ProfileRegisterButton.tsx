import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import COLORS from '@/constants/colors';

interface Props {
  onPress: () => void;
  style?: ViewStyle;
}

const ProfileRegisterButton = ({ onPress, style }: Props) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.title}>No information to display</Text>
      <Text style={styles.subtitle}>Register your profile!</Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressedButton,
        ]}
      >
        {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && styles.pressedText]}>
            Start
          </Text>
        )}
      </Pressable>
    </View>
  );
};

export default ProfileRegisterButton;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.DARK_GRAY,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.MAIN,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start', 
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  pressedButton: {
    backgroundColor: COLORS.SUB,
    transform: [{ scale: 0.98 }],
  },
  pressedText: {
    color: COLORS.WHITE,
  },
});
