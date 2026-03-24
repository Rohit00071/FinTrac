import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
    investmentStorage,
    recommendationStorage,
    aiSettingsStorage,
} from "@/lib/ai-storage";
import { InvestmentBrokerAgent } from "@/lib/ai-agents";
import {
    Investment,
    InvestmentRecommendation,
    INVESTMENT_CONFIG,
    InvestmentType,
} from "@/types/finance";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";

export default function InvestmentBrokerScreen() {
    const { theme } = useTheme();
    const { accounts, goals, refreshData, addTransaction, aiAnalysis } = useFinance();

    const [isLoading, setIsLoading] = useState(true);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
    const [autoInvest, setAutoInvest] = useState(false);
    const [portfolioMetrics, setPortfolioMetrics] = useState({
        totalInvested: 0,
        totalValue: 0,
        totalReturn: 0,
        returnPercentage: 0,
    });

    useEffect(() => {
        loadData();
    }, [accounts, goals, aiAnalysis]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const settings = await aiSettingsStorage.get();
            setAutoInvest(settings.investmentBroker.autoInvest);

            const broker = new InvestmentBrokerAgent(aiAnalysis, settings, accounts);

            // Load investments
            const invs = await investmentStorage.getAll();
            setInvestments(invs);

            // Calculate metrics
            const metrics = broker.calculatePortfolioMetrics(invs);
            setPortfolioMetrics(metrics);

            // Generate recommendations
            const recs = broker.generateRecommendations();
            setRecommendations(recs);

            // Save recommendations
            for (const rec of recs) {
                await recommendationStorage.add(rec);
            }

            // Auto-Invest Logic
            if (settings.investmentBroker.autoInvest && recs.length > 0) {
                // Simple strategy: Execute the first recommendation if we haven't invested recently
                // For this demo, we'll just execute the top one if it matches specific criteria
                // or just notify the user it's happening.
                const topRec = recs[0];

                // Check if we already have a very recent investment of this type (deduplication)
                const recentInv = invs.find(i =>
                    i.type === topRec.type &&
                    (new Date().getTime() - new Date(i.allocatedDate).getTime()) < 24 * 60 * 60 * 1000 // 24 hours
                );

                if (!recentInv) {
                    await executeInvestment(topRec, true);
                }
            }

        } catch (error) {
            console.error("Error loading investment data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAutoInvest = async (value: boolean) => {
        setAutoInvest(value);
        const currentSettings = await aiSettingsStorage.get();
        await aiSettingsStorage.update({
            investmentBroker: {
                ...currentSettings.investmentBroker,
                autoInvest: value,
            },
        });
        if (value) {
            loadData(); // Trigger auto-invest check immediately
        }
    };

    const executeInvestment = async (rec: InvestmentRecommendation, isAuto: boolean = false) => {
        try {
            // Find account with sufficient balance
            const fundingAccount = accounts.sort((a, b) => b.balance - a.balance)[0];

            if (!fundingAccount || fundingAccount.balance < rec.recommendedAmount) {
                if (!isAuto) Alert.alert("Error", "Insufficient funds in any account.");
                return;
            }

            // 1. Add Investment Record
            const newInvestment: Omit<Investment, "id"> = {
                type: rec.type,
                amount: rec.recommendedAmount,
                allocatedDate: new Date().toISOString(),
                currentValue: rec.recommendedAmount,
                returnRate: rec.expectedReturn,
                description: rec.reason,
            };
            await investmentStorage.add(newInvestment);

            // 2. Deduct funds via Transaction
            await addTransaction({
                type: "expense",
                amount: rec.recommendedAmount,
                category: "other", // Or a specific 'investment' category if available
                accountId: fundingAccount.id,
                description: `Investment in ${INVESTMENT_CONFIG[rec.type].label}`,
                notes: isAuto ? "Auto-invested by AI Broker" : "Manual investment",
                date: new Date().toISOString(),
                isRecurring: false,
            });

            await refreshData(); // This will trigger loadData via useEffect

            if (isAuto) {
                Alert.alert("Auto-Invest Executed", `Automatically invested ₹${rec.recommendedAmount} in ${INVESTMENT_CONFIG[rec.type].label}`);
            } else {
                Alert.alert("Success", "Investment added and funds deducted successfully!");
            }

        } catch (error) {
            console.error("Investment execution failed:", error);
            if (!isAuto) Alert.alert("Error", "Failed to execute investment.");
        }
    };

    const handleInvestRecommendation = async (rec: InvestmentRecommendation) => {
        Alert.alert(
            "Invest in " + INVESTMENT_CONFIG[rec.type].label,
            `Invest ₹${rec.recommendedAmount.toLocaleString()} with expected return of ${(rec.expectedReturn * 100).toFixed(1)}%?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Invest",
                    onPress: () => executeInvestment(rec, false),
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
                <ActivityIndicator size="large" color={theme.link} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
            contentContainerStyle={styles.content}
        >
            <AdaptiveContainer>
                {/* Header */}
                <LinearGradient
                    colors={["#4CAF50", "#45a049"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Feather name="trending-up" size={36} color="#fff" />
                    <Text style={styles.headerTitle}>Investment Broker</Text>
                    <Text style={styles.headerSubtitle}>AI-Powered Portfolio Management</Text>
                </LinearGradient>

            {/* Portfolio Overview */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Portfolio Overview
                </Text>
                <View style={styles.metricsGrid}>
                    <View style={styles.metricItem}>
                        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                            Total Invested
                        </Text>
                        <Text style={[styles.metricValue, { color: theme.text }]}>
                            ₹{portfolioMetrics.totalInvested.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                            Current Value
                        </Text>
                        <Text style={[styles.metricValue, { color: theme.text }]}>
                            ₹{portfolioMetrics.totalValue.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                            Total Return
                        </Text>
                        <Text
                            style={[
                                styles.metricValue,
                                { color: portfolioMetrics.totalReturn >= 0 ? "#4CAF50" : "#F44336" },
                            ]}
                        >
                            {portfolioMetrics.totalReturn >= 0 ? "+" : ""}₹
                            {portfolioMetrics.totalReturn.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                            Return %
                        </Text>
                        <Text
                            style={[
                                styles.metricValue,
                                { color: portfolioMetrics.returnPercentage >= 0 ? "#4CAF50" : "#F44336" },
                            ]}
                        >
                            {portfolioMetrics.returnPercentage >= 0 ? "+" : ""}
                            {portfolioMetrics.returnPercentage.toFixed(2)}%
                        </Text>
                    </View>
                </View>
            </View>

            {/* Auto-Invest Toggle */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.text }]}>
                            Auto-Invest
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                            Automatically invest based on recommendations
                        </Text>
                    </View>
                    <Switch
                        value={autoInvest}
                        onValueChange={handleToggleAutoInvest}
                        trackColor={{ false: theme.border, true: "#4CAF50" }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            {/* Investment Recommendations */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    AI Recommendations
                </Text>
                {recommendations.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        No recommendations available. Add some savings to get started!
                    </Text>
                ) : (
                    recommendations.map((rec) => {
                        const config = INVESTMENT_CONFIG[rec.type];
                        return (
                            <View
                                key={rec.id}
                                style={[styles.recommendationCard, { borderLeftColor: config.color }]}
                            >
                                <View style={styles.recHeader}>
                                    <View
                                        style={[
                                            styles.recIcon,
                                            { backgroundColor: config.color + "20" },
                                        ]}
                                    >
                                        <Feather name={config.icon as any} size={24} color={config.color} />
                                    </View>
                                    <View style={styles.recInfo}>
                                        <Text style={[styles.recTitle, { color: theme.text }]}>
                                            {config.label}
                                        </Text>
                                        <Text style={[styles.recAmount, { color: theme.text }]}>
                                            ₹{rec.recommendedAmount.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.recReason, { color: theme.textSecondary }]}>
                                    {rec.reason}
                                </Text>
                                <View style={styles.recFooter}>
                                    <Text style={[styles.recReturn, { color: "#4CAF50" }]}>
                                        Expected: {(rec.expectedReturn * 100).toFixed(1)}% annually
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.investButton, { backgroundColor: config.color }]}
                                        onPress={() => handleInvestRecommendation(rec)}
                                    >
                                        <Text style={styles.investButtonText}>Invest</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>

            {/* Current Investments */}
            {investments.length > 0 && (
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Current Investments
                    </Text>
                    {investments.map((inv) => {
                        const config = INVESTMENT_CONFIG[inv.type];
                        const returnAmount = inv.currentValue - inv.amount;
                        const returnPercentage = (returnAmount / inv.amount) * 100;

                        return (
                            <View
                                key={inv.id}
                                style={[styles.investmentCard, { borderLeftColor: config.color }]}
                            >
                                <View style={styles.invHeader}>
                                    <View
                                        style={[
                                            styles.invIcon,
                                            { backgroundColor: config.color + "20" },
                                        ]}
                                    >
                                        <Feather name={config.icon as any} size={20} color={config.color} />
                                    </View>
                                    <View style={styles.invInfo}>
                                        <Text style={[styles.invTitle, { color: theme.text }]}>
                                            {config.label}
                                        </Text>
                                        <Text style={[styles.invDate, { color: theme.textSecondary }]}>
                                            {new Date(inv.allocatedDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.invValues}>
                                        <Text style={[styles.invAmount, { color: theme.text }]}>
                                            ₹{inv.currentValue.toLocaleString()}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.invReturn,
                                                { color: returnPercentage >= 0 ? "#4CAF50" : "#F44336" },
                                            ]}
                                        >
                                            {returnPercentage >= 0 ? "+" : ""}
                                            {returnPercentage.toFixed(1)}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
            </AdaptiveContainer>
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
        marginBottom: Spacing.md,
    },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -Spacing.xs,
    },
    metricItem: {
        width: "50%",
        padding: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    metricLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    settingInfo: {
        flex: 1,
        marginRight: Spacing.md,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
        padding: Spacing.lg,
    },
    recommendationCard: {
        borderLeftWidth: 4,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderRadius: BorderRadius.sm,
    },
    recHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.sm,
    },
    recIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.sm,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Spacing.sm,
    },
    recInfo: {
        flex: 1,
    },
    recTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    recAmount: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 2,
    },
    recReason: {
        fontSize: 14,
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
    recFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    recReturn: {
        fontSize: 14,
        fontWeight: "600",
    },
    investButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    investButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    investmentCard: {
        borderLeftWidth: 4,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderRadius: BorderRadius.sm,
    },
    invHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    invIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Spacing.sm,
    },
    invInfo: {
        flex: 1,
    },
    invTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    invDate: {
        fontSize: 12,
        marginTop: 2,
    },
    invValues: {
        alignItems: "flex-end",
    },
    invAmount: {
        fontSize: 16,
        fontWeight: "700",
    },
    invReturn: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 2,
    },
});
