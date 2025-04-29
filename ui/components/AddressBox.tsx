import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import addressData from '@/constants/addressData';

const AddressBox = () => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const regions = Object.keys(addressData);

  const cities = selectedRegion
    ? Object.keys(addressData[selectedRegion])
    : [];

  const districts = selectedRegion && selectedCity
    ? addressData[selectedRegion][selectedCity]
    : [];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Address</Text>
      
      <View style={styles.pickerContainer}>
        {/* 1단계: 권역 선택 */}
        <Picker
            selectedValue={selectedRegion}
            onValueChange={(itemValue) => {
            setSelectedRegion(itemValue);
            setSelectedCity('');
            setSelectedDistrict('');
            }}
            style={styles.picker}
        >
            <Picker.Item label="권역 선택" value="" />
            {regions.map((region) => (
            <Picker.Item key={region} label={region} value={region} />
            ))}
        </Picker>

        {/* 2단계: 시/도 선택 */}
        <Picker
            selectedValue={selectedCity}
            onValueChange={(itemValue) => {
            setSelectedCity(itemValue);
            setSelectedDistrict('');
            }}
            style={styles.picker}
            enabled={cities.length > 0}
        >
            <Picker.Item label="시/도 선택" value="" />
            {cities.map((city) => (
            <Picker.Item key={city} label={city} value={city} />
            ))}
        </Picker>

        {/* 3단계: 시/군/구 선택 */}
        <Picker
            selectedValue={selectedDistrict}
            onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
            style={styles.picker}
            enabled={districts.length > 0}
        >
            <Picker.Item label="시/군/구 선택" value="" />
            {districts.map((district) => (
            <Picker.Item key={district} label={district} value={district} />
            ))}
        </Picker>
      </View>
    </View>
  );
};

export default AddressBox;

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
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    marginHorizontal: 10, 
  },
});
