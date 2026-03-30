import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CURRENCIES } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string = 'USD', options: Intl.NumberFormatOptions = {}) {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    ...options
  }).format(amount);
}
