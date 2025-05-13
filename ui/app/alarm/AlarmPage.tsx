import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import TalkButton from '@/components/TalkButton';
import MatchingButton from '@/components/MatchingButton';
import BottomTabBar from '@/components/BottomTabBar';
import COLORS from '@/constants/colors';

const notifications = [
  {
    id: '1',
    image: require('@/assets/images/example.jpg'),
    text: 'Match rejected 😢',
    time: 'PM 3:30',
    type: 'text',
  },
  {
    id: '2',
    image: require('@/assets/images/example.jpg'),
    text: 'Someone started a chat with my BetaBae!',
    time: 'PM 1:00',
    type: 'chat',
  },
  {
    id: '3',
    image: require('@/assets/images/example.jpg'),
    text: 'Matching came in 😍',
    time: 'AM 07:30',
    type: 'match',
  },
];

export default function AlarmPage() {
  const [selected, setSelected] = useState<'reject' | 'accept' | null>(null);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notification}>
      <Image source={item.image} style={styles.avatar} />
      <View style={styles.textSection}>
        <Text style={styles.message}>{item.text}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {item.type === 'chat' && (
        <TalkButton onPress={() => {}} title="Talk with BetaBae" />
      )}
      {item.type === 'match' && (
        <MatchingButton
          selected={selected || 'reject'}
          onSelect={setSelected}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification</Text>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 22,
    marginBottom: 20,
    color: COLORS.BLACK,
  },
  list: {
    paddingBottom: 80,
  },
  notification: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 10,
  },
  textSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  message: {
    fontSize: 16,
    color: COLORS.BLACK,
    flex: 1,
  },
  time: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 16,
  },
});
