import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { Budget, CATEGORY_CONFIG } from "@/types/finance";
import { formatCurrency, getPercentage } from "@/lib/formatters";

interface BudgetProgressProps {
  budget: Budget;
  onPress?: () => void;
}

export function BudgetProgress({ budget, onPress }: BudgetProgressProps) {
  const { theme } = useTheme();
  const categoryConfig = CATEGORY_CONFIG[budget.category];
  const percentage = getPercentage(budget.spent, budget.limit);

  const getProgressColor = () => {
    if (percentage >= 90) return FinanceColors.expense;
    if (percentage >= 70) return "#FFC107";
    return FinanceColors.income;
  };

  const progressColor = getProgressColor();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: categoryConfig.color + "20" },
            ]}
          >
            <Feather
              name={categoryConfig.icon as any}
              size={18}
              color={categoryConfig.color}
            />
          </View>
          <ThemedText type="body" style={styles.categoryName}>
            {categoryConfig.label}
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {percentage}%
        </ThemedText>
      </View>

      <View
        style={[styles.progressBackground, { backgroundColor: theme.border }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: progressColor,
              width: `${Math.min(percentage, 100)}%`,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
        </ThemedText>
        <ThemedText
          type="small"
          style={{ color: progressColor, fontWeight: "600" }}
        >
          {formatCurrency(Math.max(budget.limit - budget.spent, 0))} left
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontWeight: "500",
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
});
