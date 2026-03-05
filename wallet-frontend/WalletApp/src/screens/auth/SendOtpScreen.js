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
import { validateMobile } from '../../utils/helpers';
import authApi from '../../api/authApi';

const SendOtpScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobile: '',
    },
  });

  const onSubmit = async (data) => {
    if (!validateMobile(data.mobile)) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.sendOtp(data.mobile);
      setLoading(false);
      
      // Navigate to verify OTP screen with mobile number and tempToken
      navigation.navigate('VerifyOtp', {
        mobile: data.mobile,
        tempToken: response.tempToken,
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Wallet</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to continue
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            rules={{
              required: 'Mobile number is required',
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Enter a valid 10-digit mobile number',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Mobile Number"
                placeholder="Enter your mobile number"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.mobile}
                touched={true}
                maxLength={10}
                leftIcon={<Icon name="phone" size={20} color={COLORS.gray} />}
              />
            )}
            name="mobile"
          />

          <CustomButton
            title="Send OTP"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
          />

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
      <LoadingModal visible={loading} message="Sending OTP..." />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SendOtpScreen;