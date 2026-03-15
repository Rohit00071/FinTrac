import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  buttonText,
  onButtonPress,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <Feather name={icon as any} size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.description, { color: theme.textSecondary }]}
      >
        {description}
      </ThemedText>
      {buttonText && onButtonPress ? (
        <Button onPress={onButtonPress} style={styles.button}>
          {buttonText}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});
