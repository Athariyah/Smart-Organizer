import React, { useState } from 'react';
import { User, Mail, Lock, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import { Profession, UserProfile } from '../types';
import { BrandLogo } from '../components/BrandLogo';

interface RegisterViewProps {
  onNavigate: (route: string) => void;
  onRegisterSuccess?: (newUserProfile: UserProfile) => void;
  onRegister?: (user: any) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate, onRegisterSuccess, onRegister }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState<Profession>('designer');
  const [isSelfEmployed, setIsSelfEmployed] = useState(true);
  const [inn, setInn] = useState('');
  const [phone, setPhone] = useState('+7 (999) 000-00-00');
  const [telegram, setTelegram] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      fullName,
      occupation: profession === 'designer' ? 'Дизайнер интерфейсов & UI/UX' : 'Фрилансер',
      profession,
      isSelfEmployed,
      inn: inn || '772800000000',
      phone: phone || '+7 (999) 000-00-00',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      socialLinks: {
        telegram: telegram ? `https://t.me/${telegram.replace('@', '')}` : undefined
      },
      bankDetails: {
        bankName: 'АО "Т-Банк"',
        bik: '044525974',
        accountNumber: '40802810400009999999',
        corrAccount: '30101810145250000974'
      },
      invoiceSettings: {
        defaultNotes: 'Оплата производится по НПД. Чек высылается сразу после поступления средств.',
        paymentInstructions: 'Перевод по СБП на номер телефона.',
        colorTheme: '#2C3E50'
      }
    };

    if (onRegister) {
      onRegister({
        id: newProfile.id || `usr_${Date.now()}`,
        email: newProfile.email,
        fullName: newProfile.fullName,
        profession: newProfile.profession,
        isSelfEmployed: newProfile.isSelfEmployed
      });
    }
    if (onRegisterSuccess) {
      onRegisterSuccess(newProfile);
    }
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo size={52} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Регистрация Фрилансера
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Создайте профиль и начните выставлять счета за 2 минуты
          </p>
        </div>

        <div className="custom-card p-6 sm:p-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                ФИО фрилансера *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иванов Иван Сергеевич"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.ru"
                  required
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Пароль *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Сфера деятельности
                </label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value as Profession)}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                >
                  <option value="designer">Дизайнер (UI/UX, Графика)</option>
                  <option value="developer">Разработчик (Web, Mobile)</option>
                  <option value="copywriter">Копирайтер / Редактор</option>
                  <option value="marketer">Маркетолог / SMM</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  ИНН (опционально)
                </label>
                <input
                  type="text"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  placeholder="12 цифр ИНН"
                  maxLength={12}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>
            </div>

            <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block text-[var(--text-primary)]">
                  Статус Самозанятого (НПД)
                </span>
                <span className="text-[11px] text-slate-500">
                  Автоматический расчет 4% от физлиц / 6% от юрлиц
                </span>
              </div>
              <input
                type="checkbox"
                checked={isSelfEmployed}
                onChange={(e) => setIsSelfEmployed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 accent-[#E67E22]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Зарегистрироваться</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Уже зарегистированы?{' '}
              <button
                onClick={() => onNavigate('/login')}
                className="text-[#E67E22] font-semibold hover:underline cursor-pointer"
              >
                Войти
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
