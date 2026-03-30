import { useState, useEffect, useMemo } from 'react';
import { Wallet, TrendingUp, Calendar, ChevronLeft, ChevronRight, PieChart as ChartIcon, List as ListIcon, Target, Download, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { Expense, Category, CategoryBudget, Income } from './types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseCharts from './components/ExpenseCharts';
import BudgetManager from './components/BudgetManager';
import BudgetProgress from './components/BudgetProgress';
import ExpenseFilters, { FilterCriteria } from './components/ExpenseFilters';
import IncomeForm from './components/IncomeForm';
import IncomeList from './components/IncomeList';
import MonthlyReportModal from './components/MonthlyReportModal';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('incomes');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<CategoryBudget>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : {} as CategoryBudget;
  });
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'expenses' | 'income' | 'budget'>('expenses');
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterCriteria>({
    search: '',
    category: 'All',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const filteredExpenses = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      
      // Basic monthly filter
      const isInMonth = isWithinInterval(expDate, { start, end });
      if (!isInMonth) return false;

      // Search filter
      if (filters.search && !exp.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category !== 'All' && exp.category !== filters.category) {
        return false;
      }

      // Amount filters
      if (filters.minAmount && exp.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && exp.amount > parseFloat(filters.maxAmount)) {
        return false;
      }

      // Date range filters (within the month)
      if (filters.startDate && expDate < parseISO(filters.startDate)) {
        return false;
      }
      if (filters.endDate && expDate > parseISO(filters.endDate)) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, currentMonth, filters]);

  const filteredIncomes = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return incomes.filter(inc => {
      const incDate = parseISO(inc.date);
      
      // Basic monthly filter
      const isInMonth = isWithinInterval(incDate, { start, end });
      if (!isInMonth) return false;

      // Search filter
      if (filters.search && !inc.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Amount filters
      if (filters.minAmount && inc.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && inc.amount > parseFloat(filters.maxAmount)) {
        return false;
      }

      // Date range filters (within the month)
      if (filters.startDate && incDate < parseISO(filters.startDate)) {
        return false;
      }
      if (filters.endDate && incDate > parseISO(filters.endDate)) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, currentMonth, filters]);

  const totalMonthly = useMemo(() => 
    filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
  [filteredExpenses]);

  const totalIncome = useMemo(() => 
    filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0),
  [filteredIncomes]);

  const netBalance = useMemo(() => totalIncome - totalMonthly, [totalIncome, totalMonthly]);

  const totalBudget = useMemo(() => 
    Object.values(budgets).reduce((sum: number, b) => sum + (Number(b) || 0), 0),
  [budgets]);

  const addExpense = (newExp: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExp,
      id: crypto.randomUUID(),
    };
    setExpenses(prev => [...prev, expense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const addIncome = (newInc: Omit<Income, 'id'>) => {
    const income: Income = {
      ...newInc,
      id: crypto.randomUUID(),
    };
    setIncomes(prev => [...prev, income]);
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
  };

  const updateBudget = (category: Category, amount: number) => {
    setBudgets(prev => ({ ...prev, [category]: amount }));
  };

  const exportToCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = filteredExpenses.map(exp => [
      format(new Date(exp.date), 'yyyy-MM-dd'),
      `"${exp.description.replace(/"/g, '""')}"`,
      exp.category,
      exp.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${format(currentMonth, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Wallet size={24} />
              <span className="font-bold tracking-tight text-xl">SpendWise</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Monthly Expenses</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <FileText size={16} />
              Generate Report
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredExpenses.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Download size={16} />
              Export CSV
            </button>

            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button 
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'expenses' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <ListIcon size={16} />
                Expenses
              </button>
              <button 
                onClick={() => setActiveTab('income')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'income' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <TrendingUp size={16} />
                Income
              </button>
              <button 
                onClick={() => setActiveTab('budget')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'budget' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Target size={16} />
                Budget
              </button>
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="px-4 flex items-center gap-2 font-bold text-slate-700 min-w-[140px] justify-center">
                <Calendar size={16} className="text-blue-500" />
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-100 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Total Income</p>
              <h2 className="text-3xl font-black">
                ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-rose-600 text-white p-6 rounded-2xl shadow-xl shadow-rose-100 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</p>
              <h2 className="text-3xl font-black">
                ${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <ChevronRight className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Net Balance</p>
              <h2 className="text-3xl font-black">
                ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <Wallet className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Budget Used</p>
            <h2 className="text-3xl font-black text-slate-800">
              {totalBudget > 0 ? Math.round((totalMonthly / totalBudget) * 100) : 0}%
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              ${totalMonthly.toLocaleString()} of ${totalBudget.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {(activeTab === 'expenses' || activeTab === 'income') && (
            <ExpenseFilters filters={filters} onFilterChange={setFilters} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {activeTab === 'expenses' ? (
                <>
                  <ExpenseForm onAddExpense={addExpense} />
                  <ExpenseCharts expenses={filteredExpenses} />
                </>
              ) : activeTab === 'income' ? (
                <IncomeForm onAddIncome={addIncome} />
              ) : (
                <BudgetManager budgets={budgets} onUpdateBudget={updateBudget} />
              )}
            </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Budget Progress</h2>
              </div>
              <BudgetProgress expenses={filteredExpenses} budgets={budgets} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  {activeTab === 'income' ? 'Income History' : 'Recent Activity'}
                </h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {activeTab === 'income' ? filteredIncomes.length : filteredExpenses.length} Items
                </span>
              </div>
              {activeTab === 'income' ? (
                <IncomeList incomes={filteredIncomes} onDeleteIncome={deleteIncome} />
              ) : (
                <ExpenseList expenses={filteredExpenses} onDeleteExpense={deleteExpense} />
              )}
            </div>
          </div>

        </div>
      </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
          <p>&copy; 2026 SpendWise Tracker. Built with precision.</p>
        </footer>
      </div>

      <MonthlyReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        expenses={filteredExpenses}
        incomes={filteredIncomes}
        budgets={budgets}
        currentMonth={currentMonth}
      />
    </div>
  );
}
