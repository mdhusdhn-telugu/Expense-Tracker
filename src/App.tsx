import { useState, useEffect, useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, Landmark, Calendar, ChevronLeft, ChevronRight, PieChart as ChartIcon, List as ListIcon, Target, Download, FileText, Bell, Settings, BarChart as BarChartIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { formatCurrency } from './lib/utils';
import { Expense, Category, CategoryBudget, Income, RecurringBill, NotificationSettings, CategoryDefinition, DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES, FinancialGoal, Investment, Liability } from './types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseCharts from './components/ExpenseCharts';
import BudgetManager from './components/BudgetManager';
import BudgetProgress from './components/BudgetProgress';
import ExpenseFilters, { FilterCriteria } from './components/ExpenseFilters';
import IncomeForm from './components/IncomeForm';
import IncomeList from './components/IncomeList';
import MonthlyReportModal from './components/MonthlyReportModal';
import BillManager from './components/BillManager';
import CategoryManager from './components/CategoryManager';
import GoalManager from './components/GoalManager';
import HistoricalBudget from './components/HistoricalBudget';
import NetWorthDashboard from './components/NetWorthDashboard';
import { Toaster, toast } from 'sonner';
import { differenceInDays, getDate, getMonth, getYear, setDate } from 'date-fns';

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

  const [bills, setBills] = useState<RecurringBill[]>(() => {
    const saved = localStorage.getItem('bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { enableToasts: true, defaultReminderDays: 3, currency: 'USD' };
  });

  const [expenseCategories, setExpenseCategories] = useState<CategoryDefinition[]>(() => {
    const saved = localStorage.getItem('expenseCategories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [incomeCategories, setIncomeCategories] = useState<CategoryDefinition[]>(() => {
    const saved = localStorage.getItem('incomeCategories');
    return saved ? JSON.parse(saved) : DEFAULT_INCOME_CATEGORIES;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('investments');
    return saved ? JSON.parse(saved) : [];
  });

  const [liabilities, setLiabilities] = useState<Liability[]>(() => {
    const saved = localStorage.getItem('liabilities');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeRange, setTimeRange] = useState<1 | 3 | 6 | 12>(1);
  const [activeTab, setActiveTab] = useState<'expenses' | 'income' | 'budget' | 'performance' | 'bills' | 'categories' | 'goals' | 'networth'>('expenses');
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

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('liabilities', JSON.stringify(liabilities));
  }, [liabilities]);

  // Notification Logic
  useEffect(() => {
    if (!notificationSettings.enableToasts) return;

    const today = new Date();
    const currentMonthStr = format(today, 'yyyy-MM');

    bills.forEach(bill => {
      // Check if already notified this month
      if (bill.lastNotifiedMonth === currentMonthStr) return;

      const billDate = setDate(today, bill.dueDate);
      const daysUntil = differenceInDays(billDate, today);

      if (daysUntil >= 0 && daysUntil <= bill.reminderDaysBefore) {
        toast(`Upcoming Bill: ${bill.description}`, {
          description: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'} ($${bill.amount})`,
          action: {
            label: 'Mark Notified',
            onClick: () => {
              setBills(prev => prev.map(b => 
                b.id === bill.id ? { ...b, lastNotifiedMonth: currentMonthStr } : b
              ));
            },
          },
        });
      }
    });
  }, [bills, notificationSettings]);

  const filteredExpenses = useMemo(() => {
    const end = endOfMonth(currentMonth);
    const start = startOfMonth(subMonths(currentMonth, timeRange - 1));
    
    return expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      
      // Date range filter based on timeRange selection
      const isInRange = isWithinInterval(expDate, { start, end });
      if (!isInRange) return false;

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
    const end = endOfMonth(currentMonth);
    const start = startOfMonth(subMonths(currentMonth, timeRange - 1));
    
    return incomes.filter(inc => {
      const incDate = parseISO(inc.date);
      
      // Date range filter based on timeRange selection
      const isInRange = isWithinInterval(incDate, { start, end });
      if (!isInRange) return false;

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

  const totalBudget = useMemo(() => {
    const monthlyTotal = Object.values(budgets).reduce((sum: number, b) => sum + (Number(b) || 0), 0);
    return Number(monthlyTotal) * Number(timeRange);
  }, [budgets, timeRange]);

  const totalNetWorth = useMemo(() => {
    const totalInc = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExp = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, liab) => sum + liab.amount, 0);
    return (totalInc - totalExp) + totalGoals + totalInvestments - totalLiabilities;
  }, [incomes, expenses, goals, investments, liabilities]);

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

  const deleteExpenses = (ids: string[]) => {
    setExpenses(prev => prev.filter(exp => !ids.includes(exp.id)));
    toast.success(`${ids.length} expenses deleted`);
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

  const deleteIncomes = (ids: string[]) => {
    setIncomes(prev => prev.filter(inc => !ids.includes(inc.id)));
    toast.success(`${ids.length} income entries deleted`);
  };

  const handleChartCategoryClick = (category: Category) => {
    setFilters(prev => ({ ...prev, category }));
    toast.info(`Filtered by category: ${category}`);
  };

  const handleChartPeriodClick = (period: string, type: 'day' | 'month') => {
    if (type === 'day') {
      setFilters(prev => ({ ...prev, startDate: period, endDate: period }));
      toast.info(`Filtered by date: ${period}`);
    } else {
      // Period is YYYY-MM
      const date = parseISO(`${period}-01`);
      setFilters(prev => ({ 
        ...prev, 
        startDate: format(startOfMonth(date), 'yyyy-MM-dd'), 
        endDate: format(endOfMonth(date), 'yyyy-MM-dd') 
      }));
      toast.info(`Filtered by month: ${format(date, 'MMMM yyyy')}`);
    }
  };

  const addCategory = (newCat: Omit<CategoryDefinition, 'id'>) => {
    const category: CategoryDefinition = {
      ...newCat,
      id: crypto.randomUUID(),
    };
    if (newCat.type === 'expense') {
      setExpenseCategories(prev => [...prev, category]);
    } else {
      setIncomeCategories(prev => [...prev, category]);
    }
    toast.success(`Category "${newCat.name}" added!`);
  };

  const updateCategory = (id: string, updates: Partial<CategoryDefinition>) => {
    setExpenseCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
    setIncomeCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
    toast.success('Category updated!');
  };

  const deleteCategory = (id: string) => {
    setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
    setIncomeCategories(prev => prev.filter(cat => cat.id !== id));
    toast.success('Category deleted!');
  };

  const addBill = (newBill: Omit<RecurringBill, 'id'>) => {
    const bill: RecurringBill = {
      ...newBill,
      id: crypto.randomUUID(),
    };
    setBills(prev => [...prev, bill]);
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
  };

  const updateBill = (updatedBill: RecurringBill) => {
    setBills(prev => prev.map(bill => bill.id === updatedBill.id ? updatedBill : bill));
  };

  const markBillAsPaid = (bill: RecurringBill) => {
    const today = new Date();
    const currentMonthStr = format(today, 'yyyy-MM');
    
    // Add to expenses
    addExpense({
      amount: bill.amount,
      category: bill.category,
      description: `Bill: ${bill.description}`,
      date: today.toISOString().split('T')[0],
    });

    // Update bill notified status
    setBills(prev => prev.map(b => 
      b.id === bill.id ? { ...b, lastNotifiedMonth: currentMonthStr } : b
    ));

    toast.success(`Bill "${bill.description}" marked as paid and added to expenses.`);
  };

  const updateBudget = (category: Category, amount: number) => {
    setBudgets(prev => ({ ...prev, [category]: amount }));
  };

  const addGoal = (newGoal: Omit<FinancialGoal, 'id'>) => {
    const goal: FinancialGoal = {
      ...newGoal,
      id: crypto.randomUUID(),
    };
    setGoals(prev => [...prev, goal]);
    toast.success(`Goal "${newGoal.name}" created!`);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const addInvestment = (newInv: Omit<Investment, 'id'>) => {
    const investment: Investment = {
      ...newInv,
      id: crypto.randomUUID(),
    };
    setInvestments(prev => [...prev, investment]);
    toast.success(`Investment "${newInv.name}" added!`);
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    toast.success('Investment deleted!');
  };

  const addLiability = (newLiab: Omit<Liability, 'id'>) => {
    const liability: Liability = {
      ...newLiab,
      id: crypto.randomUUID(),
    };
    setLiabilities(prev => [...prev, liability]);
    toast.success(`Liability "${newLiab.name}" added!`);
  };

  const deleteLiability = (id: string) => {
    setLiabilities(prev => prev.filter(liab => liab.id !== id));
    toast.success('Liability deleted!');
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal deleted');
  };

  const contributeToGoal = (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    // Update goal
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));

    // Create expense
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: amount,
      category: 'Savings',
      description: `Contribution to goal: ${goal.name}`,
      date: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, expense]);
    toast.success(`Contributed $${amount.toLocaleString()} to "${goal.name}"`);
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
              <button 
                onClick={() => setActiveTab('performance')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'performance' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <BarChartIcon size={16} />
                Performance
              </button>
              <button 
                onClick={() => setActiveTab('goals')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'goals' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Target size={16} />
                Goals
              </button>
              <button 
                onClick={() => setActiveTab('bills')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'bills' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Bell size={16} />
                Bills
              </button>
              <button 
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'categories' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Settings size={16} />
                Categories
              </button>
              <button 
                onClick={() => setActiveTab('networth')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'networth' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <ChartIcon size={16} />
                Net Worth
              </button>
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value) as any)}
                className="px-3 py-2 text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value={1}>1 Month</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>1 Year</option>
              </select>
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="px-4 flex items-center gap-2 font-bold text-slate-700 min-w-[140px] justify-center">
                <Calendar size={16} className="text-blue-500" />
                {timeRange === 1 
                  ? format(currentMonth, 'MMMM yyyy')
                  : `${format(subMonths(currentMonth, timeRange - 1), 'MMM yyyy')} - ${format(currentMonth, 'MMM yyyy')}`
                }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-100 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">
                {timeRange === 1 ? 'Total Income' : `Income (${timeRange}mo)`}
              </p>
              <h2 className="text-2xl font-black">
                {formatCurrency(totalIncome, notificationSettings.currency)}
              </h2>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 rotate-12" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-rose-600 text-white p-6 rounded-2xl shadow-xl shadow-rose-100 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">
                {timeRange === 1 ? 'Total Expenses' : `Expenses (${timeRange}mo)`}
              </p>
              <h2 className="text-2xl font-black">
                {formatCurrency(totalMonthly, notificationSettings.currency)}
              </h2>
            </div>
            <TrendingDown className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 -rotate-12" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Net Balance</p>
              <h2 className="text-2xl font-black">
                {formatCurrency(netBalance, notificationSettings.currency)}
              </h2>
            </div>
            <Wallet className="absolute -right-4 -bottom-4 w-20 h-20 text-white/5 rotate-12" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Budget Used</p>
            <h2 className="text-2xl font-black text-slate-800">
              {totalBudget > 0 ? Math.round((totalMonthly / totalBudget) * 100) : 0}%
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              {formatCurrency(totalMonthly, notificationSettings.currency)} of {formatCurrency(totalBudget, notificationSettings.currency)}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-100 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Net Worth</p>
              <h2 className="text-2xl font-black">
                {formatCurrency(totalNetWorth, notificationSettings.currency)}
              </h2>
            </div>
            <Landmark className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 rotate-12" />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {(activeTab === 'expenses' || activeTab === 'income') && (
            <ExpenseFilters 
              filters={filters} 
              onFilterChange={setFilters} 
              categories={activeTab === 'expenses' ? expenseCategories : incomeCategories} 
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {activeTab === 'expenses' ? (
                <>
                  <ExpenseForm categories={expenseCategories} onAddExpense={addExpense} currency={notificationSettings.currency} />
                  <ExpenseCharts 
                    expenses={filteredExpenses} 
                    categories={expenseCategories}
                    onCategoryClick={handleChartCategoryClick}
                    onPeriodClick={handleChartPeriodClick}
                  />
                </>
              ) : activeTab === 'income' ? (
                <IncomeForm categories={incomeCategories} onAddIncome={addIncome} currency={notificationSettings.currency} />
              ) : activeTab === 'bills' ? (
                <BillManager 
                  bills={bills} 
                  categories={expenseCategories}
                  onAddBill={addBill} 
                  onDeleteBill={deleteBill} 
                  onUpdateBill={updateBill} 
                  onMarkAsPaid={markBillAsPaid}
                  settings={notificationSettings}
                  onUpdateSettings={setNotificationSettings}
                />
              ) : activeTab === 'budget' ? (
                <BudgetManager 
                  budgets={budgets} 
                  categories={expenseCategories}
                  onUpdateBudget={updateBudget} 
                  currency={notificationSettings.currency}
                />
              ) : activeTab === 'performance' ? (
                <HistoricalBudget
                  expenses={expenses}
                  budgets={budgets}
                  categories={expenseCategories}
                  currency={notificationSettings.currency}
                />
              ) : activeTab === 'goals' ? (
                <GoalManager
                  goals={goals}
                  onAddGoal={addGoal}
                  onUpdateGoal={updateGoal}
                  onDeleteGoal={deleteGoal}
                  onContribute={contributeToGoal}
                  netBalance={netBalance}
                  currency={notificationSettings.currency}
                />
              ) : activeTab === 'networth' ? (
                <NetWorthDashboard
                  expenses={expenses}
                  incomes={incomes}
                  goals={goals}
                  investments={investments}
                  liabilities={liabilities}
                  onAddInvestment={addInvestment}
                  onDeleteInvestment={deleteInvestment}
                  onAddLiability={addLiability}
                  onDeleteLiability={deleteLiability}
                  currency={notificationSettings.currency}
                />
              ) : (
                <CategoryManager
                  expenseCategories={expenseCategories}
                  incomeCategories={incomeCategories}
                  onAddCategory={addCategory}
                  onUpdateCategory={updateCategory}
                  onDeleteCategory={deleteCategory}
                />
              )}
            </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Budget Progress</h2>
              </div>
              <BudgetProgress 
                expenses={filteredExpenses} 
                budgets={budgets} 
                categories={expenseCategories}
                timeRange={timeRange} 
                currency={notificationSettings.currency}
              />
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
                <IncomeList 
                  incomes={filteredIncomes} 
                  categories={incomeCategories}
                  onDeleteIncome={deleteIncome} 
                  onBulkDelete={deleteIncomes}
                  currency={notificationSettings.currency}
                />
              ) : (
                <ExpenseList 
                  expenses={filteredExpenses} 
                  categories={expenseCategories}
                  onDeleteExpense={deleteExpense} 
                  onBulkDelete={deleteExpenses}
                  currency={notificationSettings.currency}
                />
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
        categories={expenseCategories}
        currentMonth={currentMonth}
        currency={notificationSettings.currency}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}
