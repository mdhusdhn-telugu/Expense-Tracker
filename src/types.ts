export type Category = string;
export type IncomeCategory = string;

export interface CategoryDefinition {
  id: string;
  name: string;
  color: string;
  type: 'expense' | 'income';
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO string
}

export interface Income {
  id: string;
  amount: number;
  category: IncomeCategory;
  description: string;
  date: string; // ISO string
}

export interface RecurringBill {
  id: string;
  amount: number;
  category: Category;
  description: string;
  dueDate: number; // Day of the month (1-31)
  reminderDaysBefore: number;
  lastNotifiedMonth?: string; // YYYY-MM
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  type: 'Stocks' | 'Crypto' | 'Real Estate' | 'Bonds' | 'Other';
  date: string;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  type: 'Loan' | 'Mortgage' | 'Credit Card' | 'Other';
  date: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];

export interface NotificationSettings {
  enableToasts: boolean;
  defaultReminderDays: number;
  currency: string; // code
}

export type CategoryBudget = Record<string, number>;

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: '1', name: 'Food', color: '#f87171', type: 'expense' },
  { id: '2', name: 'Rent', color: '#60a5fa', type: 'expense' },
  { id: '3', name: 'Utilities', color: '#fbbf24', type: 'expense' },
  { id: '4', name: 'Entertainment', color: '#a78bfa', type: 'expense' },
  { id: '5', name: 'Transport', color: '#34d399', type: 'expense' },
  { id: '6', name: 'Health', color: '#f472b6', type: 'expense' },
  { id: '7', name: 'Shopping', color: '#fb923c', type: 'expense' },
  { id: '8', name: 'Savings', color: '#10b981', type: 'expense' },
  { id: '9', name: 'Other', color: '#94a3b8', type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryDefinition[] = [
  { id: 'i1', name: 'Salary', color: '#10b981', type: 'income' },
  { id: 'i2', name: 'Freelance', color: '#3b82f6', type: 'income' },
  { id: 'i3', name: 'Investment', color: '#8b5cf6', type: 'income' },
  { id: 'i4', name: 'Gift', color: '#f59e0b', type: 'income' },
  { id: 'i5', name: 'Other', color: '#6b7280', type: 'income' },
];
