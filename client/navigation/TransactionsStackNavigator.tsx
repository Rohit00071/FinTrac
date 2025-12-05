import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TransactionsScreen from "@/screens/TransactionsScreen";
import TransactionDetailScreen from "@/screens/TransactionDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type TransactionsStackParamList = {
  Transactions: undefined;
  TransactionDetail: { transactionId: string };
};

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export default function TransactionsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          headerTitle: "Transactions",
        }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{
          headerTitle: "Transaction Details",
        }}
      />
    </Stack.Navigator>
  );
}
