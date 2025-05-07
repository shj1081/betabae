import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const PopupWindow = ({ visible, title, message, onCancel, onConfirm }: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onCancel}>
              <Ionicons name="close" size={22} color="#555" />
            </Pressable>
          </View>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.separator} />

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PopupWindow;


const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: '85%',
      backgroundColor: COLORS.WHITE,
      borderRadius: 20,
      padding: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: COLORS.BLACK,
    },
    message: {
      fontSize: 16,
      color: COLORS.DARK_GRAY,
      marginBottom: 24,
    },
    separator: {
      height: 1,
      backgroundColor: COLORS.LIGHT_GRAY,
      marginBottom: 16,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 18,
      color: COLORS.BLACK,
      textDecorationLine: 'underline',
    },
    confirmButton: {
      backgroundColor: COLORS.BLACK,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 14,
    },
    confirmText: {
      color: COLORS.WHITE,
      fontSize: 18,
      fontWeight: '500',
    },
  });
  
