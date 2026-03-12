import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native"; // Add this import

import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import SendMoneyScreen from "../screens/payment/SendMoneyScreen";
import RequestMoneyScreen from "../screens/payment/RequestMoneyScreen";
import AddMoneyScreen from "../screens/payment/AddMoneyScreen";
import WithdrawScreen from "../screens/payment/WithdrawScreen";
import ScanQRScreen from "../screens/payment/ScanQRScreen";
import TransactionDetailsScreen from "../screens/main/TransactionDetailsScreen";
import { COLORS } from "../utils/constants";

const Stack = createStackNavigator();

// Simple loading component instead of importing LoadingModal
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="SendMoney"
              component={SendMoneyScreen}
              options={{
                headerShown: true,
                title: "Send Money",
                headerTintColor: COLORS.primary,
              }}
            />
            <Stack.Screen
              name="RequestMoney"
              component={RequestMoneyScreen}
              options={{
                headerShown: true,
                title: "Request Money",
                headerTintColor: COLORS.primary,
              }}
            />
            <Stack.Screen
              name="AddMoney"
              component={AddMoneyScreen}
              options={{
                headerShown: true,
                title: "Add Money",
                headerTintColor: COLORS.primary,
              }}
            />
            <Stack.Screen
              name="Withdraw"
              component={WithdrawScreen}
              options={{
                headerShown: true,
                title: "Withdraw Money",
                headerTintColor: COLORS.primary,
              }}
            />
            <Stack.Screen
              name="ScanQR"
              component={ScanQRScreen}
              options={{
                headerShown: true,
                title: "Scan QR Code",
                headerTintColor: COLORS.primary,
              }}
            />
            <Stack.Screen
              name="TransactionDetails"
              component={TransactionDetailsScreen}
              options={{
                headerShown: true,
                title: "Transaction Details",
                headerTintColor: COLORS.primary,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;