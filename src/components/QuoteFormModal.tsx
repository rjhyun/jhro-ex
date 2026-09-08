import React, { useState, useEffect } from 'react';
import { QuoteItem } from '../types';
import { X, Save } from 'lucide-react';

interface QuoteFormModalProps {
  quoteToEdit?: QuoteItem | null;
  onSave: (quote: QuoteItem) => void;
  onClose: () => void;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  quoteToEdit,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<QuoteItem>({
    quote_id: `QT-${Math.floor(100 + Math.random() * 900)}`,
    pr_no: 'PR-2026-033',
    item_code: 'IT-001',
    item_name: 'MTBE 수입품',
    supplier: '신규공급사',
    unit: 't',
    qty: 5,
    unit_price: 800000,
    currency: 'KRW',
    quote_date: '2026-09-07',
    required_date: '2026-09-30',
    promised_date: '2026-09-25',
    status: '견적',
    remark: '',
  });

  useEffect(() => {
    if (quoteToEdit) {
      setFormData(quoteToEdit);
    }
  }, [quoteToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {quoteToEdit ? '견적 정보 수정' : '신규 견적 등록'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">견적 ID</label>
              <input
                type="text"
                required
                value={formData.quote_id}
                onChange={e => setFormData({ ...formData, quote_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PR 번호 (구매요청)</label>
              <input
                type="text"
                required
                value={formData.pr_no}
                onChange={e => setFormData({ ...formData, pr_no: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">품목 코드</label>
              <input
                type="text"
                required
                value={formData.item_code}
                onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">품목명</label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">공급사</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">수량</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={formData.qty}
                onChange={e => setFormData({ ...formData, qty: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">단위</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">단가 (KRW, 공란 가능)</label>
              <input
                type="number"
                value={formData.unit_price !== null ? formData.unit_price : ''}
                onChange={e => setFormData({ ...formData, unit_price: e.target.value === '' ? null : parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="미기재 시 공란"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">진행 상태</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as '견적' | '발주' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="견적">견적</option>
                <option value="발주">발주</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">견적 접수일</label>
              <input
                type="date"
                required
                value={formData.quote_date}
                onChange={e => setFormData({ ...formData, quote_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">필요일 (Required)</label>
              <input
                type="date"
                required
                value={formData.required_date}
                onChange={e => setFormData({ ...formData, required_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">약속 납기 (Promised)</label>
              <input
                type="date"
                value={formData.promised_date || ''}
                onChange={e => setFormData({ ...formData, promised_date: e.target.value || null })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="공란 가능"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">비고 (Remark)</label>
            <input
              type="text"
              value={formData.remark}
              onChange={e => setFormData({ ...formData, remark: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
