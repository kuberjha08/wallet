import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";

import DashboardScreen from "../screens/main/DashboardScreen";
import PaymentsScreen from "../screens/main/PaymentsScreen";
import QRScreen from "../screens/main/QRScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import TransactionHistoryScreen from "../screens/main/TransactionHistoryScreen";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case "Dashboard":
              iconName = "dashboard";
              break;
            case "Payments":
              iconName = "payment";
              break;
            case "QR":
              iconName = "qr-code-scanner";
              break;
            case "History":
              iconName = "history";
              break;
            case "Profile":
              iconName = "person";
              break;
            default:
              iconName = "circle";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.white,
        },
        headerTintColor: colors.white,
        headerRight: () => <ThemeToggleButton color={colors.white} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="QR" component={QRScreen} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
