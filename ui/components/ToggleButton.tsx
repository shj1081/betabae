import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  label: string;
  options: [string, string];
  selected: string;
  onSelect: (option: string) => void;
}

const ToggleButton = ({ label, options, selected, onSelect }: Props) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttonContainer}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.button,
              selected === option && styles.selectedButton,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.buttonText,
                selected === option && styles.selectedButtonText,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default ToggleButton;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 30,

  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginHorizontal : 13,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    marginHorizontal: 10, 
  },
  selectedButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectedButtonText: {
    color: '#FFF',
  },
});
