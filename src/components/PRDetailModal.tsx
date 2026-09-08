import React, { useState } from 'react';
import { EvaluatedQuote } from '../types';
import { X, Copy, Check, ExternalLink, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PRDetailModalProps {
  prNo: string;
  quotes: EvaluatedQuote[];
  onClose: () => void;
  onToggleStatus: (quoteId: string) => void;
}

export const PRDetailModal: React.FC<PRDetailModalProps> = ({
  prNo,
  quotes,
  onClose,
  onToggleStatus,
}) => {
  const [copied, setCopied] = useState(false);

  const prQuotes = quotes.filter(q => q.pr_no === prNo);
  if (prQuotes.length === 0) return null;

  const first = prQuotes[0];

  const handleCopyComparisonTable = () => {
    const headers = ['PR번호', '품목코드', '품목명', '수량', '공급사', '단가(KRW)', '편차율', '단가판정', '최저가', '약속납기', '납기판정', '진행상태'];
    const rows = prQuotes.map(q => [
      q.pr_no,
      q.item_code,
      q.item_name,
      `${q.qty} ${q.unit}`,
      q.supplier,
      q.unit_price !== null ? q.unit_price.toString() : '미기재',
      q.deviation !== null ? `${q.deviation}%` : '-',
      q.priceState,
      q.isLowest ? '최저가' : '',
      q.promised_date || '미기재',
      q.deliveryState,
      q.status,
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded text-sm border border-blue-200">
                {prNo}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {first.itemName} <span className="text-xs text-slate-500 font-mono font-normal">({first.itemCode})</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              요청수량: <span className="font-semibold text-slate-700">{first.qty.toLocaleString()} {first.unit}</span> · 요청부서 필요일: <span className="font-semibold text-slate-700">{first.required_date}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyComparisonTable}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? '복사 완료!' : '비교표 복사'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start space-x-3">
            <div className="font-semibold mt-0.5">💡 판정 안내:</div>
            <div className="leading-relaxed">
              중앙값 대비 ±30%를 초과하는 단가는 <strong>이상치</strong>로 판정되어 최저가 후보에서 제외됩니다. 최저가 후보는 정상 견적 중 최저 단가 공급사로 자동 선정됩니다.
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">공급사</th>
                  <th className="py-3 px-4 text-right">단가 (KRW)</th>
                  <th className="py-3 px-4 text-center">중앙값 대비 편차</th>
                  <th className="py-3 px-4 text-center">단가 판정</th>
                  <th className="py-3 px-4">약속 납기</th>
                  <th className="py-3 px-4 text-center">납기 판정</th>
                  <th className="py-3 px-4 text-center">상태 변경</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prQuotes.map(q => (
                  <tr key={q.quote_id} className={q.isLowest ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}>
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span>{q.supplier}</span>
                      {q.isLowest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                          최저가 후보
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {q.unit_price !== null ? `${q.unit_price.toLocaleString()}원` : <span className="text-slate-400 italic">미기재</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {q.deviation !== null ? (
                        <span className={q.priceState === '이상치' ? 'text-orange-600 font-bold' : 'text-slate-600'}>
                          {q.deviation > 0 ? `+${q.deviation}%` : `${q.deviation}%`}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        q.priceState === '이상치' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        q.priceState === '정상' ? 'bg-slate-100 text-slate-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {q.priceState}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div>{q.promised_date || <span className="text-slate-400 italic">미기재</span>}</div>
                      {q.dDays !== null && (
                        <div className="text-[11px] font-semibold mt-0.5 text-slate-500">
                          {q.dDays === 0 ? 'D-DAY' : q.dDays > 0 ? `D-${q.dDays}` : `D+${Math.abs(q.dDays)} 지연`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {q.status === '발주' ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          q.deliveryState === '지연' ? 'bg-rose-100 text-rose-700' :
                          q.deliveryState === '임박' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {q.deliveryState}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">견적대기</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleStatus(q.quote_id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          q.status === '발주'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {q.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
