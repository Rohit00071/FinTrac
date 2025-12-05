import React, { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { formatCurrency, formatMonth, getCurrentMonth } from "@/lib/formatters";
import { CATEGORY_CONFIG, CategoryType } from "@/types/finance";

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const { transactions, getMonthlyIncome, getMonthlyExpense, getCategorySpending } =
    useFinance();

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const monthlyIncome = getMonthlyIncome(currentMonth);
  const monthlyExpense = getMonthlyExpense(currentMonth);
  const netSavings = monthlyIncome - monthlyExpense;

  const navigateMonth = (direction: number) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
  };

  const categoryData = useMemo(() => {
    const categories = Object.keys(CATEGORY_CONFIG) as CategoryType[];
    return categories
      .map((cat) => ({
        name: CATEGORY_CONFIG[cat].label.split(" ")[0],
        amount: getCategorySpending(cat, currentMonth),
        color: CATEGORY_CONFIG[cat].color,
        legendFontColor: theme.text,
        legendFontSize: 12,
      }))
      .filter((d) => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonth, transactions, getCategorySpending, theme.text]);

  const monthlyData = useMemo(() => {
    const months: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const [year, month] = currentMonth.split("-").map(Number);
      const date = new Date(year, month - 1 - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.push(
        new Intl.DateTimeFormat("en", { month: "short" }).format(date)
      );
      incomeData.push(getMonthlyIncome(monthStr));
      expenseData.push(getMonthlyExpense(monthStr));
    }

    return { months, incomeData, expenseData };
  }, [currentMonth, getMonthlyIncome, getMonthlyExpense]);

  const chartConfig = {
    backgroundColor: theme.backgroundDefault,
    backgroundGradientFrom: theme.backgroundDefault,
    backgroundGradientTo: theme.backgroundDefault,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: () => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthSelector}>
          <Pressable onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Feather name="chevron-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">{formatMonth(currentMonth)}</ThemedText>
          <Pressable onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Feather name="chevron-right" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.summaryCards}>
          <View
            style={[styles.summaryCard, { backgroundColor: FinanceColors.income + "15" }]}
          >
            <Feather name="arrow-up-right" size={20} color={FinanceColors.income} />
            <ThemedText type="small">Income</ThemedText>
            <ThemedText
              type="h4"
              style={{ color: FinanceColors.income, marginTop: Spacing.xs }}
            >
              {formatCurrency(monthlyIncome)}
            </ThemedText>
          </View>

          <View
            style={[styles.summaryCard, { backgroundColor: FinanceColors.expense + "15" }]}
          >
            <Feather name="arrow-down-left" size={20} color={FinanceColors.expense} />
            <ThemedText type="small">Expense</ThemedText>
            <ThemedText
              type="h4"
              style={{ color: FinanceColors.expense, marginTop: Spacing.xs }}
            >
              {formatCurrency(monthlyExpense)}
            </ThemedText>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  (netSavings >= 0 ? FinanceColors.income : FinanceColors.expense) + "15",
              },
            ]}
          >
            <Feather
              name={netSavings >= 0 ? "trending-up" : "trending-down"}
              size={20}
              color={netSavings >= 0 ? FinanceColors.income : FinanceColors.expense}
            />
            <ThemedText type="small">Net</ThemedText>
            <ThemedText
              type="h4"
              style={{
                color: netSavings >= 0 ? FinanceColors.income : FinanceColors.expense,
                marginTop: Spacing.xs,
              }}
            >
              {formatCurrency(netSavings)}
            </ThemedText>
          </View>
        </View>

        {categoryData.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Spending by Category
            </ThemedText>
            <View
              style={[styles.chartCard, { backgroundColor: theme.backgroundDefault }]}
            >
              <PieChart
                data={categoryData}
                width={screenWidth - Spacing.lg * 4}
                height={200}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Income vs Expense Trend
          </ThemedText>
          <View
            style={[styles.chartCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <BarChart
              data={{
                labels: monthlyData.months,
                datasets: [
                  {
                    data: monthlyData.incomeData.map((v) => v || 0),
                    color: () => FinanceColors.income,
                  },
                  {
                    data: monthlyData.expenseData.map((v) => v || 0),
                    color: () => FinanceColors.expense,
                  },
                ],
              }}
              width={screenWidth - Spacing.lg * 4}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              }}
              yAxisLabel="$"
              yAxisSuffix=""
              fromZero
              showValuesOnTopOfBars={false}
              style={styles.chart}
            />
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: FinanceColors.income }]} />
              <ThemedText type="small">Income</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: FinanceColors.expense }]} />
              <ThemedText type="small">Expense</ThemedText>
            </View>
          </View>
        </View>

        {categoryData.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Top Spending Categories
            </ThemedText>
            {categoryData.slice(0, 5).map((cat, index) => (
              <View
                key={cat.name}
                style={[
                  styles.categoryRow,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <View style={styles.categoryRank}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    #{index + 1}
                  </ThemedText>
                </View>
                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                <ThemedText type="body" style={styles.categoryName}>
                  {cat.name}
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {formatCurrency(cat.amount)}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        {monthlyExpense > monthlyIncome && monthlyIncome > 0 ? (
          <View
            style={[
              styles.insightCard,
              { backgroundColor: FinanceColors.expense + "15" },
            ]}
          >
            <Feather
              name="alert-circle"
              size={24}
              color={FinanceColors.expense}
            />
            <View style={styles.insightContent}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Spending Alert
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                You spent {formatCurrency(monthlyExpense - monthlyIncome)} more than you
                earned this month.
              </ThemedText>
            </View>
          </View>
        ) : monthlyIncome > monthlyExpense && monthlyExpense > 0 ? (
          <View
            style={[
              styles.insightCard,
              { backgroundColor: FinanceColors.income + "15" },
            ]}
          >
            <Feather name="check-circle" size={24} color={FinanceColors.income} />
            <View style={styles.insightContent}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Great Job!
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                You saved {formatCurrency(monthlyIncome - monthlyExpense)} this month.
                Keep it up!
              </ThemedText>
            </View>
          </View>
        ) : null}
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
  summaryCards: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  chartCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
  },
  chart: {
    borderRadius: BorderRadius.md,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  categoryRank: {
    width: 28,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  categoryName: {
    flex: 1,
  },
  insightCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    alignItems: "center",
  },
  insightContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});
