import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

// Storage keys
const STORAGE_KEYS = {
    USER: "@fintrack_user",
    TRANSACTIONS: "@fintrack_transactions",
    ACCOUNTS: "@fintrack_accounts",
    BUDGETS: "@fintrack_budgets",
    GOALS: "@fintrack_goals",
};

// Helper to generate ID
const generateId = () => uuidv4();

// Helper to get current month
const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// Helper to get date string
const getDateString = (daysAgo: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
};

export async function createTestData() {
    console.log("Creating test data...");

    const currentMonth = getCurrentMonth();

    // Create test accounts with Indian bank details
    const savingsAccount = {
        id: generateId(),
        name: "HDFC Savings Account",
        type: "bank" as const,
        balance: 1245000, // ₹12.45 Lakhs (was $15,000)
        color: "#4CAF50",
        icon: "trending-up",
        bankName: "HDFC Bank",
        accountNumber: "50100123456789",
        ifscCode: "HDFC0001234",
        branchName: "Mumbai Main Branch",
        upiId: "user@hdfcbank",
        isLinkedToUPI: true,
    };

    const checkingAccount = {
        id: generateId(),
        name: "ICICI Current Account",
        type: "bank" as const,
        balance: 290500, // ₹2.9 Lakhs (was $3,500)
        color: "#2196F3",
        icon: "credit-card",
        bankName: "ICICI Bank",
        accountNumber: "60200987654321",
        ifscCode: "ICIC0006789",
        branchName: "Delhi Connaught Place",
        upiId: "user@icici",
        isLinkedToUPI: true,
    };

    const accounts = [savingsAccount, checkingAccount];

    // Create test transactions
    const transactions = [
        // Income transactions
        {
            id: generateId(),
            type: "income" as const,
            amount: 415000, // ₹4.15 Lakhs (was $5,000)
            category: "other" as const,
            accountId: checkingAccount.id,
            description: "Monthly Salary",
            notes: "December salary",
            date: getDateString(5),
            createdAt: new Date().toISOString(),
            isRecurring: true,
        },
        {
            id: generateId(),
            type: "income" as const,
            amount: 41500, // ₹41,500 (was $500)
            category: "other" as const,
            accountId: checkingAccount.id,
            description: "Freelance Project",
            notes: "Side project payment",
            date: getDateString(10),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },

        // Expense transactions - Food
        {
            id: generateId(),
            type: "expense" as const,
            amount: 7100, // ₹7,100 (was $85.50)
            category: "food" as const,
            accountId: checkingAccount.id,
            description: "Grocery Shopping",
            notes: "Weekly groceries",
            date: getDateString(2),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },
        {
            id: generateId(),
            type: "expense" as const,
            amount: 3735, // ₹3,735 (was $45)
            category: "food" as const,
            accountId: checkingAccount.id,
            description: "Restaurant Dinner",
            notes: "Dinner with friends",
            date: getDateString(3),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },
        {
            id: generateId(),
            type: "expense" as const,
            amount: 1040, // ₹1,040 (was $12.50)
            category: "food" as const,
            accountId: checkingAccount.id,
            description: "Coffee Shop",
            notes: "Morning coffee",
            date: getDateString(1),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },

        // Expense transactions - Transport
        {
            id: generateId(),
            type: "expense" as const,
            amount: 4980, // ₹4,980 (was $60)
            category: "transport" as const,
            accountId: checkingAccount.id,
            description: "Gas Station",
            notes: "Fuel for car",
            date: getDateString(4),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },
        {
            id: generateId(),
            type: "expense" as const,
            amount: 2075, // ₹2,075 (was $25)
            category: "transport" as const,
            accountId: checkingAccount.id,
            description: "Uber Ride",
            notes: "Ride to airport",
            date: getDateString(6),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },

        // Expense transactions - Shopping
        {
            id: generateId(),
            type: "expense" as const,
            amount: 12450, // ₹12,450 (was $150)
            category: "shopping" as const,
            accountId: checkingAccount.id,
            description: "Clothing Store",
            notes: "New winter jacket",
            date: getDateString(7),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },
        {
            id: generateId(),
            type: "expense" as const,
            amount: 6225, // ₹6,225 (was $75)
            category: "shopping" as const,
            accountId: checkingAccount.id,
            description: "Electronics Store",
            notes: "Phone accessories",
            date: getDateString(8),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },

        // Expense transactions - Bills
        {
            id: generateId(),
            type: "expense" as const,
            amount: 9960, // ₹9,960 (was $120)
            category: "bills" as const,
            accountId: checkingAccount.id,
            description: "Electric Bill",
            notes: "Monthly electricity",
            date: getDateString(15),
            createdAt: new Date().toISOString(),
            isRecurring: true,
        },
        {
            id: generateId(),
            type: "expense" as const,
            amount: 6640, // ₹6,640 (was $80)
            category: "bills" as const,
            accountId: checkingAccount.id,
            description: "Internet Bill",
            notes: "Monthly internet",
            date: getDateString(15),
            createdAt: new Date().toISOString(),
            isRecurring: true,
        },
        {
            id: generateId(),
            type: "expense" as const,
            amount: 4150, // ₹4,150 (was $50)
            category: "bills" as const,
            accountId: checkingAccount.id,
            description: "Phone Bill",
            notes: "Monthly mobile plan",
            date: getDateString(15),
            createdAt: new Date().toISOString(),
            isRecurring: true,
        },

        // Expense transactions - Entertainment
        {
            id: generateId(),
            type: "expense" as const,
            amount: 2905, // ₹2,905 (was $35)
            category: "entertainment" as const,
            accountId: checkingAccount.id,
            description: "Movie Tickets",
            notes: "Weekend movie",
            date: getDateString(5),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },
        {
            id: generateId(),
            type: "expense" as const,
            amount: 1245, // ₹1,245 (was $15)
            category: "entertainment" as const,
            accountId: checkingAccount.id,
            description: "Streaming Service",
            notes: "Netflix subscription",
            date: getDateString(1),
            createdAt: new Date().toISOString(),
            isRecurring: true,
        },

        // Expense transactions - Healthcare
        {
            id: generateId(),
            type: "expense" as const,
            amount: 3320, // ₹3,320 (was $40)
            category: "healthcare" as const,
            accountId: checkingAccount.id,
            description: "Pharmacy",
            notes: "Prescription medication",
            date: getDateString(9),
            createdAt: new Date().toISOString(),
            isRecurring: false,
        },
    ];

    // Create test budgets
    const budgets = [
        {
            id: generateId(),
            category: "food" as const,
            limit: 41500, // ₹41,500
            spent: 11875, // Sum of food expenses in INR
            month: currentMonth,
        },
        {
            id: generateId(),
            category: "transport" as const,
            limit: 16600, // ₹16,600
            spent: 7055, // Sum of transport expenses in INR
            month: currentMonth,
        },
        {
            id: generateId(),
            category: "shopping" as const,
            limit: 24900, // ₹24,900
            spent: 18675, // Sum of shopping expenses in INR
            month: currentMonth,
        },
        {
            id: generateId(),
            category: "bills" as const,
            limit: 33200, // ₹33,200
            spent: 20750, // Sum of bills expenses in INR
            month: currentMonth,
        },
        {
            id: generateId(),
            category: "entertainment" as const,
            limit: 12450, // ₹12,450
            spent: 4150, // Sum of entertainment expenses in INR
            month: currentMonth,
        },
        {
            id: generateId(),
            category: "healthcare" as const,
            limit: 16600, // ₹16,600
            spent: 3320, // Sum of healthcare expenses in INR
            month: currentMonth,
        },
    ];

    // Create test goals
    const goals = [
        {
            id: generateId(),
            name: "Emergency Fund",
            targetAmount: 830000, // ₹8.3 Lakhs (was $10,000)
            currentAmount: 415000, // ₹4.15 Lakhs (was $5,000)
            deadline: "2025-06-30",
            category: "other" as const,
            isCompleted: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: generateId(),
            name: "Vacation Fund",
            targetAmount: 249000, // ₹2.49 Lakhs (was $3,000)
            currentAmount: 99600, // ₹99,600 (was $1,200)
            deadline: "2025-07-01",
            category: "entertainment" as const,
            isCompleted: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: generateId(),
            name: "New Laptop",
            targetAmount: 166000, // ₹1.66 Lakhs (was $2,000)
            currentAmount: 66400, // ₹66,400 (was $800)
            deadline: "2025-03-31",
            category: "shopping" as const,
            isCompleted: false,
            createdAt: new Date().toISOString(),
        },
    ];

    // Create a test user if not exists
    const user = {
        id: "test-user-rohit",
        name: "Rohit",
        email: "rohit@test.com",
        avatar: "piggy-bank",
        currency: "INR",
        createdAt: new Date().toISOString(),
    };

    // Save all test data
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

    console.log("Test data created successfully!");
    console.log(`- ${accounts.length} accounts`);
    console.log(`- ${transactions.length} transactions`);
    console.log(`- ${budgets.length} budgets`);
    console.log(`- ${goals.length} goals`);
    console.log(`Total balance: ₹${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-IN')}`);
    console.log(`Monthly income: ₹4,56,500`);
    console.log(`Monthly expenses: ₹65,825`);

    return {
        accounts,
        transactions,
        budgets,
        goals,
    };
}

export async function clearAllData() {
    console.log("Clearing all data...");
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.TRANSACTIONS,
        STORAGE_KEYS.ACCOUNTS,
        STORAGE_KEYS.BUDGETS,
        STORAGE_KEYS.GOALS,
    ]);
    console.log("All data cleared!");
}
