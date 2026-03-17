import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { getCurrentMonth, formatMonth } from "@/lib/formatters";
import { CategoryType, CATEGORY_CONFIG } from "@/types/finance";
import { BudgetStackParamList } from "@/navigation/BudgetStackNavigator";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";

type RouteType = RouteProp<BudgetStackParamList, "EditBudget">;

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [
  CategoryType,
  (typeof CATEGORY_CONFIG)[CategoryType],
][];

export default function EditBudgetScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { budgets, addBudget, updateBudget, deleteBudget } = useFinance();

  const { budgetId, category: initialCategory } = route.params || {};
  const existingBudget = budgetId
    ? budgets.find((b) => b.id === budgetId)
    : null;

  const [category, setCategory] = useState<CategoryType>(
    (initialCategory as CategoryType) || existingBudget?.category || "food",
  );
  const [limit, setLimit] = useState(
    existingBudget ? existingBudget.limit.toString() : "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentMonth = getCurrentMonth();

  const handleSave = async () => {
    if (!limit || parseFloat(limit) <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (existingBudget) {
        await updateBudget(existingBudget.id, {
          limit: parseFloat(limit),
        });
      } else {
        await addBudget({
          category,
          limit: parseFloat(limit),
          spent: 0,
          month: currentMonth,
        });
      }
      navigation.goBack();
    } catch (err) {
      setError("Failed to save budget. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!existingBudget) return;

    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteBudget(existingBudget.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AdaptiveContainer>
          <View
            style={[
              styles.monthBadge,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="calendar" size={16} color={theme.textSecondary} />
            <ThemedText type="body" style={{ fontWeight: "500" }}>
              {formatMonth(currentMonth)}
            </ThemedText>
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

          <View style={styles.section}>
            <ThemedText type="small" style={styles.sectionLabel}>
              Category
            </ThemedText>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(([key, config]) => (
                <Pressable
                  key={key}
                  onPress={() => !existingBudget && setCategory(key)}
                  disabled={!!existingBudget}
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
                      opacity: existingBudget && category !== key ? 0.5 : 1,
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
              Monthly Budget Limit
            </ThemedText>
            <View
              style={[
                styles.amountInputContainer,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                value={limit}
                onChangeText={setLimit}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Button
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : existingBudget ? (
              "Update Budget"
            ) : (
              "Create Budget"
            )}
          </Button>

          {existingBudget ? (
            <Button
              onPress={handleDelete}
              style={[
                styles.deleteButton,
                { backgroundColor: FinanceColors.expense },
              ]}
            >
              Delete Budget
            </Button>
          ) : null}
        </AdaptiveContainer>
      </KeyboardAwareScrollViewCompat>
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
  monthBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
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
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "300",
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "600",
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  deleteButton: {
    marginTop: Spacing.md,
  },
});
