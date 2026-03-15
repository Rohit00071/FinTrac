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

/**
 * Investment Broker Agent
 * Analyzes savings and provides investment recommendations
 */
export class InvestmentBrokerAgent {
    private accounts: Account[];
    private goals: Goal[];
    private settings: AIAgentSettings;

    constructor(
        accounts: Account[],
        goals: Goal[],
        settings: AIAgentSettings
    ) {
        this.accounts = accounts;
        this.goals = goals;
        this.settings = settings;
    }

    /**
     * Calculate total available savings for investment
     */
    private calculateAvailableSavings(): number {
        const totalBalance = this.accounts.reduce(
            (sum, acc) => sum + acc.balance,
            0
        );

        // Reserve emergency fund
        const emergencyFundNeeded =
            this.settings.investmentBroker.emergencyFundMonths * 2000; // Assume $2000/month expenses

        return Math.max(0, totalBalance - emergencyFundNeeded);
    }

    /**
     * Calculate recommended portfolio allocation based on risk tolerance
     */
    private getPortfolioAllocation(): Record<InvestmentType, number> {
        const { riskTolerance } = this.settings.investmentBroker;

        const allocations: Record<RiskTolerance, Record<InvestmentType, number>> = {
            conservative: {
                stocks: 0.3,
                bonds: 0.5,
                emergency: 0.15,
                crypto: 0.0,
                "real-estate": 0.05,
            },
            moderate: {
                stocks: 0.5,
                bonds: 0.3,
                emergency: 0.1,
                crypto: 0.05,
                "real-estate": 0.05,
            },
            aggressive: {
                stocks: 0.6,
                bonds: 0.15,
                emergency: 0.05,
                crypto: 0.15,
                "real-estate": 0.05,
            },
        };

        return allocations[riskTolerance];
    }

    /**
     * Generate investment recommendations
     */
    generateRecommendations(): InvestmentRecommendation[] {
        const availableSavings = this.calculateAvailableSavings();
        const { minInvestmentAmount } = this.settings.investmentBroker;

        if (availableSavings < minInvestmentAmount) {
            return [
                {
                    id: Date.now().toString(),
                    type: "emergency",
                    recommendedAmount: minInvestmentAmount - availableSavings,
                    reason: `Build your emergency fund to at least $${minInvestmentAmount} before investing.`,
                    expectedReturn: 0.01,
                    riskLevel: "conservative",
                    createdAt: new Date().toISOString(),
                },
            ];
        }

        const allocation = this.getPortfolioAllocation();
        const recommendations: InvestmentRecommendation[] = [];

        Object.entries(allocation).forEach(([type, percentage]) => {
            const amount = Math.round(availableSavings * percentage);
            if (amount > 0) {
                const config = INVESTMENT_CONFIG[type as InvestmentType];
                recommendations.push({
                    id: `${Date.now()}-${type}`,
                    type: type as InvestmentType,
                    recommendedAmount: amount,
                    reason: this.getInvestmentReason(type as InvestmentType, percentage),
                    expectedReturn: config.defaultReturn,
                    riskLevel: this.settings.investmentBroker.riskTolerance,
                    createdAt: new Date().toISOString(),
                });
            }
        });

        return recommendations;
    }

    /**
     * Get reason for investment recommendation
     */
    private getInvestmentReason(type: InvestmentType, percentage: number): string {
        const reasons: Record<InvestmentType, string> = {
            stocks: `Allocate ${(percentage * 100).toFixed(0)}% to stocks for long-term growth potential with moderate risk.`,
            bonds: `Invest ${(percentage * 100).toFixed(0)}% in bonds for stable, predictable returns with lower risk.`,
            emergency: `Keep ${(percentage * 100).toFixed(0)}% as emergency fund for unexpected expenses.`,
            crypto: `Consider ${(percentage * 100).toFixed(0)}% in cryptocurrency for high-risk, high-reward opportunities.`,
            "real-estate": `Allocate ${(percentage * 100).toFixed(0)}% to real estate for diversification and passive income.`,
        };
        return reasons[type];
    }

    /**
     * Calculate portfolio performance metrics
     */
    calculatePortfolioMetrics(investments: Investment[]): {
        totalInvested: number;
        totalValue: number;
        totalReturn: number;
        returnPercentage: number;
    } {
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalReturn = totalValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

        return {
            totalInvested,
            totalValue,
            totalReturn,
            returnPercentage,
        };
    }
}

/**
 * Spending Advisor Agent
 * Provides daily spending recommendations based on budget and income
 */
export class SpendingAdvisorAgent {
    private transactions: Transaction[];
    private budgets: Budget[];
    private accounts: Account[];
    private settings: AIAgentSettings;

    constructor(
        transactions: Transaction[],
        budgets: Budget[],
        accounts: Account[],
        settings: AIAgentSettings
    ) {
        this.transactions = transactions;
        this.budgets = budgets;
        this.accounts = accounts;
        this.settings = settings;
    }

    /**
     * Get current month in YYYY-MM format
     */
    private getCurrentMonth(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }

    /**
     * Get today's date in YYYY-MM-DD format
     */
    private getToday(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }

    /**
     * Calculate monthly income
     */
    private getMonthlyIncome(): number {
        const currentMonth = this.getCurrentMonth();
        return this.transactions
            .filter((t) => t.type === "income" && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
    }

    /**
     * Calculate monthly expenses
     */
    private getMonthlyExpenses(): number {
        const currentMonth = this.getCurrentMonth();
        return this.transactions
            .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
    }

    /**
     * Calculate today's spending
     */
    private getTodaySpending(): number {
        const today = this.getToday();
        return this.transactions
            .filter((t) => t.type === "expense" && t.date === today)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    /**
     * Calculate total budget limit
     */
    private getTotalBudgetLimit(): number {
        const currentMonth = this.getCurrentMonth();
        return this.budgets
            .filter((b) => b.month === currentMonth)
            .reduce((sum, b) => sum + b.limit, 0);
    }

    /**
     * Calculate recommended daily spending limit
     */
    private calculateDailyLimit(): number {
        const income = this.getMonthlyIncome();
        const budgetLimit = this.getTotalBudgetLimit();
        const currentExpenses = this.getMonthlyExpenses();

        // Use budget if available, otherwise use 70% of income
        const monthlyLimit = budgetLimit > 0 ? budgetLimit : income * 0.7;

        // Calculate remaining budget for the month
        const remaining = monthlyLimit - currentExpenses;

        // Calculate days remaining in month
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - now.getDate() + 1;

        // Daily limit is remaining budget divided by remaining days
        return Math.max(0, remaining / daysRemaining);
    }

    /**
     * Generate spending tips
     */
    private generateTips(): string[] {
        const tips: string[] = [];
        const income = this.getMonthlyIncome();
        const expenses = this.getMonthlyExpenses();
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        if (savingsRate < 20) {
            tips.push("💡 Try to save at least 20% of your income for financial security.");
        } else if (savingsRate > 50) {
            tips.push("🌟 Excellent! You're saving over 50% of your income.");
        }

        const todaySpending = this.getTodaySpending();
        const dailyLimit = this.calculateDailyLimit();

        if (todaySpending > dailyLimit * 1.5) {
            tips.push("⚠️ You've spent significantly more than your daily limit today.");
        } else if (todaySpending < dailyLimit * 0.5) {
            tips.push("✅ Great job staying under your daily spending limit!");
        }

        // Check budget adherence
        const currentMonth = this.getCurrentMonth();
        this.budgets
            .filter((b) => b.month === currentMonth)
            .forEach((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                if (percentage > 90) {
                    tips.push(`🚨 You've used ${percentage.toFixed(0)}% of your ${budget.category} budget.`);
                }
            });

        if (tips.length === 0) {
            tips.push("💰 Keep tracking your expenses to maintain good financial habits!");
        }

        return tips;
    }

    /**
     * Generate spending alerts
     */
    private generateAlerts(): string[] {
        const alerts: string[] = [];
        const expenses = this.getMonthlyExpenses();
        const income = this.getMonthlyIncome();

        if (expenses > income) {
            alerts.push("⚠️ Warning: Your expenses exceed your income this month!");
        }

        const totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        if (totalBalance < 1000) {
            alerts.push("🔴 Low balance alert: Consider reducing non-essential spending.");
        }

        return alerts;
    }

    /**
     * Generate spending advice
     */
    generateAdvice(): SpendingAdvice {
        const dailyLimit = this.calculateDailyLimit();
        const todaySpent = this.getTodaySpending();
        const remainingToday = Math.max(0, dailyLimit - todaySpent);

        // Project weekly spending
        const avgDailySpending = this.getMonthlyExpenses() / new Date().getDate();
        const weeklyProjection = avgDailySpending * 7;

        return {
            id: Date.now().toString(),
            dailyLimit: Math.round(dailyLimit * 100) / 100,
            todaySpent: Math.round(todaySpent * 100) / 100,
            remainingToday: Math.round(remainingToday * 100) / 100,
            weeklyProjection: Math.round(weeklyProjection * 100) / 100,
            tips: this.generateTips(),
            alerts: this.generateAlerts(),
            createdAt: new Date().toISOString(),
        };
    }
}
