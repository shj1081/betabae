import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';

const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={router.back} style={styles.wrapper} hitSlop={10}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
        fill="#696969"
      >
        <Path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
      </Svg>
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginVertical: 30,
  },
});
