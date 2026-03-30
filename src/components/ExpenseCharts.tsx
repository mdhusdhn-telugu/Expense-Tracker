import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Expense, Category, CategoryDefinition } from '../types';

interface ExpenseChartsProps {
  expenses: Expense[];
  categories: CategoryDefinition[];
  onCategoryClick?: (category: Category) => void;
  onPeriodClick?: (period: string, type: 'day' | 'month') => void;
}

export default function ExpenseCharts({ expenses, categories, onCategoryClick, onPeriodClick }: ExpenseChartsProps) {
  const getCategoryColor = (categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.color || '#94a3b8';
  };
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const isMultiMonth = new Set(expenses.map(e => e.date.substring(0, 7))).size > 1;

  const chartData = expenses.reduce((acc, curr) => {
    const key = isMultiMonth ? curr.date.substring(0, 7) : curr.date;
    const existing = acc.find(item => item.label === key);
    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({ label: key, amount: curr.amount });
    }
    return acc;
  }, [] as { label: string; amount: number }[]).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Spending by Category</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                onClick={(data) => onCategoryClick?.(data.name as Category)}
                className="cursor-pointer"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
          {isMultiMonth ? 'Monthly Spending' : 'Daily Spending'}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10 }} 
                tickFormatter={(str) => isMultiMonth ? str : str.split('-').slice(1).join('/')}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="amount" 
                fill="#64748b" 
                radius={[4, 4, 0, 0]} 
                onClick={(data) => onPeriodClick?.(data.label, isMultiMonth ? 'month' : 'day')}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
