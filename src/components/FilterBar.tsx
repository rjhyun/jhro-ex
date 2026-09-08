import React from 'react';
import { Search, Filter, Layers, List } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter, totalFilteredCount }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={filter.searchQuery}
          onChange={e => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
          placeholder="PR번호, 품목코드, 품목명, 공급사 검색..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
          <span className="px-2 text-slate-400">상태:</span>
          {(['all', '발주', '견적'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilter(prev => ({ ...prev, statusFilter: st }))}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter.statusFilter === st ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              {st === 'all' ? '전체' : st}
            </button>
          ))}
        </div>

        {/* Delivery Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
          <span className="px-2 text-slate-400">납기:</span>
          {(['all', '지연', '임박', '정상', '납기 미기재'] as const).map(dt => (
            <button
              key={dt}
              onClick={() => setFilter(prev => ({ ...prev, deliveryFilter: dt }))}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter.deliveryFilter === dt ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              {dt === 'all' ? '전체' : dt}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
          <button
            onClick={() => setFilter(prev => ({ ...prev, viewMode: 'table' }))}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
              filter.viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>단건 목록</span>
          </button>
          <button
            onClick={() => setFilter(prev => ({ ...prev, viewMode: 'pr_group' }))}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
              filter.viewMode === 'pr_group' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PR별 그룹</span>
          </button>
        </div>
      </div>
    </div>
  );
};
