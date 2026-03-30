export type Category = 'Food' | 'Rent' | 'Utilities' | 'Entertainment' | 'Transport' | 'Health' | 'Shopping' | 'Other';
export type IncomeCategory = 'Salary' | 'Freelance' | 'Investment' | 'Gift' | 'Other';

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

export type CategoryBudget = Record<Category, number>;

export const CATEGORIES: Category[] = [
  'Food',
  'Rent',
  'Utilities',
  'Entertainment',
  'Transport',
  'Health',
  'Shopping',
  'Other'
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f87171',
  Rent: '#60a5fa',
  Utilities: '#fbbf24',
  Entertainment: '#a78bfa',
  Transport: '#34d399',
  Health: '#f472b6',
  Shopping: '#fb923c',
  Other: '#94a3b8'
};

export const INCOME_CATEGORY_COLORS: Record<IncomeCategory, string> = {
  Salary: '#10b981',
  Freelance: '#3b82f6',
  Investment: '#8b5cf6',
  Gift: '#f59e0b',
  Other: '#6b7280'
};
