import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Palette } from 'lucide-react';
import { CategoryDefinition } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryManagerProps {
  expenseCategories: CategoryDefinition[];
  incomeCategories: CategoryDefinition[];
  onAddCategory: (cat: Omit<CategoryDefinition, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<CategoryDefinition>) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoryManager({
  expenseCategories,
  incomeCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#64748b');
  
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const categories = activeType === 'expense' ? expenseCategories : incomeCategories;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCategory({
      name: newName.trim(),
      color: newColor,
      type: activeType,
    });
    setNewName('');
    setNewColor('#64748b');
    setIsAdding(false);
  };

  const startEdit = (cat: CategoryDefinition) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    onUpdateCategory(id, {
      name: editName.trim(),
      color: editColor,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveType('expense')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeType === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Expense Categories
          </button>
          <button
            onClick={() => setActiveType('income')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeType === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Income Categories
          </button>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col gap-3"
            >
              <input
                autoFocus
                type="text"
                placeholder="Category Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                  <Palette size={14} className="text-slate-400" />
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full h-6 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleAdd}
                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {categories.map((cat) => (
            <motion.div
              layout
              key={cat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group"
            >
              {editingId === cat.id ? (
                <div className="flex-1 flex flex-col gap-2 mr-2">
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 rounded text-sm font-medium focus:outline-none"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full h-4 bg-transparent cursor-pointer"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-bold text-slate-700">{cat.name}</span>
                </div>
              )}

              <div className="flex gap-1">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
