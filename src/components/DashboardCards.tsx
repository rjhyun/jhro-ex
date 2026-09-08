import React from 'react';
import { AlertCircle, Clock, AlertTriangle, FileText, HelpCircle, CheckCircle } from 'lucide-react';
import { EvaluatedQuote, FilterState } from '../types';

interface DashboardCardsProps {
  quotes: EvaluatedQuote[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ quotes, filter, setFilter }) => {
  const delayCount = quotes.filter(q => q.deliveryState === '지연').length;
  const imminentCount = quotes.filter(q => q.deliveryState === '임박').length;
  const outlierCount = quotes.filter(q => q.priceState === '이상치').length;
  const discrepancyCount = quotes.filter(q => q.isNameDiscrepant).length;
  const missingCount = quotes.filter(q => q.unit_price === null || q.promised_date === null).length;
  const normalDeliveryCount = quotes.filter(q => q.deliveryState === '정상').length;

  const handleCardClick = (warningType: FilterState['warningFilter']) => {
    if (filter.warningFilter === warningType) {
      setFilter(prev => ({ ...prev, warningFilter: 'all' }));
    } else {
      setFilter(prev => ({ ...prev, warningFilter: warningType }));
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 지연 */}
      <div
        onClick={() => handleCardClick('지연')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          filter.warningFilter === '지연' ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">납기 지연</span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-600">{delayCount}</div>
        <p className="text-[11px] text-slate-400 mt-1">약속일이 기준일 경과</p>
      </div>

      {/* 임박 */}
      <div
        onClick={() => handleCardClick('임박')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          filter.warningFilter === '임박' ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">납기 임박 (7일 내)</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-amber-600">{imminentCount}</div>
        <p className="text-[11px] text-slate-400 mt-1">D-Day ~ D-7 발주건</p>
      </div>

      {/* 이상치 */}
      <div
        onClick={() => handleCardClick('이상치')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          filter.warningFilter === '이상치' ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">단가 이상치</span>
          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-orange-600">{outlierCount}</div>
        <p className="text-[11px] text-slate-400 mt-1">중앙값 대비 ±30% 초과</p>
      </div>

      {/* 표기 상이 */}
      <div
        onClick={() => handleCardClick('표기상이')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          filter.warningFilter === '표기상이' ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">품목명 표기상이</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-600">{discrepancyCount}</div>
        <p className="text-[11px] text-slate-400 mt-1">동일 코드 명칭 상이</p>
      </div>

      {/* 결측/미기재 */}
      <div
        onClick={() => handleCardClick('결측')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          filter.warningFilter === '결측' ? 'border-slate-500 ring-2 ring-slate-200 bg-slate-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">단가·납기 미기재</span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-700">{missingCount}</div>
        <p className="text-[11px] text-slate-400 mt-1">공란 견적 및 납기</p>
      </div>

      {/* 정상 납기 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">정상 납기 (발주)</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600">{normalDeliveryCount}</div>
        <p className="text-[11px] text-slate-400 mt-1">D+8 이상 안정적</p>
      </div>
    </div>
  );
};
