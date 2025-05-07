import React from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Image } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import BottomTabBar from '@/components/BottomTabBar';
import LikabilityBar from '@/components/LikabilityBar';
import COLORS from '@/constants/colors';

const { width } = Dimensions.get('window');

const cards = [
  {
    nickname: 'NickName1',
    age: 27,
    location: 'Seoul',
    tags: ['ENTJ', 'Movie', 'Concert', 'OCEAN'],
    percent: 88,
    image: require('@/assets/images/example.jpg'), 
  },

];

export default function MatchingPage() {
  const onSwipedRight = (cardIndex: number) => {
    Alert.alert('Like!', `${cards[cardIndex]?.nickname}님을 좋아요했어요`);
  };

  const onSwipedLeft = (cardIndex: number) => {
    Alert.alert('Pass!', `${cards[cardIndex]?.nickname}님을 넘겼어요`);
  };

  const onSwipedBottom = (cardIndex: number) => {
    Alert.alert('Info', `${cards[cardIndex]?.nickname}님의 정보를 확인합니다`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📌 Today's Pick</Text>

      <View style={styles.swiperWrapper}>
        <Swiper
          cards={cards}
          renderCard={(card) => (
            <View style={styles.card}>
              <Image source={card.image} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.name}>{card.nickname}</Text>
                <Text style={styles.sub}>
                  {card.location} · {card.age}
                </Text>
                <View style={styles.tagRow}>
                  {card.tags.map((tag, idx) => (
                    <View style={styles.tag} key={idx}>
                      <Text style={styles.tagText}># {tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <LikabilityBar percent={card.percent} />
            </View>
          )}
          onSwipedRight={onSwipedRight}
          onSwipedLeft={onSwipedLeft}
          onSwipedBottom={onSwipedBottom}
          backgroundColor="transparent"
          stackSize={2}
          verticalSwipe={true}
          horizontalSwipe={true}
          swipeThreshold={80}
          cardHorizontalMargin={0}
        />
      </View>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: COLORS.WHITE,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 22,
    color: COLORS.BLACK,
  },
  swiperWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginHorizontal: 20,
  },
  card: {
    width: width * 0.9,
    height: width * 1.4,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    overflow: 'hidden',
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  info: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  sub: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 6,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.BLACK,
  },
});
