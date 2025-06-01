import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FilterTabsProps {
  tabs: string[];
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

const ChatFilterTab = ({ tabs, selectedTab, onTabChange }: FilterTabsProps) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            selectedTab === tab ? styles.selectedTab : styles.unselectedTab,
          ]}
          onPress={() => onTabChange(tab)} 
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === tab ? styles.selectedTabText : styles.unselectedTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ChatFilterTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 50,
  },
  selectedTab: {
    backgroundColor: '#000',
  },
  unselectedTab: {
    backgroundColor: '#EBEBEB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedTabText: {
    color: '#fff',
  },
  unselectedTabText: {
    color: '#000',
  },
});
