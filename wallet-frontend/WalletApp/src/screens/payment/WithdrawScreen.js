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

const WithdrawScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
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
      bankAccount: '',
      ifscCode: '',
      accountHolderName: '',
    },
  });

  const amount = watch('amount');

  // Quick amount options
  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  // Saved bank accounts
  const savedBanks = [
    {
      id: '1',
      bankName: 'State Bank of India',
      accountNumber: '****1234',
      ifsc: 'SBIN0001234',
      holderName: 'John Doe',
    },
    {
      id: '2',
      bankName: 'HDFC Bank',
      accountNumber: '****5678',
      ifsc: 'HDFC0001234',
      holderName: 'John Doe',
    },
  ];

  const selectBank = (bank) => {
    setSelectedBank(bank.id);
    setValue('bankAccount', bank.accountNumber);
    setValue('ifscCode', bank.ifsc);
    setValue('accountHolderName', bank.holderName);
  };

  const onSubmit = async (data) => {
    const amountNum = parseFloat(data.amount);
    
    if (!validateAmount(amountNum)) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    if (amountNum < 100) {
      Alert.alert('Error', 'Minimum withdrawal amount is ₹100');
      return;
    }

    if (amountNum > 50000) {
      Alert.alert('Error', 'Maximum withdrawal amount per transaction is ₹50,000');
      return;
    }

    if (!data.bankAccount || !data.ifscCode || !data.accountHolderName) {
      Alert.alert('Error', 'Please select or enter bank account details');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `You are about to withdraw ₹${amountNum} to your bank account. This may take 1-2 business days. Proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await paymentApi.withdrawMoney(
                amountNum,
                data.bankAccount
              );
              setLoading(false);
              
              Alert.alert(
                'Success',
                `Withdrawal request of ₹${amountNum} has been initiated successfully!`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', error.message || 'Failed to process withdrawal');
            }
          },
        },
      ]
    );
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
            <Icon name="account-balance" size={50} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Withdraw Money</Text>
          <Text style={styles.subtitle}>
            Withdraw money to your bank account
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
                if (num < 100) return 'Minimum withdrawal is ₹100';
                if (num > 50000) return 'Maximum withdrawal is ₹50,000';
                return true;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Withdrawal Amount (₹)"
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

          {/* Saved Bank Accounts */}
          {savedBanks.length > 0 && (
            <View style={styles.bankSection}>
              <Text style={styles.sectionTitle}>Saved Bank Accounts</Text>
              {savedBanks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankCard,
                    selectedBank === bank.id && styles.bankCardSelected,
                  ]}
                  onPress={() => selectBank(bank)}>
                  <View style={styles.bankIcon}>
                    <Icon name="account-balance" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>{bank.bankName}</Text>
                    <Text style={styles.bankDetails}>
                      A/C: {bank.accountNumber} | IFSC: {bank.ifsc}
                    </Text>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedBank === bank.id && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Or Add New Bank Account */}
          <View style={styles.newBankSection}>
            <Text style={styles.sectionTitle}>Or Add New Bank Account</Text>
            
            <Controller
              control={control}
              rules={{ required: !selectedBank && 'Account holder name is required' }}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="Account Holder Name"
                  placeholder="Enter account holder name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.accountHolderName}
                  touched={true}
                  editable={!selectedBank}
                  leftIcon={<Icon name="person" size={20} color={COLORS.gray} />}
                />
              )}
              name="accountHolderName"
            />

            <Controller
              control={control}
              rules={{ required: !selectedBank && 'Account number is required' }}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="Bank Account Number"
                  placeholder="Enter account number"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.bankAccount}
                  touched={true}
                  editable={!selectedBank}
                  leftIcon={<Icon name="credit-card" size={20} color={COLORS.gray} />}
                />
              )}
              name="bankAccount"
            />

            <Controller
              control={control}
              rules={{ required: !selectedBank && 'IFSC code is required' }}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="IFSC Code"
                  placeholder="Enter IFSC code"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="characters"
                  error={errors.ifscCode}
                  touched={true}
                  editable={!selectedBank}
                  leftIcon={<Icon name="code" size={20} color={COLORS.gray} />}
                />
              )}
              name="ifscCode"
            />
          </View>

          {/* Withdrawal Summary */}
          {amount && !errors.amount && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Withdrawal Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount to withdraw:</Text>
                <Text style={styles.summaryValue}>₹{amount}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing fee:</Text>
                <Text style={styles.summaryValue}>₹0</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>You will receive:</Text>
                <Text style={styles.totalValue}>₹{amount}</Text>
              </View>

              <View style={styles.infoBox}>
                <Icon name="info" size={16} color={COLORS.info} />
                <Text style={styles.infoText}>
                  Amount will be credited within 1-2 business days
                </Text>
              </View>
            </View>
          )}

          {/* Withdraw Button */}
          <CustomButton
            title={`Withdraw ₹${amount || '0'}`}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
            size="large"
          />

          {/* Terms */}
          <Text style={styles.termsText}>
            By withdrawing, you agree to our Terms of Service and confirm that the bank details are correct
          </Text>
        </View>
      </ScrollView>

      {/* Loading Modal */}
      <LoadingModal visible={loading} message="Processing withdrawal..." />
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
    backgroundColor: COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: COLORS.warning,
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
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  amountChipTextSelected: {
    color: COLORS.white,
  },
  bankSection: {
    marginBottom: 24,
  },
  bankCard: {
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
  bankCardSelected: {
    borderColor: COLORS.warning,
    borderWidth: 2,
    backgroundColor: COLORS.warning + '05',
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 4,
  },
  bankDetails: {
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
    backgroundColor: COLORS.warning,
  },
  newBankSection: {
    marginBottom: 24,
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
    color: COLORS.warning,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.info,
    marginLeft: 8,
    flex: 1,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
});

export default WithdrawScreen;