export function formatCurrency(amount: number): string {
  // Indian numbering system with Rupees
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  // Indian numbering: Crores and Lakhs
  if (amount >= 10000000) { // 1 Crore = 1,00,00,000
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) { // 1 Lakh = 1,00,000
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatMonth(monthString: string): string {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getToday(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getPercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

export function groupTransactionsByDate(
  transactions: {
    id: string;
    date: string;
    [key: string]: any;
  }[],
): { title: string; data: any[] }[] {
  const groups: { [key: string]: any[] } = {};

  transactions.forEach((txn) => {
    const dateKey = txn.date.split("T")[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(txn);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({
      title: formatDate(date),
      data,
    }));
}
