import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import {
  formatCurrency,
  formatDate,
  getPercentage,
  getDaysRemaining,
} from "@/lib/formatters";
import { GoalsStackParamList } from "@/navigation/GoalsStackNavigator";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";

type RouteType = RouteProp<GoalsStackParamList, "GoalDetail">;

export default function GoalDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { goals, addGoalContribution, deleteGoal } = useFinance();

  const { goalId } = route.params;
  const goal = goals.find((g) => g.id === goalId);

  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");

  if (!goal) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="h4">Goal not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const percentage = getPercentage(goal.currentAmount, goal.targetAmount);
  const daysRemaining = getDaysRemaining(goal.deadline);
  const remaining = goal.targetAmount - goal.currentAmount;

  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleContribute = async () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid contribution amount.",
      );
      return;
    }

    await addGoalContribution(goalId, amount);
    setShowContributeModal(false);
    setContributionAmount("");
  };

  const handleDelete = () => {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteGoal(goalId);
          navigation.goBack();
        },
      },
    ]);
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
          <View style={styles.header}>
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
              <View style={styles.progressText}>
                <ThemedText style={styles.percentageText}>
                  {percentage}%
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Complete
                </ThemedText>
              </View>
            </View>

            <View
              style={[styles.iconBadge, { backgroundColor: goal.color + "20" }]}
            >
              <Feather name={goal.icon as any} size={24} color={goal.color} />
            </View>
            <ThemedText type="h3" style={styles.goalName}>
              {goal.name}
            </ThemedText>

            {goal.isCompleted ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: FinanceColors.income + "20" },
                ]}
              >
                <Feather
                  name="check-circle"
                  size={16}
                  color={FinanceColors.income}
                />
                <ThemedText
                  style={{ color: FinanceColors.income, fontWeight: "600" }}
                >
                  Goal Completed!
                </ThemedText>
              </View>
            ) : (
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {daysRemaining >= 0
                  ? `${daysRemaining} days remaining`
                  : "Overdue"}
              </ThemedText>
            )}
          </View>

          <View
            style={[
              styles.statsCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Current
                </ThemedText>
                <ThemedText type="h4" style={{ color: FinanceColors.income }}>
                  {formatCurrency(goal.currentAmount)}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Target
                </ThemedText>
                <ThemedText type="h4">
                  {formatCurrency(goal.targetAmount)}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: goal.isCompleted
                      ? FinanceColors.income
                      : goal.color,
                    width: `${percentage}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Feather name="calendar" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Deadline: {formatDate(goal.deadline)}
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <Feather
                  name="dollar-sign"
                  size={16}
                  color={theme.textSecondary}
                />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Remaining: {formatCurrency(Math.max(remaining, 0))}
                </ThemedText>
              </View>
            </View>
          </View>

          {!goal.isCompleted ? (
            <Button
              onPress={() => setShowContributeModal(true)}
              style={styles.contributeButton}
            >
              Add Contribution
            </Button>
          ) : null}

          <Button
            onPress={handleDelete}
            style={[
              styles.deleteButton,
              { backgroundColor: FinanceColors.expense },
            ]}
          >
            Delete Goal
          </Button>
        </AdaptiveContainer>
      </KeyboardAwareScrollViewCompat>

      <Modal
        visible={showContributeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContributeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowContributeModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundRoot },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText type="h4" style={styles.modalTitle}>
              Add Contribution
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
                value={contributionAmount}
                onChangeText={setContributionAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                onPress={() => setShowContributeModal(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                Cancel
              </Button>
              <Button onPress={handleContribute} style={styles.modalButton}>
                Add
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
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  progressContainer: {
    position: "relative",
    marginBottom: Spacing.xl,
  },
  progressText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 32,
    fontWeight: "700",
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  goalName: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  statsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  statRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  infoRow: {
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  contributeButton: {
    marginBottom: Spacing.md,
  },
  deleteButton: {
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
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
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
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
