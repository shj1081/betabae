import CompleteButton from "@/components/CompleteButton";
import TextField from "@/components/InputField";
import ToggleButton from "@/components/ToggleButton";
import { Text, View } from "react-native";
import { useState } from "react";
import AddressBox from "@/components/AddressBox";
import BottomTabBar from "@/components/BottomTabBar";
import ChatFilterTab from "@/components/ChatFilterTab";
import MatchingPage from "./MatchingPage";
import LikabilityBar from "@/components/LikabilityBar";


export default function Index() {
  const [gender, setGender] = useState('');
  return (
    <View>
      <ChatFilterTab tabs={['All', 'BetaBae', 'RealBae']} />
      <TextField label="Email" placeholder="Please enter." />
      <AddressBox />
      <ToggleButton
        label="Gender"
        options={['Male', 'Female']}
        selected={gender}
        onSelect={(option) => setGender(option)}
      />
      <LikabilityBar percent={80} />
      <CompleteButton title="Complete"/>

      <BottomTabBar />
    </View>
  );
}
