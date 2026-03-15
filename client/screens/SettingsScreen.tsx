import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { settingsStorage } from "@/lib/storage";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppSettings } from "@/types/finance";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<AppSettings>({
    theme: "system",
    currency: "USD",
    notifications: true,
    biometricLock: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await settingsStorage.get();
    setSettings(savedSettings);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await settingsStorage.set(newSettings);
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
      >
        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Appearance
          </ThemedText>
          <View
            style={[
              styles.settingGroup,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather name="sun" size={20} color={theme.textSecondary} />
                <ThemedText type="body">Theme</ThemedText>
              </View>
              <View style={styles.themeSelector}>
                {(["light", "dark", "system"] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => updateSetting("theme", t)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor:
                          settings.theme === t ? theme.link : "transparent",
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color: settings.theme === t ? "#FFFFFF" : theme.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {t}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Notifications
          </ThemedText>
          <View
            style={[
              styles.settingGroup,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather name="bell" size={20} color={theme.textSecondary} />
                <View>
                  <ThemedText type="body">Push Notifications</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    Receive bill reminders and budget alerts
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting("notifications", value)}
                trackColor={{ false: theme.border, true: theme.link }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Security
          </ThemedText>
          <View
            style={[
              styles.settingGroup,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather name="lock" size={20} color={theme.textSecondary} />
                <View>
                  <ThemedText type="body">Biometric Lock</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    Use Face ID or fingerprint to unlock
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings.biometricLock}
                onValueChange={(value) => updateSetting("biometricLock", value)}
                trackColor={{ false: theme.border, true: theme.link }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            About
          </ThemedText>
          <View
            style={[
              styles.settingGroup,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.infoRow}>
              <ThemedText type="body">Version</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                1.0.0
              </ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <ThemedText type="body">Developer</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                MCA Project
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingGroup: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  themeSelector: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  themeOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
});
