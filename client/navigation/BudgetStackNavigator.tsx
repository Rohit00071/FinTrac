import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BudgetScreen from "@/screens/BudgetScreen";
import EditBudgetScreen from "@/screens/EditBudgetScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type BudgetStackParamList = {
  Budget: undefined;
  EditBudget: { budgetId?: string; category?: string };
};

const Stack = createNativeStackNavigator<BudgetStackParamList>();

export default function BudgetStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          headerTitle: "Budget",
        }}
      />
      <Stack.Screen
        name="EditBudget"
        component={EditBudgetScreen}
        options={{
          headerTitle: "Set Budget",
        }}
      />
    </Stack.Navigator>
  );
}
