import React, { useState, useEffect, useMemo } from 'react';
import { QuoteItem, EvaluatedQuote, FilterState } from './types';
import { DEFAULT_QUOTES } from './data/defaultQuotes';
import { evaluateQuotes, getPRGroups, sortEvaluatedQuotes, exportQuotesToCSV } from './utils/evaluator';
import { Navbar } from './components/Navbar';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { QuoteTable } from './components/QuoteTable';
import { PRGroupView } from './components/PRGroupView';
import { PRDetailModal } from './components/PRDetailModal';
import { QuoteFormModal } from './components/QuoteFormModal';
import { ImportModal } from './components/ImportModal';

const STORAGE_KEY = 'exs02.quotes.v1';

export default function App() {
  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from LocalStorage', e);
    }
    return DEFAULT_QUOTES;
  });

  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    deliveryFilter: 'all',
    warningFilter: 'all',
    viewMode: 'table',
  });

  const [selectedPRNo, setSelectedPRNo] = useState<string | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Save to LocalStorage immediately on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error('Failed to save to LocalStorage', e);
    }
  }, [quotes]);

  // Evaluated quotes
  const evaluatedQuotes = useMemo(() => {
    return evaluateQuotes(quotes);
  }, [quotes]);

  // Filter & sort
  const filteredQuotes = useMemo(() => {
    let result = evaluatedQuotes;

    // Search query
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.pr_no.toLowerCase().includes(q) ||
          item.item_code.toLowerCase().includes(q) ||
          item.item_name.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.quote_id.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filter.statusFilter !== 'all') {
      result = result.filter(item => item.status === filter.statusFilter);
    }

    // Delivery filter
    if (filter.deliveryFilter !== 'all') {
      result = result.filter(item => item.deliveryState === filter.deliveryFilter);
    }

    // Warning filter from dashboard cards
    if (filter.warningFilter !== 'all') {
      if (filter.warningFilter === '이상치') {
        result = result.filter(item => item.priceState === '이상치');
      } else if (filter.warningFilter === '표기상이') {
        result = result.filter(item => item.isNameDiscrepant);
      } else if (filter.warningFilter === '지연') {
        result = result.filter(item => item.deliveryState === '지연');
      } else if (filter.warningFilter === '임박') {
        result = result.filter(item => item.deliveryState === '임박');
      } else if (filter.warningFilter === '결측') {
        result = result.filter(item => item.unit_price === null || item.promised_date === null);
      }
    }

    return sortEvaluatedQuotes(result);
  }, [evaluatedQuotes, filter]);

  const prGroups = useMemo(() => {
    // Apply search and status filters to groups as well
    let qList = evaluatedQuotes;
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      qList = qList.filter(
        item =>
          item.pr_no.toLowerCase().includes(q) ||
          item.item_code.toLowerCase().includes(q) ||
          item.item_name.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q)
      );
    }
    return getPRGroups(qList);
  }, [evaluatedQuotes, filter.searchQuery]);

  // Stats
  const totalCount = quotes.length;
  const orderCount = quotes.filter(q => q.status === '발주').length;
  const delayCount = evaluatedQuotes.filter(q => q.deliveryState === '지연').length;
  const outlierCount = evaluatedQuotes.filter(q => q.priceState === '이상치').length;

  // Handlers
  const handleToggleStatus = (quoteId: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.quote_id === quoteId) {
          return { ...q, status: q.status === '발주' ? '견적' : '발주' };
        }
        return q;
      })
    );
  };

  const handleDeleteQuote = (quoteId: string) => {
    if (window.confirm(`견적 ${quoteId} 건을 삭제하시겠습니까?`)) {
      setQuotes(prev => prev.filter(q => q.quote_id !== quoteId));
    }
  };

  const handleSaveQuote = (saved: QuoteItem) => {
    setQuotes(prev => {
      const exists = prev.some(q => q.quote_id === saved.quote_id);
      if (exists) {
        return prev.map(q => (q.quote_id === saved.quote_id ? saved : q));
      }
      return [saved, ...prev];
    });
    setEditingQuote(null);
    setIsAddModalOpen(false);
  };

  const handleResetDefault = () => {
    if (window.confirm('기본 샘플 데이터(80행)로 초기화하시겠습니까? (작업 중인 내용이 초기화됩니다)')) {
      setQuotes(DEFAULT_QUOTES);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportCSV = () => {
    const csvStr = exportQuotesToCSV(quotes);
    const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchase_quotes_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar
        totalCount={totalCount}
        orderCount={orderCount}
        delayCount={delayCount}
        outlierCount={outlierCount}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAdd={() => {
          setEditingQuote(null);
          setIsAddModalOpen(true);
        }}
        onResetDefault={handleResetDefault}
        onExportCSV={handleExportCSV}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Warning Summary Dashboard */}
        <DashboardCards quotes={evaluatedQuotes} filter={filter} setFilter={setFilter} />

        {/* Filter and Search Bar */}
        <FilterBar filter={filter} setFilter={setFilter} totalFilteredCount={filteredQuotes.length} />

        {/* Active Warning Filter Notification Banner */}
        {filter.warningFilter !== 'all' && (
          <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl mb-4 flex items-center justify-between text-xs text-blue-900">
            <span>
              🔍 현재 <strong>[{filter.warningFilter}]</strong> 조건으로 필터링 중입니다. (결과: {filteredQuotes.length}건)
            </span>
            <button
              onClick={() => setFilter(prev => ({ ...prev, warningFilter: 'all' }))}
              className="font-semibold text-blue-700 hover:underline"
            >
              필터 해제
            </button>
          </div>
        )}

        {/* Main Content View */}
        {filter.viewMode === 'table' ? (
          <QuoteTable
            quotes={filteredQuotes}
            onSelectPR={prNo => setSelectedPRNo(prNo)}
            onEditQuote={q => {
              setEditingQuote(q);
              setIsAddModalOpen(true);
            }}
            onDeleteQuote={handleDeleteQuote}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <PRGroupView groups={prGroups} onSelectPR={prNo => setSelectedPRNo(prNo)} />
        )}
      </main>

      {/* PR Detail Modal */}
      {selectedPRNo && (
        <PRDetailModal
          prNo={selectedPRNo}
          quotes={evaluatedQuotes}
          onClose={() => setSelectedPRNo(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingQuote) && (
        <QuoteFormModal
          quoteToEdit={editingQuote}
          onSave={handleSaveQuote}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingQuote(null);
          }}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportModal
          onImport={imported => {
            setQuotes(imported);
            setIsImportModalOpen(false);
          }}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
    </div>
  );
}
