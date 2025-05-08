import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import BottomTabBar from '@/components/BottomTabBar';
import COLORS from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.profileRow}>
        <Image
          source={{ uri: 'https://i.imgur.com/5nRyz9C.png' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>ooo</Text>
      </View>

      <View style={styles.menuWrapper}>
        <MenuItem icon="create-outline" label="Edit profile" onPress={() => {}} />
        <MenuItem icon="eye-outline" label="Profile Preview" onPress={() => {}} />
        <MenuItem icon="settings-outline" label="Settings" onPress={() => {}} />
      </View>

      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>

      <BottomTabBar />
    </View>
  );
}

const MenuItem = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuContent}>
      <Ionicons name={icon} size={20} color={COLORS.DARK_GRAY} style={styles.menuIcon} />
      <Text style={styles.menuText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.DARK_GRAY} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: 60,
  },
  header: {
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 22,
    color: COLORS.BLACK,
    marginBottom: 50,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginHorizontal: 22,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginRight: 40,
  },
  username: {
    fontSize: 30,
    fontWeight: '400',
    color: COLORS.BLACK,
  },
  menuWrapper: {
    marginHorizontal: 22,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomColor: COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  logout: {
    fontSize: 16,
    color: COLORS.BLACK,
    textDecorationLine: 'underline',
    marginHorizontal: 25,
    marginBottom: 50,
  },
});
