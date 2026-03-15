import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  SectionList,
  StyleSheet,
  RefreshControl,
  Pressable,
  TextInput,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TransactionItem } from "@/components/TransactionItem";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { groupTransactionsByDate } from "@/lib/formatters";
import { CATEGORY_CONFIG, CategoryType } from "@/types/finance";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { TransactionsStackParamList } from "@/navigation/TransactionsStackNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList & TransactionsStackParamList
>;

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as CategoryType[];

export default function TransactionsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { transactions, isLoading, refreshData } = useFinance();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null,
  );
  const [showSearch, setShowSearch] = useState(false);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.notes.toLowerCase().includes(query) ||
          CATEGORY_CONFIG[t.category].label.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [transactions, selectedCategory, searchQuery]);

  const sections = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions],
  );

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const handleAddTransaction = () => {
    navigation.navigate("AddTransaction", {});
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate("TransactionDetail", { transactionId });
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View
      style={[styles.sectionHeader, { backgroundColor: theme.backgroundRoot }]}
    >
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary, fontWeight: "600" }}
      >
        {title}
      </ThemedText>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TransactionItem
      transaction={item}
      onPress={() => handleTransactionPress(item.id)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <AdaptiveContainer>
        <View
          style={[
            styles.filterContainer,
            {
              paddingTop: headerHeight + Spacing.sm,
              backgroundColor: theme.backgroundRoot,
            },
          ]}
        >
          {showSearch ? (
            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchInputContainer,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather name="search" size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search transactions..."
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery ? (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Feather name="x" size={18} color={theme.textSecondary} />
                  </Pressable>
                ) : null}
              </View>
              <Pressable onPress={() => setShowSearch(false)}>
                <ThemedText type="link">Cancel</ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.filterRow}>
              <Pressable
                onPress={() => setShowSearch(true)}
                style={[
                  styles.searchButton,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather name="search" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          )}

          <View style={styles.categoryFilters}>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: !selectedCategory
                    ? theme.link
                    : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: !selectedCategory ? "#FFFFFF" : theme.text,
                  fontWeight: "500",
                }}
              >
                All
              </ThemedText>
            </Pressable>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === cat
                        ? CATEGORY_CONFIG[cat].color
                        : theme.backgroundDefault,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: selectedCategory === cat ? "#FFFFFF" : theme.text,
                    fontWeight: "500",
                  }}
                >
                  {CATEGORY_CONFIG[cat].label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {sections.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: tabBarHeight + Spacing["4xl"] },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
            scrollIndicatorInsets={{ bottom: insets.bottom }}
            stickySectionHeadersEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="inbox"
              title="No Transactions"
              description={
                searchQuery || selectedCategory
                  ? "No transactions match your filters"
                  : "Start tracking your finances by adding your first transaction"
              }
              buttonText={
                !searchQuery && !selectedCategory ? "Add Transaction" : undefined
              }
              onButtonPress={handleAddTransaction}
            />
          </View>
        )}
      </AdaptiveContainer>

      <FAB onPress={handleAddTransaction} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
