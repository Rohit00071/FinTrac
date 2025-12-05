import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GoalsScreen from "@/screens/GoalsScreen";
import GoalDetailScreen from "@/screens/GoalDetailScreen";
import AddGoalScreen from "@/screens/AddGoalScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type GoalsStackParamList = {
  Goals: undefined;
  GoalDetail: { goalId: string };
  AddGoal: { goalId?: string };
};

const Stack = createNativeStackNavigator<GoalsStackParamList>();

export default function GoalsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          headerTitle: "Savings Goals",
        }}
      />
      <Stack.Screen
        name="GoalDetail"
        component={GoalDetailScreen}
        options={{
          headerTitle: "Goal Details",
        }}
      />
      <Stack.Screen
        name="AddGoal"
        component={AddGoalScreen}
        options={{
          headerTitle: "New Goal",
        }}
      />
    </Stack.Navigator>
  );
}
