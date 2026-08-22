import React, { useState } from 'react';
import {
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Calculator,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Clock,
  HelpCircle,
  BarChart3,
  Check,
  Globe,
  Sun,
  Moon,
  LayoutDashboard,
  Shield,
  QrCode,
  FileSpreadsheet
} from 'lucide-react';
import { UserProfile } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import { useLanguage } from '../context/LocalizationContext';

interface LandingViewProps {
  onNavigate: (route: string) => void;
  userProfile?: UserProfile;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  userProfile,
  isDarkMode,
  onToggleDarkMode
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  // Live NPD Tax Calculator states
  const [indIncome, setIndIncome] = useState<number>(65000);
  const [legIncome, setLegIncome] = useState<number>(145000);
  const [applyDeduction, setApplyDeduction] = useState<boolean>(true);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Tax calculations
  const standardTaxInd = indIncome * 0.04;
  const standardTaxLeg = legIncome * 0.06;
  const standardTotalTax = standardTaxInd + standardTaxLeg;

  const discountedTaxInd = indIncome * 0.03;
  const discountedTaxLeg = legIncome * 0.04;
  const discountedTotalTax = discountedTaxInd + discountedTaxLeg;

  const totalIncome = indIncome + legIncome;
  const totalTax = applyDeduction ? discountedTotalTax : standardTotalTax;
  const annualLimitPercent = Math.min(100, Math.round(((totalIncome * 12) / 2400000) * 100));

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Features list
  const featuresList = [
    {
      icon: FileText,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      title: t('auto.officialinvoiceswithqr'),
      description:
        language === 'ru'
          ? 'Мгновенная генерация счетов со всеми реквизитами самозанятого, автоматической суммой прописью, факсимиле подписи и печатью. Встроенный QR-код по ГОСТ Р 56042-2014 для моментальной оплаты в мобильных приложениях Сбер, Т-Банк, ВТБ.'
          : 'Instant invoice generation with complete self-employed requisites, words-amount, facsimile signature, and official banking QR code for immediate payment via mobile banking.',
      route: '/invoices',
      ctaText: t('auto.viewinvoices'),
      badge: t('auto.gostqrcode')
    },
    {
      icon: Calculator,
      iconColor: 'text-[#E67E22]',
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      title: t('auto.autocalculatednpdtax4'),
      description:
        language === 'ru'
          ? 'Автоматическое разделение контрагентов на физлиц (ставка 4%) и юрлиц/ИП (ставка 6%). Учет налогового вычета 10 000 ₽ со снижением до 3% и 4%, контроль дедлайна уплаты до 28 числа месяца и экспорт отчетов.'
          : 'Automatic counterparty classification into Individuals (4%) and Companies (6%). Accounting for the 10,000 ₽ tax bonus, 2.4M ₽ annual limit tracking, and payment reminders.',
      route: '/taxes',
      ctaText: t('auto.calculatetax'),
      badge: t('auto.422fztaxlaw')
    },
    {
      icon: Users,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      title: t('auto.clientcrmltv'),
      description:
        language === 'ru'
          ? 'Удобная картотека заказчиков с хранением ИНН, контактов, реквизитов и полной истории взаиморасчетов. Автоматический расчет общей выручки (LTV) по каждому клиенту и заметки со встреч.'
          : 'Structured client directory storing Tax IDs, contacts, bank requisites, settlement history, client meeting summaries, and automatic lifetime revenue (LTV) analytics.',
      route: '/clients',
      ctaText: t('auto.viewcrmdatabase'),
      badge: t('auto.crm360')
    },
    {
      icon: Calendar,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      title: t('auto.meetingcalendarslot'),
      description:
        language === 'ru'
          ? 'Планирование консультаций, звонков и важных дедлайнов с цветовой индикацией. Публичная ссылка для быстрой записи клиентов на свободные слоты без долгих согласований в мессенджерах.'
          : 'Schedule consultations, sync important deadlines with color-coding, and share your personalized booking link so clients can reserve slots directly.',
      route: '/calendar',
      ctaText: t('auto.opencalendar'),
      badge: language === 'ru' ? 'Онлайн-запись' : 'Online Booking'
    },
    {
      icon: CheckSquare,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      title: t('auto.kanbanprojecttask'),
      description:
        language === 'ru'
          ? 'Наглядное ведение проектов по стадиям: «К выполнению», «В работе», «Завершено». Привязка задач к заказчикам, чек-листы подзадач с прогресс-баром и учет затраченного времени.'
          : 'Intuitive task management with drag-and-drop kanban stages, client linkage, nested subtask checklists with animated progress indicators, and hours tracking.',
      route: '/tasks',
      ctaText: t('auto.gototasks'),
      badge: 'Agile Kanban'
    },
    {
      icon: TrendingUp,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
      title: t('auto.analyticsactshourly'),
      description:
        language === 'ru'
          ? 'Калькулятор реальной себестоимости рабочего часа с учетом налогов, отпусков и накладных расходов. Мгновенная печать официальных актов выполненных работ и финансовая аналитика.'
          : 'Real hourly rate cost calculator factoring in taxes, paid time-off, and business expenses. Instant work completion act generator and exportable financial reports.',
      route: '/analytics',
      ctaText: t('auto.viewanalytics'),
      badge: language === 'ru' ? 'Калькулятор часа' : 'Hourly Rate Calc'
    }
  ];

  const workflowSteps = [
    {
      num: '01',
      title: t('auto.addclientdetails'),
      desc:
        language === 'ru'
          ? 'Укажите ИНН или имя клиента. Система моментально определит статус (физлицо или юрлицо) и установит корректную ставку налога (4% или 6%).'
          : 'Enter Tax ID or name. The system identifies client category (individual or legal entity) and automatically assigns the 4% or 6% tax rate.'
    },
    {
      num: '02',
      title: t('auto.generateinvoicewithqr'),
      desc:
        language === 'ru'
          ? 'Добавьте список услуг в пару кликов. Органайзер сгенерирует готовый PDF-счет с банковским QR-кодом и публичную веб-ссылку для отправки заказчику.'
          : 'Add service line items in seconds. Get an official PDF invoice containing a standard banking QR code and a shareable web payment link.'
    },
    {
      num: '03',
      title: t('auto.trackpaymentnpd'),
      desc:
        language === 'ru'
          ? 'При поступлении средств отметьте счет оплаченным. Налог НПД рассчитается автоматически, а шкала годового лимита 2.4 млн ₽ обновит статус.'
          : 'Mark the invoice as paid upon receiving payment. NPD tax is calculated instantly and added to your tax budget and annual revenue meter.'
    }
  ];

  const faqItems = [
    {
      q: t('auto.istheservicecompliant'),
      a:
        language === 'ru'
          ? 'Да, все создаваемые счета и акты полностью соответствуют требованиям законодательства РФ для плательщиков налога на профессиональный доход (НПД). Они содержат обязательные реквизиты, ИНН, основание платежа, банковские реквизиты и ГОСТ QR-код для мгновенной оплаты.'
          : 'Yes, all generated invoices and completion acts conform to Russian legislation standards for self-employed professionals, including required tax requisites and standard banking QR codes.'
    },
    {
      q: t('auto.howisthenpd'),
      a:
        language === 'ru'
          ? 'При поступлении оплаты от физических лиц применяется ставка 4%. При расчетах с юридическими лицами и индивидуальными предпринимателями — 6%. При наличии неизрасходованного налогового вычета 10 000 ₽ ставки снижаются до 3% и 4% соответственно.'
          : 'Payments from individuals are taxed at 4%, while payments from registered legal entities and sole proprietorships are taxed at 6%. The 10,000 ₽ initial tax deduction lowers these to 3% and 4% respectively.'
    },
    {
      q: t('auto.howdoesaclient'),
      a:
        language === 'ru'
          ? 'Клиенту достаточно открыть мобильное приложение своего банка (Сбер, Т-Банк, ВТБ, Альфа-Банк и др.), выбрать «Оплата по QR-коду» и навести камеру на счет. Все реквизиты, ИНН, номер счета и сумма заполнятся автоматически.'
          : 'The client simply opens their mobile banking application, selects QR payment, and scans the code. Requisites, bank account numbers, invoice ID, and amount populate automatically.'
    },
    {
      q: t('auto.whereismydata'),
      a:
        language === 'ru'
          ? 'Все ваши счета, клиенты, задачи и настройки хранятся в защищенном локальном хранилище вашего браузера и синхронизируются мгновенно. Ваши данные не передаются третьим лицам.'
          : 'All invoices, clients, tasks, and configurations are stored securely and privately in your workspace. You retain full control over your records and can export backups anytime.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--bg-main)] text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden selection:bg-[#E67E22]/30 selection:text-slate-900 dark:selection:text-white">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('/dashboard')}
          >
            <BrandLogo size={36} />
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white group-hover:text-[#E67E22] transition-colors">
                {t('auto.smartorganizer')}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider">
                {t('auto.freelanceworkspace')}
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-black text-slate-700 dark:text-slate-200">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#E67E22] transition-colors cursor-pointer"
            >
              {t('auto.features')}
            </button>
            <button
              onClick={() => scrollToSection('calculator')}
              className="hover:text-[#E67E22] transition-colors cursor-pointer"
            >
              {t('auto.taxcalculator')}
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="hover:text-[#E67E22] transition-colors cursor-pointer"
            >
              {t('auto.howitworks')}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#E67E22] transition-colors cursor-pointer"
            >
              {t('auto.faq')}
            </button>
          </nav>

          {/* Right actions: Theme, Dashboard CTA */}
          <div className="flex items-center space-x-2.5">
            {/* Direct Dashboard Button */}
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-2 bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t('landing.toDashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-12 sm:py-20 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-surface)] via-[var(--bg-main)] to-[var(--bg-main)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-xs font-black shadow-xs">
                <Sparkles className="w-4 h-4 shrink-0 text-[#E67E22]" />
                <span>{t('landing.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                {language === 'ru' ? (
                  <>
                    Счета, клиенты и{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E67E22] via-[#F39C12] to-[#D35400]">
                      налог НПД
                    </span>{' '}
                    в едином рабочем пространстве
                  </>
                ) : (
                  <>
                    Invoices, clients, and{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E67E22] via-[#F39C12] to-[#D35400]">
                      NPD tax
                    </span>{' '}
                    in one unified workspace
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl font-semibold">
                {t('landing.heroDesc')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="px-6 py-3.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-black text-sm rounded-xl shadow-lg transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>{t('landing.startFree')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('/invoices/create')}
                  className="px-5 py-3.5 bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer flex items-center space-x-2 shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#E67E22]" />
                  <span>{t('landing.createQuick')}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('auto.422fzcompliant')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('auto.gostbankqr')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('auto.100privatelocal')}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Live Tax Simulator Widget */}
            <div className="lg:col-span-5" id="calculator">
              <div className="custom-card p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden border border-slate-300 dark:border-slate-700">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#E67E22] border border-amber-300 dark:border-amber-700/60">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        {t('taxes.calcTitle')}
                      </h3>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        {t('auto.realtimeinteractivecalculation')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center space-x-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Live</span>
                  </span>
                </div>

                {/* Slider 1: Individual Income */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>{t('taxes.fromInd')} {applyDeduction ? '(3%)' : '(4%)'}:</span>
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                      {indIncome.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={indIncome}
                    onChange={(e) => setIndIncome(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
                  />
                </div>

                {/* Slider 2: Legal Income */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      <span>{t('taxes.fromLeg')} {applyDeduction ? '(4%)' : '(6%)'}:</span>
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                      {legIncome.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="5000"
                    value={legIncome}
                    onChange={(e) => setLegIncome(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#E67E22]"
                  />
                </div>

                {/* Deduction Toggle Switch */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-black text-slate-900 dark:text-white block">
                      {t('taxes.deduction')}
                    </span>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                      {t('auto.lowersratesto3')}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyDeduction}
                      onChange={(e) => setApplyDeduction(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E67E22]"></div>
                  </label>
                </div>

                {/* Live Output KPI Box */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('taxes.totalIncome')}:
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                      {totalIncome.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline border-t border-amber-200 dark:border-amber-800/80 pt-2">
                    <div>
                      <span className="text-xs font-black text-[#E67E22] block">
                        {t('taxes.taxToPay')}:
                      </span>
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">
                        {applyDeduction
                          ? (t('auto.withdeductiondiscount'))
                          : (t('auto.standardrate'))}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-[#E67E22] font-mono">
                      {Math.round(totalTax).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                {/* Annual Limit Progress */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-black text-slate-800 dark:text-slate-200">
                    <span>{t('taxes.annualLimit')}</span>
                    <span className="font-mono">{annualLimitPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-[#E67E22] h-full rounded-full transition-all duration-300"
                      style={{ width: `${annualLimitPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('/taxes')}
                  className="w-full py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>{t('auto.opentaxcenter')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. 6 CORE FEATURE CARDS */}
      <section id="features" className="py-16 sm:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
            {t('auto.6in1toolkit')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'ru'
              ? 'Всё, что нужно для ведения практики самозанятого'
              : 'Everything you need to manage your freelance practice'}
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold">
            {language === 'ru'
              ? 'Забудьте о разрозненных таблицах, блокнотах и ручном составлении счетов. Органайзер автоматизирует рутину.'
              : 'Forget scattered spreadsheets and manual invoice writing. Smart Organizer handles your routine.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="custom-card p-6 flex flex-col justify-between space-y-4 border border-slate-300 dark:border-slate-700 hover:border-[#E67E22] transition-colors shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${feat.iconBg} ${feat.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => onNavigate(feat.route)}
                    className="text-xs font-black text-[#E67E22] hover:text-[#D35400] flex items-center space-x-1.5 cursor-pointer transition-colors group"
                  >
                    <span>{feat.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WORKFLOW STEPS */}
      <section id="workflow" className="py-16 sm:py-20 w-full bg-[var(--bg-surface)] border-y border-[var(--border-subtle)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black uppercase text-[#E67E22] tracking-wider">
              {t('auto.simpleprocess')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('auto.howyourdayworks')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowSteps.map((step, sIdx) => (
              <div
                key={sIdx}
                className="p-6 rounded-2xl bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 space-y-3 relative overflow-hidden shadow-xs"
              >
                <span className="text-4xl font-black text-[#E67E22]/30 font-mono block">
                  {step.num}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMPARISON SECTION */}
      <section className="py-16 sm:py-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('auto.whysmartorganizer')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold">
            {language === 'ru'
              ? 'Сравнение с ведением счетов в Excel или разрозненных блокнотах'
              : 'Comparison against manual spreadsheets and scattered notebooks'}
          </p>
        </div>

        <div className="custom-card overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md">
          <div className="grid grid-cols-2 divide-x divide-[var(--border-subtle)] text-xs sm:text-sm">
            
            {/* Manual spreadsheet column */}
            <div className="p-5 sm:p-7 space-y-4 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center space-x-2 font-black text-rose-600 dark:text-rose-400">
                <span className="text-sm uppercase tracking-wide">
                  {t('auto.excelmanual')}
                </span>
              </div>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300 font-semibold">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>{t('auto.manual46')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>{t('auto.noinstantbankingqr')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>{t('auto.misseddeadlinesandlate')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>{t('auto.nounifiedcrmor')}</span>
                </li>
              </ul>
            </div>

            {/* Smart Organizer column */}
            <div className="p-5 sm:p-7 space-y-4 bg-amber-50/40 dark:bg-amber-950/20">
              <div className="flex items-center space-x-2 font-black text-[#E67E22]">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm uppercase tracking-wide">
                  {t('auto.smartorganizer')}
                </span>
              </div>
              <ul className="space-y-3 text-slate-900 dark:text-white font-extrabold">
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('auto.auto46tax')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('auto.standardbankingqron')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('auto.24hoururgencyalerts')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('auto.fullcrmkanbanboard')}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="py-16 sm:py-20 w-full bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-black uppercase text-[#E67E22] tracking-wider">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('auto.frequentlyaskedquestions')}
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-card)] overflow-hidden transition-colors shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between space-x-4 cursor-pointer"
                  >
                    <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#E67E22] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold border-t border-[var(--border-subtle)] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="py-16 sm:py-20 w-full bg-gradient-to-br from-[#E67E22] via-[#F39C12] to-[#D35400] text-white text-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {language === 'ru'
              ? 'Готовы навести идеальный порядок в счетах и налогах?'
              : 'Ready to bring clarity to your invoices and taxes?'}
          </h2>
          <p className="text-sm sm:text-base text-amber-100 max-w-xl mx-auto font-semibold">
            {language === 'ru'
              ? 'Начните выставлять официальные счета и контролировать НПД прямо сейчас. Без кредитных карт и сложной настройки.'
              : 'Start issuing official invoices with QR-codes and monitoring your NPD taxes right now.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-8 py-3.5 bg-slate-900 text-white hover:bg-slate-800 font-black text-sm rounded-xl shadow-xl transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <span>{t('landing.toDashboard')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/invoices/create')}
              className="px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white font-black text-sm rounded-xl border border-white/40 transition-colors cursor-pointer flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t('landing.createQuick')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-8 w-full bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <BrandLogo size={28} />
            <span className="font-black text-slate-200">
              {t('auto.smartorganizerforselfemployed')}
            </span>
          </div>
          <p className="text-slate-400 text-center sm:text-right font-medium">
            © 2026 {t('auto.builtinaccordancewith')}
          </p>
        </div>
      </footer>
    </div>
  );
};

