import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Wallet } from 'lucide-react';
import { loginWithGoogle } from '../firebase';

export default function Login() {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 text-white rounded-2xl mb-6 shadow-lg shadow-blue-200">
            <Wallet size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">FinTrack Pro</h1>
          <p className="text-slate-500 font-medium mb-8">Your personal finance companion. Secure, real-time, and insightful.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            Sign in with Google
          </button>
          
          <p className="mt-8 text-xs text-slate-400 font-medium">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">100%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">Real-time</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">Free</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forever</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
