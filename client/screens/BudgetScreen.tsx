import React, { useState, useCallback } from "react";
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
import { BudgetProgress } from "@/components/BudgetProgress";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { getCurrentMonth, formatMonth, formatCurrency } from "@/lib/formatters";
import { BudgetStackParamList } from "@/navigation/BudgetStackNavigator";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";

type NavigationProp = NativeStackNavigationProp<BudgetStackParamList>;

export default function BudgetScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { budgets, isLoading, refreshData, getMonthlyExpense } = useFinance();

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const monthBudgets = budgets.filter((b) => b.month === currentMonth);
  const totalBudget = monthBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = monthBudgets.reduce((sum, b) => sum + b.spent, 0);
  const monthlyExpense = getMonthlyExpense(currentMonth);

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const navigateMonth = (direction: number) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
  };

  const handleAddBudget = () => {
    navigation.navigate("EditBudget", {});
  };

  const handleEditBudget = (budgetId: string, category: string) => {
    navigation.navigate("EditBudget", { budgetId, category });
  };

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
          <View style={styles.monthSelector}>
            <Pressable onPress={() => navigateMonth(-1)} style={styles.navButton}>
              <Feather name="chevron-left" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="h4">{formatMonth(currentMonth)}</ThemedText>
            <Pressable onPress={() => navigateMonth(1)} style={styles.navButton}>
              <Feather name="chevron-right" size={24} color={theme.text} />
            </Pressable>
          </View>

          {monthBudgets.length > 0 ? (
            <>
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      Total Budget
                    </ThemedText>
                    <ThemedText type="h4">
                      {formatCurrency(totalBudget)}
                    </ThemedText>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      Total Spent
                    </ThemedText>
                    <ThemedText
                      type="h4"
                      style={{
                        color:
                          totalSpent > totalBudget
                            ? FinanceColors.expense
                            : theme.text,
                      }}
                    >
                      {formatCurrency(totalSpent)}
                    </ThemedText>
                  </View>
                </View>

                <View
                  style={[
                    styles.progressBackground,
                    { backgroundColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor:
                          totalSpent > totalBudget
                            ? FinanceColors.expense
                            : FinanceColors.income,
                        width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>

                <ThemedText
                  type="small"
                  style={{
                    color:
                      totalBudget - totalSpent >= 0
                        ? FinanceColors.income
                        : FinanceColors.expense,
                    textAlign: "center",
                    marginTop: Spacing.sm,
                    fontWeight: "600",
                  }}
                >
                  {totalBudget - totalSpent >= 0
                    ? `${formatCurrency(totalBudget - totalSpent)} remaining`
                    : `${formatCurrency(Math.abs(totalBudget - totalSpent))} over budget`}
                </ThemedText>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="h4">Category Budgets</ThemedText>
                  <Pressable onPress={handleAddBudget}>
                    <Feather name="plus" size={24} color={theme.link} />
                  </Pressable>
                </View>

                {monthBudgets.map((budget) => (
                  <BudgetProgress
                    key={budget.id}
                    budget={budget}
                    onPress={() => handleEditBudget(budget.id, budget.category)}
                  />
                ))}
              </View>
            </>
          ) : (
            <EmptyState
              icon="target"
              title="No Budget Set"
              description="Set monthly budgets for each category to track your spending and stay on target."
              buttonText="Create Budget"
              onButtonPress={handleAddBudget}
            />
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
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["2xl"],
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  progressBackground: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
});
