import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { CATEGORIES, Category } from '../types';

interface ExpenseFormProps {
  onAddExpense: (expense: { amount: number; category: Category; description: string; date: string }) => void;
}

export default function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    onAddExpense({
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
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Expense</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was it for?"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-2 bg-slate-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-[0.98]"
      >
        <PlusCircle size={18} />
        Add Expense
      </button>
    </form>
  );
}
