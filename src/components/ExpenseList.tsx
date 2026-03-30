import { Trash2, Calendar, Tag } from 'lucide-react';
import { Expense, CATEGORY_COLORS } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

export default function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
        <p className="text-slate-400 font-medium">No expenses recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {expenses.map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
              >
                {expense.category[0]}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{expense.description}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {format(new Date(expense.date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {expense.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900">
                ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
