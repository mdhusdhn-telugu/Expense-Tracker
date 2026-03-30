import React from 'react';
import { Settings2 } from 'lucide-react';
import { Category, CategoryBudget, CategoryDefinition, CURRENCIES } from '../types';

interface BudgetManagerProps {
  budgets: CategoryBudget;
  categories: CategoryDefinition[];
  onUpdateBudget: (category: Category, amount: number) => void;
  currency: string;
}

export default function BudgetManager({ budgets, categories, onUpdateBudget, currency }: BudgetManagerProps) {
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 size={18} className="text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800">Set Monthly Budgets</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currencySymbol}</span>
              <input
                type="number"
                min="0"
                value={budgets[category.name] || ''}
                onChange={(e) => onUpdateBudget(category.name, parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
