import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';

export default function SettingsPage() {
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [deactivated, setDeactivated] = useState(false);

  return (
    <View style={styles.container}>
      <BackButton />

      <View style={styles.option}>
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>Alarm</Text>
          <Text style={styles.description}>Not receive any notifications.</Text>
        </View>
        <Switch
          value={alarmEnabled}
          onValueChange={setAlarmEnabled}
          trackColor={{ false: '#ccc', true: COLORS.BLACK }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.option}>
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>Deactivation</Text>
          <Text style={styles.description}>My profile is not disclosed to anyone else.</Text>
        </View>
        <Switch
          value={deactivated}
          onValueChange={setDeactivated}
          trackColor={{ false: '#ccc', true: COLORS.BLACK }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.divider} />

      <TouchableOpacity onPress={() => {}} style={styles.deleteWrapper}>
        <Text style={styles.deleteText}>Delete account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginTop: 20,
    marginBottom: 20,
  },
  labelWrapper: {
    flexShrink: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginBottom: 20,
    marginHorizontal: 22,
  },
  deleteWrapper: {
    marginTop: 20,
    marginHorizontal: 22,
  },
  deleteText: {
    fontSize: 16,
    color: 'red',
  },
});
