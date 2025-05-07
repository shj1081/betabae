import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import ResultBar from '@/components/ResultBar';
import CompleteButton from '@/components/CompleteButton';
import BackButton from '@/components/BackButton';
import COLORS from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function PersonalityResultPage () {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BackButton onPress={() => {}} />
          <Text style={styles.title}>Your score</Text>

          <ResultBar
            leftLabel="Openness"
            rightLabel="Conservativity"
            percentage={67}
            color="#DB816D"
          />

          <ResultBar
            leftLabel="Conscientiousness"
            rightLabel="Impulsiveness"
            percentage={85}
            color="#E1A652"
          />

          <ResultBar
            leftLabel="Extraversion"
            rightLabel="Introversion"
            percentage={30}
            color="#3D6B3D"
          />

          <ResultBar
            leftLabel="Agreeableness"
            rightLabel="Hostility"
            percentage={70}
            color="#1F2D61"
          />

          <ResultBar
            leftLabel="Neuroticism"
            rightLabel="Stability"
            percentage={22}
            color="#754E51"
          />

          <View style={styles.buttonWrapper}>
            <CompleteButton title="Next" onPress={() => router.push('/nextStep')} />
          </View>
        </ScrollView>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 22,
    marginVertical: 20,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    marginTop: 30,
    marginHorizontal: 10,
  },
});
