import CompleteButton from "@/components/CompleteButton";
import TextField from "@/components/InputField";
import ToggleButton from "@/components/ToggleButton";
import { ScrollView, Text, View } from "react-native";
import { useState } from "react";
import AddressBox from "@/components/AddressBox";
import BottomTabBar from "@/components/BottomTabBar";
import ChatFilterTab from "@/components/ChatFilterTab";
import LikabilityBar from "@/components/LikabilityBar";
import MbtiSlider from "@/components/MbtiSlider";
import LikertSlider from "@/components/LikertSlider";


export default function Index() {
  const [gender, setGender] = useState('');
  const [ie, setIe] = useState(50);
  const [value1, setValue1] = useState(3);

  return (
    <View>
      <ScrollView>
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
        <MbtiSlider labelLeft="Introverted" labelRight="Extrovert" value={ie} onChange={setIe} />
        <LikertSlider
          question="1. Gets nervous easily"
          value={value1}
          onChange={setValue1}
        />
        <CompleteButton title="Complete"/>
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}
