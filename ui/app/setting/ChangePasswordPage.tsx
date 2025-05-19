import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BackButton from '@/components/BackButton';
import InputField from '@/components/InputField';
import CompleteButton from '@/components/CompleteButton';
import PopupWindow from '@/components/PopupWindow';
import COLORS from '@/constants/colors';
import api from '@/lib/api';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%^&*()\-_=+!./?]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required.');
      valid = false;
    } else {
      setCurrentPasswordError('');
    }

    if (!validatePassword(newPassword)) {
      setNewPasswordError('Passwords must contain at least one alpha one numeric and one ( @#$*&"()_-+=. / ) character.');
      valid = false;
    } else {
      setNewPasswordError('');
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!valid) return;

    try {
      await api.put('/user/credential', {
        currentPassword,
        newPassword,
      });

      setShowSuccessModal(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password';

      if (message.includes('Current password is incorrect')) {
        setCurrentPasswordError('Passwords are wrong.');
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <BackButton />

        <InputField
          label="Current password"
          placeholder="Please enter."
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        {currentPasswordError ? <Text style={styles.error}>{currentPasswordError}</Text> : null}

        <InputField
          label="New password"
          placeholder="Please enter."
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        {newPasswordError ? <Text style={styles.error}>{newPasswordError}</Text> : null}

        <InputField
          label="Confirm new password"
          placeholder="Please enter."
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}

        <CompleteButton title="Complete" onPress={handleSubmit} />
      </ScrollView>

      <PopupWindow
        visible={showSuccessModal}
        title="Password Changed"
        message="Your password has been updated successfully."
        onCancel={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: -24,
    marginBottom: 20,
    marginHorizontal: 22,
  },
});
