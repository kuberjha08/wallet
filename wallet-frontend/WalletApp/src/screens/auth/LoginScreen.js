import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import Icon from "react-native-vector-icons/MaterialIcons";

import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import LoadingModal from "../../components/LoadingModal";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { validateMobile } from "../../utils/helpers";

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: { mobile: "", mpin: "" },
  });

  const onSubmit = async (data) => {
    if (!validateMobile(data.mobile)) {
      Alert.alert("Error", "Please enter a valid mobile number");
      return;
    }
    setLoading(true);
    const result = await login(data.mobile, data.mpin);
    setLoading(false);
    if (!result.success) {
      Alert.alert("Login Failed", result.error || "Invalid MPIN");
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContainer: { flexGrow: 1 },
    header: {
      backgroundColor: colors.primary,
      padding: 40,
      paddingTop: 60,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      alignItems: "center",
    },
    headerTopRow: {
      position: "absolute",
      top: 50,
      right: 20,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    appName: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
    tagline: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 5 },
    form: { padding: 20 },
    welcomeText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
    },
    loginSubtitle: { fontSize: 14, color: colors.gray, marginBottom: 25 },
    forgotButton: { alignSelf: "center", marginTop: 15 },
    forgotText: { color: colors.primary, fontSize: 14 },
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 30,
    },
    registerText: { color: colors.gray, fontSize: 14 },
    registerLink: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <ThemeToggleButton color="#FFFFFF" />
          </View>
          <View style={styles.logoContainer}>
            <Icon name="account-balance-wallet" size={80} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>Wallet App</Text>
          <Text style={styles.tagline}>Secure Digital Wallet</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.loginSubtitle}>Login with your MPIN</Text>

          <Controller
            control={control}
            rules={{
              required: "Mobile number is required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Enter a valid 10-digit mobile number",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Mobile Number"
                placeholder="Enter your mobile number"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.mobile}
                touched={true}
                maxLength={10}
              />
            )}
            name="mobile"
          />

          <Controller
            control={control}
            rules={{
              required: "MPIN is required",
              minLength: { value: 4, message: "MPIN must be 4 digits" },
              maxLength: { value: 4, message: "MPIN must be 4 digits" },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="MPIN"
                placeholder="Enter 4-digit MPIN"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                secureTextEntry
                error={errors.mpin}
                touched={true}
                maxLength={4}
              />
            )}
            name="mpin"
          />

          <CustomButton
            title="Login"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            type="primary"
          />

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => {
              const mobile = getValues("mobile");
              if (mobile && validateMobile(mobile)) {
                navigation.navigate("ForgotMpin", { mobile });
              } else {
                Alert.alert("Info", "Please enter your mobile number first");
              }
            }}
          >
            <Text style={styles.forgotText}>Forgot MPIN?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>New user? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <LoadingModal visible={loading} message="Logging in..." />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
