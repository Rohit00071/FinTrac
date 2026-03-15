import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { formatCurrency } from "@/lib/formatters";

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  return (
    <LinearGradient
      colors={["#1A237E", "#3949AB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.label}>Total Balance</ThemedText>
      </View>

      <ThemedText style={styles.balance}>{formatCurrency(balance)}</ThemedText>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor: FinanceColors.income + "30",
              },
            ]}
          >
            <Feather name="arrow-up-right" size={16} color="#FFFFFF" />
          </View>
          <View>
            <ThemedText style={styles.statLabel}>Income</ThemedText>
            <ThemedText style={styles.statValue}>
              {formatCurrency(income)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor: FinanceColors.expense + "30",
              },
            ]}
          >
            <Feather name="arrow-down-left" size={16} color="#FFFFFF" />
          </View>
          <View>
            <ThemedText style={styles.statLabel}>Expense</ThemedText>
            <ThemedText style={styles.statValue}>
              {formatCurrency(expense)}
            </ThemedText>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  label: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: Spacing.lg,
  },
});
