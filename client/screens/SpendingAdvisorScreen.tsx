import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { spendingAdviceStorage, aiSettingsStorage } from "@/lib/ai-storage";
import { SpendingAdvisorAgent } from "@/lib/ai-agents";
import { SpendingAdvice } from "@/types/finance";

export default function SpendingAdvisorScreen() {
    const { theme } = useTheme();
    const { transactions, budgets, accounts } = useFinance();

    const [isLoading, setIsLoading] = useState(true);
    const [advice, setAdvice] = useState<SpendingAdvice | null>(null);

    useEffect(() => {
        loadData();
    }, [transactions, budgets, accounts]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const settings = await aiSettingsStorage.get();
            const advisor = new SpendingAdvisorAgent(
                transactions,
                budgets,
                accounts,
                settings
            );
            const newAdvice = advisor.generateAdvice();
            setAdvice(newAdvice);
            await spendingAdviceStorage.save(newAdvice);
        } catch (error) {
            console.error("Error loading spending advice:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !advice) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
                <ActivityIndicator size="large" color={theme.link} />
            </View>
        );
    }

    const spendingProgress = advice.dailyLimit > 0
        ? (advice.todaySpent / advice.dailyLimit) * 100
        : 0;
    const isOverBudget = advice.remainingToday < 0;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <LinearGradient
                colors={["#2196F3", "#1976D2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Feather name="dollar-sign" size={36} color="#fff" />
                <Text style={styles.headerTitle}>Spending Advisor</Text>
                <Text style={styles.headerSubtitle}>Smart Budget Management</Text>
            </LinearGradient>

            {/* Daily Spending Overview */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Today's Spending
                </Text>

                {/* Progress Circle */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressCircle}>
                        <Text style={[styles.progressAmount, { color: theme.text }]}>
                            ₹{advice.todaySpent.toFixed(0)}
                        </Text>
                        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                            of ₹{advice.dailyLimit.toFixed(0)}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(spendingProgress, 100)}%`,
                                backgroundColor: isOverBudget ? "#F44336" : "#4CAF50",
                            },
                        ]}
                    />
                </View>

                {/* Remaining Amount */}
                <View style={styles.remainingContainer}>
                    <Feather
                        name={isOverBudget ? "alert-circle" : "check-circle"}
                        size={20}
                        color={isOverBudget ? "#F44336" : "#4CAF50"}
                    />
                    <Text
                        style={[
                            styles.remainingText,
                            { color: isOverBudget ? "#F44336" : "#4CAF50" },
                        ]}
                    >
                        {isOverBudget
                            ? `₹${Math.abs(advice.remainingToday).toFixed(0)} over budget`
                            : `₹${advice.remainingToday.toFixed(0)} remaining today`}
                    </Text>
                </View>
            </View>

            {/* Weekly Projection */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.projectionHeader}>
                    <Feather name="trending-up" size={20} color={theme.link} />
                    <Text style={[styles.cardTitle, { color: theme.text, marginLeft: Spacing.xs }]}>
                        Weekly Projection
                    </Text>
                </View>
                <Text style={[styles.projectionAmount, { color: theme.text }]}>
                    ₹{advice.weeklyProjection.toFixed(0)}
                </Text>
                <Text style={[styles.projectionLabel, { color: theme.textSecondary }]}>
                    Estimated spending for the next 7 days
                </Text>
            </View>

            {/* AI Tips */}
            {advice.tips.length > 0 && (
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.tipsHeader}>
                        <Feather name="zap" size={20} color="#FF9800" />
                        <Text style={[styles.cardTitle, { color: theme.text, marginLeft: Spacing.xs }]}>
                            AI Tips
                        </Text>
                    </View>
                    {advice.tips.map((tip, index) => (
                        <View key={index} style={styles.tipItem}>
                            <View style={[styles.tipDot, { backgroundColor: "#FF9800" }]} />
                            <Text style={[styles.tipText, { color: theme.text }]}>{tip}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Alerts */}
            {advice.alerts.length > 0 && (
                <View style={[styles.card, { backgroundColor: "#FFF3E0" }]}>
                    <View style={styles.alertsHeader}>
                        <Feather name="alert-triangle" size={20} color="#F57C00" />
                        <Text style={[styles.cardTitle, { color: "#E65100", marginLeft: Spacing.xs }]}>
                            Alerts
                        </Text>
                    </View>
                    {advice.alerts.map((alert, index) => (
                        <View key={index} style={styles.alertItem}>
                            <View style={[styles.alertDot, { backgroundColor: "#F57C00" }]} />
                            <Text style={[styles.alertText, { color: "#E65100" }]}>{alert}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Spending Insights */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.insightsHeader}>
                    <Feather name="bar-chart-2" size={20} color={theme.link} />
                    <Text style={[styles.cardTitle, { color: theme.text, marginLeft: Spacing.xs }]}>
                        Spending Insights
                    </Text>
                </View>

                <View style={styles.insightRow}>
                    <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>
                        Daily Budget
                    </Text>
                    <Text style={[styles.insightValue, { color: theme.text }]}>
                        ₹{advice.dailyLimit.toFixed(0)}
                    </Text>
                </View>

                <View style={styles.insightRow}>
                    <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>
                        Spent Today
                    </Text>
                    <Text style={[styles.insightValue, { color: theme.text }]}>
                        ₹{advice.todaySpent.toFixed(0)}
                    </Text>
                </View>

                <View style={styles.insightRow}>
                    <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>
                        Budget Usage
                    </Text>
                    <Text
                        style={[
                            styles.insightValue,
                            { color: isOverBudget ? "#F44336" : theme.text },
                        ]}
                    >
                        {spendingProgress.toFixed(0)}%
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    header: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
        marginTop: Spacing.sm,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        marginTop: Spacing.xs,
    },
    card: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    progressContainer: {
        alignItems: "center",
        marginVertical: Spacing.lg,
    },
    progressCircle: {
        alignItems: "center",
    },
    progressAmount: {
        fontSize: 36,
        fontWeight: "700",
    },
    progressLabel: {
        fontSize: 16,
        marginTop: Spacing.xs,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        marginVertical: Spacing.md,
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    remainingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    remainingText: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: Spacing.xs,
    },
    projectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.sm,
    },
    projectionAmount: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: Spacing.xs,
    },
    projectionLabel: {
        fontSize: 14,
    },
    tipsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    tipItem: {
        flexDirection: "row",
        marginBottom: Spacing.sm,
    },
    tipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
        marginRight: Spacing.sm,
    },
    tipText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 20,
    },
    alertsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    alertItem: {
        flexDirection: "row",
        marginBottom: Spacing.sm,
    },
    alertDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
        marginRight: Spacing.sm,
    },
    alertText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 20,
        fontWeight: "500",
    },
    insightsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    insightRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.05)",
    },
    insightLabel: {
        fontSize: 16,
    },
    insightValue: {
        fontSize: 16,
        fontWeight: "600",
    },
});
