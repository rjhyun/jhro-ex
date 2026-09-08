import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lock, Mail, Key, AlertCircle, ArrowRight, Shield, Database } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (userEmail: string) => void;
  onBypassDemo: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onBypassDemo }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase 환경 변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다. 데모 체험 모드를 이용해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          alert('회원가입이 완료되었습니다. 이메일 인증 또는 로그인 후 이용해 주세요.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user.email || email);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">구매 견적 비교·납기 판정기</h2>
          <p className="text-xs text-blue-100 mt-1">인가된 사용자 전용 시큐어 시스템 (Supabase Auth)</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-800 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Supabase 미설정 상태:</strong> Supabase 프로젝트가 연결되지 않았습니다. 아래의 <strong>[데모 체험 모드로 바로 시작]</strong> 버튼을 누르거나 .env 파일에 환경변수를 설정하세요.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">이메일 주소</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">비밀번호</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <span>{loading ? '처리 중...' : isSignUp ? '회원가입 및 등록' : '로그인'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="hover:text-blue-600 font-medium"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBypassDemo}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5"
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>데모 체험 모드로 바로 시작하기</span>
            </button>
          </div>
        </form>

        {/* Supabase SQL Schema Guide for User */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">📌 Supabase SQL 테이블 생성 가이드</p>
          <p>Supabase SQL Editor에서 아래 쿼리를 실행하여 <code className="bg-slate-200 px-1 py-0.5 rounded">quotes</code> 테이블을 생성하세요 (데이터 누적 저장용).</p>
        </div>
      </div>
    </div>
  );
};
