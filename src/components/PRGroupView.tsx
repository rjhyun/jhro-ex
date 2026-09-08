import React from 'react';
import { PRGroup } from '../types';
import { Layers, ExternalLink, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PRGroupViewProps {
  groups: PRGroup[];
  onSelectPR: (prNo: string) => void;
}

export const PRGroupView: React.FC<PRGroupViewProps> = ({ groups, onSelectPR }) => {
  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <p className="text-base font-medium">검색된 PR 그룹이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(group => {
        return (
          <div
            key={group.prNo}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-blue-300 transition-all"
          >
            {/* PR Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-sm">
                  {group.prNo}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {group.itemName}
                    <span className="text-xs font-normal text-slate-500 font-mono">({group.itemCode})</span>
                    {group.hasDiscrepancy && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        표기 상이
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    수량: <span className="font-semibold text-slate-700">{group.qty.toLocaleString()} {group.unit}</span> · 견적사 수: <span className="font-semibold text-slate-700">{group.quotes.length}개사</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {group.hasOrder ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 발주완료 ({group.orderCount}건)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    견적 접수중
                  </span>
                )}

                <button
                  onClick={() => onSelectPR(group.prNo)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span>비교 상세</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quotes list for this PR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.quotes.map(q => {
                return (
                  <div
                    key={q.quote_id}
                    className={`p-3 rounded-xl border text-xs relative ${
                      q.isLowest
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{q.supplier}</span>
                      <div className="flex items-center space-x-1">
                        {q.isLowest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            최저가
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          q.status === '발주' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-slate-500">단가:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {q.unit_price !== null ? `${q.unit_price.toLocaleString()}원` : '공란'}
                      </span>
                    </div>

                    {q.deviation !== null && (
                      <div className="flex items-baseline justify-between mt-1 text-[11px]">
                        <span className="text-slate-500">중앙값 대비:</span>
                        <span className={`font-semibold ${q.priceState === '이상치' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}>
                          {q.deviation > 0 ? `+${q.deviation}%` : `${q.deviation}%`}
                          {q.priceState === '이상치' && ' (이상치)'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline justify-between mt-1 text-[11px]">
                      <span className="text-slate-500">약속납기:</span>
                      <span className="font-mono text-slate-800">
                        {q.promised_date || '미기재'}
                        {q.dDays !== null && (
                          <span className={`ml-1 font-semibold ${
                            q.dDays < 0 ? 'text-rose-600' : q.dDays <= 7 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            ({q.dDays === 0 ? 'D-DAY' : q.dDays > 0 ? `D-${q.dDays}` : `D+${Math.abs(q.dDays)}`})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
