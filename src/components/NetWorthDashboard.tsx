import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Landmark, CreditCard, Plus, Trash2, PieChart, ArrowUpRight, ArrowDownRight, Edit2, X } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, eachMonthOfInterval } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Expense, Income, FinancialGoal, Investment, Liability } from '../types';
import { formatCurrency } from '../lib/utils';

interface NetWorthDashboardProps {
  expenses: Expense[];
  incomes: Income[];
  goals: FinancialGoal[];
  investments: Investment[];
  liabilities: Liability[];
  onAddInvestment: (inv: Omit<Investment, 'id'>) => void;
  onUpdateInvestment: (id: string, updates: Partial<Investment>) => void;
  onDeleteInvestment: (id: string) => void;
  onAddLiability: (liab: Omit<Liability, 'id'>) => void;
  onDeleteLiability: (id: string) => void;
  currency: string;
}

export default function NetWorthDashboard({
  expenses,
  incomes,
  goals,
  investments,
  liabilities,
  onAddInvestment,
  onUpdateInvestment,
  onDeleteInvestment,
  onAddLiability,
  onDeleteLiability,
  currency
}: NetWorthDashboardProps) {
  const [showAddInv, setShowAddInv] = useState(false);
  const [showAddLiab, setShowAddLiab] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [newInv, setNewInv] = useState<Omit<Investment, 'id'>>({
    name: '',
    amount: 0,
    costBasis: 0,
    type: 'Stocks',
    date: new Date().toISOString().split('T')[0]
  });
  const [newLiab, setNewLiab] = useState<Omit<Liability, 'id'>>({
    name: '',
    amount: 0,
    type: 'Loan',
    date: new Date().toISOString().split('T')[0]
  });

  const totalCash = useMemo(() => {
    const totalInc = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExp = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return totalInc - totalExp;
  }, [incomes, expenses]);

  const totalGoals = useMemo(() => goals.reduce((sum, goal) => sum + goal.currentAmount, 0), [goals]);
  const totalInvestments = useMemo(() => investments.reduce((sum, inv) => sum + inv.amount, 0), [investments]);
  const totalAssets = totalCash + totalGoals + totalInvestments;

  const totalLiabilities = useMemo(() => liabilities.reduce((sum, liab) => sum + liab.amount, 0), [liabilities]);
  
  const netWorth = totalAssets - totalLiabilities;

  const chartData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return months.map(month => {
      const monthEnd = endOfMonth(month);
      
      const monthIncomes = incomes.filter(inc => parseISO(inc.date) <= monthEnd)
        .reduce((sum, inc) => sum + inc.amount, 0);
      const monthExpenses = expenses.filter(exp => parseISO(exp.date) <= monthEnd)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const monthCash = monthIncomes - monthExpenses;
      
      // For goals, investments, and liabilities, we'll assume they apply to the current state
      // or we could filter by date if we had that data for goals.
      // For simplicity, we'll use current goals but filter investments/liabilities by date.
      const monthInvestments = investments.filter(inv => parseISO(inv.date) <= monthEnd)
        .reduce((sum, inv) => sum + inv.amount, 0);
      const monthLiabilities = liabilities.filter(liab => parseISO(liab.date) <= monthEnd)
        .reduce((sum, liab) => sum + liab.amount, 0);
      
      const monthAssets = monthCash + totalGoals + monthInvestments;
      const monthNetWorth = monthAssets - monthLiabilities;

      return {
        month: format(month, 'MMM yy'),
        assets: monthAssets,
        liabilities: monthLiabilities,
        netWorth: monthNetWorth
      };
    });
  }, [incomes, expenses, investments, liabilities, totalGoals]);

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInvestment(newInv);
    setNewInv({ name: '', amount: 0, costBasis: 0, type: 'Stocks', date: new Date().toISOString().split('T')[0] });
    setShowAddInv(false);
  };

  const handleUpdateInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInv) return;
    const { id, ...updates } = editingInv;
    onUpdateInvestment(id, updates);
    setEditingInv(null);
  };

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLiability(newLiab);
    setNewLiab({ name: '', amount: 0, type: 'Loan', date: new Date().toISOString().split('T')[0] });
    setShowAddLiab(false);
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Landmark size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assets</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{formatCurrency(totalAssets, currency)}</h3>
          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <ArrowUpRight size={14} />
            <span>Cash + Goals + Investments</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <CreditCard size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Liabilities</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{formatCurrency(totalLiabilities, currency)}</h3>
          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-rose-600">
            <ArrowDownRight size={14} />
            <span>Loans + Outstanding Bills</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10 text-white rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Worth</span>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(netWorth, currency)}</h3>
          <p className="mt-2 text-xs text-slate-400 font-medium">Your total financial value</p>
        </motion.div>
      </div>

      {/* Net Worth Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PieChart size={20} className="text-blue-500" />
          Net Worth Over Time
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                tickFormatter={(value) => formatCurrency(value, currency, { notation: 'compact' })}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                formatter={(value: number) => [formatCurrency(value, currency), '']}
              />
              <Area 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#0f172a" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorNetWorth)" 
                name="Net Worth"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Investments Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Investments</h3>
            <button 
              onClick={() => setShowAddInv(!showAddInv)}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {showAddInv && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleAddInvestment}
              className="mb-6 p-4 bg-slate-50 rounded-xl space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                  <input 
                    type="text" 
                    required
                    value={newInv.name}
                    onChange={e => setNewInv({...newInv, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. S&P 500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                  <input 
                    type="number" 
                    required
                    value={newInv.amount || ''}
                    onChange={e => setNewInv({...newInv, amount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cost Basis</label>
                  <input 
                    type="number" 
                    required
                    value={newInv.costBasis || ''}
                    onChange={e => setNewInv({...newInv, costBasis: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select 
                    value={newInv.type}
                    onChange={e => setNewInv({...newInv, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Stocks">Stocks</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newInv.date}
                    onChange={e => setNewInv({...newInv, date: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
              >
                Add Investment
              </button>
            </motion.form>
          )}

          <div className="space-y-3">
            {investments.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm font-medium italic">No investments added yet.</p>
            ) : (
              investments.map(inv => {
                const profit = inv.amount - inv.costBasis;
                const profitPercent = inv.costBasis > 0 ? (profit / inv.costBasis) * 100 : 0;
                
                return (
                  <div key={inv.id} className="p-4 bg-slate-50 rounded-xl group relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm">
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{inv.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{inv.type} • Acquired {format(parseISO(inv.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingInv(inv)}
                          className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => onDeleteInvestment(inv.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Value</p>
                        <p className="text-sm font-black text-slate-900">{formatCurrency(inv.amount, currency)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cost Basis</p>
                        <p className="text-sm font-bold text-slate-600">{formatCurrency(inv.costBasis, currency)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Profit/Loss</p>
                        <p className={`text-sm font-black ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {profit >= 0 ? '+' : ''}{formatCurrency(profit, currency)}
                          <span className="text-[10px] ml-1">({profitPercent.toFixed(1)}%)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Edit Investment Modal */}
        {editingInv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Edit Investment</h3>
                <button onClick={() => setEditingInv(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateInvestment} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingInv.name}
                    onChange={e => setEditingInv({...editingInv, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Current Value</label>
                    <input 
                      type="number" 
                      required
                      value={editingInv.amount}
                      onChange={e => setEditingInv({...editingInv, amount: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Cost Basis</label>
                    <input 
                      type="number" 
                      required
                      value={editingInv.costBasis}
                      onChange={e => setEditingInv({...editingInv, costBasis: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select 
                      value={editingInv.type}
                      onChange={e => setEditingInv({...editingInv, type: e.target.value as any})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Stocks">Stocks</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Bonds">Bonds</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Date Acquired</label>
                    <input 
                      type="date" 
                      required
                      value={editingInv.date}
                      onChange={e => setEditingInv({...editingInv, date: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 mt-2"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Liabilities Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Liabilities</h3>
            <button 
              onClick={() => setShowAddLiab(!showAddLiab)}
              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {showAddLiab && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleAddLiability}
              className="mb-6 p-4 bg-slate-50 rounded-xl space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                  <input 
                    type="text" 
                    required
                    value={newLiab.name}
                    onChange={e => setNewLiab({...newLiab, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="e.g. Student Loan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                  <input 
                    type="number" 
                    required
                    value={newLiab.amount || ''}
                    onChange={e => setNewLiab({...newLiab, amount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select 
                    value={newLiab.type}
                    onChange={e => setNewLiab({...newLiab, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    <option value="Loan">Loan</option>
                    <option value="Mortgage">Mortgage</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newLiab.date}
                    onChange={e => setNewLiab({...newLiab, date: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100"
              >
                Add Liability
              </button>
            </motion.form>
          )}

          <div className="space-y-3">
            {liabilities.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm font-medium italic">No liabilities added yet.</p>
            ) : (
              liabilities.map(liab => (
                <div key={liab.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white text-rose-600 rounded-lg shadow-sm">
                      <TrendingDown size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{liab.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{liab.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900">{formatCurrency(liab.amount, currency)}</span>
                    <button 
                      onClick={() => onDeleteLiability(liab.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
