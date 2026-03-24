import {
    Account,
    Transaction,
    Budget,
    Goal,
    Investment,
    InvestmentRecommendation,
    SpendingAdvice,
    AIAgentSettings,
    InvestmentType,
    RiskTolerance,
    INVESTMENT_CONFIG,
} from "@/types/finance";

const getAiServiceUrl = () => {
  const url = process.env.EXPO_PUBLIC_AI_SERVICE_URL;
  if (!url) {
    if (typeof window !== "undefined") {
      // If we're on web and it's local development, point to our backend proxy on port 5000
      if (window.location.hostname === "localhost") {
        return "http://localhost:5000/api";
      }
      return "/api";
    }
    return "http://localhost:8000";
  }
  // If it's a relative path, use it as is
  if (url.startsWith("/")) return url;
  // If it's an absolute URL with protocol, use it
  if (url.startsWith("http")) return url;
  // If it's just a hostname (like from Render), add https
  return `https://${url}`;
};

const AI_SERVICE_URL = getAiServiceUrl();

export interface AIAnalysisResult {
    insights: string[];
    warnings: string[];
    recommendations: string[];
    portfolio_allocation: Record<string, number>;
    daily_spending_limit: number;
    prediction_details: {
        predicted_spending_30d: number;
        category_predictions: Record<string, number>;
    };
}

/**
 * Main AI Service Client
 */
export const fetchAIAnalysis = async (
    transactions: Transaction[],
    accounts: Account[],
    budgets: Budget[],
    settings: AIAgentSettings
): Promise<AIAnalysisResult | null> => {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/ai/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                transactions,
                accounts,
                budgets,
                risk_tolerance: settings.investmentBroker.riskTolerance,
            }),
        });
        if (!response.ok) throw new Error("AI Service unavailable");
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch AI analysis:", error);
        return null;
    }
};

/**
 * Investment Broker Agent (Protonated with Python AI)
 */
export class InvestmentBrokerAgent {
    private analysis: AIAnalysisResult | null;
    private settings: AIAgentSettings;

    constructor(
        analysis: AIAnalysisResult | null,
        settings: AIAgentSettings
    ) {
        this.analysis = analysis;
        this.settings = settings;
    }

    generateRecommendations(): InvestmentRecommendation[] {
        if (!this.analysis) return [];

        const allocation = this.analysis.portfolio_allocation;
        // Total balance logic for sizing
        // (This part can stay client-side or be moved to Python)
        const totalAvailable = 10000; // Placeholder or calculate from accounts

        return Object.entries(allocation).map(([type, percentage]) => ({
            id: `${Date.now()}-${type}`,
            type: type as InvestmentType,
            recommendedAmount: Math.round(totalAvailable * percentage),
            reason: `AI-optimized allocation based on your risk profile and market trends.`,
            expectedReturn: INVESTMENT_CONFIG[type as InvestmentType]?.defaultReturn || 0.05,
            riskLevel: this.settings.investmentBroker.riskTolerance,
            createdAt: new Date().toISOString(),
        }));
    }

    calculatePortfolioMetrics(investments: Investment[]) {
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalReturn = totalValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

        return { totalInvested, totalValue, totalReturn, returnPercentage };
    }
}

/**
 * Spending Advisor Agent (Protonated with Python AI)
 */
export class SpendingAdvisorAgent {
    private analysis: AIAnalysisResult | null;

    constructor(analysis: AIAnalysisResult | null) {
        this.analysis = analysis;
    }

    generateAdvice(todaySpent: number = 0): SpendingAdvice {
        const fallback: SpendingAdvice = {
            id: Date.now().toString(),
            dailyLimit: 0,
            todaySpent: todaySpent,
            remainingToday: -todaySpent,
            weeklyProjection: 0,
            tips: ["AI Service currently unavailable. Check your connection."],
            alerts: [],
            createdAt: new Date().toISOString(),
        };

        if (!this.analysis) return fallback;

        return {
            id: Date.now().toString(),
            dailyLimit: this.analysis.daily_spending_limit,
            todaySpent: todaySpent,
            remainingToday: this.analysis.daily_spending_limit - todaySpent,
            weeklyProjection: (this.analysis.prediction_details.predicted_spending_30d / 30) * 7,
            tips: this.analysis.insights,
            alerts: this.analysis.warnings,
            createdAt: new Date().toISOString(),
        };
    }
}
