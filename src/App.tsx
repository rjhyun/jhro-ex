import React, { useState, useEffect, useMemo } from 'react';
import { QuoteItem, EvaluatedQuote, FilterState } from './types';
import { DEFAULT_QUOTES } from './data/defaultQuotes';
import { evaluateQuotes, getPRGroups, sortEvaluatedQuotes, exportQuotesToCSV } from './utils/evaluator';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { QuoteTable } from './components/QuoteTable';
import { PRGroupView } from './components/PRGroupView';
import { PRDetailModal } from './components/PRDetailModal';
import { QuoteFormModal } from './components/QuoteFormModal';
import { ImportModal } from './components/ImportModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('exs02.user_email') || (!isSupabaseConfigured() ? 'demo@purchasing.system' : null);
  });
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('exs02.quotes.v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load local quotes', e);
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

  // Check Supabase Auth session on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const client = getSupabaseClient();
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        localStorage.setItem('exs02.user_email', session.user.email);
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        localStorage.setItem('exs02.user_email', session.user.email);
      } else {
        setUserEmail(null);
        localStorage.removeItem('exs02.user_email');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userEmail]);

  // Fetch quotes from Supabase if configured & logged in
  useEffect(() => {
    async function fetchSupabaseQuotes() {
      if (!isSupabaseConfigured() || !userEmail || userEmail === 'demo@purchasing.system') return;

      setIsLoadingQuotes(true);
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.from('quotes').select('*');
        if (error) {
          console.error('Error fetching quotes from Supabase:', error);
          return;
        }

        if (data && data.length > 0) {
          const mapped: QuoteItem[] = data.map((d: any) => ({
            quote_id: d.quote_id,
            pr_no: d.pr_no,
            item_code: d.item_code,
            item_name: d.item_name,
            supplier: d.supplier,
            unit: d.unit,
            qty: Number(d.qty),
            unit_price: d.unit_price !== null && d.unit_price !== undefined ? Number(d.unit_price) : null,
            currency: d.currency || 'KRW',
            quote_date: d.quote_date,
            required_date: d.required_date,
            promised_date: d.promised_date || null,
            status: d.status || '견적',
            remark: d.remark || '',
          }));
          setQuotes(mapped);
          localStorage.setItem('exs02.quotes.v1', JSON.stringify(mapped));
        } else {
          const seedPayload = DEFAULT_QUOTES.map(q => ({
            quote_id: q.quote_id,
            pr_no: q.pr_no,
            item_code: q.item_code,
            item_name: q.item_name,
            supplier: q.supplier,
            unit: q.unit,
            qty: q.qty,
            unit_price: q.unit_price,
            currency: q.currency,
            quote_date: q.quote_date,
            required_date: q.required_date,
            promised_date: q.promised_date,
            status: q.status,
            remark: q.remark,
          }));
          await client.from('quotes').insert(seedPayload);
        }
      } catch (err) {
        console.error('Supabase sync error:', err);
      } finally {
        setIsLoadingQuotes(false);
      }
    }

    fetchSupabaseQuotes();
  }, [userEmail]);

  const persistQuotes = async (newQuotes: QuoteItem[]) => {
    setQuotes(newQuotes);
    localStorage.setItem('exs02.quotes.v1', JSON.stringify(newQuotes));
  };

  const evaluatedQuotes = useMemo(() => {
    return evaluateQuotes(quotes);
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    let result = evaluatedQuotes;

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

    if (filter.statusFilter !== 'all') {
      result = result.filter(item => item.status === filter.statusFilter);
    }

    if (filter.deliveryFilter !== 'all') {
      result = result.filter(item => item.deliveryState === filter.deliveryFilter);
    }

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

  const totalCount = quotes.length;
  const orderCount = quotes.filter(q => q.status === '발주').length;
  const delayCount = evaluatedQuotes.filter(q => q.deliveryState === '지연').length;
  const outlierCount = evaluatedQuotes.filter(q => q.priceState === '이상치').length;

  const handleToggleStatus = async (quoteId: string) => {
    const updated = quotes.map(q => {
      if (q.quote_id === quoteId) {
        return { ...q, status: (q.status === '발주' ? '견적' : '발주') as '견적' | '발주' };
      }
      return q;
    });
    await persistQuotes(updated);

    if (isSupabaseConfigured() && userEmail !== 'demo@purchasing.system') {
      const target = updated.find(q => q.quote_id === quoteId);
      if (target) {
        const client = getSupabaseClient();
        await client.from('quotes').update({ status: target.status }).eq('quote_id', quoteId);
      }
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm(`견적 ${quoteId} 건을 삭제하시겠습니까?`)) {
      const updated = quotes.filter(q => q.quote_id !== quoteId);
      await persistQuotes(updated);

      if (isSupabaseConfigured() && userEmail !== 'demo@purchasing.system') {
        const client = getSupabaseClient();
        await client.from('quotes').delete().eq('quote_id', quoteId);
      }
    }
  };

  const handleSaveQuote = async (saved: QuoteItem) => {
    const exists = quotes.some(q => q.quote_id === saved.quote_id);
    let updated: QuoteItem[];
    if (exists) {
      updated = quotes.map(q => (q.quote_id === saved.quote_id ? saved : q));
    } else {
      updated = [saved, ...quotes];
    }
    await persistQuotes(updated);

    if (isSupabaseConfigured() && userEmail !== 'demo@purchasing.system') {
      const client = getSupabaseClient();
      await client.from('quotes').upsert([saved], { onConflict: 'quote_id' });
    }

    setEditingQuote(null);
    setIsAddModalOpen(false);
  };

  const handleImportQuotes = async (imported: QuoteItem[]) => {
    await persistQuotes(imported);
    setIsImportModalOpen(false);

    if (isSupabaseConfigured() && userEmail !== 'demo@purchasing.system') {
      const client = getSupabaseClient();
      const payload = imported.map(q => ({
        quote_id: q.quote_id,
        pr_no: q.pr_no,
        item_code: q.item_code,
        item_name: q.item_name,
        supplier: q.supplier,
        unit: q.unit,
        qty: q.qty,
        unit_price: q.unit_price,
        currency: q.currency,
        quote_date: q.quote_date,
        required_date: q.required_date,
        promised_date: q.promised_date,
        status: q.status,
        remark: q.remark,
      }));
      const { error } = await client.from('quotes').upsert(payload, { onConflict: 'quote_id' });
      if (error) {
        console.error('Supabase import error:', error);
        alert('Supabase DB 누적 저장 중 오류가 발생했습니다: ' + error.message);
      } else {
        alert('성공적으로 CSV 데이터가 Supabase DB에 누적 저장되었습니다.');
      }
    }
  };

  const handleResetDefault = async () => {
    if (window.confirm('기본 샘플 데이터(80행)로 초기화하시겠습니까?')) {
      await persistQuotes(DEFAULT_QUOTES);
      localStorage.removeItem('exs02.quotes.v1');
    }
  };

  const handleExportCSV = () => {
    const csvStr = exportQuotesToCSV(quotes);
    const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchase_quotes_supabase_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      await client.auth.signOut();
    }
    setUserEmail(null);
    localStorage.removeItem('exs02.user_email');
  };

  if (!userEmail) {
    return (
      <LoginModal
        onLoginSuccess={email => {
          setUserEmail(email);
          localStorage.setItem('exs02.user_email', email);
        }}
        onBypassDemo={() => {
          setUserEmail('demo@purchasing.system');
          localStorage.setItem('exs02.user_email', 'demo@purchasing.system');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar
        totalCount={totalCount}
        orderCount={orderCount}
        delayCount={delayCount}
        outlierCount={outlierCount}
        userEmail={userEmail}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAdd={() => {
          setEditingQuote(null);
          setIsAddModalOpen(true);
        }}
        onResetDefault={handleResetDefault}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoadingQuotes && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl mb-4 text-xs text-blue-800 text-center">
            Supabase DB에서 견적 데이터를 동기화하고 있습니다...
          </div>
        )}

        <DashboardCards quotes={evaluatedQuotes} filter={filter} setFilter={setFilter} />

        <FilterBar filter={filter} setFilter={setFilter} totalFilteredCount={filteredQuotes.length} />

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

      {selectedPRNo && (
        <PRDetailModal
          prNo={selectedPRNo}
          quotes={evaluatedQuotes}
          onClose={() => setSelectedPRNo(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}

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

      {isImportModalOpen && (
        <ImportModal
          onImport={handleImportQuotes}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
    </div>
  );
}
