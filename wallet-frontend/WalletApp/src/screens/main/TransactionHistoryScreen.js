import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

import TransactionCard from "../../components/TransactionCard";
import LoadingModal from "../../components/LoadingModal";
import { useTheme } from "../../context/ThemeContext";
import transactionApi from "../../api/transactionApi";
import { formatCurrency } from "../../utils/helpers";

const TransactionHistoryScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    totalTransactions: 0,
  });

  const loadTransactions = async (pageNum = 0, refresh = false) => {
    try {
      setLoading(true);
      const response = await transactionApi.getTransactionHistory(pageNum, 20);
      setStats({
        totalReceived: response.stats?.totalReceived || 0,
        totalSent: response.stats?.totalSent || 0,
        totalTransactions: response.totalTransactions || 0,
      });
      setTotalPages(response.totalPages || 1);
      if (refresh) {
        setTransactions(response.transactions || []);
      } else {
        setTransactions((prev) => [...prev, ...(response.transactions || [])]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(0);
      loadTransactions(0, true);
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    await loadTransactions(0, true);
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (page < totalPages - 1 && !loading && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTransactions(nextPage, false);
    }
  };

  const handleTransactionPress = (transaction) => {
    navigation.navigate("TransactionDetails", {
      transactionId: transaction.id,
      transaction: transaction,
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: 20 },
    header: {
      backgroundColor: colors.card,
      paddingTop: 20,
      paddingBottom: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    statLabel: { fontSize: 12, color: colors.gray, marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: "bold", color: colors.text },
    filterBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    transactionCount: { fontSize: 14, color: colors.gray },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      padding: 6,
    },
    filterText: { fontSize: 14, color: colors.primary },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
    },
    emptySubText: { fontSize: 14, color: colors.gray, marginTop: 8 },
    footer: { paddingVertical: 20 },
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Transaction History</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Received</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {formatCurrency(stats.totalReceived)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sent</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>
            {formatCurrency(stats.totalSent)}
          </Text>
        </View>
      </View>
      <View style={styles.filterBar}>
        <Text style={styles.transactionCount}>
          {stats.totalTransactions} Transactions
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-list" size={20} color={colors.primary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt" size={64} color={colors.gray} />
      <Text style={styles.emptyText}>No transactions found</Text>
      <Text style={styles.emptySubText}>
        Your transactions will appear here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <LoadingModal visible={true} message="Loading more..." />
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleTransactionPress(item)}>
      <TransactionCard transaction={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TransactionHistoryScreen;
