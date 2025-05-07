import React from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';
import COLORS from '@/constants/colors';

interface Props {
  title?: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
}

const TalkButton = ({ title = 'Talk with BetaBae', onPress, style }: Props) => {
  return (
    <View style={[styles.wrapper, style]}>
        <Pressable
        onPress={onPress}
        style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            style,
        ]}
        >
        <Text style={styles.text}>{title}</Text>
        </Pressable>
    </View>

  );
};

export default TalkButton;

const styles = StyleSheet.create({
  wrapper: {
    paddingLeft: 5,
    paddingRight: 3,
    marginVertical: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    backgroundColor: COLORS.BLACK,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.WHITE,
  },
});
