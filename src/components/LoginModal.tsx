import React, { useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Lock, Mail, Key, AlertCircle, ArrowRight, Shield, Database, Settings, Check } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (userEmail: string) => void;
  onBypassDemo: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onBypassDemo }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());
  
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => localStorage.getItem('exs02.supabase_url') || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => localStorage.getItem('exs02.supabase_key') || '');
  const [configSaved, setConfigSaved] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('exs02.supabase_url', supabaseUrlInput.trim());
    localStorage.setItem('exs02.supabase_key', supabaseKeyInput.trim());
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
    setShowConfig(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase URL 및 Anon Key를 먼저 설정해 주세요. 또는 데모 체험 모드를 이용하실 수 있습니다.');
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const client = getSupabaseClient();
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          alert('회원가입이 완료되었습니다. 이메일 인증 또는 로그인 후 이용해 주세요.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user.email || email);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 중 오류가 발생했습니다. Supabase 설정과 계정 정보를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center shrink-0">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">구매 견적 비교·납기 판정기</h2>
          <p className="text-xs text-blue-100 mt-1">Supabase 인가 및 데이터베이스 연동 로그인</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Config Toggle Button */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-700 font-medium">
              <Settings className="w-4 h-4 text-blue-600" />
              <span>Supabase 연결 설정</span>
            </div>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
            >
              {showConfig ? '설정 닫기' : '설정 열기 ⚙️'}
            </button>
          </div>

          {/* Config Panel */}
          {showConfig && (
            <form onSubmit={handleSaveConfig} className="bg-slate-50 border border-blue-200 p-4 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Supabase 프로젝트 인증 정보 입력</h3>
              <p className="text-slate-500 text-[11px]">
                Supabase 대시보드(Project Settings &gt; API)에서 <code className="bg-slate-200 px-1 rounded">Project URL</code>과 <code className="bg-slate-200 px-1 rounded">anon public key</code>를 복사하여 입력하세요.
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supabase URL</label>
                <input
                  type="url"
                  placeholder="https://abcdefgh.supabase.co"
                  value={supabaseUrlInput}
                  onChange={e => setSupabaseUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={e => setSupabaseKeyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                {configSaved && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 설정 저장됨!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  설정 저장하기
                </button>
              </div>
            </form>
          )}

          {!isSupabaseConfigured() && !showConfig && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-800 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Supabase 미설정 상태:</strong> 위 <strong>[설정 열기]</strong>를 통해 Supabase URL과 키를 입력하거나, 아래 <strong>[데모 체험 모드]</strong>를 이용하세요.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1 mt-4">
            <p className="font-semibold text-slate-700">📌 Supabase SQL 테이블 생성 가이드</p>
            <p>Supabase SQL Editor에서 <code className="bg-slate-200 px-1 py-0.5 rounded">quotes</code> 테이블을 생성하여 데이터를 누적 저장하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
