import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import transactionApi from "../../api/transactionApi";
import { formatCurrency } from "../../utils/helpers";

const PaymentsScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecentTransactions = async () => {
    try {
      const response = await transactionApi.getTransactionHistory(0, 5);
      setRecentTransactions(response.transactions || []);
    } catch (error) {
      // Silently fail — user can still use payment options
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecentTransactions();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecentTransactions();
    setRefreshing(false);
  }, []);

  const paymentOptions = [
    {
      id: "send",
      title: "Send Money",
      icon: "send",
      color: colors.primary,
      screen: "SendMoney",
      description: "Transfer to any mobile number",
    },
    {
      id: "request",
      title: "Request Money",
      icon: "request-page",
      color: colors.secondary,
      screen: "RequestMoney",
      description: "Request from friends",
    },
    {
      id: "add",
      title: "Add Money",
      icon: "add-circle",
      color: colors.success,
      screen: "AddMoney",
      description: "Add money to wallet",
    },
    {
      id: "withdraw",
      title: "Withdraw",
      icon: "account-balance",
      color: colors.warning,
      screen: "Withdraw",
      description: "Withdraw to bank account",
    },
    {
      id: "scan",
      title: "Scan & Pay",
      icon: "qr-code-scanner",
      color: colors.info,
      screen: "ScanQR",
      description: "Pay by scanning QR code",
    },
    {
      id: "history",
      title: "History",
      icon: "history",
      color: colors.dark,
      screen: "History",
      description: "View all transactions",
    },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      padding: 20,
      paddingTop: 40,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    headerTitle: { fontSize: 28, fontWeight: "bold", color: colors.text },
    headerSubtitle: { fontSize: 14, color: colors.gray, marginTop: 5 },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      padding: 16,
      justifyContent: "space-between",
    },
    gridItem: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    itemDescription: { fontSize: 11, color: colors.gray, textAlign: "center" },
    recentSection: {
      backgroundColor: colors.card,
      margin: 16,
      padding: 16,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
    seeAllText: { fontSize: 14, color: colors.primary, fontWeight: "500" },
    transactionCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    transactionIcon: {
      width: 45,
      height: 45,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    transactionInfo: { flex: 1 },
    transactionName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 4,
    },
    transactionDate: { fontSize: 12, color: colors.gray },
    transactionAmount: { alignItems: "flex-end" },
    amountText: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    statusText: {
      fontSize: 10,
      fontWeight: "500",
      textTransform: "capitalize",
    },
    emptyText: { color: colors.gray, textAlign: "center", paddingVertical: 20 },
    upiSection: {
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
      marginBottom: 30,
    },
    upiCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
      padding: 16,
      borderRadius: 12,
      marginTop: 12,
    },
    upiIcon: {
      width: 45,
      height: 45,
      borderRadius: 23,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    upiInfo: { flex: 1 },
    upiTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 2,
    },
    upiDescription: { fontSize: 12, color: colors.gray },
  });

  const getTransactionStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
      case "success":
        return colors.success;
      case "pending":
        return colors.warning;
      case "failed":
        return colors.danger;
      default:
        return colors.gray;
    }
  };

  const formatTransactionDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
      }
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
        <Text style={styles.headerSubtitle}>
          Send, receive and manage money
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {paymentOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.gridItem}
            onPress={() => navigation.navigate(option.screen)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: option.color + "15" },
              ]}
            >
              <Icon name={option.icon} size={32} color={option.color} />
            </View>
            <Text style={styles.itemTitle}>{option.title}</Text>
            <Text style={styles.itemDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((tx, index) => (
            <TouchableOpacity
              key={tx.id || index}
              style={styles.transactionCard}
              onPress={() =>
                navigation.navigate("TransactionDetails", {
                  transactionId: tx.id,
                  transaction: tx,
                })
              }
            >
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      tx.type === "CREDIT"
                        ? colors.success + "15"
                        : colors.danger + "15",
                  },
                ]}
              >
                <Icon
                  name={
                    tx.type === "CREDIT" ? "arrow-downward" : "arrow-upward"
                  }
                  size={22}
                  color={tx.type === "CREDIT" ? colors.success : colors.danger}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>
                  {tx.counterparty ||
                    tx.from ||
                    tx.to ||
                    tx.description ||
                    "Transaction"}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatTransactionDate(tx.date)}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color:
                        tx.type === "CREDIT" ? colors.success : colors.danger,
                    },
                  ]}
                >
                  {tx.type === "CREDIT" ? "+" : "-"} {formatCurrency(tx.amount)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getTransactionStatusColor(tx.status) + "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getTransactionStatusColor(tx.status) },
                    ]}
                  >
                    {(tx.status || "completed").toLowerCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent transactions</Text>
        )}
      </View>

      <View style={styles.upiSection}>
        <Text style={styles.sectionTitle}>UPI Payment</Text>
        <TouchableOpacity
          style={styles.upiCard}
          onPress={() => navigation.navigate("ScanQR")}
        >
          <View style={styles.upiIcon}>
            <Icon name="qr-code" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.upiInfo}>
            <Text style={styles.upiTitle}>Scan any UPI QR</Text>
            <Text style={styles.upiDescription}>Pay using any UPI app</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.gray} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PaymentsScreen;
