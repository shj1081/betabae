import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import COLORS from '@/constants/colors';
import BackButton from '@/components/BackButton';
import CompleteButton from '@/components/CompleteButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';
import PopupWindow from '@/components/PopupWindow'; 

interface InterestItemProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  onDelete: () => void;
}

const InterestItem = ({ label, isSelected, onPress, onDelete }: InterestItemProps) => (
  <View style={[styles.itemWrapper, isSelected && styles.selectedItem]}>
    <TouchableOpacity onPress={onPress} style={styles.itemContent}>
      <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
        {label}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onDelete}>
      <Text style={styles.deleteText}>  ✕</Text>
    </TouchableOpacity>
  </View>
);

export default function InterestPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>([
    'Movie',
    'Cafe',
    'Shopping',
    'Travel',
    'Running',
    'Bakery',
    'Cooking',
    'Reading',
  ]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  const [showPopup, setShowPopup] = useState(false);
  const handlePopupClose = () => setShowPopup(false);

  const toggleSelect = (label: string) => {
    if (selected.includes(label)) {
      setSelected((prev) => prev.filter((i) => i !== label));
    } else {
      setSelected((prev) => [...prev, label]);
    }
  };

  const deleteInterest = (label: string) => {
    setInterests((prev) => prev.filter((i) => i !== label));
    setSelected((prev) => prev.filter((i) => i !== label));
  };

  const handleAdd = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
    }
    setNewInterest('');
    setIsAdding(false);
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setShowPopup(true);
      return;
    }

    useProfileStore.getState().setProfile({
      interests: selected,
    });

    router.push('/profile/MbtiPage'); 
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Check your interest.</Text>
      <Text style={styles.subtitle}>Select maximum 8  ({selected.length}/8)</Text>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>All Interests</Text>
        <View style={styles.row}>
          {interests.map((item) => (
            <InterestItem
              key={item}
              label={item}
              isSelected={selected.includes(item)}
              onPress={() => toggleSelect(item)}
              onDelete={() => deleteInterest(item)}
            />
          ))}

          {isAdding ? (
            <View style={styles.itemWrapper}>
              <TextInput
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder=""
                style={[
                  styles.itemText,
                  {
                    width: Math.min(Math.max(newInterest.length * 10 + 20, 50), 160),
                  },
                ]}
                autoFocus
                onSubmitEditing={handleAdd}
                onBlur={handleAdd}
              />
            </View>
          ) : (
            <TouchableOpacity style={styles.itemWrapper} onPress={() => setIsAdding(true)}>
              <Ionicons name="add" size={18} color={COLORS.BLACK} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <CompleteButton title="Next" onPress={handleNext} />
      </View>
      
      <PopupWindow
        visible={showPopup}
        title="Error"
        message="Please fill out all fields."
        onCancel={handlePopupClose}
        onConfirm={handlePopupClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.BLACK,
    borderWidth: 2,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 15,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectedItem: {
    backgroundColor: COLORS.BLACK,
  },
  itemContent: {
    marginRight: 6,
  },
  itemText: {
    color: COLORS.BLACK,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedItemText: {
    color: COLORS.WHITE,
  },
  deleteText: {
    fontSize: 14,
    color: COLORS.SUB,
    fontWeight: 'bold',
  },
  buttonWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
});
