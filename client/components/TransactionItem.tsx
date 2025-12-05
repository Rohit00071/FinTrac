import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { Transaction, CATEGORY_CONFIG } from "@/types/finance";
import { formatCurrency, formatDateShort } from "@/lib/formatters";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const categoryConfig = CATEGORY_CONFIG[transaction.category];
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? FinanceColors.income : FinanceColors.expense;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: categoryConfig.color + "20" }]}
      >
        <Feather
          name={categoryConfig.icon as any}
          size={20}
          color={categoryConfig.color}
        />
      </View>

      <View style={styles.content}>
        <ThemedText type="body" style={styles.description} numberOfLines={1}>
          {transaction.description || categoryConfig.label}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {categoryConfig.label} • {formatDateShort(transaction.date)}
        </ThemedText>
      </View>

      <View style={styles.amountContainer}>
        <ThemedText style={[styles.amount, { color: amountColor }]}>
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </ThemedText>
        <Feather
          name={isIncome ? "arrow-up-right" : "arrow-down-left"}
          size={14}
          color={amountColor}
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.md,
  },
  description: {
    fontWeight: "500",
    marginBottom: 2,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
