import { motion } from 'motion/react';
import { Expense, Category, CategoryBudget, CategoryDefinition } from '../types';
import { cn, formatCurrency } from '../lib/utils';

interface BudgetProgressProps {
  expenses: Expense[];
  budgets: CategoryBudget;
  categories: CategoryDefinition[];
  timeRange: number;
  currency: string;
}

export default function BudgetProgress({ expenses, budgets, categories, timeRange, currency }: BudgetProgressProps) {
  const getCategoryColor = (categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.color || '#94a3b8';
  };

  const categorySpending = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<Category, number>);

  const activeBudgets = Object.entries(budgets).filter(([_, amount]) => amount > 0) as [Category, number][];

  if (activeBudgets.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <p className="text-slate-400 text-sm">Set category budgets to track your progress here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <h2 className="text-lg font-bold text-slate-800">Budget Progress</h2>
      
      <div className="space-y-5">
        {activeBudgets.map(([category, monthlyLimit]) => {
          const limit = monthlyLimit * timeRange;
          const spent = categorySpending[category] || 0;
          const percentage = Math.min((spent / limit) * 100, 100);
          const isOver = spent > limit;

          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-sm font-bold text-slate-700">{category}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {formatCurrency(spent, currency)} of {formatCurrency(limit, currency)}
                  </p>
                </div>
                <span className={cn(
                  "text-xs font-bold",
                  isOver ? "text-red-500" : "text-slate-600"
                )}>
                  {Math.round((spent / limit) * 100)}%
                </span>
              </div>
              
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    isOver ? "bg-red-500" : ""
                  )}
                  style={{ 
                    backgroundColor: isOver ? undefined : getCategoryColor(category) 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
