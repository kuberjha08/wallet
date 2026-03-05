// ForgotMpinSendOtpScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

const ForgotMpinSendOtpScreen = ({ navigation }) => {
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
      await authApi.forgotMpinSendOtp(data.mobile);
      setLoading(false);
      navigation.navigate('ForgotMpinReset', { mobile: data.mobile });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="lock-reset" size={60} color={COLORS.primary} />
        <Text style={styles.title}>Reset MPIN</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to receive OTP
        </Text>

        <Controller
          control={control}
          rules={{
            required: 'Mobile number is required',
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Enter a valid mobile number',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="Mobile Number"
              placeholder="Enter mobile number"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={errors.mobile}
              touched={true}
              maxLength={10}
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
      </View>
      <LoadingModal visible={loading} message="Sending OTP..." />
    </View>
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
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default ForgotMpinSendOtpScreen;