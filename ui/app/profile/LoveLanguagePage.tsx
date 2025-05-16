import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import BackButton from '@/components/BackButton';
import CompleteButton from '@/components/CompleteButton';
import COLORS from '@/constants/colors';
import api from '@/lib/api';
import { useRouter } from 'expo-router';

const LANGUAGES = [
  'Words of affirmation',
  'Acts of service',
  'Receiving gifts',
  'Quality time',
  'Physical touch',
];

export default function LoveLanguagePage() {
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const router = useRouter();

  const toggleSelection = (language: string) => {
    const isSelected = selectedOrder.includes(language);
    if (isSelected) {
      setSelectedOrder(selectedOrder.filter((item) => item !== language));
    } else {
      if (selectedOrder.length < 5) {
        setSelectedOrder([...selectedOrder, language]);
      }
    }
  };

  const getRank = (language: string) => {
    const index = selectedOrder.indexOf(language);
    return index !== -1 ? index + 1 : null;
  };

  const handleSubmit = async () => {
    if (selectedOrder.length < 5) {
      Alert.alert('Please rank all 5 items.');
      return;
    }

    // 점수 매핑 (1등은 5점, 2등은 4점, ... 5등은 1점)
    const scores = Array(5).fill(0);
    selectedOrder.forEach((language, index) => {
      const score = 5 - index;
      const langIndex = LANGUAGES.indexOf(language);
      scores[langIndex] = score;
    });

    console.log('전송할 점수:', scores);

    try {
      await api.post('/user/lovelanguage/score', {
        answers: scores,
      });

      Alert.alert('성공', '러브랭귀지 결과가 저장되었습니다.');
      router.push('/profile/SeriousnessPage');
    } catch (err: any) {
      console.error('❌ 전송 실패:', err.response?.data || err.message);
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton />
      <Text style={styles.title}>Love Language</Text>
      <Text style={styles.subtitle}>Please rank them.</Text>
      <View style={styles.divider} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {LANGUAGES.map((language) => {
            const rank = getRank(language);
            return (
              <TouchableOpacity
                key={language}
                onPress={() => toggleSelection(language)}
                style={[
                  styles.languageButton,
                  rank !== null && styles.selectedButton,
                ]}
              >
                <View style={styles.rankCircle}>
                  {rank !== null && <Text style={styles.rankText}>{rank}</Text>}
                </View>
                <Text style={styles.languageText}>{language}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.buttonWrapper}>
          <CompleteButton title="Next" onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 22,
    marginBottom: 15,
    color: COLORS.BLACK,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.DARK_GRAY,
    marginHorizontal: 25,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 12,
  },
  selectedButton: {
    borderColor: COLORS.PRIMARY,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  languageText: {
    fontSize: 16,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
