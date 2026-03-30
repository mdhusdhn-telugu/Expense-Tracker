import { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  format, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  startOfQuarter, 
  endOfQuarter, 
  subQuarters,
  eachMonthOfInterval,
  eachQuarterOfInterval
} from 'date-fns';
import { Expense, CategoryBudget, CategoryDefinition } from '../types';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, Filter } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface HistoricalBudgetProps {
  expenses: Expense[];
  budgets: CategoryBudget;
  categories: CategoryDefinition[];
  currency: string;
}

export default function HistoricalBudget({ expenses, budgets, categories, currency }: HistoricalBudgetProps) {
  const [viewType, setViewType] = useState<'monthly' | 'quarterly'>('monthly');
  const [range, setRange] = useState<number>(6); // Last 6 months/quarters

  const totalBudget = useMemo(() => {
    return Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
  }, [budgets]);

  const historicalData = useMemo(() => {
    const now = new Date();
    const data = [];

    if (viewType === 'monthly') {
      const interval = {
        start: startOfMonth(subMonths(now, range - 1)),
        end: endOfMonth(now)
      };
      
      const months = eachMonthOfInterval(interval);
      
      for (const month of months) {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthExpenses = expenses.filter(exp => {
          const date = parseISO(exp.date);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        });
        
        const actual = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        data.push({
          name: format(month, 'MMM yyyy'),
          actual,
          budget: totalBudget,
          diff: totalBudget - actual,
          status: actual > totalBudget ? 'over' : 'under'
        });
      }
    } else {
      const interval = {
        start: startOfQuarter(subQuarters(now, range - 1)),
        end: endOfQuarter(now)
      };
      
      const quarters = eachQuarterOfInterval(interval);
      
      for (const quarter of quarters) {
        const qStart = startOfQuarter(quarter);
        const qEnd = endOfQuarter(quarter);
        
        const qExpenses = expenses.filter(exp => {
          const date = parseISO(exp.date);
          return isWithinInterval(date, { start: qStart, end: qEnd });
        });
        
        const actual = qExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const qBudget = totalBudget * 3; // Quarterly budget is 3x monthly budget
        
        data.push({
          name: `Q${Math.floor(getMonth(qStart) / 3) + 1} ${format(qStart, 'yyyy')}`,
          actual,
          budget: qBudget,
          diff: qBudget - actual,
          status: actual > qBudget ? 'over' : 'under'
        });
      }
    }

    return data;
  }, [expenses, totalBudget, viewType, range]);

  const averageAdherence = useMemo(() => {
    if (historicalData.length === 0) return 0;
    const totalDiff = historicalData.reduce((sum, d) => sum + (d.actual / d.budget), 0);
    return (totalDiff / historicalData.length) * 100;
  }, [historicalData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-8 text-sm">
              <span className="text-slate-500">Actual:</span>
              <span className="font-bold text-slate-900">{formatCurrency(data.actual, currency)}</span>
            </div>
            <div className="flex justify-between gap-8 text-sm">
              <span className="text-slate-500">Budget:</span>
              <span className="font-bold text-slate-900">{formatCurrency(data.budget, currency)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-50 flex justify-between gap-8 text-sm">
              <span className="text-slate-500">Difference:</span>
              <span className={cn(
                "font-bold",
                data.diff >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {data.diff >= 0 ? '+' : ''}{formatCurrency(data.diff, currency)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Budget Performance</h2>
          <p className="text-slate-500 text-sm">Compare your spending habits against your budget over time.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setViewType('monthly')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              viewType === 'monthly' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewType('quarterly')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              viewType === 'quarterly' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Adherence</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{averageAdherence.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">
            of budget used on average
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown size={18} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Best Performance</p>
          </div>
          {historicalData.length > 0 ? (
            <>
              <p className="text-2xl font-black text-emerald-600">
                {Math.min(...historicalData.map(d => (d.actual / d.budget) * 100)).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Lowest budget usage recorded
              </p>
            </>
          ) : (
            <p className="text-2xl font-black text-slate-300">N/A</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Over Budget Periods</p>
          </div>
          <p className="text-2xl font-black text-rose-600">
            {historicalData.filter(d => d.actual > d.budget).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            out of last {historicalData.length} {viewType === 'monthly' ? 'months' : 'quarters'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Spending vs Budget Trend
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-900 rounded-full" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-200 rounded-full" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</span>
            </div>
            <select 
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="ml-4 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer"
            >
              <option value={3}>Last 3 {viewType === 'monthly' ? 'Months' : 'Quarters'}</option>
              <option value={6}>Last 6 {viewType === 'monthly' ? 'Months' : 'Quarters'}</option>
              <option value={12}>Last 12 {viewType === 'monthly' ? 'Months' : 'Quarters'}</option>
            </select>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={historicalData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dx={-10}
                tickFormatter={(value) => formatCurrency(value, currency, { notation: 'compact' })}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar 
                dataKey="actual" 
                radius={[6, 6, 0, 0]} 
                barSize={40}
              >
                {historicalData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.actual > entry.budget ? '#f43f5e' : '#0f172a'} 
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="budget" 
                fill="#e2e8f0" 
                radius={[6, 6, 0, 0]} 
                barSize={40} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            Performance Insights
          </h3>
          <div className="space-y-4">
            {historicalData.map((data, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{data.name}</p>
                  <p className="text-xs text-slate-500">
                    {data.status === 'over' 
                      ? `Exceeded budget by ${formatCurrency(Math.abs(data.diff), currency)}`
                      : `Saved ${formatCurrency(data.diff, currency)} from budget`
                    }
                  </p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  data.status === 'over' ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                )}>
                  {data.status === 'over' ? 'Over Budget' : 'On Track'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            Recommendations
          </h3>
          <div className="space-y-6">
            {averageAdherence > 100 ? (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Budget Adjustment Needed</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Your average spending is {averageAdherence.toFixed(1)}% of your budget. Consider increasing your budget targets for categories where you consistently overspend, or review your recent expenses to find areas to cut back.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Healthy Budget Adherence</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Great job! You're averaging {averageAdherence.toFixed(1)}% of your budget. This consistency allows you to allocate more towards your financial goals.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Quarterly Review</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Switch to the Quarterly view to see broader trends. This helps identify seasonal spending patterns that might not be obvious month-to-month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMonth(date: Date) {
  return date.getMonth();
}
