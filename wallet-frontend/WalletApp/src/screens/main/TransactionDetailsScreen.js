import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import LoadingModal from "../../components/LoadingModal";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import transactionApi from "../../api/transactionApi";

const TransactionDetailsScreen = ({ route, navigation }) => {
  // Accept both transactionId and pre-passed transaction object
  const { transactionId, transaction: passedTransaction } = route.params || {};
  const { colors, isDarkMode } = useTheme();
  const [transaction, setTransaction] = useState(passedTransaction || null);
  const [loading, setLoading] = useState(!passedTransaction);

  useEffect(() => {
    if (!passedTransaction && transactionId) {
      loadTransactionDetails();
    }
  }, []);

  const loadTransactionDetails = async () => {
    setLoading(true);
    try {
      const data = await transactionApi.getTransactionDetails(transactionId);
      setTransaction(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingModal visible={true} message="Loading..." />;
  }

  if (!transaction) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Icon name="error" size={48} color={colors.danger} />
        <Text style={{ color: colors.text, marginTop: 12 }}>
          Transaction not found
        </Text>
      </View>
    );
  }

  const isCredit = transaction.type === "CREDIT";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    statusCard: {
      backgroundColor: colors.card,
      margin: 16,
      padding: 24,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    amount: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    status: { fontSize: 14, color: colors.gray, textTransform: "capitalize" },
    detailsCard: {
      backgroundColor: colors.card,
      margin: 16,
      marginTop: 0,
      padding: 16,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabel: { fontSize: 14, color: colors.gray },
    detailValue: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      maxWidth: "60%",
      textAlign: "right",
    },
    partyCard: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
    },
    partyName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    partyMobile: { fontSize: 14, color: colors.gray },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusCard}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isCredit
                ? colors.success + "20"
                : colors.danger + "20",
            },
          ]}
        >
          <Icon
            name={isCredit ? "arrow-downward" : "arrow-upward"}
            size={40}
            color={isCredit ? colors.success : colors.danger}
          />
        </View>
        <Text style={styles.amount}>
          {isCredit ? "+" : "-"} {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.status}>{transaction.status}</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>

        {transaction.transactionId && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>
              {transaction.transactionId || transaction.id}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>
            {transaction.date ? formatDate(new Date(transaction.date)) : "—"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>
            {isCredit ? "Received" : "Sent"}
          </Text>
        </View>

        {transaction.paymentMethod && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
          </View>
        )}

        {transaction.description && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{transaction.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>
          {isCredit ? "Sender Details" : "Receiver Details"}
        </Text>
        <View style={styles.partyCard}>
          {isCredit && transaction.from ? (
            <>
              <Text style={styles.partyName}>
                {transaction.from?.name || transaction.from}
              </Text>
              {transaction.from?.mobile && (
                <Text style={styles.partyMobile}>
                  {transaction.from.mobile}
                </Text>
              )}
            </>
          ) : !isCredit && transaction.to ? (
            <>
              <Text style={styles.partyName}>
                {transaction.to?.name || transaction.to}
              </Text>
              {transaction.to?.mobile && (
                <Text style={styles.partyMobile}>{transaction.to.mobile}</Text>
              )}
            </>
          ) : (
            <Text style={styles.partyMobile}>
              {transaction.counterparty || "—"}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default TransactionDetailsScreen;
