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
import { validateMobile, validateAmount } from '../../utils/helpers';
import paymentApi from '../../api/paymentApi';

const RequestMoneyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [recentContacts, setRecentContacts] = useState([
    { id: '1', name: 'Rahul Sharma', mobile: '9876543210' },
    { id: '2', name: 'Priya Patel', mobile: '8765432109' },
    { id: '3', name: 'Amit Kumar', mobile: '7654321098' },
  ]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobile: '',
      amount: '',
      note: '',
    },
  });

  const onSubmit = async (data) => {
    // Validate mobile number
    if (!validateMobile(data.mobile)) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    // Validate amount
    const amount = parseFloat(data.amount);
    if (!validateAmount(amount)) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    // Confirm request
    Alert.alert(
      'Confirm Request',
      `Are you sure you want to request ₹${amount} from ${data.mobile}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await paymentApi.requestMoney(
                data.mobile,
                amount,
                data.note || 'Payment request'
              );
              setLoading(false);
              
              Alert.alert(
                'Success',
                'Money request sent successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', error.message || 'Failed to send request');
            }
          },
        },
      ]
    );
  };

  const selectContact = (contact) => {
    setValue('mobile', contact.mobile);
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
            <Icon name="request-page" size={50} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Request Money</Text>
          <Text style={styles.subtitle}>
            Request money from friends and family
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
                label="From Mobile Number"
                placeholder="Enter mobile number"
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

          {/* Recent Contacts */}
          {recentContacts.length > 0 && (
            <View style={styles.contactsSection}>
              <Text style={styles.contactsTitle}>Recent Contacts</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.contactsList}>
                {recentContacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactChip}
                    onPress={() => selectContact(contact)}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.avatarText}>
                        {contact.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.contactName}>{contact.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Amount Input */}
          <Controller
            control={control}
            rules={{
              required: 'Amount is required',
              validate: (value) => {
                const num = parseFloat(value);
                return num > 0 || 'Amount must be greater than 0';
              },
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
                leftIcon={<Icon name="currency-rupee" size={20} color={COLORS.gray} />}
              />
            )}
            name="amount"
          />

          {/* Quick Amount Selector */}
          <View style={styles.quickAmounts}>
            {[100, 500, 1000, 5000].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={styles.amountChip}
                onPress={() => setValue('amount', amt.toString())}>
                <Text style={styles.amountChipText}>₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note Input */}
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Note (Optional)"
                placeholder="Add a note for the request"
                value={value}
                onChangeText={onChange}
                error={errors.note}
                touched={true}
                multiline={true}
                numberOfLines={3}
                leftIcon={<Icon name="note" size={20} color={COLORS.gray} />}
              />
            )}
            name="note"
          />

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Request Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>From:</Text>
              <Controller
                control={control}
                name="mobile"
                render={({ field: { value } }) => (
                  <Text style={styles.summaryValue}>
                    {value ? value : 'Not specified'}
                  </Text>
                )}
              />
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { value } }) => (
                  <Text style={[styles.summaryValue, styles.amountValue]}>
                    {value ? `₹${value}` : 'Not specified'}
                  </Text>
                )}
              />
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Note:</Text>
              <Controller
                control={control}
                name="note"
                render={({ field: { value } }) => (
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {value ? value : 'No note'}
                  </Text>
                )}
              />
            </View>
          </View>

          {/* Request Button */}
          <CustomButton
            title="Send Request"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
            size="large"
          />

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Icon name="info" size={16} color={COLORS.info} />
            <Text style={styles.infoText}>
              The recipient will receive a notification and can accept or reject your request
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Loading Modal */}
      <LoadingModal visible={loading} message="Sending request..." />
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
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: COLORS.secondary,
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
  contactsSection: {
    marginBottom: 20,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  contactsList: {
    flexDirection: 'row',
  },
  contactChip: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  contactName: {
    fontSize: 12,
    color: COLORS.dark,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.gray + '20',
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
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
    maxWidth: '60%',
  },
  amountValue: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: COLORS.info + '10',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.info,
    marginLeft: 8,
    flex: 1,
  },
});

export default RequestMoneyScreen;