import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/auth/LoginScreen";
import SendOtpScreen from "../screens/auth/SendOtpScreen";
import VerifyOtpScreen from "../screens/auth/VerifyOtpScreen";
import SetMpinScreen from "../screens/auth/SetMpinScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import { COLORS } from "../utils/constants";
import ForgotMpinSendOtpScreen from "../screens/auth/ForgotMpinSendOtpScreen";
import ForgotMpinScreen from "../screens/auth/ForgotMpinScreen";

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SendOtp"
        component={SendOtpScreen}
        options={{ title: "Send OTP" }}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtpScreen}
        options={{ title: "Verify OTP" }}
      />
      <Stack.Screen
        name="SetMpin"
        component={SetMpinScreen}
        options={{ title: "Set MPIN" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Register" }}
      />
      <Stack.Screen
        name="ForgotMpinSendOtp"
        component={ForgotMpinSendOtpScreen}
        options={{ title: "Reset MPIN" }}
      />
      <Stack.Screen
        name="ForgotMpin"
        component={ForgotMpinScreen}
        options={{ title: "Forgot MPIN" }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
