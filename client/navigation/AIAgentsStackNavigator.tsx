import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";

import AIAgentsScreen from "@/screens/AIAgentsScreen";
import InvestmentBrokerScreen from "@/screens/InvestmentBrokerScreen";
import SpendingAdvisorScreen from "@/screens/SpendingAdvisorScreen";

export type AIAgentStackParamList = {
    AIAgents: undefined;
    InvestmentBroker: undefined;
    SpendingAdvisor: undefined;
};

const Stack = createNativeStackNavigator<AIAgentStackParamList>();

export default function AIAgentsStackNavigator() {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.backgroundElevated,
                },
                headerTintColor: theme.text,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="AIAgents"
                component={AIAgentsScreen}
                options={{ title: "AI Agents" }}
            />
            <Stack.Screen
                name="InvestmentBroker"
                component={InvestmentBrokerScreen}
                options={{ title: "Investment Broker" }}
            />
            <Stack.Screen
                name="SpendingAdvisor"
                component={SpendingAdvisorScreen}
                options={{ title: "Spending Advisor" }}
            />
        </Stack.Navigator>
    );
}
