import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const success = await login(email, password);
      if (!success) {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AdaptiveContainer>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="h2" style={styles.title}>
              Welcome to FinTrack
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Track your finances, reach your goals
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Mode Switcher */}
            <View style={[styles.tabContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Pressable 
                style={[styles.tab, { backgroundColor: theme.cardBackground }]}
                onPress={() => {}}
              >
                <ThemedText style={{ fontWeight: "600", color: theme.link }}>Login</ThemedText>
              </Pressable>
              <Pressable 
                style={styles.tab}
                onPress={() => navigation.navigate("Register")}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Sign Up</ThemedText>
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

            <View style={styles.inputContainer}>
              <ThemedText type="small" style={styles.label}>
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
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="small" style={styles.label}>
                Password
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
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Quick Login Section */}
            <View style={styles.quickLoginSection}>
              <ThemedText type="small" style={[styles.quickLoginTitle, { color: theme.textSecondary }]}>
                QUICK LOGIN (DEMO)
              </ThemedText>
              <View style={styles.demoButtonsContainer}>
                <Pressable 
                  style={[styles.demoBtn, { borderColor: theme.border }]}
                  onPress={() => { setEmail("rohit@fintrac.com"); setPassword("rohit123"); }}
                >
                  <ThemedText style={styles.demoBtnText}>Rohit</ThemedText>
                </Pressable>
                <Pressable 
                  style={[styles.demoBtn, { borderColor: theme.border }]}
                  onPress={() => { setEmail("priya@fintrac.com"); setPassword("priya456"); }}
                >
                  <ThemedText style={styles.demoBtnText}>Priya</ThemedText>
                </Pressable>
                <Pressable 
                  style={[styles.demoBtn, { borderColor: theme.border }]}
                  onPress={() => { setEmail("vikram@fintrac.com"); setPassword("vikram789"); }}
                >
                  <ThemedText style={styles.demoBtnText}>Vikram</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: BorderRadius.sm - 2,
  },
  quickLoginSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  quickLoginTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "600",
    letterSpacing: 1,
  },
  demoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
