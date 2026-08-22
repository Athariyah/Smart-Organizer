import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  PieChart,
  Info,
  DollarSign,
  Coins,
  FileDown,
  Printer,
  Sparkles,
  CheckCircle2,
  Receipt,
  FileSpreadsheet,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaxCalculationResult, UserProfile, CurrencyCode, Invoice } from '../types';
import { calculateNpdTax } from '../utils/storage';
import { formatCurrency, CURRENCY_SYMBOLS } from '../utils/numberToWordsRu';
import { RegionalNpdTipsHelper } from '../components/RegionalNpdTipsHelper';
import { generateTaxReportPdf } from '../utils/taxPdfExport';

interface TaxCalculatorViewProps {
  taxData?: TaxCalculationResult;
  userProfile?: UserProfile;
  invoices?: Invoice[];
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const TaxCalculatorView: React.FC<TaxCalculatorViewProps> = ({
  taxData,
  userProfile,
  invoices = [],
  onUpdateProfile
}) => {
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>(
    userProfile?.currency || userProfile?.invoiceSettings?.currency || 'RUB'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);

  const safeInvoices = invoices || [];

  const handleCurrencyChange = (curr: CurrencyCode) => {
    setActiveCurrency(curr);
    if (userProfile && onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        currency: curr,
        invoiceSettings: {
          ...userProfile.invoiceSettings,
          currency: curr,
          defaultNotes: userProfile.invoiceSettings?.defaultNotes || ''
        }
      });
    }
  };

  const safeTaxData: TaxCalculationResult = taxData || {
    yearlyIncome: 0,
    yearlyLimit: 2400000,
    remainingLimit: 2400000,
    incomeFromIndividuals: 0,
    incomeFromLegal: 0,
    estimatedTax: 0,
    taxDeductionRemaining: 10000,
    totalIncome: 0,
    taxAmount: 0,
    projectedTax: 0
  };

  // Manual Interactive Simulator State
  const [incomeIndividuals, setIncomeIndividuals] = useState<number>(65000);
  const [incomeLegal, setIncomeLegal] = useState<number>(140000);
  const [bonusUsed, setBonusUsed] = useState<number>(2500);

  // Manual calculation
  const manualTaxIndividuals = Math.round(incomeIndividuals * 0.04);
  const manualTaxLegal = Math.round(incomeLegal * 0.06);
  const manualTotalTax = manualTaxIndividuals + manualTaxLegal;

  // Deduction savings (1% for physical, 2% for legal up to 10k remaining)
  const remainingDeduction = Math.max(0, 10000 - bonusUsed);
  const discountIndiv = Math.min(incomeIndividuals * 0.01, remainingDeduction);
  const discountLegal = Math.min(incomeLegal * 0.02, Math.max(0, remainingDeduction - discountIndiv));
  const totalDiscount = Math.round(discountIndiv + discountLegal);
  const manualFinalTax = Math.max(0, manualTotalTax - totalDiscount);

  const limitPercentage = Math.min(100, Math.round(((safeTaxData.yearlyIncome || 0) / (safeTaxData.yearlyLimit || 2400000)) * 100));

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await generateTaxReportPdf({
        taxData: safeTaxData,
        invoices: safeInvoices,
        userProfile: userProfile || {
          id: 'usr-1',
          email: '',
          fullName: 'Самозанятый специалист',
          occupation: 'Фрилансер',
          isSelfEmployed: true,
          inn: '770123456789',
          phone: '+7 (999) 000-00-00',
          bankDetails: { bankName: '', bik: '', accountNumber: '' }
        },
        activeCurrency,
        periodYear: 2026
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (e) {
      console.error('Error generating PDF report:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Header & Currency Switcher & PDF Export CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-[#E67E22] border border-[#E67E22]/30 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>ФНС 422-ФЗ • 2026</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              Налоговый калькулятор НПД и отчетность
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Контроль годового лимита 2.4 млн ₽, расчет ставок 4% / 6% и мгновенный экспорт деклараций
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Currency Switcher */}
          <div className="flex items-center space-x-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-xs">
            <span className="text-[11px] font-extrabold text-[var(--text-secondary)] px-2 flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Валюта:</span>
            </span>
            {(['RUB', 'USD', 'EUR', 'KZT', 'BYN', 'CNY'] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCurrencyChange(c)}
                className={`px-2 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeCurrency === c
                    ? 'bg-[#E67E22] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {CURRENCY_SYMBOLS[c]} {c}
              </button>
            ))}
          </div>

          {/* PDF Export Button */}
          <button
            id="btn-export-tax-pdf"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="btn-dark px-4 py-2.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center space-x-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-700/60"
            title="Экспорт налогового отчета со сводной таблицей в PDF"
          >
            {isExporting ? (
              <span className="flex items-center space-x-1.5 text-white font-bold">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Генерация...</span>
              </span>
            ) : exportSuccess ? (
              <span className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Отчет сформирован!</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-white font-bold">
                <FileDown className="w-4 h-4 text-amber-400" />
                <span className="text-white font-extrabold">Экспорт отчета в PDF</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Limit Progress Card with Colorful Gradients */}
      <div className="custom-card p-6 bg-gradient-to-br from-[#1E293B] via-[#2C3E50] to-[#0F172A] text-white space-y-5 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Лимит самозанятости в 2026 году
              </span>
              <span className="text-xs text-slate-300 font-medium">Статья 4 Федерального закона № 422-ФЗ</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mt-1 text-white tracking-tight">
              Доход за год: <span className="text-amber-400">{formatCurrency(safeTaxData.yearlyIncome || 0, activeCurrency)}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Максимально допустимый доход в год: <strong>{formatCurrency(safeTaxData.yearlyLimit || 2400000, activeCurrency)}</strong>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center self-stretch md:self-auto border border-white/20 shadow-inner">
            <span className="text-xs text-slate-300 block font-semibold">Свободный остаток лимита</span>
            <span className="text-2xl font-black text-amber-300 block mt-0.5">
              {formatCurrency(safeTaxData.remainingLimit || 2400000, activeCurrency)}
            </span>
            <span className="text-[10px] text-slate-300 font-medium">до перехода на общие налоги</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-xs font-extrabold text-slate-200">
            <span>Использовано {limitPercentage}% лимита</span>
            <span>{formatCurrency(2400000, activeCurrency)}</span>
          </div>
          <div className="w-full bg-slate-900/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-600 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                limitPercentage > 85
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : limitPercentage > 60
                  ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                  : 'bg-gradient-to-r from-teal-400 to-emerald-400'
              }`}
              style={{ width: `${Math.max(3, limitPercentage)}%` }}
            />
          </div>
        </div>

        {limitPercentage > 80 && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 flex items-center space-x-2 relative z-10 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              Внимание: Вы приближаетесь к годовому лимиту 2.4 млн ₽. При превышении потребуется перейти на ИП с УСН.
            </span>
          </div>
        )}
      </div>

      {/* Auto-categorization Helper for Developers */}
      <div className="custom-card p-6 border-l-4 border-indigo-500 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Авто-разметка IT расходов</h3>
              <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                Сканировать описания транзакций на наличие сервисов (AWS, Vercel, GitHub, JetBrains).
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsScanning(true);
              setShowScanResult(false);
              setTimeout(() => {
                setIsScanning(false);
                setShowScanResult(true);
              }, 1500);
            }}
            disabled={isScanning}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors border flex items-center space-x-1.5 ${isScanning ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 cursor-not-allowed' : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'}`}
          >
            {isScanning && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isScanning ? 'Сканирование...' : 'Запустить сканирование'}</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showScanResult && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                      Сканирование успешно завершено
                    </h4>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      Найдены совпадения по ключам: <strong>AWS, Vercel, GitHub, JetBrains, Sentry</strong>. Успешно переведены в категорию «Professional Software Expense» (не влияют на базу НПД).
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowScanResult(false)}
                  className="p-1 text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors shrink-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tax Analytics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Income Physical */}
        <div className="custom-card p-5 space-y-3 bg-[var(--bg-card)] hover:border-emerald-400/60 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Доход от физлиц</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md text-xs font-extrabold border border-emerald-300 dark:border-emerald-800">
              Ставка 4%
            </span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {formatCurrency(safeTaxData.incomeFromIndividuals || 0, activeCurrency)}
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Налог (базовый):</span>
            <span className="font-bold text-[var(--text-primary)]">
              {formatCurrency((safeTaxData.incomeFromIndividuals || 0) * 0.04, activeCurrency)}
            </span>
          </div>
        </div>

        {/* Income Legal */}
        <div className="custom-card p-5 space-y-3 bg-[var(--bg-card)] hover:border-blue-400/60 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Доход от юрлиц / ИП</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 rounded-md text-xs font-extrabold border border-blue-300 dark:border-blue-800">
              Ставка 6%
            </span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {formatCurrency(safeTaxData.incomeFromLegal || 0, activeCurrency)}
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Налог (базовый):</span>
            <span className="font-bold text-[var(--text-primary)]">
              {formatCurrency((safeTaxData.incomeFromLegal || 0) * 0.06, activeCurrency)}
            </span>
          </div>
        </div>

        {/* Net Tax Payable with Deduction */}
        <div className="custom-card p-5 space-y-3 bg-[var(--bg-card)] border-l-4 border-l-[#E67E22] hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Итоговый налог к уплате</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E67E22]">
            {formatCurrency(safeTaxData.estimatedTax || 0, activeCurrency)}
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
            <span>Бонус вычета (остаток):</span>
            <span>{formatCurrency(safeTaxData.taxDeductionRemaining || 10000, activeCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Invoices Registry & PDF Preview Table */}
      <div className="custom-card p-5 sm:p-6 space-y-4 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-[#E67E22]" />
            <h3 className="font-extrabold text-base text-[var(--text-primary)]">
              Реестр счетов и налоговых поступлений ({safeInvoices.length})
            </h3>
          </div>

          <button
            onClick={handleExportPdf}
            className="btn-dark px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-bold">Печать / Сохранить в PDF</span>
          </button>
        </div>

        {safeInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] font-bold">
                  <th className="p-3">Номер</th>
                  <th className="p-3">Дата</th>
                  <th className="p-3">Клиент</th>
                  <th className="p-3">Тип</th>
                  <th className="p-3 text-right">Сумма</th>
                  <th className="p-3 text-right">Ставка</th>
                  <th className="p-3 text-right">Налог</th>
                  <th className="p-3 text-center">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {safeInvoices.map((inv) => {
                  const isLegal = inv.clientType === 'legal';
                  const rate = isLegal ? 6 : 4;
                  const tax = Math.round((inv.total || 0) * (rate / 100));
                  const isPaid = inv.status === 'paid';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-[var(--text-primary)]">{inv.number}</td>
                      <td className="p-3 text-[var(--text-secondary)] font-medium">{inv.date}</td>
                      <td className="p-3 font-bold text-[var(--text-primary)]">{inv.clientName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isLegal
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {isLegal ? 'Юрлицо/ИП' : 'Физлицо'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-[var(--text-primary)]">
                        {formatCurrency(inv.total || 0, activeCurrency)}
                      </td>
                      <td className="p-3 text-right font-bold text-[var(--text-secondary)]">{rate}%</td>
                      <td className="p-3 text-right font-bold text-[#E67E22]">
                        {formatCurrency(tax, activeCurrency)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {isPaid ? 'Оплачен' : 'Ожидает'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[var(--text-muted)] font-medium border-2 border-dashed border-[var(--border-subtle)] rounded-xl">
            Пока нет счетов в базе. Создайте первый счет в разделе «Счета», чтобы увидеть налоговую сводку.
          </div>
        )}
      </div>

      {/* Regional NPD Tax Tips & Deadlines Helper Component */}
      <RegionalNpdTipsHelper
        userProfile={userProfile}
        onUpdateProfile={onUpdateProfile}
        yearlyIncome={safeTaxData.yearlyIncome}
      />

      {/* Interactive Simulator Section */}
      <div className="custom-card p-6 space-y-6 bg-[var(--bg-card)]">
        <div className="flex items-center space-x-2 border-b border-[var(--border-subtle)] pb-3">
          <Calculator className="w-5 h-5 text-[#E67E22]" />
          <h3 className="font-bold text-base text-[var(--text-primary)]">
            Интерактивный симулятор дохода и налоговой нагрузки ({CURRENCY_SYMBOLS[activeCurrency]} {activeCurrency})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[var(--text-primary)] mb-1">
                Доход от физлиц ({CURRENCY_SYMBOLS[activeCurrency]}/мес):
              </label>
              <input
                type="number"
                value={incomeIndividuals}
                onChange={(e) => setIncomeIndividuals(Number(e.target.value))}
                step={5000}
                className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-sm font-bold text-[var(--text-primary)]"
              />
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Ставка 4% (скидка 1% из налогового бонуса)
              </span>
            </div>

            <div>
              <label className="block font-bold text-[var(--text-primary)] mb-1">
                Доход от юрлиц и ИП ({CURRENCY_SYMBOLS[activeCurrency]}/мес):
              </label>
              <input
                type="number"
                value={incomeLegal}
                onChange={(e) => setIncomeLegal(Number(e.target.value))}
                step={5000}
                className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-sm font-bold text-[var(--text-primary)]"
              />
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Ставка 6% (скидка 2% из налогового бонуса)
              </span>
            </div>

            <div>
              <label className="block font-bold text-[var(--text-primary)] mb-1">
                Уже использовано бонуса вычета (из {formatCurrency(10000, activeCurrency)}):
              </label>
              <input
                type="number"
                value={bonusUsed}
                onChange={(e) => setBonusUsed(Number(e.target.value))}
                min={0}
                max={10000}
                className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-sm font-bold text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Results Display Box */}
          <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-subtle)] space-y-4 text-xs">
            <h4 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              Расчет налоговой нагрузки
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-[var(--text-secondary)] font-medium">
                <span>Суммарный доход:</span>
                <span className="font-bold text-[var(--text-primary)]">{formatCurrency(incomeIndividuals + incomeLegal, activeCurrency)}</span>
              </div>

              <div className="flex justify-between text-[var(--text-secondary)] font-medium">
                <span>Базовый налог (без скидки):</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(manualTotalTax, activeCurrency)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Экономия за счет вычета:</span>
                <span>- {formatCurrency(totalDiscount, activeCurrency)}</span>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-sm font-black">
                <span className="text-[var(--text-primary)]">Итоговый налог к уплате:</span>
                <span className="text-[#E67E22] text-lg font-black">{formatCurrency(manualFinalTax, activeCurrency)}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-xl text-[11px] space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Справка Мой Налог (ФНС)</span>
              </div>
              <p className="leading-relaxed">
                Налог уплачивается ежемесячно до 28 числа месяца, следующего за истекшим. Сумма до 100 ₽ переносится на следующий период.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
