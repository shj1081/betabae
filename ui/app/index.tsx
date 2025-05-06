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
import ListFilterTab from "@/components/ListFilterTab";
import BirthdayField from "@/components/BirthdayField";
import ProfileRegisterButton from "@/components/ProfileRegisterButton";
import MultipleButton from "@/components/MultipleButton";
import PhotoUploader from "@/components/PhotoUploader";
import TalkButton from "@/components/TalkButton";
import SelfIntroInput from "@/components/SelfIntroInput";
import ResultBar from "@/components/ResultBar";
import BackButton from "@/components/BackButton";
import LoginPage from "./auth/LoginPage";
import SignupBasicPage from "./auth/signup/SignupBasicPage";
import SignupAuthPage from "./auth/signup/SignupAuthPage";
import AddressPage from "./auth/signup/AddressPage";
import NicknamePage from "./auth/signup/NicknamePage";
import BasicInfoPage from "./profile/BasicInfoPage";
import MbtiPage from "./profile/MbtiPage";
import PersonalityPage from "./profile/PersonalityPage";
import PhotoRegisterPage from "./profile/PhotoRegisterPage";
import SeriousnessPage from "./profile/SeriousnessPage";

export default function Index() {
  const [gender, setGender] = useState('');

  return (
    <BasicInfoPage />


    // <View>
    //   <ScrollView>
    //     {/* <ChatFilterTab tabs={['All', 'BetaBae', 'RealBae']} />
    //     <ListFilterTab selected={selectedTab} onSelect={setSelectedTab} /> */}
    //     <BackButton onPress={() => navigation.goBack()} />
    //     <TextField label="Email" placeholder="Please enter." />
    //     <SelfIntroInput />
    //     <ResultBar
    //       leftLabel="Openness"
    //       rightLabel="Conservativity"
    //       percentage={25}
    //       color="#D5715B"
    //     />
    //     {/* <MultipleButton 
    //       label="Religion"
    //       options={['No', 'Buddhism', 'Christianity', 'Islam', 'Catholicism', 'Else']}
    //     /> */}
    //     {/* <BirthdayField
    //       year={year}
    //       month={month}
    //       day={day}
    //       onChange={(y, m, d) => {
    //         setYear(y);
    //         setMonth(m);
    //         setDay(d);
    //       }}
    //     />
    //     <AddressBox /> */}
    //     {/* <PhotoUploader /> */}
    //     <TalkButton />
    //     <ToggleButton
    //       label="Gender"
    //       options={['Male', 'Female']}
    //       selected={gender}
    //       onSelect={(option) => setGender(option)}
    //     />
    //     <LikabilityBar percent={80} />
    //     <ProfileRegisterButton />
    //     {/* <MbtiSlider labelLeft="Introverted" labelRight="Extrovert" value={ie} onChange={setIe} />
    //     <LikertSlider
    //       question="1. Gets nervous easily"
    //       value={value1}
    //       onChange={setValue1}
    //     /> */}
    //     <CompleteButton title="Complete"/>
    //   </ScrollView>
    //   {/* <BottomTabBar /> */}
    // </View>
  );
}
