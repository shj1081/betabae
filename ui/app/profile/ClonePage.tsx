import React, { useState } from "react";
import { View, StyleSheet, Text, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, } from 'react-native';
import { useRouter } from 'expo-router';
import InputField from '@/components/InputField';
import BackButton from '@/components/BackButton';
import CompleteButton from '@/components/CompleteButton';
import COLORS from "@/constants/colors";

export default function ClonePage () {
    const router = useRouter();
    const [q1, setQ1] = useState('');
    const [q2, setQ2] = useState('');
    const [q3, setQ3] = useState('');
    const [q4, setQ4] = useState('');
    const [q5, setQ5] = useState('');
    const [q6, setQ6] = useState('');
    const [q7, setQ7] = useState('');
    const [q8, setQ8] = useState('');
    const [q9, setQ9] = useState('');
    const [q10, setQ10] = useState('');

    // const handleComplete = async () => {
    //     const answers = [q1, q2, q3, q4, q5];

    //     try {
    //        router.push('/match/MatchingPage');

    //     } catch (err.any) {

    //     }
    // }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <BackButton />
                        <Text style={styles.title}>Write your answers</Text>
                        <Text style={styles.subtitle}>To make my own BetaBae</Text>
                        <View style={styles.divider} />

                        <InputField 
                            label="Q1. ~~~"
                            placeholder="Please enter."
                            value={q1}
                            onChangeText={setQ1}
                        />

                        <InputField 
                            label="Q2. ~~~"
                            placeholder="Please enter."
                            value={q2}
                            onChangeText={setQ2}
                        />
                </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.buttonWrapper}>
                <CompleteButton title="Complete" onPress={() => {}}/>
            </View>
        </SafeAreaView>
    )

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
    fontSize: 16,
    color: COLORS.DARK_GRAY,
    marginHorizontal: 25,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
    marginBottom: 50,
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
