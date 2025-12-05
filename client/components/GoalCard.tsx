import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { Goal } from "@/types/finance";
import { formatCurrency, getPercentage, getDaysRemaining } from "@/lib/formatters";

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const { theme } = useTheme();
  const percentage = getPercentage(goal.currentAmount, goal.targetAmount);
  const daysRemaining = getDaysRemaining(goal.deadline);

  const size = 70;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          <Circle
            stroke={theme.border}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={goal.isCompleted ? FinanceColors.income : goal.color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.percentageContainer}>
          <ThemedText style={styles.percentage}>{percentage}%</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: goal.color + "20" }]}>
            <Feather name={goal.icon as any} size={16} color={goal.color} />
          </View>
          <ThemedText type="body" style={styles.name} numberOfLines={1}>
            {goal.name}
          </ThemedText>
        </View>

        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
        </ThemedText>

        <ThemedText
          type="small"
          style={{
            color: goal.isCompleted
              ? FinanceColors.income
              : daysRemaining < 0
                ? FinanceColors.expense
                : theme.textSecondary,
            fontWeight: "500",
          }}
        >
          {goal.isCompleted
            ? "Completed!"
            : daysRemaining < 0
              ? "Overdue"
              : `${daysRemaining} days left`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  progressContainer: {
    position: "relative",
    marginRight: Spacing.lg,
  },
  percentageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontWeight: "600",
    flex: 1,
  },
});
