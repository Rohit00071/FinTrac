import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/contexts/FinanceContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { AdaptiveContainer } from "@/components/AdaptiveContainer";
import {
    investmentStorage,
    spendingAdviceStorage,
    aiSettingsStorage,
} from "@/lib/ai-storage";
import {
    InvestmentBrokerAgent,
    SpendingAdvisorAgent,
} from "@/lib/ai-agents";
import type { AIAgentStackParamList } from "@/navigation/AIAgentsStackNavigator";

type NavigationProp = NativeStackNavigationProp<AIAgentStackParamList>;

export default function AIAgentsScreen() {
    const { theme } = useTheme();
    const { isDesktop } = useResponsive();
    const navigation = useNavigation<NavigationProp>();
    const {
        accounts,
        transactions,
        budgets,
        goals,
        isLoading: financeLoading,
        aiAnalysis,
    } = useFinance();

    const [isLoading, setIsLoading] = useState(true);
    const [investmentStats, setInvestmentStats] = useState({
        totalInvested: 0,
        totalValue: 0,
        returnPercentage: 0,
    });
    const [spendingStats, setSpendingStats] = useState({
        dailyLimit: 0,
        todaySpent: 0,
        remainingToday: 0,
    });

    useEffect(() => {
        loadData();
    }, [accounts, transactions, budgets, goals, aiAnalysis]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const settings = await aiSettingsStorage.get();

            // Load investment stats
            const investments = await investmentStorage.getAll();
            const broker = new InvestmentBrokerAgent(aiAnalysis, settings);
            const metrics = broker.calculatePortfolioMetrics(investments);
            setInvestmentStats({
                totalInvested: metrics.totalInvested,
                totalValue: metrics.totalValue,
                returnPercentage: metrics.returnPercentage,
            });

            // Load spending stats
            const today = new Date().toISOString().substring(0, 10);
            const todaySpent = transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(today))
                .reduce((sum, t) => sum + t.amount, 0);

            const advisor = new SpendingAdvisorAgent(aiAnalysis);
            const advice = advisor.generateAdvice(todaySpent);
            setSpendingStats({
                dailyLimit: advice.dailyLimit,
                todaySpent: advice.todaySpent,
                remainingToday: advice.remainingToday,
            });

            // Save latest advice
            await spendingAdviceStorage.save(advice);
        } catch (error) {
            console.error("Error loading AI agent data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (financeLoading || isLoading) {
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
            {/* Header */}
            <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Feather name="cpu" size={40} color="#fff" />
                <Text style={styles.headerTitle}>AI Financial Agents</Text>
                <Text style={styles.headerSubtitle}>
                    Your intelligent money management assistants
                </Text>
            </LinearGradient>

            <AdaptiveContainer>
                <View style={[styles.agentsGrid, isDesktop && styles.agentsGridDesktop]}>
                    {/* Investment Broker Agent Card */}
                    <TouchableOpacity
                        style={[
                            styles.agentCard, 
                            { backgroundColor: theme.cardBackground },
                            isDesktop && styles.agentCardDesktop
                        ]}
                        onPress={() => navigation.navigate("InvestmentBroker")}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#4CAF50", "#45a049"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.agentIconContainer}
                        >
                            <Feather name="trending-up" size={32} color="#fff" />
                        </LinearGradient>

                        <View style={styles.agentContent}>
                            <View style={styles.agentHeader}>
                                <Text style={[styles.agentTitle, { color: theme.text }]}>
                                    Investment Broker
                                </Text>
                                <Feather name="chevron-right" size={24} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.agentDescription, { color: theme.textSecondary }]}>
                                AI-powered investment recommendations for your savings
                            </Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                        Invested
                                    </Text>
                                    <Text style={[styles.statValue, { color: theme.text }]}>
                                        ₹{investmentStats.totalInvested.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                        Current Value
                                    </Text>
                                    <Text style={[styles.statValue, { color: theme.text }]}>
                                        ₹{investmentStats.totalValue.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                        Return
                                    </Text>
                                    <Text
                                        style={[
                                            styles.statValue,
                                            {
                                                color:
                                                    investmentStats.returnPercentage >= 0 ? "#4CAF50" : "#F44336",
                                            },
                                        ]}
                                    >
                                        {investmentStats.returnPercentage >= 0 ? "+" : ""}
                                        {investmentStats.returnPercentage.toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Spending Advisor Agent Card */}
                    <TouchableOpacity
                        style={[
                            styles.agentCard, 
                            { backgroundColor: theme.cardBackground },
                            isDesktop && styles.agentCardDesktop
                        ]}
                        onPress={() => navigation.navigate("SpendingAdvisor")}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#2196F3", "#1976D2"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.agentIconContainer}
                        >
                            <Feather name="dollar-sign" size={32} color="#fff" />
                        </LinearGradient>

                        <View style={styles.agentContent}>
                            <View style={styles.agentHeader}>
                                <Text style={[styles.agentTitle, { color: theme.text }]}>
                                    Spending Advisor
                                </Text>
                                <Feather name="chevron-right" size={24} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.agentDescription, { color: theme.textSecondary }]}>
                                Smart daily spending recommendations and budget insights
                            </Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                        Daily Limit
                                    </Text>
                                    <Text style={[styles.statValue, { color: theme.text }]}>
                                        ₹{spendingStats.dailyLimit.toFixed(0)}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                        Spent Today
                                    </Text>
                                    <Text style={[styles.statValue, { color: theme.text }]}>
                                        ₹{spendingStats.todaySpent.toFixed(0)}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                        Remaining
                                    </Text>
                                    <Text
                                        style={[
                                            styles.statValue,
                                            {
                                                color:
                                                    spendingStats.remainingToday >= 0 ? "#4CAF50" : "#F44336",
                                            },
                                        ]}
                                    >
                                        ₹{Math.abs(spendingStats.remainingToday).toFixed(0)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
                    <Feather name="info" size={20} color={theme.link} />
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                        These AI agents analyze your financial data to provide personalized
                        recommendations. Tap on each agent to see detailed insights and take action.
                    </Text>
                </View>
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
        marginTop: Spacing.md,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        marginTop: Spacing.xs,
        textAlign: "center",
    },
    agentCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    agentIconContainer: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.md,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Spacing.md,
    },
    agentContent: {
        flex: 1,
    },
    agentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.xs,
    },
    agentTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    agentDescription: {
        fontSize: 14,
        marginBottom: Spacing.md,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "600",
    },
    infoCard: {
        flexDirection: "row",
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        marginLeft: Spacing.sm,
        lineHeight: 20,
    },
    agentsGrid: {
        flexDirection: "column",
        gap: Spacing.md,
    },
    agentsGridDesktop: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    agentCardDesktop: {
        flex: 1,
        minWidth: 350,
    },
});
