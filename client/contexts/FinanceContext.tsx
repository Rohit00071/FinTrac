import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  Transaction,
  Account,
  Budget,
  Goal,
  Bill,
  CategoryType,
  Investment,
  INVESTMENT_CONFIG,
} from "@/types/finance";
import {
  transactionStorage,
  accountStorage,
  budgetStorage,
  goalStorage,
  billStorage,
} from "@/lib/storage";
import { aiSettingsStorage, investmentStorage } from "@/lib/ai-storage";
import { InvestmentBrokerAgent, fetchAIAnalysis, AIAnalysisResult } from "@/lib/ai-agents";
import { useAuth } from "./AuthContext";

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
  bills: Bill[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt">,
  ) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, "id">) => Promise<Account>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, "id">) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalContribution: (id: string, amount: number) => Promise<void>;
  addBill: (bill: Omit<Bill, "id">) => Promise<Bill>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markBillPaid: (id: string) => Promise<void>;
  getTotalBalance: () => number;
  getMonthlyIncome: (month?: string) => number;
  getMonthlyExpense: (month?: string) => number;
  getCategorySpending: (category: CategoryType, month?: string) => number;
  aiAnalysis: AIAnalysisResult | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txns, accts, bdgts, gls, bls] = await Promise.all([
        transactionStorage.getAll(),
        accountStorage.getAll(),
        budgetStorage.getAll(),
        goalStorage.getAll(),
        billStorage.getAll(),
      ]);
      setTransactions(txns);
      setAccounts(accts);
      setBudgets(bdgts);
      setGoals(gls);
      setBills(bls);

      // Perform AI Analysis
      const settings = await aiSettingsStorage.get();
      const analysis = await fetchAIAnalysis(txns, accts, bdgts, settings);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setTransactions([]);
      setAccounts([]);
      setBudgets([]);
      setGoals([]);
      setBills([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshData]);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const checkAutoInvest = async () => {
    try {
      const settings = await aiSettingsStorage.get();
      if (!settings.investmentBroker.autoInvest) return;

      // Fetch fresh data for analysis
      const currentAccounts = await accountStorage.getAll();
      const currentGoals = await goalStorage.getAll();
      const currentBudgets = await budgetStorage.getAll();

      const analysis = await fetchAIAnalysis(transactions, currentAccounts, currentBudgets, settings);
      const broker = new InvestmentBrokerAgent(analysis, settings);
      const recs = broker.generateRecommendations();

      if (recs.length > 0) {
        const topRec = recs[0];
        const invs = await investmentStorage.getAll();

        // Deduplication: Check if invested in same type in last 24 hours
        const recentInv = invs.find(i =>
          i.type === topRec.type &&
          (new Date().getTime() - new Date(i.allocatedDate).getTime()) < 24 * 60 * 60 * 1000
        );

        if (!recentInv) {
          // Find funding account (highest balance)
          const fundingAccount = currentAccounts.sort((a, b) => b.balance - a.balance)[0];

          if (fundingAccount && fundingAccount.balance >= topRec.recommendedAmount) {
            // 1. Add Investment
            const newInvestment: Omit<Investment, "id"> = {
              type: topRec.type,
              amount: topRec.recommendedAmount,
              allocatedDate: new Date().toISOString(),
              currentValue: topRec.recommendedAmount,
              returnRate: topRec.expectedReturn,
              description: topRec.reason,
            };
            await investmentStorage.add(newInvestment);

            // 2. Add Expense Transaction
            // We call transactionStorage directly to avoid recursive loop with addTransaction
            const invTxn: Omit<Transaction, "id" | "createdAt"> = {
              type: "expense",
              amount: topRec.recommendedAmount,
              category: "other",
              accountId: fundingAccount.id,
              description: `Auto-Invest: ${INVESTMENT_CONFIG[topRec.type].label}`,
              notes: "Triggered by income deposit",
              date: new Date().toISOString(),
              isRecurring: false
            };

            await transactionStorage.add(invTxn);
            await accountStorage.updateBalance(fundingAccount.id, -topRec.recommendedAmount);

            console.log("Auto-invest executed successfully");
          }
        }
      }
    } catch (error) {
      console.error("Auto-invest check failed:", error);
    }
  };

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt">,
  ) => {
    const newTxn = await transactionStorage.add(transaction);
    setTransactions((prev) => [newTxn, ...prev]);
    const amount =
      transaction.type === "income" ? transaction.amount : -transaction.amount;
    await accountStorage.updateBalance(transaction.accountId, amount);
    if (transaction.type === "expense") {
      const month = transaction.date.substring(0, 7);
      await budgetStorage.updateSpent(
        transaction.category,
        month,
        transaction.amount,
      );
    }

    // Trigger Auto-Invest if Income
    if (transaction.type === "income") {
      // We await this to ensure data consistency, though it could be backgrounded
      await checkAutoInvest();
    }

    await refreshData();
    return newTxn;
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>,
  ) => {
    await transactionStorage.update(id, updates);
    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    const txn = transactions.find((t) => t.id === id);
    if (txn) {
      const amount = txn.type === "income" ? -txn.amount : txn.amount;
      await accountStorage.updateBalance(txn.accountId, amount);
    }
    await transactionStorage.delete(id);
    await refreshData();
  };

  const addAccount = async (account: Omit<Account, "id">) => {
    const newAccount = await accountStorage.add(account);
    setAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    await accountStorage.update(id, updates);
    await refreshData();
  };

  const deleteAccount = async (id: string) => {
    await accountStorage.delete(id);
    await refreshData();
  };

  const addBudget = async (budget: Omit<Budget, "id">) => {
    const newBudget = await budgetStorage.add(budget);
    setBudgets((prev) => [...prev, newBudget]);
    return newBudget;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    await budgetStorage.update(id, updates);
    await refreshData();
  };

  const deleteBudget = async (id: string) => {
    await budgetStorage.delete(id);
    await refreshData();
  };

  const addGoal = async (goal: Omit<Goal, "id" | "createdAt">) => {
    const newGoal = await goalStorage.add(goal);
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    await goalStorage.update(id, updates);
    await refreshData();
  };

  const deleteGoal = async (id: string) => {
    await goalStorage.delete(id);
    await refreshData();
  };

  const addGoalContribution = async (id: string, amount: number) => {
    // 1. Update Goal
    await goalStorage.addContribution(id, amount);

    // 2. Deduct from Account (Find highest balance)
    const currentAccounts = await accountStorage.getAll();
    const fundingAccount = currentAccounts.sort((a, b) => b.balance - a.balance)[0];

    if (fundingAccount && fundingAccount.balance >= amount) {
      const goal = goals.find(g => g.id === id);
      await addTransaction({
        type: "expense",
        amount: amount,
        category: "other", // Goals are savings
        accountId: fundingAccount.id,
        description: `Contribution to Goal: ${goal?.name || 'Unknown Goal'}`,
        notes: "Manual contribution",
        date: new Date().toISOString(),
        isRecurring: false
      });
    } else {
      console.warn("No sufficient funds to deduct for goal contribution");
      // Optionally notify user, but for now we just log it to avoid breaking UI flow if logic differs
    }

    await refreshData();
  };

  const addBill = async (bill: Omit<Bill, "id">) => {
    const newBill = await billStorage.add(bill);
    setBills((prev) => [...prev, newBill]);
    return newBill;
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    await billStorage.update(id, updates);
    await refreshData();
  };

  const deleteBill = async (id: string) => {
    await billStorage.delete(id);
    await refreshData();
  };

  const markBillPaid = async (id: string) => {
    await billStorage.markPaid(id);
    await refreshData();
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getMonthlyIncome = (month?: string) => {
    const targetMonth = month || getCurrentMonth();
    return transactions
      .filter((t) => t.type === "income" && t.date.startsWith(targetMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyExpense = (month?: string) => {
    const targetMonth = month || getCurrentMonth();
    return transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(targetMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCategorySpending = (category: CategoryType, month?: string) => {
    const targetMonth = month || getCurrentMonth();
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === category &&
          t.date.startsWith(targetMonth),
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        budgets,
        goals,
        bills,
        isLoading,
        refreshData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addGoalContribution,
        addBill,
        updateBill,
        deleteBill,
        markBillPaid,
        getTotalBalance,
        getMonthlyIncome,
        getMonthlyExpense,
        getCategorySpending,
        aiAnalysis,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
