import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { formatCurrency, formatDate, getDaysRemaining } from "@/lib/formatters";
import { CategoryType, CATEGORY_CONFIG, Bill } from "@/types/finance";

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [
  CategoryType,
  (typeof CATEGORY_CONFIG)[CategoryType],
][];

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const { bills, isLoading, refreshData, addBill, markBillPaid, deleteBill } =
    useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDate, setNewBillDueDate] = useState("");
  const [newBillCategory, setNewBillCategory] = useState<CategoryType>("bills");

  const unpaidBills = bills
    .filter((b) => !b.isPaid)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  const paidBills = bills.filter((b) => b.isPaid);

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleAddBill = async () => {
    if (!newBillName.trim()) {
      Alert.alert("Error", "Please enter a bill name");
      return;
    }
    if (!newBillAmount || parseFloat(newBillAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!newBillDueDate) {
      Alert.alert("Error", "Please enter a due date");
      return;
    }

    await addBill({
      name: newBillName.trim(),
      amount: parseFloat(newBillAmount),
      dueDate: newBillDueDate,
      category: newBillCategory,
      isRecurring: true,
      frequency: "monthly",
      isPaid: false,
    });

    setShowAddModal(false);
    setNewBillName("");
    setNewBillAmount("");
    setNewBillDueDate("");
    setNewBillCategory("bills");
  };

  const handleMarkPaid = (bill: Bill) => {
    Alert.alert("Mark as Paid", `Mark "${bill.name}" as paid?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Paid",
        onPress: () => markBillPaid(bill.id),
      },
    ]);
  };

  const handleDeleteBill = (id: string, name: string) => {
    Alert.alert("Delete Bill", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteBill(id),
      },
    ]);
  };

  const renderBillItem = (bill: Bill) => {
    const categoryConfig = CATEGORY_CONFIG[bill.category];
    const daysRemaining = getDaysRemaining(bill.dueDate);
    const isOverdue = daysRemaining < 0 && !bill.isPaid;

    return (
      <Pressable
        key={bill.id}
        onPress={() => !bill.isPaid && handleMarkPaid(bill)}
        onLongPress={() => handleDeleteBill(bill.id, bill.name)}
        style={[styles.billCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View
          style={[
            styles.billIcon,
            { backgroundColor: categoryConfig.color + "20" },
          ]}
        >
          <Feather
            name={categoryConfig.icon as any}
            size={20}
            color={categoryConfig.color}
          />
        </View>
        <View style={styles.billInfo}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {bill.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {bill.isPaid
              ? `Paid on ${formatDate(bill.lastPaidDate || "")}`
              : isOverdue
                ? "Overdue"
                : `Due ${formatDate(bill.dueDate)}`}
          </ThemedText>
        </View>
        <View style={styles.billRight}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {formatCurrency(bill.amount)}
          </ThemedText>
          {!bill.isPaid ? (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isOverdue
                    ? FinanceColors.expense + "20"
                    : theme.link + "20",
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: isOverdue ? FinanceColors.expense : theme.link,
                  fontWeight: "600",
                }}
              >
                {isOverdue
                  ? "Overdue"
                  : daysRemaining === 0
                    ? "Today"
                    : `${daysRemaining}d`}
              </ThemedText>
            </View>
          ) : (
            <Feather
              name="check-circle"
              size={20}
              color={FinanceColors.income}
            />
          )}
        </View>
      </Pressable>
    );
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
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {bills.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No Bills Yet"
            description="Add your recurring bills to get reminders before they're due."
            buttonText="Add Bill"
            onButtonPress={() => setShowAddModal(true)}
          />
        ) : (
          <>
            {unpaidBills.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="h4">
                    Upcoming ({unpaidBills.length})
                  </ThemedText>
                  <Pressable onPress={() => setShowAddModal(true)}>
                    <Feather name="plus" size={24} color={theme.link} />
                  </Pressable>
                </View>
                {unpaidBills.map(renderBillItem)}
              </View>
            ) : (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="h4">Upcoming</ThemedText>
                  <Pressable onPress={() => setShowAddModal(true)}>
                    <Feather name="plus" size={24} color={theme.link} />
                  </Pressable>
                </View>
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: theme.backgroundDefault },
                  ]}
                >
                  <Feather
                    name="check"
                    size={32}
                    color={FinanceColors.income}
                  />
                  <ThemedText type="body" style={{ marginTop: Spacing.sm }}>
                    All bills paid!
                  </ThemedText>
                </View>
              </View>
            )}

            {paidBills.length > 0 ? (
              <View style={styles.section}>
                <ThemedText type="h4" style={styles.sectionTitle}>
                  Paid ({paidBills.length})
                </ThemedText>
                {paidBills.map(renderBillItem)}
              </View>
            ) : null}
          </>
        )}

        <ThemedText
          type="small"
          style={[styles.hint, { color: theme.textSecondary }]}
        >
          Tap to mark as paid. Long press to delete.
        </ThemedText>
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundRoot },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText type="h4" style={styles.modalTitle}>
              Add Bill
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Bill Name
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g., Electricity Bill"
                placeholderTextColor={theme.textSecondary}
                value={newBillName}
                onChangeText={setNewBillName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Amount
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                value={newBillAmount}
                onChangeText={setNewBillAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Due Date (YYYY-MM-DD)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="2025-01-15"
                placeholderTextColor={theme.textSecondary}
                value={newBillDueDate}
                onChangeText={setNewBillDueDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Category
              </ThemedText>
              <View style={styles.categoryGrid}>
                {CATEGORIES.slice(0, 4).map(([key, config]) => (
                  <Pressable
                    key={key}
                    onPress={() => setNewBillCategory(key)}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor:
                          newBillCategory === key
                            ? config.color + "20"
                            : theme.backgroundDefault,
                        borderColor:
                          newBillCategory === key
                            ? config.color
                            : "transparent",
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <Feather
                      name={config.icon as any}
                      size={18}
                      color={
                        newBillCategory === key
                          ? config.color
                          : theme.textSecondary
                      }
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                onPress={() => setShowAddModal(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                Cancel
              </Button>
              <Button onPress={handleAddBill} style={styles.modalButton}>
                Add Bill
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  billIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  billInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  billRight: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  emptyCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  hint: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  categoryGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  categoryOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
