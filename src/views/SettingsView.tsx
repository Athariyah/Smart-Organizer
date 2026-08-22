import React, { useState } from 'react';
import {
  User,
  Building,
  CheckCircle2,
  Save,
  Moon,
  Sun,
  Palette,
  Bell,
  ShieldCheck,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Check,
  FileSpreadsheet,
  AlertTriangle,
  Image as ImageIcon,
  Sliders,
  Smartphone,
  Coins
} from 'lucide-react';
import { UserProfile, Profession, CurrencyCode } from '../types';
import { LOGO_PRESETS, BrandLogo } from '../components/BrandLogo';
import { CURRENCY_NAMES, CURRENCY_SYMBOLS } from '../utils/numberToWordsRu';
import { useLanguage } from '../context/LocalizationContext';
import { Globe } from 'lucide-react';

interface SettingsViewProps {
  userProfile?: UserProfile;
  profile?: UserProfile;
  theme?: 'light' | 'dark';
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleDarkMode?: () => void;
  onSaveProfile?: (profile: UserProfile) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  onResetData?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  profile,
  theme = 'light',
  isDarkMode = false,
  onToggleTheme,
  onToggleDarkMode,
  onSaveProfile,
  onUpdateProfile,
  onResetData
}) => {
  const { language, toggleLanguage, setLanguage, t } = useLanguage();
  const currentProfile: UserProfile = userProfile || profile || {
    id: 'usr_default',
    fullName: 'Алексей Смирнов',
    email: 'alexey.smirnov@example.com',
    occupation: 'Дизайнер интерфейсов & UI/UX',
    inn: '770123456789',
    phone: '+7 (999) 123-45-67',
    profession: 'designer',
    isSelfEmployed: true,
    avatar: AVATAR_PRESETS[0],
    bankDetails: {
      bankName: 'АО Тинькофф Банк',
      bik: '044525974',
      accountNumber: '40817810000000000000',
      corrAccount: '30101810145250000974'
    },
    invoiceSettings: {
      defaultVatRate: 0,
      defaultNotes: 'Без НДС. Налог на профессиональный доход (НПД).',
      prefix: 'СЧ',
      nextNumber: 3
    }
  };

  const [fullName, setFullName] = useState(currentProfile.fullName || '');
  const [email, setEmail] = useState(currentProfile.email || '');
  const [occupation, setOccupation] = useState(currentProfile.occupation || '');
  const [profession, setProfession] = useState<Profession>(currentProfile.profession || 'freelancer');
  const [inn, setInn] = useState(currentProfile.inn || '');
  const [phone, setPhone] = useState(currentProfile.phone || '');
  const [isSelfEmployed, setIsSelfEmployed] = useState(currentProfile.isSelfEmployed ?? true);
  const [avatar, setAvatar] = useState(currentProfile.avatar || AVATAR_PRESETS[0]);
  const [logoUrl, setLogoUrl] = useState(currentProfile.invoiceSettings?.logoUrl || LOGO_PRESETS[0].svgDataUri);

  // Bank details
  const [bankName, setBankName] = useState(currentProfile.bankDetails?.bankName || 'АО Т-Банк');
  const [bik, setBik] = useState(currentProfile.bankDetails?.bik || '044525974');
  const [accountNumber, setAccountNumber] = useState(currentProfile.bankDetails?.accountNumber || '40817810000000000000');
  const [corrAccount, setCorrAccount] = useState(currentProfile.bankDetails?.corrAccount || '30101810145250000974');

  // Invoice settings
  const [prefix, setPrefix] = useState(currentProfile.invoiceSettings?.prefix || 'СЧ');
  const [nextNumber, setNextNumber] = useState(currentProfile.invoiceSettings?.nextNumber || 1);
  const [currency, setCurrency] = useState<CurrencyCode>(
    currentProfile.currency || currentProfile.invoiceSettings?.currency || 'RUB'
  );
  const [defaultNotes, setDefaultNotes] = useState(
    currentProfile.invoiceSettings?.defaultNotes || 'Без НДС. Налог на профессиональный доход (НПД).'
  );

  // Notification toggles
  const [notifyTaxes, setNotifyTaxes] = useState(true);
  const [notifyInvoices, setNotifyInvoices] = useState(true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);

  // Toast / feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedRequisites, setCopiedRequisites] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleDarkMode = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else if (onToggleTheme) {
      onToggleTheme();
    }
  };

  const handleCopyRequisites = () => {
    const text = `РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ:
Получатель: ${fullName}
ИНН: ${inn}
Банк: ${bankName}
БИК: ${bik}
Расчетный счет: ${accountNumber}
Корр. счет: ${corrAccount}
Назначение платежа: Оплата по счету за оказанные услуги (Без НДС, НПД)`;

    try {
      navigator.clipboard.writeText(text);
      setCopiedRequisites(true);
      showToast('Реквизиты успешно скопированы в буфер обмена!');
      setTimeout(() => setCopiedRequisites(false), 2500);
    } catch {
      showToast('Реквизиты подготовлены для копирования');
    }
  };

  const handleExportBackup = () => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        profile: {
          fullName,
          email,
          occupation,
          profession,
          inn,
          phone,
          isSelfEmployed,
          avatar,
          bankDetails: { bankName, bik, accountNumber, corrAccount },
          invoiceSettings: { prefix, nextNumber, defaultNotes }
        },
        invoices: localStorage.getItem('smart_organizer_invoices')
          ? JSON.parse(localStorage.getItem('smart_organizer_invoices') || '[]')
          : [],
        clients: localStorage.getItem('smart_organizer_clients')
          ? JSON.parse(localStorage.getItem('smart_organizer_clients') || '[]')
          : [],
        tasks: localStorage.getItem('smart_organizer_tasks')
          ? JSON.parse(localStorage.getItem('smart_organizer_tasks') || '[]')
          : []
      };

      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organizer-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Файл резервной копии успешно скачан!');
    } catch (err) {
      console.error(err);
      showToast('Ошибка при экспорте данных');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.profile) {
          if (parsed.profile.fullName) setFullName(parsed.profile.fullName);
          if (parsed.profile.email) setEmail(parsed.profile.email);
          if (parsed.profile.inn) setInn(parsed.profile.inn);
          if (parsed.profile.phone) setPhone(parsed.profile.phone);
          if (parsed.profile.bankDetails) {
            setBankName(parsed.profile.bankDetails.bankName || '');
            setBik(parsed.profile.bankDetails.bik || '');
            setAccountNumber(parsed.profile.bankDetails.accountNumber || '');
            setCorrAccount(parsed.profile.bankDetails.corrAccount || '');
          }
        }

        if (parsed.invoices && Array.isArray(parsed.invoices)) {
          localStorage.setItem('smart_organizer_invoices', JSON.stringify(parsed.invoices));
        }
        if (parsed.clients && Array.isArray(parsed.clients)) {
          localStorage.setItem('smart_organizer_clients', JSON.stringify(parsed.clients));
        }
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          localStorage.setItem('smart_organizer_tasks', JSON.stringify(parsed.tasks));
        }

        showToast('Резервная копия успешно загружена! Обновите страницу для отображения всех объектов.');
      } catch {
        showToast('Неверный формат JSON файла бэкапа');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    setShowResetModal(false);
    if (onResetData) {
      onResetData();
    } else {
      localStorage.clear();
      window.location.reload();
    }
    showToast('Данные успешно сброшены к начальному состоянию!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...currentProfile,
      fullName,
      email,
      occupation,
      profession,
      inn,
      phone,
      isSelfEmployed,
      avatar,
      currency,
      bankDetails: {
        bankName,
        bik,
        accountNumber,
        corrAccount
      },
      invoiceSettings: {
        defaultVatRate: 0,
        currency,
        prefix,
        nextNumber: Number(nextNumber) || 1,
        defaultNotes,
        logoUrl
      }
    };

    if (onSaveProfile) onSaveProfile(updatedProfile);
    if (onUpdateProfile) onUpdateProfile(updatedProfile);
    showToast('Все настройки и реквизиты успешно сохранены!');
  };

  const isDarkActive = isDarkMode || theme === 'dark';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Настройки и Реквизиты
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 font-medium">
            Управление личным профилем, банковскими счетами, шаблонами документов и данными
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyRequisites}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            {copiedRequisites ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#E67E22]" />}
            <span>{copiedRequisites ? 'Скопировано!' : 'Скопировать реквизиты'}</span>
          </button>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-[var(--text-primary)] rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 2: Personal Profile & Avatar */}
        <div className="custom-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <span>Личные данные самозанятого</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
              НПД Статус активен
            </span>
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Аватар профиля
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={avatar}
                alt="Avatar"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E67E22] shadow-sm"
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(p)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 cursor-pointer transition-transform hover:scale-105 ${
                        avatar === p ? 'border-[#E67E22] ring-2 ring-amber-400/50' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">Выберите готовый аватар или укажите ссылку на фото</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                ФИО Самозанятого (как в паспорте) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Смирнов Алексей Владимирович"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Email для уведомлений и счетов *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="alexey@design.ru"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Телефон (привязан к СБП)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                ИНН физлица (12 цифр для чеков ФНС) *
              </label>
              <input
                type="text"
                value={inn}
                onChange={(e) => setInn(e.target.value.replace(/\D/g, ''))}
                maxLength={12}
                placeholder="770123456789"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Сфера деятельности / Специализация
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value as Profession)}
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              >
                <option value="designer">Дизайн (UI/UX, Веб, Брендинг, 3D)</option>
                <option value="developer">Разработка ПО (Frontend, Backend, Mobile)</option>
                <option value="copywriter">Копирайтинг / Редактор / Переводы</option>
                <option value="marketer">Маркетинг / Таргет / SMM / SEO</option>
                <option value="freelancer">Консалтинг и частная практика</option>
                <option value="other">Другой вид деятельности</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Название должности (отображается в документах)
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Дизайнер интерфейсов & UI/UX"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank Requisites */}
        <div className="custom-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <Building className="w-5 h-5 text-emerald-500" />
              <span>Банковские реквизиты для получения платежей</span>
            </h3>
            <button
              type="button"
              onClick={handleCopyRequisites}
              className="text-xs text-[#E67E22] hover:text-[#D35400] font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Скопировать реквизиты</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Наименование банка получателя
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="АО 'Т-Банк' г. Москва"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                БИК Банка (9 цифр)
              </label>
              <input
                type="text"
                value={bik}
                onChange={(e) => setBik(e.target.value.replace(/\D/g, ''))}
                maxLength={9}
                placeholder="044525974"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono font-bold text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Расчетный счет самозанятого (20 цифр)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={20}
                placeholder="40817810000000000000"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono font-bold text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Корреспондентский счет банка
              </label>
              <input
                type="text"
                value={corrAccount}
                onChange={(e) => setCorrAccount(e.target.value.replace(/\D/g, ''))}
                maxLength={20}
                placeholder="30101810145250000974"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono font-bold text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Invoicing & Document Preferences */}
        <div className="custom-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <span>Параметры счетов, логотип и формулировки для ФНС</span>
            </h3>
          </div>

          {/* Professional Logo Selector */}
          <div className="space-y-3 p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[var(--text-primary)] flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-[#E67E22]" />
                  <span>Фирменный логотип для профиля и счетов (PDF)</span>
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Отображается в шапке генерируемых счетов, квитанций и на странице оплаты
                </p>
              </div>
              <BrandLogo logoUrl={logoUrl} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {LOGO_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setLogoUrl(preset.svgDataUri)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center space-x-3 ${
                    logoUrl === preset.svgDataUri
                      ? 'border-[#E67E22] bg-amber-50/60 dark:bg-slate-800 shadow-xs'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-slate-300'
                  }`}
                >
                  <img src={preset.svgDataUri} alt={preset.name} className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[var(--text-primary)] truncate">{preset.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">{preset.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Currency Switcher Setting */}
            <div className="sm:col-span-2 p-3.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm text-[var(--text-primary)]">Основная валюта счетов и расчетов</span>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300">
                  {CURRENCY_SYMBOLS[currency]} {currency}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                Применяется для отображения сумм в реестре счетов, калькуляторе налогов и формируемых документах
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {(['RUB', 'USD', 'EUR', 'KZT', 'BYN', 'CNY'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                      currency === c
                        ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-sm'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-amber-400'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{CURRENCY_SYMBOLS[c]}</span>
                    <span className="text-[10px] uppercase font-bold">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Префикс номера счета
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="СЧ"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Следующий порядковый номер
              </label>
              <input
                type="number"
                min="1"
                value={nextNumber}
                onChange={(e) => setNextNumber(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                Стандартное примечание в счете (указание НПД)
              </label>
              <textarea
                value={defaultNotes}
                onChange={(e) => setDefaultNotes(e.target.value)}
                rows={2}
                placeholder="Без НДС. Исполнитель применяет специальный налоговый режим 'Налог на профессиональный доход' (НПД)."
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Notification Reminders */}
        <div className="custom-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>Напоминания и уведомления органайзера</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)]">
              <div>
                <p className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Напоминание об уплате налога НПД (до 25 числа)</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Автоматическое предупреждение за 5 дней до наступления крайнего срока</p>
              </div>
              <input
                type="checkbox"
                checked={notifyTaxes}
                onChange={(e) => setNotifyTaxes(e.target.checked)}
                className="w-5 h-5 accent-[#E67E22] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)]">
              <div>
                <p className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Контроль просрочки счетов клиентами</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Уведомление при превышении срока оплаты счета</p>
              </div>
              <input
                type="checkbox"
                checked={notifyInvoices}
                onChange={(e) => setNotifyInvoices(e.target.checked)}
                className="w-5 h-5 accent-[#E67E22] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)]">
              <div>
                <p className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Дедлайны задач и встреч в календаре</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Оповещение о предстоящих дедлайнах из Канбан-доски</p>
              </div>
              <input
                type="checkbox"
                checked={notifyDeadlines}
                onChange={(e) => setNotifyDeadlines(e.target.checked)}
                className="w-5 h-5 accent-[#E67E22] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Integrations & API Keys */}
        <div className="custom-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[#3B82F6]" />
              <span>Developer Integrations (GitHub, Jira, Trello)</span>
            </h3>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1 text-sm flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">GH</span>
                <span>GitHub Personal Access Token</span>
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono text-sm text-[var(--text-primary)]"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Используется для автоматического импорта коммитов в качестве Work Logs.</p>
            </div>
            
            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1 text-sm flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">J</span>
                <span>Jira API Token</span>
              </label>
              <input
                type="password"
                placeholder="ATATT3xFfGF0xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono text-sm text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1 text-sm flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">T</span>
                <span>Trello API Key & Token</span>
              </label>
              <input
                type="password"
                placeholder="Ваш Trello API ключ..."
                className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Section 6.5: VS Code Webhook Snippet */}
        <div className="custom-card p-5 sm:p-6 space-y-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              <span>Documentation</span>
            </h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{t('auto.addthissnippetto')}<code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">.vscode/settings.json</code>{t('auto.forautomaticdispatchof')}</p>
          <div className="relative group">
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[10px] sm:text-xs overflow-x-auto font-mono">
{`"editorSync.webhook": {
  "url": "https://your-api.domain.com/api/work-logs",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
  },
  "payload": {
    "developer_id": "usr-1",
    "workspace": "\${workspaceFolder}",
    "branch": "\${git.branch}",
    "timestamp": "\${timestamp}"
  },
  "trigger": "onSave"
}`}
            </pre>
            <button 
              type="button"
              onClick={() => alert((t('auto.snippetcopiedtoclipboard')))}
              className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </div>

        {/* Section 7: Data Backup, Export & Reset */}
        <div className="custom-card p-5 sm:p-6 space-y-4 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Резервное копирование и управление данными</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-4 h-4 text-[#E67E22]" />
              <span>Экспорт всех данных (JSON)</span>
            </button>

            <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700">
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Импорт данных из JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer border border-rose-500/20"
            >
              <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Сбросить данные к демо-состоянию</span>
            </button>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold text-sm rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Save className="w-5 h-5 text-white" />
            <span>Сохранить все настройки</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Сбросить данные к демо-состоянию?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Это действие восстановит исходные демонстрационные счета, задачи, базу клиентов и налоговые расчеты.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-semibold text-xs rounded-xl cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Да, сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
