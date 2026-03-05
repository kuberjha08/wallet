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
import { validateAmount } from '../../utils/helpers';
import paymentApi from '../../api/paymentApi';

const AddMoneyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedAmount, setSelectedAmount] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
    },
  });

  const amount = watch('amount');

  // Quick amount options
  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  // Payment methods
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', color: COLORS.primary },
    { id: 'upi', name: 'UPI', icon: 'qr-code', color: COLORS.secondary },
    { id: 'netbanking', name: 'Net Banking', icon: 'account-balance', color: COLORS.info },
    { id: 'wallet', name: 'Wallet', icon: 'account-balance-wallet', color: COLORS.warning },
  ];

  const onSubmit = async (data) => {
    const amountNum = parseFloat(data.amount);
    
    if (!validateAmount(amountNum)) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    if (amountNum < 10) {
      Alert.alert('Error', 'Minimum amount to add is ₹10');
      return;
    }

    if (amountNum > 100000) {
      Alert.alert('Error', 'Maximum amount to add is ₹1,00,000');
      return;
    }

    // Show payment method selection
    Alert.alert(
      'Confirm Payment',
      `You are about to add ₹${amountNum} to your wallet via ${getPaymentMethodName(selectedPaymentMethod)}. Proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            setLoading(true);
            try {
              // Call API to add money
              const response = await paymentApi.addMoney(amountNum);
              setLoading(false);
              
              Alert.alert(
                'Success',
                `₹${amountNum} added to your wallet successfully!`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', error.message || 'Failed to add money');
            }
          },
        },
      ]
    );
  };

  const getPaymentMethodName = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : 'Unknown';
  };

  const selectQuickAmount = (amt) => {
    setSelectedAmount(amt.toString());
    setValue('amount', amt.toString());
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
            <Icon name="add-circle" size={50} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Add Money</Text>
          <Text style={styles.subtitle}>
            Add money to your wallet securely
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Amount Input */}
          <Controller
            control={control}
            rules={{
              required: 'Amount is required',
              validate: (value) => {
                const num = parseFloat(value);
                if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
                if (num < 10) return 'Minimum amount is ₹10';
                if (num > 100000) return 'Maximum amount is ₹1,00,000';
                return true;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Enter Amount (₹)"
                placeholder="Enter amount"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setSelectedAmount(text);
                }}
                keyboardType="numeric"
                error={errors.amount}
                touched={true}
                leftIcon={<Icon name="currency-rupee" size={20} color={COLORS.gray} />}
              />
            )}
            name="amount"
          />

          {/* Quick Amount Selector */}
          <View style={styles.quickAmountsSection}>
            <Text style={styles.sectionTitle}>Quick Amounts</Text>
            <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.amountChip,
                    selectedAmount === amt.toString() && styles.amountChipSelected,
                  ]}
                  onPress={() => selectQuickAmount(amt)}>
                  <Text
                    style={[
                      styles.amountChipText,
                      selectedAmount === amt.toString() && styles.amountChipTextSelected,
                    ]}>
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}>
                <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
                  <Icon name={method.icon} size={24} color={method.color} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDesc}>Secure and instant</Text>
                </View>
                <View style={styles.radioButton}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Summary */}
          {amount && !errors.amount && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Amount Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount to add:</Text>
                <Text style={styles.summaryValue}>₹{amount}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment method:</Text>
                <Text style={styles.summaryValue}>
                  {getPaymentMethodName(selectedPaymentMethod)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total to pay:</Text>
                <Text style={styles.totalValue}>₹{amount}</Text>
              </View>
            </View>
          )}

          {/* Add Money Button */}
          <CustomButton
            title={`Add ₹${amount || '0'}`}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
            size="large"
          />

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Icon name="lock" size={16} color={COLORS.success} />
            <Text style={styles.securityText}>
              Your payment information is secure and encrypted
            </Text>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By adding money, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>

      {/* Loading Modal */}
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: COLORS.success,
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
  quickAmountsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountChip: {
    width: '18%',
    aspectRatio: 1.5,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray + '20',
    marginBottom: 8,
  },
  amountChipSelected: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  amountChipTextSelected: {
    color: COLORS.white,
  },
  paymentMethodSection: {
    marginBottom: 24,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray + '20',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paymentMethodSelected: {
    borderColor: COLORS.success,
    borderWidth: 2,
    backgroundColor: COLORS.success + '05',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 4,
  },
  paymentDesc: {
    fontSize: 12,
    color: COLORS.gray,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray + '20',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 6,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default AddMoneyScreen;