import { useRef } from 'react';
import { X, Download, FileText, TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Expense, Income, CategoryBudget, CategoryDefinition } from '../types';
import { formatCurrency } from '../lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  incomes: Income[];
  budgets: CategoryBudget;
  categories: CategoryDefinition[];
  currentMonth: Date;
  currency: string;
}

export default function MonthlyReportModal({ 
  isOpen, 
  onClose, 
  expenses, 
  incomes, 
  budgets, 
  categories,
  currentMonth,
  currency
}: MonthlyReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const getCategoryColor = (categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.color || '#94a3b8';
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  
  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + (Number(b) || 0), 0);

  const expensesByCategory = categories.map(cat => {
    const amount = expenses
      .filter(exp => exp.category === cat.name)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const budget = budgets[cat.name] || 0;
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    
    return {
      category: cat.name,
      color: cat.color,
      amount,
      budget,
      percentage,
      isOverBudget: budget > 0 && amount > budget
    };
  }).filter(item => item.amount > 0 || item.budget > 0);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SpendWise-Report-${format(currentMonth, 'yyyy-MM')}.pdf`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Monthly Financial Report</h2>
                  <p className="text-sm text-slate-500 font-medium">{format(currentMonth, 'MMMM yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  <Download size={18} />
                  Export PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 bg-white" ref={reportRef}>
              <div className="max-w-3xl mx-auto space-y-10">
                
                {/* Report Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SpendWise Summary</h1>
                  <p className="text-slate-500 font-medium">Financial performance for {format(currentMonth, 'MMMM yyyy')}</p>
                  <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mt-4"></div>
                </div>

                {/* High Level Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <TrendingUp size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Total Income</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-700">{formatCurrency(totalIncome, currency)}</p>
                  </div>
                  <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                    <div className="flex items-center gap-2 text-rose-600 mb-2">
                      <TrendingDown size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
                    </div>
                    <p className="text-2xl font-black text-rose-700">{formatCurrency(totalExpenses, currency)}</p>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Wallet size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Net Balance</span>
                    </div>
                    <p className="text-2xl font-black text-white">{formatCurrency(netBalance, currency)}</p>
                  </div>
                </div>

                {/* Budget Adherence */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-800">Budget Adherence</h3>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-slate-500 text-sm font-medium">Overall Budget Usage</p>
                        <p className="text-2xl font-black text-slate-900">
                          {totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-sm font-medium">Remaining</p>
                        <p className={`text-xl font-bold ${totalBudget - totalExpenses >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(totalBudget - totalExpenses, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${totalExpenses > totalBudget ? 'bg-rose-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(100, totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={20} className="text-rose-600" />
                    <h3 className="text-lg font-bold text-slate-800">Spending by Category</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {expensesByCategory.map((item) => (
                      <div key={item.category} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                        <div 
                          className="w-3 h-12 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800">{item.category}</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrency(item.amount, currency)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>{item.percentage.toFixed(1)}% of total</span>
                            {item.budget > 0 && (
                              <span className={item.isOverBudget ? 'text-rose-500 font-bold' : 'text-emerald-600 font-bold'}>
                                {item.isOverBudget ? 'Over Budget' : 'Within Budget'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer of Report */}
                <div className="pt-10 border-t border-slate-100 text-center">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    Generated by SpendWise on {format(new Date(), 'PPP')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
