import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomTabBar from '@/components/BottomTabBar';
import COLORS from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PopupWindow from '@/components/PopupWindow';
import api from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    nickname: string;
    profile_image_url: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await api.post('/auth/logout');
      console.log('Logout success', response.data.message);

      router.replace('/auth/LoginPage');
    } catch (error: any) {
      console.error('Logout failed', error.response?.data || error.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile'); // 실제 API 경로로 수정 필요
      setProfile(response.data.profile);
    } catch (error: any) {
      console.error('Failed to load profile:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.MAIN} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.profileRow}>
        <Image
          source={{ uri: profile?.profile_image_url || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{profile?.nickname || 'Unknown'}</Text>
      </View>

      <View style={styles.menuWrapper}>
        <MenuItem icon="create-outline" label="Edit profile" onPress={() => {}} />
        <MenuItem icon="eye-outline" label="Profile Preview" onPress={() => {}} />
        <MenuItem icon="settings-outline" label="Settings" onPress={() => router.push('/setting/SettingsPage')} />
      </View>

      <TouchableOpacity onPress={() => setShowLogoutModal(true)}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>

      <BottomTabBar />

      <PopupWindow
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure want to log out?"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
      />
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
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLORS.WHITE,
},
});
