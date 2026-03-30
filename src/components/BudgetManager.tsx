import React from 'react';
import { Settings2 } from 'lucide-react';
import { CATEGORIES, Category, CategoryBudget, CATEGORY_COLORS } from '../types';

interface BudgetManagerProps {
  budgets: CategoryBudget;
  onUpdateBudget: (category: Category, amount: number) => void;
}

export default function BudgetManager({ budgets, onUpdateBudget }: BudgetManagerProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 size={18} className="text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800">Set Monthly Budgets</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((category) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
                {category}
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                value={budgets[category] || ''}
                onChange={(e) => onUpdateBudget(category, parseFloat(e.target.value) || 0)}
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
