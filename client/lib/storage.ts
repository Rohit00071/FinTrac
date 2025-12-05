import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  Transaction,
  Account,
  Budget,
  Goal,
  Bill,
  AppSettings,
} from "@/types/finance";

const STORAGE_KEYS = {
  USER: "@fintrack_user",
  TRANSACTIONS: "@fintrack_transactions",
  ACCOUNTS: "@fintrack_accounts",
  BUDGETS: "@fintrack_budgets",
  GOALS: "@fintrack_goals",
  BILLS: "@fintrack_bills",
  SETTINGS: "@fintrack_settings",
  AUTH_TOKEN: "@fintrack_auth_token",
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

const setItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
};

export const userStorage = {
  get: () => getItem<User>(STORAGE_KEYS.USER),
  set: (user: User) => setItem(STORAGE_KEYS.USER, user),
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.USER),
  create: async (name: string, email: string): Promise<User> => {
    const user: User = {
      id: generateId(),
      name,
      email,
      avatar: "piggy-bank",
      currency: "USD",
      createdAt: new Date().toISOString(),
    };
    await setItem(STORAGE_KEYS.USER, user);
    return user;
  },
};

export const transactionStorage = {
  getAll: async (): Promise<Transaction[]> => {
    const data = await getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
    return data || [];
  },
  add: async (
    transaction: Omit<Transaction, "id" | "createdAt">
  ): Promise<Transaction> => {
    const transactions = await transactionStorage.getAll();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTransaction);
    await setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
    return newTransaction;
  },
  update: async (
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction | null> => {
    const transactions = await transactionStorage.getAll();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    transactions[index] = { ...transactions[index], ...updates };
    await setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
    return transactions[index];
  },
  delete: async (id: string): Promise<boolean> => {
    const transactions = await transactionStorage.getAll();
    const filtered = transactions.filter((t) => t.id !== id);
    await setItem(STORAGE_KEYS.TRANSACTIONS, filtered);
    return filtered.length < transactions.length;
  },
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS),
};

export const accountStorage = {
  getAll: async (): Promise<Account[]> => {
    const data = await getItem<Account[]>(STORAGE_KEYS.ACCOUNTS);
    if (!data || data.length === 0) {
      const defaultAccounts: Account[] = [
        {
          id: "default-cash",
          name: "Cash",
          type: "cash",
          balance: 0,
          color: "#4CAF50",
          icon: "dollar-sign",
        },
        {
          id: "default-bank",
          name: "Bank Account",
          type: "bank",
          balance: 0,
          color: "#2196F3",
          icon: "credit-card",
        },
      ];
      await setItem(STORAGE_KEYS.ACCOUNTS, defaultAccounts);
      return defaultAccounts;
    }
    return data;
  },
  add: async (account: Omit<Account, "id">): Promise<Account> => {
    const accounts = await accountStorage.getAll();
    const newAccount: Account = { ...account, id: generateId() };
    accounts.push(newAccount);
    await setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    return newAccount;
  },
  update: async (
    id: string,
    updates: Partial<Account>
  ): Promise<Account | null> => {
    const accounts = await accountStorage.getAll();
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) return null;
    accounts[index] = { ...accounts[index], ...updates };
    await setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    return accounts[index];
  },
  updateBalance: async (id: string, amount: number): Promise<void> => {
    const accounts = await accountStorage.getAll();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].balance += amount;
      await setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    }
  },
  delete: async (id: string): Promise<boolean> => {
    const accounts = await accountStorage.getAll();
    const filtered = accounts.filter((a) => a.id !== id);
    await setItem(STORAGE_KEYS.ACCOUNTS, filtered);
    return filtered.length < accounts.length;
  },
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.ACCOUNTS),
};

export const budgetStorage = {
  getAll: async (): Promise<Budget[]> => {
    const data = await getItem<Budget[]>(STORAGE_KEYS.BUDGETS);
    return data || [];
  },
  getByMonth: async (month: string): Promise<Budget[]> => {
    const budgets = await budgetStorage.getAll();
    return budgets.filter((b) => b.month === month);
  },
  add: async (budget: Omit<Budget, "id">): Promise<Budget> => {
    const budgets = await budgetStorage.getAll();
    const newBudget: Budget = { ...budget, id: generateId() };
    budgets.push(newBudget);
    await setItem(STORAGE_KEYS.BUDGETS, budgets);
    return newBudget;
  },
  update: async (
    id: string,
    updates: Partial<Budget>
  ): Promise<Budget | null> => {
    const budgets = await budgetStorage.getAll();
    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) return null;
    budgets[index] = { ...budgets[index], ...updates };
    await setItem(STORAGE_KEYS.BUDGETS, budgets);
    return budgets[index];
  },
  updateSpent: async (category: string, month: string, amount: number) => {
    const budgets = await budgetStorage.getAll();
    const index = budgets.findIndex(
      (b) => b.category === category && b.month === month
    );
    if (index !== -1) {
      budgets[index].spent += amount;
      await setItem(STORAGE_KEYS.BUDGETS, budgets);
    }
  },
  delete: async (id: string): Promise<boolean> => {
    const budgets = await budgetStorage.getAll();
    const filtered = budgets.filter((b) => b.id !== id);
    await setItem(STORAGE_KEYS.BUDGETS, filtered);
    return filtered.length < budgets.length;
  },
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.BUDGETS),
};

export const goalStorage = {
  getAll: async (): Promise<Goal[]> => {
    const data = await getItem<Goal[]>(STORAGE_KEYS.GOALS);
    return data || [];
  },
  add: async (goal: Omit<Goal, "id" | "createdAt">): Promise<Goal> => {
    const goals = await goalStorage.getAll();
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    await setItem(STORAGE_KEYS.GOALS, goals);
    return newGoal;
  },
  update: async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
    const goals = await goalStorage.getAll();
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    goals[index] = { ...goals[index], ...updates };
    await setItem(STORAGE_KEYS.GOALS, goals);
    return goals[index];
  },
  addContribution: async (id: string, amount: number): Promise<Goal | null> => {
    const goals = await goalStorage.getAll();
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    goals[index].currentAmount += amount;
    if (goals[index].currentAmount >= goals[index].targetAmount) {
      goals[index].isCompleted = true;
    }
    await setItem(STORAGE_KEYS.GOALS, goals);
    return goals[index];
  },
  delete: async (id: string): Promise<boolean> => {
    const goals = await goalStorage.getAll();
    const filtered = goals.filter((g) => g.id !== id);
    await setItem(STORAGE_KEYS.GOALS, filtered);
    return filtered.length < goals.length;
  },
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.GOALS),
};

export const billStorage = {
  getAll: async (): Promise<Bill[]> => {
    const data = await getItem<Bill[]>(STORAGE_KEYS.BILLS);
    return data || [];
  },
  add: async (bill: Omit<Bill, "id">): Promise<Bill> => {
    const bills = await billStorage.getAll();
    const newBill: Bill = { ...bill, id: generateId() };
    bills.push(newBill);
    await setItem(STORAGE_KEYS.BILLS, bills);
    return newBill;
  },
  update: async (id: string, updates: Partial<Bill>): Promise<Bill | null> => {
    const bills = await billStorage.getAll();
    const index = bills.findIndex((b) => b.id === id);
    if (index === -1) return null;
    bills[index] = { ...bills[index], ...updates };
    await setItem(STORAGE_KEYS.BILLS, bills);
    return bills[index];
  },
  markPaid: async (id: string): Promise<Bill | null> => {
    const bills = await billStorage.getAll();
    const index = bills.findIndex((b) => b.id === id);
    if (index === -1) return null;
    bills[index].isPaid = true;
    bills[index].lastPaidDate = new Date().toISOString();
    await setItem(STORAGE_KEYS.BILLS, bills);
    return bills[index];
  },
  delete: async (id: string): Promise<boolean> => {
    const bills = await billStorage.getAll();
    const filtered = bills.filter((b) => b.id !== id);
    await setItem(STORAGE_KEYS.BILLS, filtered);
    return filtered.length < bills.length;
  },
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.BILLS),
};

export const settingsStorage = {
  get: async (): Promise<AppSettings> => {
    const data = await getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
    return (
      data || {
        theme: "system",
        currency: "USD",
        notifications: true,
        biometricLock: false,
      }
    );
  },
  set: (settings: AppSettings) => setItem(STORAGE_KEYS.SETTINGS, settings),
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
};

export const clearAllData = async (): Promise<void> => {
  await Promise.all([
    userStorage.clear(),
    transactionStorage.clear(),
    accountStorage.clear(),
    budgetStorage.clear(),
    goalStorage.clear(),
    billStorage.clear(),
    settingsStorage.clear(),
  ]);
};
