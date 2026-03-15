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
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { formatCurrency } from "@/lib/formatters";
import { AccountType, ACCOUNT_CONFIG } from "@/types/finance";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";

const ACCOUNT_TYPES = Object.entries(ACCOUNT_CONFIG) as [
  AccountType,
  (typeof ACCOUNT_CONFIG)[AccountType],
][];

const ACCOUNT_COLORS = [
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#E91E63",
  "#00BCD4",
];

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const { accounts, isLoading, refreshData, addAccount, deleteAccount } =
    useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<AccountType>("cash");
  const [newAccountColor, setNewAccountColor] = useState(ACCOUNT_COLORS[0]);
  const [newAccountBalance, setNewAccountBalance] = useState("");

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      Alert.alert("Error", "Please enter an account name");
      return;
    }

    await addAccount({
      name: newAccountName.trim(),
      type: newAccountType,
      balance: parseFloat(newAccountBalance) || 0,
      color: newAccountColor,
      icon: ACCOUNT_CONFIG[newAccountType].icon,
    });

    setShowAddModal(false);
    setNewAccountName("");
    setNewAccountBalance("");
    setNewAccountType("cash");
    setNewAccountColor(ACCOUNT_COLORS[0]);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAccount(id),
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
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        <AdaptiveContainer>
          <View
            style={[
              styles.totalCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Total Balance
            </ThemedText>
            <ThemedText
              style={[
                styles.totalBalance,
                {
                  color:
                    totalBalance >= 0
                      ? FinanceColors.income
                      : FinanceColors.expense,
                },
              ]}
            >
              {formatCurrency(totalBalance)}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="h4">Your Accounts</ThemedText>
              <Pressable onPress={() => setShowAddModal(true)}>
                <Feather name="plus" size={24} color={theme.link} />
              </Pressable>
            </View>

            {accounts.map((account) => (
              <Pressable
                key={account.id}
                onLongPress={() => handleDeleteAccount(account.id, account.name)}
                style={[
                  styles.accountCard,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <View
                  style={[
                    styles.accountIcon,
                    { backgroundColor: account.color + "20" },
                  ]}
                >
                  <Feather
                    name={account.icon as any}
                    size={24}
                    color={account.color}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {account.name}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {ACCOUNT_CONFIG[account.type].label}
                  </ThemedText>
                </View>
                <ThemedText
                  type="body"
                  style={{
                    fontWeight: "600",
                    color:
                      account.balance >= 0
                        ? FinanceColors.income
                        : FinanceColors.expense,
                  }}
                >
                  {formatCurrency(account.balance)}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText
            type="small"
            style={[styles.hint, { color: theme.textSecondary }]}
          >
            Long press on an account to delete it
          </ThemedText>
        </AdaptiveContainer>
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
              Add Account
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Account Name
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
                placeholder="e.g., My Savings"
                placeholderTextColor={theme.textSecondary}
                value={newAccountName}
                onChangeText={setNewAccountName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Account Type
              </ThemedText>
              <View style={styles.typeGrid}>
                {ACCOUNT_TYPES.map(([type, config]) => (
                  <Pressable
                    key={type}
                    onPress={() => setNewAccountType(type)}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          newAccountType === type
                            ? theme.link + "20"
                            : theme.backgroundDefault,
                        borderColor:
                          newAccountType === type ? theme.link : "transparent",
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <Feather
                      name={config.icon as any}
                      size={20}
                      color={
                        newAccountType === type
                          ? theme.link
                          : theme.textSecondary
                      }
                    />
                    <ThemedText type="small">{config.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Initial Balance
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
                value={newAccountBalance}
                onChangeText={setNewAccountBalance}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.inputLabel}>
                Color
              </ThemedText>
              <View style={styles.colorGrid}>
                {ACCOUNT_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setNewAccountColor(color)}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderColor:
                          newAccountColor === color
                            ? theme.text
                            : "transparent",
                        borderWidth: newAccountColor === color ? 3 : 0,
                      },
                    ]}
                  >
                    {newAccountColor === color ? (
                      <Feather name="check" size={16} color="#FFFFFF" />
                    ) : null}
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
              <Button onPress={handleAddAccount} style={styles.modalButton}>
                Add Account
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
  totalCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: Spacing.xs,
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
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  hint: {
    textAlign: "center",
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
    maxHeight: "80%",
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  colorGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});
