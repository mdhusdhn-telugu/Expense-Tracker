import React from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Settings, Bell, Globe, Shield, Trash2 } from 'lucide-react';
import { auth, logout } from '../firebase';
import { CURRENCIES, NotificationSettings } from '../types';

interface ProfileSettingsProps {
  notificationSettings: NotificationSettings;
  onUpdateSettings: (settings: Partial<NotificationSettings>) => void;
  onResetData: () => void;
}

export default function ProfileSettings({ notificationSettings, onUpdateSettings, onResetData }: ProfileSettingsProps) {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="relative">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg">
            <Settings size={20} />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-900 mb-1">{user?.displayName || 'Financial Expert'}</h2>
          <p className="text-slate-500 font-medium mb-4">{user?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">Premium Member</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">Verified Account</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preferences */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Default Currency</label>
              <select 
                value={notificationSettings.currency}
                onChange={(e) => onUpdateSettings({ currency: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.name} ({curr.symbol})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-slate-400" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Enable Notifications</p>
                  <p className="text-[10px] font-medium text-slate-400">Receive alerts for bills and goals</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.enableToasts}
                  onChange={(e) => onUpdateSettings({ enableToasts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Bill Reminder (Days Before)</label>
              <input 
                type="number" 
                min="1" 
                max="30"
                value={notificationSettings.defaultReminderDays}
                onChange={(e) => onUpdateSettings({ defaultReminderDays: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Security & Data */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Security & Data</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Account Security</p>
                <p className="text-[10px] font-medium text-slate-400">Two-factor authentication is enabled</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black uppercase">Active</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Data Privacy</p>
                <p className="text-[10px] font-medium text-slate-400">Your data is encrypted end-to-end</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase">Encrypted</span>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all your data? This cannot be undone.")) {
                    onResetData();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-rose-100 text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-all group"
              >
                <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                Reset All Financial Data
              </button>
              <p className="mt-2 text-[10px] text-center text-slate-400 font-medium italic">Warning: This will permanently delete all transactions, goals, and investments.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
