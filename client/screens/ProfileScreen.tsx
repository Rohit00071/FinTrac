import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { AVATAR_OPTIONS } from "@/types/finance";

const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "piggy-bank");
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "USD");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      await updateUser({
        name: name.trim(),
        email,
        avatar: selectedAvatar,
        currency: selectedCurrency,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.currentAvatar, { backgroundColor: theme.link + "20" }]}>
            <Feather name={selectedAvatar as any} size={48} color={theme.link} />
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Choose an avatar
          </ThemedText>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((avatar) => (
              <Pressable
                key={avatar}
                onPress={() => setSelectedAvatar(avatar)}
                style={[
                  styles.avatarOption,
                  {
                    backgroundColor:
                      selectedAvatar === avatar
                        ? theme.link + "20"
                        : theme.backgroundDefault,
                    borderColor:
                      selectedAvatar === avatar ? theme.link : "transparent",
                    borderWidth: 2,
                  },
                ]}
              >
                <Feather
                  name={avatar as any}
                  size={24}
                  color={selectedAvatar === avatar ? theme.link : theme.textSecondary}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Full Name
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
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Email
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
            placeholder="Enter your email"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Currency
          </ThemedText>
          <View style={styles.currencyGrid}>
            {CURRENCY_OPTIONS.map((currency) => (
              <Pressable
                key={currency.code}
                onPress={() => setSelectedCurrency(currency.code)}
                style={[
                  styles.currencyOption,
                  {
                    backgroundColor:
                      selectedCurrency === currency.code
                        ? theme.link + "20"
                        : theme.backgroundDefault,
                    borderColor:
                      selectedCurrency === currency.code
                        ? theme.link
                        : "transparent",
                    borderWidth: 2,
                  },
                ]}
              >
                <ThemedText style={styles.currencySymbol}>
                  {currency.symbol}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{
                    color:
                      selectedCurrency === currency.code
                        ? theme.link
                        : theme.textSecondary,
                  }}
                >
                  {currency.code}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          onPress={handleSave}
          disabled={isLoading}
          style={[
            styles.saveButton,
            isSaved && { backgroundColor: FinanceColors.income },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : isSaved ? (
            "Saved!"
          ) : (
            "Save Changes"
          )}
        </Button>

        <Button
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: FinanceColors.expense }]}
        >
          Log Out
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
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  currentAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
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
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  currencyOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 2,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  logoutButton: {
    marginTop: Spacing.md,
  },
});
