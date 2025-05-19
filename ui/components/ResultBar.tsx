import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '@/constants/colors';

interface ResultBarProps {
  leftLabel: string;
  rightLabel: string;
  percentage: number; 
  color: string;
}

const ResultBar = ({ leftLabel, rightLabel, percentage, color }: ResultBarProps) => {
    const isLeftDominant = percentage >= 50;
    const dominantPercent = isLeftDominant ? percentage : 100 - percentage;
  
    return (
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{leftLabel}</Text>
          <Text style={styles.label}>{rightLabel}</Text>
        </View>
  
        <View style={styles.barBackground}>
          <View style={{ flexDirection: isLeftDominant ? 'row' : 'row-reverse', flex: 1 }}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${dominantPercent}%`,
                  backgroundColor: color,
                  borderTopLeftRadius: isLeftDominant ? 20 : 0,
                  borderBottomLeftRadius: isLeftDominant ? 20 : 0,
                  borderTopRightRadius: isLeftDominant ? 0 : 20,
                  borderBottomRightRadius: isLeftDominant ? 0 : 20,
                },
              ]}
            >
              <Text style={styles.barText}>{dominantPercent}%</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

export default ResultBar;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
  },
  barBackground: {
    height: 28,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  barFill: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  barText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 14,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});
