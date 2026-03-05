import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import CustomButton from "../../components/CustomButton";
import LoadingModal from "../../components/LoadingModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getInitials, maskMobile, formatCurrency } from "../../utils/helpers";
import walletApi from "../../api/walletApi";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const dashboardData = await walletApi.getDashboard();
      if (dashboardData?.user) {
        setWalletBalance(dashboardData.user.walletBalance || 0);
      }
      if (dashboardData?.stats) {
        setTransactionCount(dashboardData.stats.totalTransactions || 0);
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          await logout();
          setLoading(false);
        },
      },
    ]);
  };

  const handleChangeMpin = () => {
    Alert.alert(
      "Change MPIN",
      "You will be logged out to change your MPIN. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            logout();
          },
        },
      ],
    );
  };

  const kycStatus = user?.kycStatus || "PENDING";
  const kycStatusColor =
    kycStatus === "APPROVED"
      ? colors.success
      : kycStatus === "PENDING"
        ? colors.warning
        : kycStatus === "REJECTED"
          ? colors.danger
          : colors.gray;

  const menuSections = [
    {
      title: "Account",
      items: [
        {
          id: "edit",
          icon: "edit",
          label: "Edit Profile",
          color: colors.primary,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
        {
          id: "mpin",
          icon: "lock",
          label: "Change MPIN",
          color: colors.secondary,
          onPress: handleChangeMpin,
        },
        {
          id: "kyc",
          icon: "verified-user",
          label: "KYC Verification",
          color: colors.success,
          badge: kycStatus,
          badgeColor: kycStatusColor,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
        {
          id: "bank",
          icon: "account-balance",
          label: "Bank Accounts",
          color: colors.info,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "notifications",
          icon: "notifications",
          label: "Notifications",
          color: colors.primary,
          type: "switch",
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          id: "biometric",
          icon: "fingerprint",
          label: "Biometric Login",
          color: colors.secondary,
          type: "switch",
          value: biometric,
          onValueChange: setBiometric,
        },
        {
          id: "darkmode",
          icon: isDarkMode ? "light-mode" : "dark-mode",
          label: "Dark Mode",
          color: colors.dark,
          type: "switch",
          value: isDarkMode,
          onValueChange: toggleTheme,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          id: "limits",
          icon: "speed",
          label: "Transaction Limits",
          color: colors.warning,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
        {
          id: "devices",
          icon: "devices",
          label: "Active Devices",
          color: colors.info,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          icon: "help",
          label: "Help & Support",
          color: colors.primary,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
        {
          id: "about",
          icon: "info",
          label: "About App",
          color: colors.secondary,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
        {
          id: "privacy",
          icon: "privacy-tip",
          label: "Privacy Policy",
          color: colors.dark,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
        {
          id: "terms",
          icon: "description",
          label: "Terms of Service",
          color: colors.gray,
          onPress: () => Alert.alert("Info", "Coming soon!"),
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    headerBackground: { height: 80, backgroundColor: colors.primary },
    profileInfo: {
      alignItems: "center",
      paddingBottom: 20,
      paddingHorizontal: 20,
      marginTop: -40,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
      borderWidth: 3,
      borderColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    avatarText: { fontSize: 32, fontWeight: "bold", color: colors.primary },
    userName: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    userMobile: { fontSize: 14, color: colors.gray, marginBottom: 10 },
    kycBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 15,
      gap: 4,
    },
    kycText: { fontSize: 12, fontWeight: "500" },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 20,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 8,
    },
    statLabel: { fontSize: 11, color: colors.gray, marginTop: 2 },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 10,
      marginLeft: 4,
    },
    sectionContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    menuLabel: { flex: 1, fontSize: 15, color: colors.text },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginRight: 8,
    },
    badgeText: { fontSize: 10, fontWeight: "500" },
    logoutContainer: { padding: 20, paddingTop: 0 },
    versionText: {
      textAlign: "center",
      fontSize: 12,
      color: colors.gray,
      marginBottom: 30,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {getInitials(user?.name || "User")}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || "User Name"}</Text>
          <Text style={styles.userMobile}>
            {maskMobile(user?.mobile || "")}
          </Text>
          <View
            style={[
              styles.kycBadge,
              { backgroundColor: kycStatusColor + "15" },
            ]}
          >
            <Icon name="verified" size={16} color={kycStatusColor} />
            <Text style={[styles.kycText, { color: kycStatusColor }]}>
              KYC {kycStatus}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon
            name="account-balance-wallet"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.statValue}>{formatCurrency(walletBalance)}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="receipt" size={24} color={colors.success} />
          <Text style={styles.statValue}>{transactionCount}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star" size={24} color={colors.warning} />
          <Text style={styles.statValue}>4.5</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.type !== "switch" ? item.onPress : undefined}
                disabled={item.type === "switch"}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: item.color + "15" },
                  ]}
                >
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: item.badgeColor + "15" },
                    ]}
                  >
                    <Text
                      style={[styles.badgeText, { color: item.badgeColor }]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                )}
                {item.type === "switch" ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{
                      false: colors.gray + "30",
                      true: item.color + "80",
                    }}
                    thumbColor={item.value ? item.color : colors.gray}
                  />
                ) : (
                  <Icon name="chevron-right" size={20} color={colors.gray} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.logoutContainer}>
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          type="danger"
          size="large"
        />
      </View>
      <Text style={styles.versionText}>Version 1.0.0</Text>
      <LoadingModal visible={loading} message="Please wait..." />
    </ScrollView>
  );
};

export default ProfileScreen;
