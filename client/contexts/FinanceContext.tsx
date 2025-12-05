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
} from "@/types/finance";
import {
  transactionStorage,
  accountStorage,
  budgetStorage,
  goalStorage,
  billStorage,
} from "@/lib/storage";
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
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>
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
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
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

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => {
    const newTxn = await transactionStorage.add(transaction);
    setTransactions((prev) => [newTxn, ...prev]);
    const amount =
      transaction.type === "income"
        ? transaction.amount
        : -transaction.amount;
    await accountStorage.updateBalance(transaction.accountId, amount);
    if (transaction.type === "expense") {
      const month = transaction.date.substring(0, 7);
      await budgetStorage.updateSpent(
        transaction.category,
        month,
        transaction.amount
      );
    }
    await refreshData();
    return newTxn;
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>
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
    await goalStorage.addContribution(id, amount);
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
          t.date.startsWith(targetMonth)
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
