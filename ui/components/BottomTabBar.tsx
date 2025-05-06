import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const BottomTabBar = () => {
  const [selectedTab, setSelectedTab] = useState('Main');

  return (
    <View style={styles.container}>
      <View style={styles.separator} />
      <View style={styles.tabContainer}>
        <TabItem label="Main" icon={<HomeIcon />} selected={selectedTab === 'Main'} onPress={() => setSelectedTab('Main')} />
        <TabItem label="List" icon={<HeartIcon />} selected={selectedTab === 'List'} onPress={() => setSelectedTab('List')} />
        <TabItem label="Alarm" icon={<BellIcon />} selected={selectedTab === 'Alarm'} onPress={() => setSelectedTab('Alarm')} />
        <TabItem label="Chat" icon={<ChatIcon />} selected={selectedTab === 'Chat'} onPress={() => setSelectedTab('Chat')} />
        <TabItem label="Profile" icon={<ProfileIcon />} selected={selectedTab === 'Profile'} onPress={() => setSelectedTab('Profile')} />
      </View>
    </View>
  );
};

const TabItem = ({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}) => {
  const color = selected ? '#C52B67' : '#666';

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      {React.cloneElement(icon as React.ReactElement, { color })}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 3,
  },
  iconStyle: {
    marginBottom: 5,
  },
});


const HomeIcon = ({ color = '#666' }: { color?: string }) => (
  <Svg height="28" viewBox="0 -960 960 960" width="28" fill={color} style={styles.iconStyle}>
    <Path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
  </Svg>
);

const HeartIcon = ({ color = '#666' }: { color?: string }) => (
  <Svg height="28" viewBox="0 -960 960 960" width="28" fill={color} style={styles.iconStyle}>
    <Path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
  </Svg>
);

const BellIcon = ({ color = '#666' }: { color?: string }) => (
  <Svg height="28" viewBox="0 -960 960 960" width="28" fill={color} style={styles.iconStyle}>
    <Path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
  </Svg>
);

const ChatIcon = ({ color = '#666' }: { color?: string }) => (
  <Svg height="28" viewBox="0 -960 960 960" width="28" fill={color} style={styles.iconStyle}>
    <Path d="M480-80 373-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H587L480-80Zm0-144 64-96h256v-480H160v480h256l64 96Zm0-336Z" />
  </Svg>
);

const ProfileIcon = ({ color = '#666' }: { color?: string }) => (
  <Svg height="28" viewBox="0 -960 960 960" width="28" fill={color} style={styles.iconStyle}>
    <Path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
  </Svg>
);
