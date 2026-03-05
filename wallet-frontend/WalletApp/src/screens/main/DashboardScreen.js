import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

import LoadingModal from "../../components/LoadingModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import walletApi from "../../api/walletApi";
import { formatCurrency } from "../../utils/helpers";

const DashboardScreen = ({ navigation }) => {
  const { user: authUser } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getStyles = (colors, isDarkMode) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background },
      headerButtons: { flexDirection: "row", marginRight: 10 },
      headerButton: { marginHorizontal: 8, padding: 4 },
      headerTitle: { flexDirection: "row", alignItems: "center" },
      headerTitleText: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 8,
        color: colors.white,
      },
      balanceCard: {
        backgroundColor: colors.primary,
        margin: 20,
        padding: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      balanceLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
      balanceAmount: {
        color: "#FFFFFF",
        fontSize: 36,
        fontWeight: "bold",
        marginVertical: 10,
      },
      userInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
      },
      userInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
      },
      userInfoText: {
        color: "#FFFFFF",
        marginLeft: 6,
        fontSize: 12,
        fontWeight: "500",
      },
      kycContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
      },
      kycText: { marginLeft: 6, fontSize: 12, fontWeight: "500" },
      statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        gap: 8,
      },
      statCard: {
        width: "48%",
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: 4,
      },
      statLabel: { fontSize: 12, color: colors.gray },
      quickActionsSection: { padding: 20 },
      sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 15,
      },
      quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      },
      quickActionItem: { width: "30%", alignItems: "center", marginBottom: 20 },
      actionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
      },
      actionLabel: { fontSize: 12, color: colors.text, textAlign: "center" },
      transactionsSection: { paddingHorizontal: 20, paddingBottom: 20 },
      sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
      },
      seeAllText: { color: colors.primary, fontSize: 14, fontWeight: "500" },
      transactionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
      },
      transactionInfo: { flex: 1 },
      transactionTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text,
        marginBottom: 4,
      },
      transactionTime: { fontSize: 12, color: colors.gray },
      transactionAmount: { alignItems: "flex-end" },
      amountText: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
      transactionType: { fontSize: 11, color: colors.gray },
      emptyState: {
        alignItems: "center",
        padding: 40,
        backgroundColor: colors.card,
        borderRadius: 12,
      },
      emptyText: { color: colors.gray, marginTop: 10, fontSize: 16 },
      qrSection: { padding: 20, paddingTop: 0 },
      qrContainer: {
        backgroundColor: colors.card,
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      qrImage: { width: 150, height: 150, marginBottom: 10 },
      qrText: { fontSize: 14, color: colors.primary, fontWeight: "500" },
    });

  const styles = getStyles(colors, isDarkMode);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={onRefresh} style={styles.headerButton}>
            <Icon name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: colors.primary,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: "#FFFFFF",
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Icon name="account-balance-wallet" size={24} color="#FFFFFF" />
          <Text style={styles.headerTitleText}>Wallet</Text>
        </View>
      ),
    });
  }, [navigation, colors]);

  const loadDashboard = async () => {
    try {
      const data = await walletApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  const handleQuickAction = (action) => {
    switch (action) {
      case "addMoney":
        navigation.navigate("AddMoney");
        break;
      case "scan":
        navigation.navigate("ScanQR");
        break;
      case "request":
        navigation.navigate("RequestMoney");
        break;
      case "pay":
        navigation.navigate("SendMoney");
        break;
      case "passbook":
        navigation.navigate("History");
        break;
      case "offers":
        Alert.alert("Info", "Offers coming soon!");
        break;
    }
  };

  if (loading && !dashboardData) {
    return <LoadingModal visible={true} message="Loading dashboard..." />;
  }

  const { user, stats, recentTransactions } = dashboardData || {};

  const quickActions = [
    {
      key: "addMoney",
      icon: "add-circle",
      label: "Add Money",
      color: colors.success,
    },
    {
      key: "scan",
      icon: "qr-code-scanner",
      label: "Scan & Pay",
      color: colors.info,
    },
    { key: "pay", icon: "send", label: "Send Money", color: colors.primary },
    {
      key: "request",
      icon: "request-page",
      label: "Request",
      color: colors.secondary,
    },
    {
      key: "passbook",
      icon: "receipt",
      label: "History",
      color: colors.warning,
    },
    { key: "offers", icon: "local-offer", label: "Offers", color: colors.dark },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(user?.walletBalance || 0)}
        </Text>
        <View style={styles.userInfoRow}>
          <View style={styles.userInfo}>
            <Icon name="person" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.userInfoText}>
              {user?.name || authUser?.name || "User"}
            </Text>
          </View>
          <View style={styles.kycContainer}>
            <Icon
              name={user?.kycStatus === "APPROVED" ? "verified" : "pending"}
              size={16}
              color={
                user?.kycStatus === "APPROVED" ? colors.success : colors.warning
              }
            />
            <Text
              style={[
                styles.kycText,
                {
                  color:
                    user?.kycStatus === "APPROVED"
                      ? colors.success
                      : colors.warning,
                },
              ]}
            >
              KYC {user?.kycStatus || "PENDING"}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalTransactions || 0}</Text>
          <Text style={styles.statLabel}>Total Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {stats?.thisMonthTransactions || 0}
          </Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCurrency(stats?.totalReceived || 0)}
          </Text>
          <Text style={styles.statLabel}>Total Received</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCurrency(stats?.totalSent || 0)}
          </Text>
          <Text style={styles.statLabel}>Total Sent</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(({ key, icon, label, color }) => (
            <TouchableOpacity
              key={key}
              style={styles.quickActionItem}
              onPress={() => handleQuickAction(key)}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: color + "20" }]}
              >
                <Icon name={icon} size={24} color={color} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions?.length > 0 ? (
          recentTransactions.slice(0, 5).map((tx, index) => (
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
              <View style={styles.transactionIcon}>
                <Icon
                  name={
                    tx.type === "CREDIT" ? "arrow-downward" : "arrow-upward"
                  }
                  size={20}
                  color={tx.type === "CREDIT" ? colors.success : colors.danger}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                  {tx.from ||
                    tx.to ||
                    tx.counterparty ||
                    tx.description ||
                    "Transaction"}
                </Text>
                <Text style={styles.transactionTime}>{tx.time || tx.date}</Text>
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
                <Text style={styles.transactionType}>
                  {tx.type === "CREDIT" ? "Received" : "Sent"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="receipt" size={48} color={colors.gray} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </View>

      {/* QR Code */}
      {user?.qrCodeData && (
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Your QR Code</Text>
          <TouchableOpacity
            style={styles.qrContainer}
            onPress={() => navigation.navigate("QR")}
          >
            <Image
              source={{ uri: `data:image/png;base64,${user.qrCodeData}` }}
              style={styles.qrImage}
            />
            <Text style={styles.qrText}>Tap to view full QR</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default DashboardScreen;
