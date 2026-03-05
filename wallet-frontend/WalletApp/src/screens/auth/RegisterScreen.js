import React, { useState } from 'react';
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

const RegisterScreen = ({ navigation, route }) => {
  // Route params se mobile le sakte hain agar OTP flow se aa rahe hain
  const { mobile: initialMobile, tempToken: initialTempToken } = route.params || {};
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobile: initialMobile || '',
      name: '',
      tempToken: initialTempToken || '',
    },
  });

  const onSubmit = async (data) => {
    // Validate mobile
    if (!validateMobile(data.mobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate name
    if (!data.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    // Validate tempToken (agar required ho to)
    // if (!data.tempToken) {
    //   Alert.alert('Error', 'Temporary token is missing');
    //   return;
    // }

    setLoading(true);
    try {
      console.log('📤 Registering with:', {
        mobile: data.mobile,
        name: data.name,
        // tempToken: data.tempToken
      });

      const response = await authApi.register(data.mobile, data.name);
      
      setLoading(false);
      console.log('✅ Register response:', response);
      
      // Check response and navigate accordingly
      if (response?.step === 'SET_MPIN' && response?.token) {
        navigation.replace('SetMpin', { token: response.token });
      } else if (response?.token) {
        navigation.replace('SetMpin', { token: response.token });
      } else {
        Alert.alert(
          'Success',
          response?.message || 'Registration successful! Please login.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      }
    } catch (error) {
      setLoading(false);
      console.log('❌ Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="person-add" size={50} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Enter your details to register
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Mobile Number Input */}
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
                editable={!initialMobile} // Agar OTP flow se aa rahe hain to mobile edit na ho
              />
            )}
            name="mobile"
          />

          {/* Full Name Input */}
          <Controller
            control={control}
            rules={{
              required: 'Full name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                error={errors.name}
                touched={true}
                leftIcon={<Icon name="person" size={20} color={COLORS.gray} />}
              />
            )}
            name="name"
          />

          {/* Hidden tempToken field (optional - agar user ko manually enter karwana ho to) */}
          {/* {!initialTempToken && (
            <Controller
              control={control}
              rules={{
                required: 'Temporary token is required',
              }}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="Temporary Token"
                  placeholder="Enter temporary token"
                  value={value}
                  onChangeText={onChange}
                  error={errors.tempToken}
                  touched={true}
                  leftIcon={<Icon name="vpn-key" size={20} color={COLORS.gray} />}
                />
              )}
              name="tempToken"
            />
          )} */}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon name="info" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              After registration, you'll set your MPIN
            </Text>
          </View>

          {/* Register Button */}
          <CustomButton
            title="Register"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
            size="large"
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Loading Modal */}
      <LoadingModal visible={loading} message="Creating account..." />
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
    marginBottom: 30,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    padding: 15,
    borderRadius: 12,
    marginVertical: 20,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.info,
    flex: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  loginText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;