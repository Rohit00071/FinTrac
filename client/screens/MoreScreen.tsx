import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius, FinanceColors } from "@/constants/theme";
import { MoreStackParamList } from "@/navigation/MoreStackNavigator";
import { createTestData, clearAllData } from "@/lib/test-data";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";

type NavigationProp = NativeStackNavigationProp<MoreStackParamList>;

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  showBadge?: boolean;
}

function MenuItem({ icon, label, onPress, color, showBadge }: MenuItemProps) {
  const { theme } = useTheme();
  const iconColor = color || theme.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
        },
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: (color || theme.link) + "15" },
        ]}
      >
        <Feather name={icon as any} size={20} color={iconColor} />
      </View>
      <ThemedText type="body" style={styles.menuLabel}>
        {label}
      </ThemedText>
      <View style={styles.menuArrow}>
        {showBadge ? <View style={styles.badge} /> : null}
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const { refreshData } = useFinance();
  const [isLoadingData, setIsLoadingData] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleLoadTestData = async () => {
    Alert.alert(
      "Load Test Data",
      "This will add sample financial data to test AI agents. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load Data",
          onPress: async () => {
            setIsLoadingData(true);
            try {
              await createTestData();
              await refreshData();
              Alert.alert(
                "Success",
                "Test data loaded! Check AI Agents tab to see recommendations."
              );
            } catch (error) {
              Alert.alert("Error", "Failed to load test data");
            } finally {
              setIsLoadingData(false);
            }
          },
        },
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will delete ALL financial data. This cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setIsLoadingData(true);
            try {
              await clearAllData();
              await refreshData();
              Alert.alert("Success", "All data cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            } finally {
              setIsLoadingData(false);
            }
          },
        },
      ]
    );
  };

  // Expose functions to window for easy testing via browser console
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).loadTestData = async () => {
        try {
          await createTestData();
          await refreshData();
          console.log('✅ Test data loaded successfully!');
          alert('Test data loaded! Check AI Agents tab.');
        } catch (error) {
          console.error('❌ Failed to load test data:', error);
          alert('Failed to load test data. Check console.');
        }
      };
      (window as any).clearTestData = async () => {
        try {
          await clearAllData();
          await refreshData();
          console.log('✅ All data cleared!');
          alert('All data cleared!');
        } catch (error) {
          console.error('❌ Failed to clear data:', error);
          alert('Failed to clear data. Check console.');
        }
      };
      console.log('💡 Test data functions exposed to window:');
      console.log('   - window.loadTestData()');
      console.log('   - window.clearTestData()');
    }
  }, [refreshData]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AdaptiveContainer>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={[
              styles.profileCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.link + "20" }]}>
              <Feather name="user" size={28} color={theme.link} />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="body" style={styles.profileName}>
                {user?.name || "User"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {user?.email || "View profile"}
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          <View style={styles.section}>
            <ThemedText
              type="small"
              style={[styles.sectionTitle, { color: theme.textSecondary }]}
            >
              Finance
            </ThemedText>
            <View
              style={[
                styles.menuGroup,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <MenuItem
                icon="credit-card"
                label="Accounts & Cards"
                onPress={() => navigation.navigate("Accounts")}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <MenuItem
                icon="file-text"
                label="Bills & Reminders"
                onPress={() => navigation.navigate("Bills")}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <MenuItem
                icon="bar-chart-2"
                label="Reports & Analytics"
                onPress={() => navigation.navigate("Reports")}
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText
              type="small"
              style={[styles.sectionTitle, { color: theme.textSecondary }]}
            >
              App
            </ThemedText>
            <View
              style={[
                styles.menuGroup,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <MenuItem
                icon="settings"
                label="Settings"
                onPress={() => navigation.navigate("Settings")}
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText
              type="small"
              style={[styles.sectionTitle, { color: theme.textSecondary }]}
            >
              Developer Tools
            </ThemedText>
            <View
              style={[
                styles.menuGroup,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Pressable
                onPress={handleLoadTestData}
                disabled={isLoadingData}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
                  },
                ]}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: "#4CAF50" + "15" },
                  ]}
                >
                  {isLoadingData ? (
                    <ActivityIndicator size="small" color="#4CAF50" />
                  ) : (
                    <Feather name="database" size={20} color="#4CAF50" />
                  )}
                </View>
                <ThemedText type="body" style={styles.menuLabel}>
                  Load Test Data
                </ThemedText>
                <View style={styles.menuArrow}>
                  <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                </View>
              </Pressable>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Pressable
                onPress={handleClearData}
                disabled={isLoadingData}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
                  },
                ]}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: FinanceColors.expense + "15" },
                  ]}
                >
                  {isLoadingData ? (
                    <ActivityIndicator size="small" color={FinanceColors.expense} />
                  ) : (
                    <Feather name="trash-2" size={20} color={FinanceColors.expense} />
                  )}
                </View>
                <ThemedText type="body" style={styles.menuLabel}>
                  Clear All Data
                </ThemedText>
                <View style={styles.menuArrow}>
                  <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <View
              style={[
                styles.menuGroup,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <MenuItem
                icon="log-out"
                label="Log Out"
                onPress={handleLogout}
                color={FinanceColors.expense}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              FinTrack v1.0.0
            </ThemedText>
          </View>
        </AdaptiveContainer>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    fontWeight: "600",
    marginBottom: 2,
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
  menuGroup: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FinanceColors.expense,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
