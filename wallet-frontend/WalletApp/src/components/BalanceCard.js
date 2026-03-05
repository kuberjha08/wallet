import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const BalanceCard = ({ balance, onRefresh, onAddMoney }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddMoney}>
        <Icon name="add-circle" size={24} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    margin: 16,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: COLORS.white + '80',
    fontSize: 14,
  },
  balance: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BalanceCard;