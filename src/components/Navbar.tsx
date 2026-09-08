import React from 'react';
import { FileSpreadsheet, Plus, RotateCcw, Download, Upload, ShieldCheck, Database } from 'lucide-react';

interface NavbarProps {
  totalCount: number;
  orderCount: number;
  delayCount: number;
  outlierCount: number;
  onOpenImport: () => void;
  onOpenAdd: () => void;
  onResetDefault: () => void;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  orderCount,
  delayCount,
  outlierCount,
  onOpenImport,
  onOpenAdd,
  onResetDefault,
  onExportCSV,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              구매 견적 비교·납기 판정기
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                PRD-S02 (기준일: 2026-08-27)
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              총 견적 <span className="font-semibold text-slate-700">{totalCount}건</span> · 발주완료 <span className="font-semibold text-slate-700">{orderCount}건</span>
              {delayCount > 0 && <span className="ml-2 text-rose-600 font-medium">납기지연 {delayCount}건</span>}
              {outlierCount > 0 && <span className="ml-2 text-amber-600 font-medium">단가이상치 {outlierCount}건</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenImport}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            title="CSV 파일 업로드 또는 텍스트 붙여넣기"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">반입/업로드</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>견적 등록</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            title="현재 데이터 CSV 다운로드"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">내보내기</span>
          </button>

          <button
            onClick={onResetDefault}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="기본 샘플 데이터(80행)로 초기화"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">기본 샘플 복원</span>
          </button>
        </div>
      </div>
    </header>
  );
};
