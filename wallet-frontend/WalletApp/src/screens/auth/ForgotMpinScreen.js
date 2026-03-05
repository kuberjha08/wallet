import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingModal from '../../components/LoadingModal';
import { COLORS } from '../../utils/constants';
import { validateMobile } from '../../utils/helpers';
import authApi from '../../api/authApi';

const ForgotMpinScreen = ({ navigation, route }) => {
  // Login screen se mobile number le lo
  const initialMobile = route.params?.mobile || '';
  
  const [step, setStep] = useState(initialMobile ? 'otp' : 'mobile');
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobile: initialMobile,
      otp: '',
      newMpin: '',
      confirmMpin: '',
    },
  });

  const newMpin = watch('newMpin');

  // Timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0 && !canResend && step === 'otp') {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, canResend, step]);

  // Automatically send OTP if mobile number is provided
  useEffect(() => {
    if (initialMobile) {
      handleSendOtpAutomatically();
    }
  }, []);

  const handleSendOtpAutomatically = async () => {
    if (!validateMobile(initialMobile)) return;

    setLoading(true);
    try {
      await authApi.forgotMpinSendOtp(initialMobile);
      setMobileNumber(initialMobile);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  // Step 1: Send OTP (manual)
  const handleSendOtp = async (data) => {
    const mobile = data.mobile;
    
    if (!validateMobile(mobile)) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotMpinSendOtp(mobile);
      console.log('✅ OTP sent response:', response);
      
      setMobileNumber(mobile);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!validateMobile(mobileNumber)) return;

    setLoading(true);
    try {
      await authApi.forgotMpinSendOtp(mobileNumber);
      setTimer(60);
      setCanResend(false);
      Alert.alert('Success', 'OTP resent successfully');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  // Step 2: Verify OTP and Reset MPIN
  const handleResetMpin = async (data) => {
    if (data.otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    if (data.newMpin.length !== 4) {
      Alert.alert('Error', 'MPIN must be 4 digits');
      return;
    }

    if (data.newMpin !== data.confirmMpin) {
      Alert.alert('Error', 'MPIN and confirm MPIN do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetMpin(
        mobileNumber,
        data.otp,
        data.newMpin
      );
      console.log('✅ Reset MPIN response:', response);
      
      Alert.alert(
        'Success',
        'MPIN reset successfully! Please login with your new MPIN.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to reset MPIN');
    }
  };

  // Go back to mobile step
  const goBackToMobile = () => {
    setStep('mobile');
    setTimer(60);
    setCanResend(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="lock-reset" size={50} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Forgot MPIN</Text>
          <Text style={styles.subtitle}>
            {step === 'mobile' 
              ? 'Enter your mobile number to receive OTP'
              : `Enter OTP sent to ${mobileNumber}`}
          </Text>
        </View>

        {step === 'mobile' ? (
          // Step 1: Mobile Number Screen
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
              onPress={handleSubmit(handleSendOtp)}
              loading={loading}
              type="primary"
            />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={20} color={COLORS.primary} />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Step 2: OTP and Reset MPIN Screen
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

            <Controller
              control={control}
              rules={{
                required: 'New MPIN is required',
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
                  label="New MPIN"
                  placeholder="Enter 4-digit MPIN"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  secureTextEntry
                  error={errors.newMpin}
                  touched={true}
                  maxLength={4}
                  leftIcon={<Icon name="lock" size={20} color={COLORS.gray} />}
                />
              )}
              name="newMpin"
            />

            <Controller
              control={control}
              rules={{
                required: 'Please confirm your MPIN',
                validate: value => value === newMpin || 'MPIN does not match',
              }}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="Confirm MPIN"
                  placeholder="Re-enter MPIN"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  secureTextEntry
                  error={errors.confirmMpin}
                  touched={true}
                  maxLength={4}
                  leftIcon={<Icon name="lock" size={20} color={COLORS.gray} />}
                />
              )}
              name="confirmMpin"
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

            <CustomButton
              title="Reset MPIN"
              onPress={handleSubmit(handleResetMpin)}
              loading={loading}
              type="primary"
            />

            <TouchableOpacity
              style={styles.backButton}
              onPress={goBackToMobile}>
              <Icon name="arrow-back" size={20} color={COLORS.primary} />
              <Text style={styles.backText}>Change Mobile Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* <LoadingModal visible={loading} message="Please wait..." /> */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    color: COLORS.gray,
    fontSize: 14,
  },
});

export default ForgotMpinScreen;