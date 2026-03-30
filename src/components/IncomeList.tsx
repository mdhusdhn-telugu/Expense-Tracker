import { useState } from 'react';
import { Trash2, Calendar, Tag, CheckSquare, Square, Trash } from 'lucide-react';
import { Income, CategoryDefinition } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';

interface IncomeListProps {
  incomes: Income[];
  categories: CategoryDefinition[];
  onDeleteIncome: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  currency: string;
}

export default function IncomeList({ incomes, categories, onDeleteIncome, onBulkDelete, currency }: IncomeListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getCategoryColor = (categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.color || '#10b981';
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === incomes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(incomes.map(i => i.id));
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.length > 0) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  if (incomes.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
        <p className="text-slate-400 font-medium">No income recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSelectAll}
            className="text-slate-400 hover:text-blue-600 transition-colors"
          >
            {selectedIds.length === incomes.length ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {selectedIds.length} Selected
          </span>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
          >
            <Trash size={14} />
            Delete Selected
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {incomes.map((income) => (
            <motion.div
              key={income.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "group bg-white p-4 rounded-xl shadow-sm border transition-all flex items-center justify-between",
                selectedIds.includes(income.id) ? "border-blue-200 bg-blue-50/30" : "border-slate-100 hover:border-emerald-100"
              )}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleSelection(income.id)}
                  className={cn(
                    "transition-colors",
                    selectedIds.includes(income.id) ? "text-blue-600" : "text-slate-300 group-hover:text-slate-400"
                  )}
                >
                  {selectedIds.includes(income.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: getCategoryColor(income.category) }}
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
                  +{formatCurrency(income.amount, currency)}
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
    </div>
  );
}
