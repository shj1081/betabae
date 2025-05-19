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

  // 사용자가 province를 외부에서 세팅한 경우에 region 자동 선택
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
        {/* 1단계: 권역 (선택 활성화) */}
        <Picker
          selectedValue={selectedRegion}
          onValueChange={(itemValue) => {
            setSelectedRegion(itemValue);
            setProvince('');
            setCity('');
          }}
          style={styles.picker}
        >
          <Picker.Item label="권역 선택" value="" />
          {regions.map((region) => (
            <Picker.Item key={region} label={region} value={region} />
          ))}
        </Picker>

        {/* 2단계: 시/도 */}
        <Picker
          selectedValue={province}
          onValueChange={(itemValue) => {
            setProvince(itemValue);
            setCity('');
          }}
          style={styles.picker}
          enabled={!!selectedRegion}
        >
          <Picker.Item label="시/도 선택" value="" />
          {cities.map((cityOption) => (
            <Picker.Item key={cityOption} label={cityOption} value={cityOption} />
          ))}
        </Picker>

        {/* 3단계: 시/군/구 */}
        <Picker
          selectedValue={city}
          onValueChange={setCity}
          style={styles.picker}
          enabled={!!province}
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
