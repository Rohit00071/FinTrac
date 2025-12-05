export type TransactionType = "income" | "expense";

export type CategoryType =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "healthcare"
  | "education"
  | "other";

export type AccountType = "cash" | "bank" | "credit" | "wallet";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryType;
  accountId: string;
  description: string;
  notes: string;
  date: string;
  createdAt: string;
  isRecurring: boolean;
  receiptUri?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  category: CategoryType;
  limit: number;
  spent: number;
  month: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  createdAt: string;
  isCompleted: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: CategoryType;
  isRecurring: boolean;
  frequency: "weekly" | "monthly" | "yearly";
  isPaid: boolean;
  lastPaidDate?: string;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  currency: string;
  notifications: boolean;
  biometricLock: boolean;
}

export const CATEGORY_CONFIG: Record<
  CategoryType,
  { label: string; icon: string; color: string }
> = {
  food: { label: "Food & Dining", icon: "coffee", color: "#FF9800" },
  transport: { label: "Transportation", icon: "truck", color: "#2196F3" },
  shopping: { label: "Shopping", icon: "shopping-bag", color: "#E91E63" },
  bills: { label: "Bills & Utilities", icon: "file-text", color: "#9C27B0" },
  entertainment: { label: "Entertainment", icon: "film", color: "#00BCD4" },
  healthcare: { label: "Healthcare", icon: "heart", color: "#F44336" },
  education: { label: "Education", icon: "book", color: "#3F51B5" },
  other: { label: "Other", icon: "more-horizontal", color: "#607D8B" },
};

export const ACCOUNT_CONFIG: Record<
  AccountType,
  { label: string; icon: string; defaultColor: string }
> = {
  cash: { label: "Cash", icon: "dollar-sign", defaultColor: "#4CAF50" },
  bank: { label: "Bank Account", icon: "credit-card", defaultColor: "#2196F3" },
  credit: { label: "Credit Card", icon: "credit-card", defaultColor: "#9C27B0" },
  wallet: { label: "Digital Wallet", icon: "smartphone", defaultColor: "#FF9800" },
};

export const AVATAR_OPTIONS = [
  "piggy-bank",
  "dollar-sign",
  "credit-card",
  "trending-up",
  "shield",
  "target",
  "bar-chart-2",
  "pie-chart",
];
