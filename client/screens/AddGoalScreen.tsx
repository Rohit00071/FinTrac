import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";

const GOAL_ICONS = [
  { icon: "home", label: "Home" },
  { icon: "truck", label: "Car" },
  { icon: "briefcase", label: "Business" },
  { icon: "sun", label: "Vacation" },
  { icon: "heart", label: "Health" },
  { icon: "book", label: "Education" },
  { icon: "gift", label: "Gift" },
  { icon: "shield", label: "Emergency" },
];

const GOAL_COLORS = [
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#E91E63",
  "#00BCD4",
  "#795548",
  "#607D8B",
];

export default function AddGoalScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { addGoal } = useFinance();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0].icon);
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a goal name");
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      setError("Please enter a valid target amount");
      return;
    }
    if (!deadline) {
      setError("Please enter a deadline");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await addGoal({
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        deadline,
        icon: selectedIcon,
        color: selectedColor,
        isCompleted: false,
      });
      navigation.goBack();
    } catch (err) {
      setError("Failed to create goal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.xl,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
            Goal Name
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
            placeholder="e.g., New Car, Vacation, Emergency Fund"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Target Amount
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
            <ThemedText style={styles.currencySymbol}>$</ThemedText>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Target Date (YYYY-MM-DD)
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
            placeholder="2025-12-31"
            placeholderTextColor={theme.textSecondary}
            value={deadline}
            onChangeText={setDeadline}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Icon
          </ThemedText>
          <View style={styles.iconGrid}>
            {GOAL_ICONS.map((item) => (
              <Pressable
                key={item.icon}
                onPress={() => setSelectedIcon(item.icon)}
                style={[
                  styles.iconItem,
                  {
                    backgroundColor:
                      selectedIcon === item.icon
                        ? selectedColor + "20"
                        : theme.backgroundDefault,
                    borderColor:
                      selectedIcon === item.icon
                        ? selectedColor
                        : "transparent",
                    borderWidth: 2,
                  },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={24}
                  color={
                    selectedIcon === item.icon
                      ? selectedColor
                      : theme.textSecondary
                  }
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Color
          </ThemedText>
          <View style={styles.colorGrid}>
            {GOAL_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorItem,
                  {
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color ? theme.text : "transparent",
                    borderWidth: selectedColor === color ? 3 : 0,
                  },
                ]}
              >
                {selectedColor === color ? (
                  <Feather name="check" size={20} color="#FFFFFF" />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          onPress={handleSave}
          disabled={isLoading}
          style={styles.saveButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            "Create Goal"
          )}
        </Button>
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
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
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
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  iconItem: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  colorItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
