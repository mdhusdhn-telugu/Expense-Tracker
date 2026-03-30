import { Trash2, Calendar, Tag } from 'lucide-react';
import { Income, INCOME_CATEGORY_COLORS } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface IncomeListProps {
  incomes: Income[];
  onDeleteIncome: (id: string) => void;
}

export default function IncomeList({ incomes, onDeleteIncome }: IncomeListProps) {
  if (incomes.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
        <p className="text-slate-400 font-medium">No income recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {incomes.map((income) => (
          <motion.div
            key={income.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-emerald-100 transition-all"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: INCOME_CATEGORY_COLORS[income.category] }}
              >
                {income.category[0]}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{income.description}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {format(new Date(income.date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {income.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-bold text-emerald-600">
                +${income.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => onDeleteIncome(income.id)}
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
