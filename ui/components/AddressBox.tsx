import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import addressData from '@/constants/addressData';
import COLORS from '@/constants/colors';

interface Props {
  province: string;
  city: string;
  setProvince: (value: string) => void;
  setCity: (value: string) => void;
}

const AddressBox = ({ province, city, setProvince, setCity }: Props) => {
  const [selectedRegion, setSelectedRegion] = useState('');

  const regions = Object.keys(addressData);
  const cities = selectedRegion ? Object.keys(addressData[selectedRegion]) : [];
  const districts = selectedRegion && province
    ? addressData[selectedRegion][province] || []
    : [];

  useEffect(() => {
    if (!selectedRegion && province) {
      const matchingRegion = regions.find((region) =>
        Object.keys(addressData[region]).includes(province)
      );
      if (matchingRegion) {
        setSelectedRegion(matchingRegion);
      }
    }
  }, [province]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Address</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedRegion}
          onValueChange={(itemValue) => {
            setSelectedRegion(itemValue);
            setProvince('');
            setCity('');
          }}
          style={styles.picker}
        >
          <Picker.Item label="Region" value="" />
          {regions.map((region) => (
            <Picker.Item key={region} label={region} value={region} />
          ))}
        </Picker>

        <Picker
          selectedValue={province}
          onValueChange={(itemValue) => {
            setProvince(itemValue);
            setCity('');
          }}
          style={styles.picker}
          enabled={!!selectedRegion}
        >
          <Picker.Item label="province" value="" />
          {cities.map((cityOption) => (
            <Picker.Item key={cityOption} label={cityOption} value={cityOption} />
          ))}
        </Picker>

        <Picker
          selectedValue={city}
          onValueChange={setCity}
          style={styles.picker}
          enabled={!!province}
        >
          <Picker.Item label="city" value="" />
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
    marginHorizontal: 22,
    color: COLORS.BLACK,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    marginHorizontal: 22,
  },
});
