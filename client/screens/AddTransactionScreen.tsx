import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { getToday } from "@/lib/formatters";
import {
  TransactionType,
  CategoryType,
  CATEGORY_CONFIG,
} from "@/types/finance";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteType = RouteProp<RootStackParamList, "AddTransaction">;

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [
  CategoryType,
  (typeof CATEGORY_CONFIG)[CategoryType],
][];

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { accounts, addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryType>("other");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(getToday());
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!accountId) {
      setError("Please select an account");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        accountId,
        description,
        notes,
        date,
        isRecurring,
      });
      navigation.goBack();
    } catch (err) {
      setError("Failed to save transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, Spacing.xl),
            paddingBottom: Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AdaptiveContainer>
          <View style={styles.typeToggle}>
            <Pressable
              onPress={() => setType("expense")}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    type === "expense"
                      ? FinanceColors.expense
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name="arrow-down-left"
                size={20}
                color={type === "expense" ? "#FFFFFF" : theme.text}
              />
              <ThemedText
                style={[
                  styles.typeButtonText,
                  { color: type === "expense" ? "#FFFFFF" : theme.text },
                ]}
              >
                Expense
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setType("income")}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    type === "income"
                      ? FinanceColors.income
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name="arrow-up-right"
                size={20}
                color={type === "income" ? "#FFFFFF" : theme.text}
              />
              <ThemedText
                style={[
                  styles.typeButtonText,
                  { color: type === "income" ? "#FFFFFF" : theme.text },
                ]}
              >
                Income
              </ThemedText>
            </Pressable>
          </View>

          {error ? (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: isDark ? "#3D2020" : "#FFEBEE" },
              ]}
            >
              <ThemedText
                style={[
                  styles.errorText,
                  { color: isDark ? "#EF9A9A" : "#C62828" },
                ]}
              >
                {error}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.amountContainer}>
            <ThemedText style={styles.currencySymbol}>$</ThemedText>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.sectionLabel}>
              Category
            </ThemedText>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(([key, config]) => (
                <Pressable
                  key={key}
                  onPress={() => setCategory(key)}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor:
                        category === key
                          ? config.color + "20"
                          : theme.backgroundDefault,
                      borderColor:
                        category === key ? config.color : "transparent",
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Feather
                    name={config.icon as any}
                    size={24}
                    color={category === key ? config.color : theme.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    style={{
                      color: category === key ? config.color : theme.text,
                      marginTop: Spacing.xs,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {config.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.sectionLabel}>
              Account
            </ThemedText>
            <View style={styles.accountList}>
              {accounts.map((acc) => (
                <Pressable
                  key={acc.id}
                  onPress={() => setAccountId(acc.id)}
                  style={[
                    styles.accountItem,
                    {
                      backgroundColor:
                        accountId === acc.id
                          ? theme.link + "20"
                          : theme.backgroundDefault,
                      borderColor:
                        accountId === acc.id ? theme.link : "transparent",
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: acc.color + "20" },
                    ]}
                  >
                    <Feather name={acc.icon as any} size={18} color={acc.color} />
                  </View>
                  <ThemedText type="body" style={{ fontWeight: "500" }}>
                    {acc.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.sectionLabel}>
              Description
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
              placeholder="What was this for?"
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.sectionLabel}>
              Notes (Optional)
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Add any additional notes..."
              placeholderTextColor={theme.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            onPress={() => setIsRecurring(!isRecurring)}
            style={[
              styles.toggleRow,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.toggleLabel}>
              <Feather name="repeat" size={20} color={theme.textSecondary} />
              <ThemedText type="body">Recurring Transaction</ThemedText>
            </View>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: isRecurring ? theme.link : theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    transform: [{ translateX: isRecurring ? 20 : 2 }],
                  },
                ]}
              />
            </View>
          </Pressable>
        </AdaptiveContainer>
      </KeyboardAwareScrollViewCompat>
      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, Spacing.lg),
            borderTopColor: theme.border,
            alignItems: "center",
          },
        ]}
      >
        <AdaptiveContainer 
            style={{ 
                flexDirection: 'row', 
                paddingHorizontal: 0 
            }}
        >
          <Button
            onPress={handleSave}
            disabled={isLoading}
            style={[styles.saveButton, { flex: 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              "Save Transaction"
            )}
          </Button>
        </AdaptiveContainer>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  typeToggle: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    width: "100%",
    minHeight: 52,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.md,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: "300",
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "700",
    minWidth: 100,
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryItem: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
  },
  accountList: {
    gap: Spacing.sm,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  toggleLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    marginTop: 0,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
});
