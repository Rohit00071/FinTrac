import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MoreScreen from "@/screens/MoreScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AccountsScreen from "@/screens/AccountsScreen";
import BillsScreen from "@/screens/BillsScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type MoreStackParamList = {
  More: undefined;
  Profile: undefined;
  Settings: undefined;
  Accounts: undefined;
  Bills: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={{
          headerTitle: "More",
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{
          headerTitle: "Accounts",
        }}
      />
      <Stack.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          headerTitle: "Bills & Reminders",
        }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          headerTitle: "Reports",
        }}
      />
    </Stack.Navigator>
  );
}
