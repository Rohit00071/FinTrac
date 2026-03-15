import React from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { formatCurrency, formatDate, formatTime } from "@/lib/formatters";
import { CATEGORY_CONFIG, ACCOUNT_CONFIG } from "@/types/finance";
import { DashboardStackParamList } from "@/navigation/DashboardStackNavigator";

type RouteType = RouteProp<DashboardStackParamList, "TransactionDetail">;

export default function TransactionDetailScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { transactions, accounts, deleteTransaction } = useFinance();

  const { transactionId } = route.params;
  const transaction = transactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="h4">Transaction not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[transaction.category];
  const account = accounts.find((a) => a.id === transaction.accountId);
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? FinanceColors.income : FinanceColors.expense;

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTransaction(transactionId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: categoryConfig.color + "20" },
            ]}
          >
            <Feather
              name={categoryConfig.icon as any}
              size={32}
              color={categoryConfig.color}
            />
          </View>

          <View style={styles.amountRow}>
            <Feather
              name={isIncome ? "arrow-up-right" : "arrow-down-left"}
              size={24}
              color={amountColor}
            />
            <ThemedText style={[styles.amount, { color: amountColor }]}>
              {isIncome ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </ThemedText>
          </View>

          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {categoryConfig.label}
          </ThemedText>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow
            icon="calendar"
            label="Date"
            value={formatDate(transaction.date)}
            theme={theme}
          />
          <DetailRow
            icon="clock"
            label="Time"
            value={formatTime(transaction.createdAt)}
            theme={theme}
          />
          <DetailRow
            icon="credit-card"
            label="Account"
            value={account?.name || "Unknown"}
            theme={theme}
          />
          {transaction.description ? (
            <DetailRow
              icon="file-text"
              label="Description"
              value={transaction.description}
              theme={theme}
            />
          ) : null}
          {transaction.notes ? (
            <DetailRow
              icon="edit-3"
              label="Notes"
              value={transaction.notes}
              theme={theme}
            />
          ) : null}
          {transaction.isRecurring ? (
            <DetailRow
              icon="repeat"
              label="Recurring"
              value="Yes"
              theme={theme}
            />
          ) : null}
        </View>

        <Button
          onPress={handleDelete}
          style={[
            styles.deleteButton,
            { backgroundColor: FinanceColors.expense },
          ]}
        >
          Delete Transaction
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: string;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.labelContainer}>
        <Feather name={icon as any} size={18} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {label}
        </ThemedText>
      </View>
      <ThemedText type="body" style={detailStyles.value}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: 36,
    fontWeight: "700",
  },
  detailsCard: {
    marginBottom: Spacing["2xl"],
  },
  deleteButton: {
    marginTop: Spacing.lg,
  },
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontWeight: "500",
    marginLeft: Spacing.lg,
  },
});
