import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/helpers';

const TransactionCard = ({ transaction }) => {
  const isCredit = transaction.type === 'CREDIT';
  const amount = transaction.amount || 0;
  const title = transaction.counterparty || transaction.description || 'Transaction';
  const date = transaction.date ? new Date(transaction.date) : new Date();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { 
        backgroundColor: isCredit ? COLORS.success + '20' : COLORS.danger + '20' 
      }]}>
        <Icon 
          name={isCredit ? 'arrow-downward' : 'arrow-upward'} 
          size={24} 
          color={isCredit ? COLORS.success : COLORS.danger} 
        />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>{formatDate(date)}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: isCredit ? COLORS.success : COLORS.danger }]}>
          {isCredit ? '+' : '-'} {formatCurrency(amount)}
        </Text>
        <Text style={styles.status}>{transaction.status || 'COMPLETED'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: COLORS.gray,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  status: {
    fontSize: 11,
    color: COLORS.gray,
    textTransform: 'capitalize',
  },
});

export default TransactionCard;