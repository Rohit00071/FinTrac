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
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionItem } from "@/components/TransactionItem";
import { BudgetProgress } from "@/components/BudgetProgress";
import { GoalCard } from "@/components/GoalCard";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getCurrentMonth, formatMonth } from "@/lib/formatters";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { DashboardStackParamList } from "@/navigation/DashboardStackNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList & DashboardStackParamList
>;

export default function DashboardScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    transactions,
    budgets,
    goals,
    bills,
    isLoading,
    refreshData,
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpense,
  } = useFinance();

  const currentMonth = getCurrentMonth();
  const recentTransactions = transactions.slice(0, 5);
  const monthBudgets = budgets.filter((b) => b.month === currentMonth);
  const activeGoals = goals.filter((g) => !g.isCompleted).slice(0, 3);
  const upcomingBills = bills
    .filter((b) => !b.isPaid)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 3);

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleAddTransaction = () => {
    navigation.navigate("AddTransaction", {});
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate("TransactionDetail", { transactionId });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["4xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        <AdaptiveContainer>
          <BalanceCard
            balance={getTotalBalance()}
            income={getMonthlyIncome()}
            expense={getMonthlyExpense()}
          />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="h4">Recent Transactions</ThemedText>
              <Pressable
                onPress={() => navigation.navigate("TransactionsTab" as any)}
              >
                <ThemedText type="link">View All</ThemedText>
              </Pressable>
            </View>

            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => (
                <TransactionItem
                  key={txn.id}
                  transaction={txn}
                  onPress={() => handleTransactionPress(txn.id)}
                />
              ))
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather name="inbox" size={32} color={theme.textSecondary} />
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                >
                  No transactions yet
                </ThemedText>
              </View>
            )}
          </View>

          {monthBudgets.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="h4">
                  {formatMonth(currentMonth)} Budget
                </ThemedText>
                <Pressable
                  onPress={() => navigation.navigate("BudgetTab" as any)}
                >
                  <ThemedText type="link">View All</ThemedText>
                </Pressable>
              </View>
              {monthBudgets.slice(0, 3).map((budget) => (
                <BudgetProgress key={budget.id} budget={budget} />
              ))}
            </View>
          ) : null}

          {activeGoals.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="h4">Savings Goals</ThemedText>
                <Pressable onPress={() => navigation.navigate("GoalsTab" as any)}>
                  <ThemedText type="link">View All</ThemedText>
                </Pressable>
              </View>
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() =>
                    navigation.navigate("GoalsTab" as any, {
                      screen: "GoalDetail",
                      params: { goalId: goal.id },
                    })
                  }
                />
              ))}
            </View>
          ) : null}

          {upcomingBills.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="h4">Upcoming Bills</ThemedText>
                <Pressable
                  onPress={() =>
                    navigation.navigate("MoreTab" as any, { screen: "Bills" })
                  }
                >
                  <ThemedText type="link">View All</ThemedText>
                </Pressable>
              </View>
              {upcomingBills.map((bill) => (
                <View
                  key={bill.id}
                  style={[
                    styles.billItem,
                    { backgroundColor: theme.backgroundDefault },
                  ]}
                >
                  <View style={styles.billInfo}>
                    <ThemedText type="body" style={{ fontWeight: "500" }}>
                      {bill.name}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      Due {new Date(bill.dueDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    ₹{bill.amount.toFixed(2)}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </AdaptiveContainer>
      </ScrollView>

      <FAB onPress={handleAddTransaction} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  billItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  billInfo: {
    gap: Spacing.xs,
  },
});
