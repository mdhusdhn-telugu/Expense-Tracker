import { Search, Filter, X } from 'lucide-react';
import { Category, CategoryDefinition } from '../types';

export interface FilterCriteria {
  search: string;
  category: Category | 'All';
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
}

interface ExpenseFiltersProps {
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  categories: CategoryDefinition[];
}

export default function ExpenseFilters({ filters, onFilterChange, categories }: ExpenseFiltersProps) {
  const handleChange = (key: keyof FilterCriteria, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'All',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.category !== 'All' || 
    filters.minAmount !== '' || 
    filters.maxAmount !== '' || 
    filters.startDate !== '' || 
    filters.endDate !== '';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter size={18} className="text-slate-400" />
          <h2 className="text-lg font-bold">Filter Transactions</h2>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by description..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-sm"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Min Amount */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Amount</label>
          <input
            type="number"
            placeholder="Min $"
            value={filters.minAmount}
            onChange={(e) => handleChange('minAmount', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Max Amount */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Amount</label>
          <input
            type="number"
            placeholder="Max $"
            value={filters.maxAmount}
            onChange={(e) => handleChange('maxAmount', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );
}
