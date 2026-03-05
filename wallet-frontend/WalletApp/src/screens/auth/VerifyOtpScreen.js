import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingModal from '../../components/LoadingModal';
import { COLORS } from '../../utils/constants';
import authApi from '../../api/authApi';

const VerifyOtpScreen = ({ navigation, route }) => {
  const { mobile, tempToken: initialTempToken } = route.params;
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState(initialTempToken);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    let interval = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const onSubmit = async (data) => {
    if (data.otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp(mobile, data.otp, tempToken);
      setLoading(false);

      // Check response to determine next step
      if (response.requiresRegistration) {
        // New user - go to register screen
        navigation.navigate('Register', {
          mobile,
          tempToken: response.tempToken,
        });
      } else if (response.requiresMpinSetup) {
        // Existing user but no MPIN - go to set MPIN
        navigation.navigate('SetMpin', {
          token: response.tempToken,
        });
      } else {
        // Existing user with MPIN - go to login
        Alert.alert('Success', 'OTP verified successfully');
        navigation.navigate('Login');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await authApi.sendOtp(mobile);
      setTempToken(response.tempToken);
      setTimer(60);
      setCanResend(false);
      setLoading(false);
      Alert.alert('Success', 'OTP resent successfully');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="lock-clock" size={60} color={COLORS.primary} />
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to
          </Text>
          <Text style={styles.mobileText}>{mobile}</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            rules={{
              required: 'OTP is required',
              minLength: {
                value: 6,
                message: 'OTP must be 6 digits',
              },
              maxLength: {
                value: 6,
                message: 'OTP must be 6 digits',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="OTP"
                placeholder="Enter 6-digit OTP"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                error={errors.otp}
                touched={true}
                maxLength={6}
                leftIcon={<Icon name="lock" size={20} color={COLORS.gray} />}
              />
            )}
            name="otp"
          />

          <CustomButton
            title="Verify OTP"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
          />

          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend OTP in {timer} seconds
              </Text>
            )}
          </View>
        </View>
      </View>
      <LoadingModal visible={loading} message="Verifying OTP..." />
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
    marginTop: 5,
  },
  mobileText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    color: COLORS.gray,
    fontSize: 14,
  },
});

export default VerifyOtpScreen;