import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import COLORS from '@/constants/colors';

interface Props {
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const MultipleButton = ({ label, options, selected, onSelect }: Props) => {
  return (
    <View style={styles.wrapper}> 
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttonContainer}>
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              style={[
                styles.button,
                isSelected && styles.selectedButton,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[styles.buttonText, isSelected && styles.selectedText]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default MultipleButton;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginHorizontal : 22,
    color: COLORS.BLACK,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 22, 
    gap: 5, 
  },
  button: {
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    marginRight: 8, 
  },
  selectedButton: {
    backgroundColor: COLORS.BLACK,
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  selectedText: {
    color: COLORS.WHITE,
  },
});
