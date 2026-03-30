import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { IncomeCategory, CategoryDefinition, CURRENCIES } from '../types';

interface IncomeFormProps {
  categories: CategoryDefinition[];
  onAddIncome: (income: { amount: number; category: IncomeCategory; description: string; date: string }) => void;
  currency: string;
}

export default function IncomeForm({ categories, onAddIncome, currency }: IncomeFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date || !category) return;

    onAddIncome({
      amount: parseFloat(amount),
      category,
      description,
      date,
    });

    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Income</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currencySymbol}</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as IncomeCategory)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Where did it come from?"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-2 bg-emerald-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors active:scale-[0.98]"
      >
        <PlusCircle size={18} />
        Add Income
      </button>
    </form>
  );
}
