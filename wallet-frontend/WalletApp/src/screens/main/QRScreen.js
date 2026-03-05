import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Icon from "react-native-vector-icons/MaterialIcons";

import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import LoadingModal from "../../components/LoadingModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import qrApi from "../../api/qrApi";

const QRScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [qrType, setQrType] = useState("personal");
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    loadPersonalQR();
  }, []);

  const loadPersonalQR = async () => {
    setLoading(true);
    try {
      const response = await qrApi.generatePersonalQR();
      setQrValue(
        response.qrData ||
          JSON.stringify({
            type: "personal",
            userId: user?.id,
            mobile: user?.mobile,
            name: user?.name,
          }),
      );
      setShowQr(true);
    } catch (error) {
      Alert.alert("Error", "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentQR = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const response = await qrApi.generatePaymentQR(parseFloat(paymentAmount));
      setQrValue(
        response.qrData ||
          JSON.stringify({
            type: "payment",
            userId: user?.id,
            amount: parseFloat(paymentAmount),
            mobile: user?.mobile,
            name: user?.name,
          }),
      );
      setShowQr(true);
      setQrType("payment");
    } catch (error) {
      Alert.alert("Error", "Failed to generate payment QR");
    } finally {
      setLoading(false);
    }
  };

  const setupUpiId = async () => {
    if (!upiId) {
      Alert.alert("Error", "Please enter UPI ID");
      return;
    }
    setLoading(true);
    try {
      await qrApi.setUpiId(upiId);
      Alert.alert("Success", "UPI ID saved successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save UPI ID");
    } finally {
      setLoading(false);
    }
  };

  const shareQR = async () => {
    try {
      await Share.share({
        message: `Scan this QR code to pay me:\n${qrValue}`,
        title: "My QR Code",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share QR code");
    }
  };

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
    typeSelector: {
      flexDirection: "row",
      margin: 20,
      backgroundColor: colors.card,
      borderRadius: 25,
      padding: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    typeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 21,
      gap: 8,
    },
    typeButtonActive: { backgroundColor: colors.primary },
    typeText: { fontSize: 14, fontWeight: "500", color: colors.gray },
    typeTextActive: { color: "#FFFFFF" },
    qrContainer: {
      backgroundColor: colors.card,
      margin: 20,
      padding: 20,
      borderRadius: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    qrWrapper: {
      padding: 20,
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userName: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 15,
    },
    userMobile: { fontSize: 14, color: colors.gray, marginTop: 5 },
    amountBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 10,
    },
    amountBadgeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
    qrActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    qrAction: { alignItems: "center" },
    qrActionText: { fontSize: 12, color: colors.primary, marginTop: 4 },
    formContainer: { padding: 20 },
    form: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    formSubtitle: { fontSize: 14, color: colors.gray, marginBottom: 20 },
    upiSection: {
      backgroundColor: colors.card,
      marginTop: 20,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    sectionSubtitle: { fontSize: 14, color: colors.gray, marginBottom: 16 },
    saveUpiButton: {
      backgroundColor: colors.primary + "10",
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },
    saveUpiText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
    scanButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      margin: 20,
      padding: 16,
      borderRadius: 30,
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    scanButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR Code</Text>
        <Text style={styles.headerSubtitle}>Scan to pay or share your QR</Text>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            qrType === "personal" && styles.typeButtonActive,
          ]}
          onPress={() => {
            setQrType("personal");
            loadPersonalQR();
          }}
        >
          <Icon
            name="person"
            size={20}
            color={qrType === "personal" ? "#FFFFFF" : colors.gray}
          />
          <Text
            style={[
              styles.typeText,
              qrType === "personal" && styles.typeTextActive,
            ]}
          >
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            qrType === "payment" && styles.typeButtonActive,
          ]}
          onPress={() => {
            setQrType("payment");
            setShowQr(false);
          }}
        >
          <Icon
            name="payment"
            size={20}
            color={qrType === "payment" ? "#FFFFFF" : colors.gray}
          />
          <Text
            style={[
              styles.typeText,
              qrType === "payment" && styles.typeTextActive,
            ]}
          >
            Payment
          </Text>
        </TouchableOpacity>
      </View>

      {showQr && qrValue ? (
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={250}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userMobile}>{user?.mobile}</Text>
          {qrType === "payment" && paymentAmount ? (
            <View style={styles.amountBadge}>
              <Text style={styles.amountBadgeText}>₹{paymentAmount}</Text>
            </View>
          ) : null}
          <View style={styles.qrActions}>
            <TouchableOpacity style={styles.qrAction} onPress={shareQR}>
              <Icon name="share" size={24} color={colors.primary} />
              <Text style={styles.qrActionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.qrAction}
              onPress={() => Alert.alert("Info", "Download coming soon!")}
            >
              <Icon name="download" size={24} color={colors.primary} />
              <Text style={styles.qrActionText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.qrAction}
              onPress={() => {
                setShowQr(false);
              }}
            >
              <Icon name="refresh" size={24} color={colors.primary} />
              <Text style={styles.qrActionText}>Regenerate</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.formContainer}>
          {qrType === "payment" ? (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Generate Payment QR</Text>
              <Text style={styles.formSubtitle}>
                Enter amount to create a payment QR code
              </Text>
              <CustomInput
                label="Amount (₹)"
                placeholder="Enter amount"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />
              <CustomButton
                title="Generate Payment QR"
                onPress={generatePaymentQR}
                loading={loading}
                type="primary"
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Your Personal QR</Text>
              <Text style={styles.formSubtitle}>
                Tap generate to create your personal QR code
              </Text>
              <CustomButton
                title="Generate Personal QR"
                onPress={loadPersonalQR}
                loading={loading}
                type="primary"
              />
            </View>
          )}

          <View style={styles.upiSection}>
            <Text style={styles.sectionTitle}>UPI ID</Text>
            <Text style={styles.sectionSubtitle}>
              Set your UPI ID for direct payments
            </Text>
            <CustomInput
              label="UPI ID"
              placeholder="e.g., name@okhdfcbank"
              value={upiId}
              onChangeText={setUpiId}
            />
            <TouchableOpacity style={styles.saveUpiButton} onPress={setupUpiId}>
              <Text style={styles.saveUpiText}>Save UPI ID</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate("ScanQR")}
      >
        <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </TouchableOpacity>

      <LoadingModal visible={loading} message="Processing..." />
    </ScrollView>
  );
};

export default QRScreen;
