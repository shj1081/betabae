import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface LikabilityBarProps {
  percent: number;
}

const LikabilityBar = ({ percent }: LikabilityBarProps) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const listener = progressAnim.addListener(({ value }) => {
      setAnimatedValue(Math.floor(value));
    });

    Animated.timing(progressAnim, {
      toValue: percent,
      duration: 1500,
      useNativeDriver: false,
    }).start(() => {
      progressAnim.removeListener(listener);
    });
  }, [percent]);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, { width: widthInterpolated }]} />
        <View style={styles.percentContainer}>
          <Text style={styles.percentText}>{animatedValue}%</Text>
        </View>
      </View>
    </View>
  );
};

export default LikabilityBar;

const styles = StyleSheet.create({
  container: {
    width: '95%',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  barBackground: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBEBEB',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#C52B67',
    borderRadius: 20,
  },
  percentContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
