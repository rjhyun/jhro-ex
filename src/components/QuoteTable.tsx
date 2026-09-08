import React from 'react';
import { EvaluatedQuote } from '../types';
import { AlertTriangle, AlertCircle, Clock, CheckCircle, ExternalLink, Trash2, Edit } from 'lucide-react';

interface QuoteTableProps {
  quotes: EvaluatedQuote[];
  onSelectPR: (prNo: string) => void;
  onEditQuote: (quote: EvaluatedQuote) => void;
  onDeleteQuote: (quoteId: string) => void;
  onToggleStatus: (quoteId: string) => void;
}

export const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes,
  onSelectPR,
  onEditQuote,
  onDeleteQuote,
  onToggleStatus,
}) => {
  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <p className="text-base font-medium">검색 결과가 없습니다.</p>
        <p className="text-xs text-slate-400 mt-1">검색어나 필터 조건을 변경해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-3">견적ID / PR번호</th>
              <th className="py-3 px-3">품목명 / 코드</th>
              <th className="py-3 px-3">공급사</th>
              <th className="py-3 px-3 text-right">수량</th>
              <th className="py-3 px-3 text-right">단가 (KRW)</th>
              <th className="py-3 px-3 text-center">단가 판정</th>
              <th className="py-3 px-3">약속납기 (D-day)</th>
              <th className="py-3 px-3 text-center">납기 판정</th>
              <th className="py-3 px-3 text-center">진행상태</th>
              <th className="py-3 px-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {quotes.map(q => {
              return (
                <tr
                  key={q.quote_id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* ID / PR */}
                  <td className="py-3 px-3 font-medium">
                    <div className="text-slate-900 font-mono">{q.quote_id}</div>
                    <button
                      onClick={() => onSelectPR(q.pr_no)}
                      className="text-blue-600 hover:underline font-mono text-[11px] inline-flex items-center gap-1 mt-0.5"
                    >
                      {q.pr_no} <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>

                  {/* Item Name / Code */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>{q.item_name}</span>
                      {q.isNameDiscrepant && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200" title="동일 item_code 내 item_name 표기 상이">
                          표기상이
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{q.item_code}</div>
                  </td>

                  {/* Supplier */}
                  <td className="py-3 px-3 font-medium text-slate-800">{q.supplier}</td>

                  {/* Qty */}
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {q.qty.toLocaleString()} {q.unit}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    {q.unit_price !== null ? (
                      <span className={q.isLowest ? 'text-blue-600' : 'text-slate-900'}>
                        {q.unit_price.toLocaleString()}원
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">미기재</span>
                    )}
                  </td>

                  {/* Price State & Lowest Badge */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {q.isLowest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs">
                          최저가
                        </span>
                      )}
                      {q.priceState === '이상치' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> 이상치 ({q.deviation !== null ? (q.deviation > 0 ? `+${q.deviation}%` : `${q.deviation}%`) : ''})
                        </span>
                      )}
                      {q.priceState === '비교 불가' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                          비교불가
                        </span>
                      )}
                      {q.priceState === '단가 미기재' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                          단가공란
                        </span>
                      )}
                      {q.priceState === '정상' && !q.isLowest && (
                        <span className="text-slate-400 text-[11px]">정상</span>
                      )}
                    </div>
                  </td>

                  {/* Promised Date & D-day */}
                  <td className="py-3 px-3 font-mono">
                    <div>{q.promised_date || <span className="text-slate-400 italic">미기재</span>}</div>
                    {q.dDays !== null && (
                      <div className="text-[11px] font-semibold mt-0.5">
                        {q.dDays === 0 ? (
                          <span className="text-amber-600">D-DAY</span>
                        ) : q.dDays > 0 ? (
                          <span className="text-amber-600">D-{q.dDays}</span>
                        ) : (
                          <span className="text-rose-600">D+{Math.abs(q.dDays)} 지연</span>
                        )}
                        {q.isExceededRequired && (
                          <span className="ml-1 text-orange-500" title="필요일 초과">⚠️필요일초과</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Delivery State */}
                  <td className="py-3 px-3 text-center">
                    {q.status === '발주' ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        q.deliveryState === '지연' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        q.deliveryState === '임박' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        q.deliveryState === '납기 미기재' ? 'bg-slate-100 text-slate-600' :
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {q.deliveryState === '지연' && <AlertCircle className="w-3 h-3" />}
                        {q.deliveryState === '임박' && <Clock className="w-3 h-3" />}
                        {q.deliveryState === '정상' && <CheckCircle className="w-3 h-3" />}
                        {q.deliveryState}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">대상아님</span>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onToggleStatus(q.quote_id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        q.status === '발주'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {q.status}
                    </button>
                    {q.isStatusDuplicate && (
                      <div className="text-[10px] text-rose-600 font-semibold mt-0.5">발주중복</div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onEditQuote(q)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteQuote(q.quote_id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
