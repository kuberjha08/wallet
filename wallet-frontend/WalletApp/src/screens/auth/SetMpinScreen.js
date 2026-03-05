import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingModal from '../../components/LoadingModal';
import { COLORS } from '../../utils/constants';
import authApi from '../../api/authApi';

const SetMpinScreen = ({ navigation, route }) => {
  const { token } = route.params;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mpin: '',
      confirmMpin: '',
    },
  });

  const mpin = watch('mpin');

  const onSubmit = async (data) => {
    if (data.mpin !== data.confirmMpin) {
      Alert.alert('Error', 'MPIN and Confirm MPIN do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.setMpin(token, data.mpin);
      setLoading(false);
      
      Alert.alert(
        'Success',
        'MPIN set successfully! Please login with your MPIN.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to set MPIN');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="lock" size={60} color={COLORS.primary} />
          <Text style={styles.title}>Set MPIN</Text>
          <Text style={styles.subtitle}>
            Create a 4-digit MPIN for quick login
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            rules={{
              required: 'MPIN is required',
              minLength: {
                value: 4,
                message: 'MPIN must be 4 digits',
              },
              maxLength: {
                value: 4,
                message: 'MPIN must be 4 digits',
              },
              pattern: {
                value: /^[0-9]{4}$/,
                message: 'MPIN must contain only numbers',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="MPIN"
                placeholder="Enter 4-digit MPIN"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                secureTextEntry
                error={errors.mpin}
                touched={true}
                maxLength={4}
                leftIcon={<Icon name="lock-outline" size={20} color={COLORS.gray} />}
              />
            )}
            name="mpin"
          />

          <Controller
            control={control}
            rules={{
              required: 'Please confirm your MPIN',
              validate: (value) =>
                value === mpin || 'MPIN does not match',
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Confirm MPIN"
                placeholder="Re-enter 4-digit MPIN"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                secureTextEntry
                error={errors.confirmMpin}
                touched={true}
                maxLength={4}
                leftIcon={<Icon name="lock-outline" size={20} color={COLORS.gray} />}
              />
            )}
            name="confirmMpin"
          />

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>MPIN Tips:</Text>
            <Text style={styles.tipText}>• Use 4-digit number only</Text>
            <Text style={styles.tipText}>• Avoid obvious combinations like 1234</Text>
            <Text style={styles.tipText}>• Don't share your MPIN with anyone</Text>
          </View>

          <CustomButton
            title="Set MPIN"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
          />
        </View>
      </View>
      <LoadingModal visible={loading} message="Setting MPIN..." />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  tipsContainer: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
    marginVertical: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
});

export default SetMpinScreen;