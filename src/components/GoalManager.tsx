import React, { useState } from 'react';
import { Plus, Target, Trash2, Edit2, Check, X, Calendar, TrendingUp } from 'lucide-react';
import { FinancialGoal } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface GoalManagerProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  netBalance: number;
  currency: string;
}

const GOAL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

export default function GoalManager({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, onContribute, netBalance, currency }: GoalManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    color: GOAL_COLORS[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    const goalData = {
      name: formData.name,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount) || 0,
      deadline: formData.deadline || undefined,
      color: formData.color
    };

    if (editingId) {
      onUpdateGoal(editingId, goalData);
      setEditingId(null);
    } else {
      onAddGoal(goalData);
      setIsAdding(false);
    }

    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      color: GOAL_COLORS[0]
    });
  };

  const startEdit = (goal: FinancialGoal) => {
    setEditingId(goal.id);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline || '',
      color: goal.color
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Goals</h2>
          <p className="text-slate-500 text-sm">Track your savings and reach your milestones.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus size={18} />
          New Goal
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Target</p>
          <p className="text-xl font-bold text-slate-900">
            {formatCurrency(goals.reduce((sum, g) => sum + g.targetAmount, 0), currency)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Saved</p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(goals.reduce((sum, g) => sum + g.currentAmount, 0), currency)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available to Save</p>
          <p className={cn(
            "text-xl font-bold",
            netBalance > 0 ? "text-emerald-600" : "text-rose-600"
          )}>
            {formatCurrency(netBalance, currency)}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Goal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. New Car, Vacation"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Amount</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Amount</label>
                  <input
                    type="number"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Goal Color</label>
                <div className="flex flex-wrap gap-3">
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        formData.color === color ? "border-slate-900 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white py-2 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  {editingId ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <motion.div
              key={goal.id}
              layout
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: goal.color }}
                  >
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{goal.name}</h3>
                    {goal.deadline && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        Target: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => startEdit(goal)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Progress</span>
                  <span className="font-bold text-slate-800">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full shadow-inner"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>
                <div className="flex justify-between items-end pt-1">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Saved</p>
                    <p className="text-lg font-bold text-slate-800">{formatCurrency(goal.currentAmount, currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Target</p>
                    <p className="text-lg font-bold text-slate-800">{formatCurrency(goal.targetAmount, currency)}</p>
                  </div>
                </div>
              </div>

              {progress < 100 && netBalance > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => onContribute(goal.id, Math.min(netBalance, goal.targetAmount - goal.currentAmount))}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                  >
                    <TrendingUp size={14} />
                    Contribute Balance ({formatCurrency(Math.min(netBalance, goal.targetAmount - goal.currentAmount), currency)})
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}

        {goals.length === 0 && !isAdding && (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Target size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No goals set yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">
              Start by setting a financial goal to track your progress and stay motivated.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
