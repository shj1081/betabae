import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import COLORS from '@/constants/colors';

interface Props {
  selected: 'liked' | 'likedMe';
  onSelect: (value: 'liked' | 'likedMe') => void;
}

const ListFilterTab = ({ selected, onSelect }: Props) => {
  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => onSelect('liked')}
        style={[styles.tab, selected === 'liked' && styles.selectedTab]}
      >
        <Text style={[styles.tabText, selected === 'liked' && styles.selectedText]}>
          Liked
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onSelect('likedMe')}
        style={[styles.tab, selected === 'likedMe' && styles.selectedTab]}
      >
        <Text style={[styles.tabText, selected === 'likedMe' && styles.selectedText]}>
          Liked me
        </Text>
      </Pressable>
    </View>
  );
};

export default ListFilterTab;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 999,
    padding: 4,
    marginVertical: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 999,
  },
  selectedTab: {
    backgroundColor: COLORS.WHITE,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
  },
  selectedText: {
    color: COLORS.BLACK,
  },
});
