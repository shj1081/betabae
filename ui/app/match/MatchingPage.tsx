import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Image, Platform } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import BottomTabBar from '@/components/BottomTabBar';
import LikabilityBar from '@/components/LikabilityBar';
import COLORS from '@/constants/colors';
import api from '@/lib/api';

const { width } = Dimensions.get('window');

interface FeedUser {
  id: number;
  nickname: string;
  age: number;
  location: string;
  gender: string;
  city: string;
  province: string;
  profileImageUrl: string | null;
  compatibilityScore: number;
  tags?: string[]; 
}

export default function MatchingPage() {
  const [cards, setCards] = useState<FeedUser[]>([]);

  useEffect(() => {
  const fetchFeed = async () => {
    try {
      const res = await api.get('/feed');
      console.log('🧾 Feed response:', res.data.users); 
      setCards(res.data.users);
    } catch (err) {
      console.error('❌ Feed fetch error:', err);
    }
  };

  fetchFeed();
}, []);


  const onSwipedRight = async (cardIndex: number) => {
    const likedUser = cards[cardIndex];
    console.log('💌 likedUser:', likedUser);

    try {
      const response = await api.post('/match', {
        requestedId: likedUser.id,
      });
      console.log('✅ Match created:', response.data);
      Alert.alert('Like!', `${likedUser.nickname}님을 좋아요했어요`);
    } catch (err: any) {
      console.error('❌ Match create error:', err.response?.data || err.message);
      Alert.alert('에러', err.response?.data?.message || '요청 실패');
    }
  };

  const onSwipedLeft = (cardIndex: number) => {
    console.log('Pass..');
    Alert.alert('Pass!', `${cards[cardIndex]?.nickname}님을 넘겼어요`);
  };

  const onSwipedBottom = (cardIndex: number) => {
    console.log('Info!');
    Alert.alert('Info', `${cards[cardIndex]?.nickname}님의 정보를 확인합니다`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📌 Today's Pick</Text>

      <View style={styles.swiperWrapper}>
        <Swiper
          cards={cards}
          renderCard={(card) =>
            card ? (
              <View style={styles.card}>
                {card.profileImageUrl ? (
                  <Image source={{ uri: card.profileImageUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text>No Image</Text>
                  </View>
                )}
                <View style={styles.info}>
                  <Text style={styles.name}>{card.nickname}</Text>
                  <Text style={styles.sub}>
                    {card.city || card.province} · {card.age}
                  </Text>
                  <View style={styles.tagRow}>
                    {(card.tags || []).map((tag, idx) => (
                      <View style={styles.tag} key={idx}>
                        <Text style={styles.tagText}># {tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <LikabilityBar percent={card.compatibilityScore} />
              </View>
            ) : null
          }
          onSwipedRight={onSwipedRight}
          onSwipedLeft={onSwipedLeft}
          onSwipedBottom={onSwipedBottom}
          backgroundColor="transparent"
          stackSize={2}
          verticalSwipe={true}
          horizontalSwipe={true}
          disableTopSwipe={Platform.OS === 'web'}
          disableBottomSwipe={Platform.OS === 'web'}
          swipeThreshold={Platform.OS === 'web' ? 30 : 80}
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
    marginHorizontal: 400,
    width: width * 0.5,
    height: width * 0.5,
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
