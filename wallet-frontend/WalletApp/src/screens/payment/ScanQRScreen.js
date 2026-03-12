import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

import LoadingModal from "../../components/LoadingModal";
import { COLORS } from "../../utils/constants";
import qrApi from "../../api/qrApi";

const ScanQRScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;

    setScanned(true);
    setLoading(true);

    try {
      const scanResult = await qrApi.scanQR(data);

      if (scanResult.amount) {
        const paymentResult = await qrApi.payByQR(data, scanResult.amount);

        setLoading(false);

        Alert.alert(
          "Payment Successful",
          `Paid ₹${scanResult.amount} successfully`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        setLoading(false);

        Alert.alert(
          "QR Code Info",
          `User: ${scanResult.userName}\nMobile: ${scanResult.mobile}`,
          [
            { text: "Cancel", onPress: () => setScanned(false) },
            {
              text: "Send Money",
              onPress: () => {
                navigation.navigate("SendMoney", {
                  mobile: scanResult.mobile,
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      setLoading(false);

      Alert.alert(
        "Error",
        error.message || "Failed to process QR code",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-off" size={64} color={COLORS.danger} />

        <Text style={styles.permissionText}>
          No access to camera
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.scanArea} />

        <Text style={styles.instruction}>
          Align QR code within the frame
        </Text>
      </View>

      {scanned && (
        <TouchableOpacity
          style={styles.scanAgain}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>
            Tap to Scan Again
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <LoadingModal
        visible={loading}
        message="Processing QR..."
      />
    </View>
  );
};

export default ScanQRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 20,
  },

  instruction: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },

  scanAgain: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },

  scanAgainText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  permissionText: {
    color: COLORS.white,
    fontSize: 18,
    marginTop: 16,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});