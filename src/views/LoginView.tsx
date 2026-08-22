import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

interface LoginViewProps {
  onNavigate: (route: string) => void;
  onLoginSuccess?: (email: string) => void;
  onLogin?: (user: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onLoginSuccess, onLogin }) => {
  const [email, setEmail] = useState('alexey.design@organizer.ru');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetModal, setResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Пожалуйста, заполните email и пароль');
      return;
    }
    if (onLogin) {
      onLogin({
        id: 'usr_mock_1',
        email,
        fullName: 'Алексей Смирнов',
        profession: 'designer',
        isSelfEmployed: true
      });
    }
    if (onLoginSuccess) {
      onLoginSuccess(email);
    }
    onNavigate('/dashboard');
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setResetModal(false);
      setResetSuccess(false);
    }, 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo size={52} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Вход в Личный Кабинет
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Умный органайзер для самозанятых фрилансеров
          </p>
        </div>

        <div className="custom-card p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Электронная почта (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexey@example.ru"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  Пароль
                </label>
                <button
                  type="button"
                  onClick={() => setResetModal(true)}
                  className="text-xs text-[#E67E22] hover:underline font-medium"
                >
                  Забыли пароль?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 accent-[#E67E22]"
                />
                <span>Запомнить меня</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Войти</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ещё нет аккаунта?{' '}
              <button
                onClick={() => onNavigate('/register')}
                className="text-[#E67E22] font-semibold hover:underline cursor-pointer"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </div>

        {/* Demo Login Shortcut */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span className="flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 shrink-0 text-[#E67E22]" />
            Демо-аккаунт подготовлен
          </span>
          <button
            onClick={() => {
              if (onLogin) {
                onLogin({
                  id: 'usr_01',
                  email: 'alexey.design@organizer.ru',
                  fullName: 'Алексей Смирнов',
                  profession: 'designer',
                  isSelfEmployed: true
                });
              } else if (onLoginSuccess) {
                onLoginSuccess('alexey.design@organizer.ru');
              }
              onNavigate('/dashboard');
            }}
            className="px-2.5 py-1 bg-[#E67E22] text-white font-semibold rounded-md text-[11px] hover:bg-[#D35400] cursor-pointer"
          >
            Войти как Демо
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setResetModal(false)}
        >
          <div
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-[var(--text-primary)]">Восстановление пароля</h3>
            <p className="text-xs text-slate-500">Введите ваш email, и мы отправим ссылку для сброса пароля.</p>
            {resetSuccess ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ссылка успешно отправлена на {email}!</span>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]"
                  required
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-[#E67E22] text-white font-bold rounded-lg hover:bg-[#D35400]"
                  >
                    Отправить ссылку
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
