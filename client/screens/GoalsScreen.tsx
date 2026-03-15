import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GoalCard } from "@/components/GoalCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing } from "@/constants/theme";
import { GoalsStackParamList } from "@/navigation/GoalsStackNavigator";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";

type NavigationProp = NativeStackNavigationProp<GoalsStackParamList>;

export default function GoalsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { goals, isLoading, refreshData } = useFinance();

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleAddGoal = () => {
    navigation.navigate("AddGoal", {});
  };

  const handleGoalPress = (goalId: string) => {
    navigation.navigate("GoalDetail", { goalId });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleAddGoal} style={{ marginRight: Spacing.md }}>
          <Feather name="plus" size={24} color={theme.link} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        <AdaptiveContainer>
          {goals.length === 0 ? (
            <EmptyState
              icon="target"
              title="Set Your First Goal"
              description="Create savings goals to track your progress towards financial milestones."
              buttonText="Create Goal"
              onButtonPress={handleAddGoal}
            />
          ) : (
            <>
              {activeGoals.length > 0 ? (
                <View style={styles.section}>
                  <ThemedText type="h4" style={styles.sectionTitle}>
                    Active Goals ({activeGoals.length})
                  </ThemedText>
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onPress={() => handleGoalPress(goal.id)}
                    />
                  ))}
                </View>
              ) : null}

              {completedGoals.length > 0 ? (
                <View style={styles.section}>
                  <ThemedText type="h4" style={styles.sectionTitle}>
                    Completed ({completedGoals.length})
                  </ThemedText>
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onPress={() => handleGoalPress(goal.id)}
                    />
                  ))}
                </View>
              ) : null}
            </>
          )}
        </AdaptiveContainer>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
});
