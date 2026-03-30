import React, { useState, useEffect } from 'react';
import { CheckCircle, PlusCircle, Calendar, DollarSign, Bell, Globe } from 'lucide-react';
import { Category, RecurringBill, NotificationSettings, CategoryDefinition, CURRENCIES } from '../types';
import { format } from 'date-fns';
import { formatCurrency } from '../lib/utils';

interface BillManagerProps {
  bills: RecurringBill[];
  categories: CategoryDefinition[];
  onAddBill: (bill: Omit<RecurringBill, 'id'>) => void;
  onDeleteBill: (id: string) => void;
  onUpdateBill: (bill: RecurringBill) => void;
  onMarkAsPaid: (bill: RecurringBill) => void;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export default function BillManager({ bills, categories, onAddBill, onDeleteBill, onUpdateBill, onMarkAsPaid, settings, onUpdateSettings }: BillManagerProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('');
  const [dueDate, setDueDate] = useState('1');
  const [reminderDays, setReminderDays] = useState(settings.defaultReminderDays.toString());

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const currentMonthStr = format(new Date(), 'yyyy-MM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;

    onAddBill({
      description,
      amount: parseFloat(amount),
      category,
      dueDate: parseInt(dueDate),
      reminderDaysBefore: parseInt(reminderDays),
    });

    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-8">
      {/* Settings Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Notification Preferences</h2>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800 text-sm">Preferred Currency</p>
              <p className="text-xs text-slate-500">Select your base currency</p>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => onUpdateSettings({ ...settings, currency: e.target.value })}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>{curr.code} ({curr.symbol}) - {curr.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800 text-sm">Enable Bill Reminders</p>
              <p className="text-xs text-slate-500">Get notified about upcoming bills</p>
            </div>
            <button 
              onClick={() => onUpdateSettings({ ...settings, enableToasts: !settings.enableToasts })}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.enableToasts ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableToasts ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800 text-sm">Default Reminder Days</p>
              <p className="text-xs text-slate-500">Days before due date to notify</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="0"
                max="14"
                value={settings.defaultReminderDays}
                onChange={(e) => onUpdateSettings({ ...settings, defaultReminderDays: parseInt(e.target.value) || 0 })}
                className="w-16 px-2 py-1 rounded border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs font-medium text-slate-500">days</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Add Recurring Bill</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rent, Netflix, etc."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Due Day (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Remind Days Before</label>
              <input
                type="number"
                min="0"
                max="14"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-100"
        >
          <PlusCircle size={18} />
          Add Recurring Bill
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Your Recurring Bills</h3>
        <div className="grid grid-cols-1 gap-4">
          {bills.map(bill => (
            <div key={bill.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{bill.description}</h4>
                  <p className="text-xs text-slate-500">Due on the {bill.dueDate}{getDaySuffix(bill.dueDate)} • {bill.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-black text-slate-900">{formatCurrency(bill.amount, settings.currency)}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Remind {bill.reminderDaysBefore}d before</p>
                </div>
                <div className="flex items-center gap-2">
                  {bill.lastNotifiedMonth === currentMonthStr ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                      <CheckCircle size={14} />
                      Paid
                    </div>
                  ) : (
                    <button 
                      onClick={() => onMarkAsPaid(bill)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button 
                    onClick={() => onDeleteBill(bill.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <PlusCircle className="rotate-45" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {bills.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No recurring bills added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getDaySuffix(day: number) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
