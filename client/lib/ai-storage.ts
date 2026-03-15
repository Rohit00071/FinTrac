import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Investment,
    InvestmentRecommendation,
    SpendingAdvice,
    AIAgentSettings,
    RiskTolerance,
} from "@/types/finance";

const STORAGE_KEYS = {
    INVESTMENTS: "@fintrac/investments",
    INVESTMENT_RECOMMENDATIONS: "@fintrac/investment_recommendations",
    SPENDING_ADVICE: "@fintrac/spending_advice",
    AI_SETTINGS: "@fintrac/ai_settings",
};

// Default AI Agent Settings
const DEFAULT_AI_SETTINGS: AIAgentSettings = {
    investmentBroker: {
        enabled: true,
        autoInvest: false,
        riskTolerance: "moderate" as RiskTolerance,
        minInvestmentAmount: 1000,
        emergencyFundMonths: 6,
    },
    spendingAdvisor: {
        enabled: true,
        strictMode: false,
        notifyOnOverspend: true,
    },
};

// Investment Storage
export const investmentStorage = {
    async getAll(): Promise<Investment[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.INVESTMENTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading investments:", error);
            return [];
        }
    },

    async add(investment: Omit<Investment, "id">): Promise<Investment> {
        const investments = await this.getAll();
        const newInvestment: Investment = {
            ...investment,
            id: Date.now().toString(),
        };
        investments.push(newInvestment);
        await AsyncStorage.setItem(
            STORAGE_KEYS.INVESTMENTS,
            JSON.stringify(investments)
        );
        return newInvestment;
    },

    async update(id: string, updates: Partial<Investment>): Promise<void> {
        const investments = await this.getAll();
        const index = investments.findIndex((inv) => inv.id === id);
        if (index !== -1) {
            investments[index] = { ...investments[index], ...updates };
            await AsyncStorage.setItem(
                STORAGE_KEYS.INVESTMENTS,
                JSON.stringify(investments)
            );
        }
    },

    async delete(id: string): Promise<void> {
        const investments = await this.getAll();
        const filtered = investments.filter((inv) => inv.id !== id);
        await AsyncStorage.setItem(
            STORAGE_KEYS.INVESTMENTS,
            JSON.stringify(filtered)
        );
    },

    async getTotalInvested(): Promise<number> {
        const investments = await this.getAll();
        return investments.reduce((sum, inv) => sum + inv.amount, 0);
    },

    async getTotalValue(): Promise<number> {
        const investments = await this.getAll();
        return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    },
};

// Investment Recommendations Storage
export const recommendationStorage = {
    async getAll(): Promise<InvestmentRecommendation[]> {
        try {
            const data = await AsyncStorage.getItem(
                STORAGE_KEYS.INVESTMENT_RECOMMENDATIONS
            );
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading recommendations:", error);
            return [];
        }
    },

    async add(
        recommendation: Omit<InvestmentRecommendation, "id" | "createdAt">
    ): Promise<InvestmentRecommendation> {
        const recommendations = await this.getAll();
        const newRecommendation: InvestmentRecommendation = {
            ...recommendation,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        recommendations.unshift(newRecommendation);
        // Keep only last 10 recommendations
        const limited = recommendations.slice(0, 10);
        await AsyncStorage.setItem(
            STORAGE_KEYS.INVESTMENT_RECOMMENDATIONS,
            JSON.stringify(limited)
        );
        return newRecommendation;
    },

    async clear(): Promise<void> {
        await AsyncStorage.setItem(
            STORAGE_KEYS.INVESTMENT_RECOMMENDATIONS,
            JSON.stringify([])
        );
    },
};

// Spending Advice Storage
export const spendingAdviceStorage = {
    async getLatest(): Promise<SpendingAdvice | null> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.SPENDING_ADVICE);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Error loading spending advice:", error);
            return null;
        }
    },

    async save(advice: Omit<SpendingAdvice, "id" | "createdAt">): Promise<SpendingAdvice> {
        const newAdvice: SpendingAdvice = {
            ...advice,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(
            STORAGE_KEYS.SPENDING_ADVICE,
            JSON.stringify(newAdvice)
        );
        return newAdvice;
    },
};

// AI Settings Storage
export const aiSettingsStorage = {
    async get(): Promise<AIAgentSettings> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
            return data ? JSON.parse(data) : DEFAULT_AI_SETTINGS;
        } catch (error) {
            console.error("Error loading AI settings:", error);
            return DEFAULT_AI_SETTINGS;
        }
    },

    async update(settings: Partial<AIAgentSettings>): Promise<AIAgentSettings> {
        const current = await this.get();
        const updated: AIAgentSettings = {
            investmentBroker: {
                ...current.investmentBroker,
                ...(settings.investmentBroker || {}),
            },
            spendingAdvisor: {
                ...current.spendingAdvisor,
                ...(settings.spendingAdvisor || {}),
            },
        };
        await AsyncStorage.setItem(
            STORAGE_KEYS.AI_SETTINGS,
            JSON.stringify(updated)
        );
        return updated;
    },

    async reset(): Promise<AIAgentSettings> {
        await AsyncStorage.setItem(
            STORAGE_KEYS.AI_SETTINGS,
            JSON.stringify(DEFAULT_AI_SETTINGS)
        );
        return DEFAULT_AI_SETTINGS;
    },
};
