import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import InputField from "@/components/InputField";
import BackButton from "@/components/BackButton";
import CompleteButton from "@/components/CompleteButton";
import PopupWindow from '@/components/PopupWindow';
import COLORS from "@/constants/colors";
import api from "@/lib/api";

export default function ClonePage() {
  const router = useRouter();

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");
  const [q7, setQ7] = useState("");
  const [q8, setQ8] = useState("");
  const [q9, setQ9] = useState("");
  const [q10, setQ10] = useState("");

  const [userId, setUserId] = useState<number | null>(null);
  const [errorPopupVisible, setErrorPopupVisible] = useState(false);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        setUserId(res.data.user?.id ?? null);
      } catch (err) {
        console.error("load user profile error:", err);
        Alert.alert("error", "loading error");
      }
    };
    fetchUserProfile();
  }, []);

  const handleComplete = async () => {
    if (!userId) {
      Alert.alert("error", "error");
      return;
    }

    const answers = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10];
    const hasEmpty = answers.some((ans) => ans.trim() === "");
    if (hasEmpty) {
      setErrorPopupVisible(true);
      return;
    }

    try {
      await api.post("/llm-clone/create", {
        sampleUserResponses: answers,
      });

      setSuccessPopupVisible(true);
    } catch (error: any) {
      console.error("createBetaBae 실패:", error.response ?? error.message);
      Alert.alert("Failed to make clone.");
    }
  };

  const handleErrorPopupClose = () => setErrorPopupVisible(false);
  const handleSuccessPopupClose = () => {
    setSuccessPopupVisible(false);
    router.push("/match/MatchingPage");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <BackButton />
          <Text style={styles.title}>Write your answers</Text>
          <Text style={styles.subtitle}>To make my own BetaBae clone</Text>
          <View style={styles.divider} />

          <InputField
            label="Q1. How do you usually greet someone in a chat?"
            placeholder="e.g., 'Hello ^^'"
            value={q1}
            onChangeText={setQ1}
          />

          <InputField
            label="Q2. What words or phrases do you use most often?"
            placeholder="e.g., 'LOL', 'Exactly', 'hmm', etc."
            value={q2}
            onChangeText={setQ2}
          />

          <InputField
            label="Q3. How do you show excitement or enthusiasm?"
            placeholder="e.g., 'That's awesome!!!', 'Can't wait!'"
            value={q3}
            onChangeText={setQ3}
          />

          <InputField
            label="Q4. How do you express empathy when someone shares a problem?"
            placeholder="e.g., 'I understand how you feel…'"
            value={q4}
            onChangeText={setQ4}
          />

          <InputField
            label="Q5. What is your favorite way to offer advice?"
            placeholder="e.g., 'Maybe you could try…'"
            value={q5}
            onChangeText={setQ5}
          />

          <InputField
            label="Q6. How do you jokingly tease a friend?"
            placeholder="e.g., 'Oh come on, you know that's not true!'"
            value={q6}
            onChangeText={setQ6}
          />

          <InputField
            label="Q7. How do you apologize when you make a mistake?"
            placeholder="e.g., 'Sorry, I'll fix it right away.'"
            value={q7}
            onChangeText={setQ7}
          />

          <InputField
            label="Q8. How would you ask someone about their day?"
            placeholder="e.g., 'How’s your day going? What’ve you been up to?'"
            value={q8}
            onChangeText={setQ8}
          />

          <InputField
            label="Q9. How do you end a conversation politely?"
            placeholder="e.g., 'Talk soon! Take care.'"
            value={q9}
            onChangeText={setQ9}
          />

          <InputField
            label="Q10. Describe your overall tone when talking to friends."
            placeholder="e.g., 'Casual and friendly, with a hint of humor.'"
            value={q10}
            onChangeText={setQ10}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.buttonWrapper}>
        <CompleteButton title="Complete" onPress={handleComplete} />
      </View>
      
      <PopupWindow
        visible={errorPopupVisible}
        title="Error"
        message="Please fill out all fields."
        onCancel={handleErrorPopupClose}
        onConfirm={handleErrorPopupClose}
      />

      <PopupWindow
        visible={successPopupVisible}
        title="Congratulations 🎉"
        message="Your profile created."
        onCancel={handleSuccessPopupClose}
        onConfirm={handleSuccessPopupClose}
      />

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
    fontWeight: "700",
    marginHorizontal: 22,
    marginBottom: 10,
    color: COLORS.BLACK,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.DARK_GRAY,
    marginHorizontal: 22,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
