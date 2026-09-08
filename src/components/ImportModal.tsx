import React, { useState } from 'react';
import { X, Upload, FileText, Check } from 'lucide-react';
import { QuoteItem } from '../types';
import { parseCSVData } from '../utils/evaluator';

interface ImportModalProps {
  onImport: (quotes: QuoteItem[]) => void;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose }) => {
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<QuoteItem[] | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSVData(text);
        setParsedPreview(parsed);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handlePasteProcess = () => {
    if (!pasteText.trim()) return;
    const parsed = parseCSVData(pasteText);
    setParsedPreview(parsed);
  };

  const handleConfirmImport = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onImport(parsedPreview);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            견적 데이터 반입 (CSV 업로드 / 텍스트 붙여넣기)
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">
                {fileName ? `선택된 파일: ${fileName}` : 'CSV 파일 업로드하기'}
              </span>
              <span className="text-slate-400 mt-1">UTF-8 인코딩 쉼표 구분 CSV 파일 지원</span>
            </label>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 font-semibold">또는 텍스트 붙여넣기</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Text Paste Section */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              CSV 형식 텍스트 직접 입력 또는 붙여넣기
            </label>
            <textarea
              rows={5}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="quote_id,pr_no,item_code,item_name,supplier,unit,qty,unit_price,currency,quote_date,required_date,promised_date,status,remark..."
              className="w-full p-3 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handlePasteProcess}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
              >
                텍스트 파싱 미리보기
              </button>
            </div>
          </div>

          {/* Preview Result */}
          {parsedPreview && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>총 <strong className="font-bold">{parsedPreview.length}건</strong>의 견적 데이터가 성공적으로 파싱되었습니다.</span>
              </div>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
              >
                데이터 적용하기
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
