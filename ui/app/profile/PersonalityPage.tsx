import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BackButton from '@/components/BackButton';
import CompleteButton from '@/components/CompleteButton';
import LikertSlider from '@/components/LikertSlider';
import COLORS from '@/constants/colors';

export default function PersonalityPage() {
  const [q1, setQ1] = useState(3);
  const [q2, setQ2] = useState(3);
  const [q3, setQ3] = useState(3);
  const [q4, setQ4] = useState(3);
  const [q5, setQ5] = useState(3);
  const [q6, setQ6] = useState(3);
  const [q7, setQ7] = useState(3);
  const [q8, setQ8] = useState(3);
  const [q9, setQ9] = useState(3);
  const [q10, setQ10] = useState(3);

  const handleNext = () => {

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton onPress={() => {}} />
        <Text style={styles.title}>5 Personality Test</Text>
        <Text style={styles.subtitle}>"I see myself as someone who..."</Text>

        <LikertSlider
          question="1. Gets nervous easily"
          value={q1}
          onChange={setQ1}
        />
        <LikertSlider
          question="2. Is outgoing, sociable"
          value={q2}
          onChange={setQ2}
        />
        <LikertSlider
          question="3. Is reserved"
          value={q3}
          onChange={setQ3}
        />
        <LikertSlider
          question="4. Has an active imagination"
          value={q4}
          onChange={setQ4}
        />
        <LikertSlider
          question="5. Is generally trusting"
          value={q5}
          onChange={setQ5}
        />

        <LikertSlider
          question="6. Has few artistic interests"
          value={q6}
          onChange={setQ6}
        />
        
        <LikertSlider
          question="7. Tends to be lazy"
          value={q7}
          onChange={setQ7}
        />

        <LikertSlider
          question="8. Gets nervous easily"
          value={q8}
          onChange={setQ8}
        />

        <LikertSlider
          question="9. Tends to find fault with others"
          value={q9}
          onChange={setQ9}
        />

        <LikertSlider
          question="10. Is relaxed, handles stress well"
          value={q10}
          onChange={setQ10}
        />


        <View style={styles.buttonWrapper}>
          <CompleteButton title="Next" onPress={handleNext} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 22,
    marginBottom: 25,
    color: COLORS.BLACK,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 22,
    marginBottom: 16,
    color: COLORS.BLACK,
  },
  buttonWrapper: {
    marginHorizontal: 10,
    marginTop: 20,
  },
});
