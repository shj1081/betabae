import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import ListFilterTab from '@/components/ListFilterTab';
import TalkButton from '@/components/TalkButton';
import COLORS from '@/constants/colors';
import BottomTabBar from '@/components/BottomTabBar';

interface UserItem {
  id: string;
  nickname: string;
  avatar: any;
  matchStatus: 'matched' | 'liked';
}

const dummyData: UserItem[] = [
  {
    id: '1',
    nickname: 'XXX',
    avatar: require('@/assets/images/BetaBaeLogo.png'),
    matchStatus: 'liked',
  },
  {
    id: '2',
    nickname: 'XXX',
    avatar: require('@/assets/images/BetaBaeLogo.png'),
    matchStatus: 'matched',
  },
];

export default function ListPage() {
  const [selectedTab, setSelectedTab] = useState<'liked' | 'likedMe'>('liked');

  const filteredData = dummyData.filter((user) =>
    selectedTab === 'liked' ? user.matchStatus === 'liked' : true
  );

  const renderItem = ({ item }: { item: UserItem }) => (
    <View style={styles.item}>
      <Image source={item.avatar} style={styles.avatar} />
      <Text style={styles.nickname}>{item.nickname}</Text>
      <TalkButton
        title={item.matchStatus === 'matched' ? 'Talk with BetaBae' : 'Match'}
        onPress={() => {}}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List</Text>
      <ListFilterTab selected={selectedTab} onSelect={setSelectedTab} />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 100 }}
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    marginLeft: 15,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
  },
});
