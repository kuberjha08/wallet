import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingModal from '../../components/LoadingModal';
import { COLORS } from '../../utils/constants';
import { validateMobile, validateAmount } from '../../utils/helpers';
import paymentApi from '../../api/paymentApi';

const SendMoneyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobile: '',
      amount: '',
      reference: '',
    },
  });

  const onSubmit = async (data) => {
    if (!validateMobile(data.mobile)) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    if (!validateAmount(parseFloat(data.amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentApi.sendMoneyByMobile(
        data.mobile,
        parseFloat(data.amount),
        data.reference || 'Payment'
      );
      setLoading(false);
      Alert.alert(
        'Success',
        'Money sent successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to send money');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                label="Recipient Mobile Number"
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

          <Controller
            control={control}
            rules={{
              required: 'Amount is required',
              validate: (value) =>
                parseFloat(value) > 0 || 'Amount must be greater than 0',
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Amount (₹)"
                placeholder="Enter amount"
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                error={errors.amount}
                touched={true}
              />
            )}
            name="amount"
          />

          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Reference (Optional)"
                placeholder="Add a note"
                value={value}
                onChangeText={onChange}
                error={errors.reference}
                touched={true}
              />
            )}
            name="reference"
          />

          <CustomButton
            title="Send Money"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
          />
        </View>
      </ScrollView>
      <LoadingModal visible={loading} message="Processing payment..." />
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
  form: {
    width: '100%',
  },
});

export default SendMoneyScreen;