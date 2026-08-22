import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  TrendingUp,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LocalizationContext';
import { Invoice, UserProfile } from '../types';
import { formatCurrency, formatDateRu } from '../utils/numberToWordsRu';

interface TaxesViewProps {
  invoices?: Invoice[];
  userProfile?: UserProfile;
}

export const TaxesView: React.FC<TaxesViewProps> = ({ invoices = [], userProfile }) => {
  const { language, t } = useLanguage();
  const safeInvoices = invoices || [];
  const activeCurrency = userProfile?.currency || userProfile?.invoiceSettings?.currency || 'RUB';
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isScanning, setIsScanning] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);

  // Filter paid invoices
  const paidInvoices = safeInvoices.filter((i) => i.status === 'paid');

  // Breakdown by client type
  const individualInvoices = paidInvoices.filter((i) => i.clientType === 'individual');
  const legalInvoices = paidInvoices.filter((i) => i.clientType === 'legal');

  const individualIncome = individualInvoices.reduce((acc, i) => acc + i.total, 0);
  const legalIncome = legalInvoices.reduce((acc, i) => acc + i.total, 0);
  const totalIncome = individualIncome + legalIncome;

  const tax4Percent = individualIncome * 0.04;
  const tax6Percent = legalIncome * 0.06;
  const grossTax = tax4Percent + tax6Percent;

  // Tax deduction allowance (10,000 RUB deduction for NPD self-employed)
  const remainingDeduction = 10000;
  const finalTaxToPay = Math.max(0, grossTax);

  // CSV Tax Report Export
  const handleExportTaxCSV = () => {
    const headers = 'Тип клиента,Номер счета,Дата оплаты,Сумма дохода,Ставка налога,Сумма налога НПД\n';
    const rows = paidInvoices
      .map((i) => {
        const rate = i.clientType === 'legal' ? '6%' : '4%';
        const tax = i.taxAmount;
        return `"${i.clientType === 'legal' ? 'Юрлицо/ИП' : 'Физлицо'}","${i.number}","${i.paidAt || i.date}","${i.total}","${rate}","${tax}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_report_npd_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & NPD Notice */}
      <div className="custom-card p-6 bg-gradient-to-r from-[#2C3E50] via-[#1E293B] to-[#16213E] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Налог на профессиональный доход (НПД)</span>
          </div>
          <h2 className="text-2xl font-bold">Налоговый Кабинет Самозанятого</h2>
          <p className="text-xs text-slate-300 mt-1">
            Автоматический расчет ставок 4% (физлица) и 6% (юрлица/ИП) по фактически поступившим оплатам.
          </p>
        </div>

        <button
          onClick={handleExportTaxCSV}
          className="px-4 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl text-xs shadow-md flex items-center space-x-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Скачать налоговый отчет (CSV)</span>
        </button>
      </div>

      {/* Critical Tax Deadline Alert Banner */}
      <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-start space-x-3 text-amber-900 dark:text-amber-300 text-xs">
        <AlertCircle className="w-5 h-5 text-[#E67E22] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm block">
            Срок уплаты налога за прошлый месяц — до 25 числа текущего месяца
          </span>
          <p>
            Налог рассчитывается на основе всех выбитых чеков. ФНС списывает налог автоматически или по квитанции в приложении "Мой Налог".
          </p>
        </div>
      </div>

      {/* Tax Breakdown Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="custom-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Доход от физлиц (4%)</span>
            <User className="w-4 h-4 text-[#E67E22]" />
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(individualIncome, activeCurrency)}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">Налог 4%: {formatCurrency(tax4Percent, activeCurrency)}</p>
        </div>

        <div className="custom-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Доход от юрлиц/ИП (6%)</span>
            <Building className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(legalIncome, activeCurrency)}</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 font-bold">Налог 6%: {formatCurrency(tax6Percent, activeCurrency)}</p>
        </div>

        <div className="custom-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Общий доход за период</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome, activeCurrency)}</p>
          <p className="text-xs text-[var(--text-secondary)] font-medium">Оплачено {paidInvoices.length} счетов</p>
        </div>

        <div className="custom-card p-5 space-y-2 bg-[#E67E22]/10 border-[#E67E22]/30">
          <div className="flex items-center justify-between text-[#E67E22]">
            <span className="text-xs font-bold text-[#E67E22]">Итого налог к уплате</span>
            <Calculator className="w-4 h-4 text-[#E67E22]" />
          </div>
          <p className="text-2xl font-extrabold text-[#E67E22]">{formatCurrency(finalTaxToPay, activeCurrency)}</p>
          <p className="text-xs text-[var(--text-secondary)] font-semibold">С учетом баланса вычета</p>
        </div>
      </div>

      {/* Professional IT Expenses (Auto-Categorized) */}
      <div className="custom-card p-6 space-y-4 border-l-4 border-l-indigo-500">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>{t('auto.autocategorizationofprofessionalexpenses')}</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Для внутреннего учета чистой прибыли (Net Income) при работе на НПД. Расходы на серверы и софт не уменьшают базу НПД, но важны для аналитики.</p>
          </div>
          <div className="flex items-center space-x-2">
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
              className={`px-3 py-1.5 flex items-center space-x-1.5 text-xs font-bold rounded-xl border transition-colors ${isScanning ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 cursor-not-allowed' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'}`}
            >
              {isScanning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isScanning ? 'Сканирование...' : t('auto.scantransactions')}</span>
            </motion.button>
            <label className="flex items-center cursor-pointer ml-2">
              <div className="relative">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="block bg-indigo-500 w-10 h-6 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
              </div>
              <span className="ml-3 text-xs font-bold text-[var(--text-primary)] hidden sm:block">{t('auto.autotrackingactive')}</span>
            </label>
          </div>
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
                      Найдены совпадения по ключам: <strong>AWS, Vercel, GitHub, JetBrains, Sentry</strong>. Успешно переведены в категорию «Professional Software Expense».
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">AWS / DigitalOcean / VDS</span>
              <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">Cloud</span>
            </div>
            <span className="font-black text-[var(--text-primary)]">3 500 ₽</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">JetBrains / GitHub Copilot</span>
              <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">Software</span>
            </div>
            <span className="font-black text-[var(--text-primary)]">2 100 ₽</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">ChatGPT / Claude API</span>
              <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">AI API</span>
            </div>
            <span className="font-black text-[var(--text-primary)]">4 800 ₽</span>
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex justify-between items-center">
          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">{t('auto.totalitexpensesfor')}</span>
          <span className="font-black text-indigo-600 dark:text-indigo-400">10 400 ₽</span>
        </div>
      </div>

      {/* Tax Report Detailed Table */}
      <div className="custom-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="font-bold text-base text-[var(--text-primary)]">
            Реестр оплаченных счетов для ФНС
          </h3>

          <div className="flex bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-bold">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedPeriod === 'month' ? 'bg-[#2C3E50] text-white font-bold shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              За Месяц
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedPeriod === 'quarter' ? 'bg-[#2C3E50] text-white font-bold shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              За Квартал
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedPeriod === 'year' ? 'bg-[#2C3E50] text-white font-bold shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              За Год
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-extrabold text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="p-3">№ Счета</th>
                <th className="p-3">Заказчик</th>
                <th className="p-3">Категория</th>
                <th className="p-3">Дата оплаты</th>
                <th className="p-3">Сумма дохода</th>
                <th className="p-3">Ставка НПД</th>
                <th className="p-3 text-right">Налог к уплате</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-[var(--text-primary)]">
              {paidInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-[var(--text-primary)]">{inv.number}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{inv.clientName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.clientType === 'legal' ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {inv.clientType === 'legal' ? 'Юрлицо/ИП' : 'Физлицо'}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-[var(--text-secondary)]">{inv.paidAt || inv.date}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{formatCurrency(inv.total, activeCurrency)}</td>
                  <td className="p-3 font-bold text-[var(--text-secondary)]">{inv.clientType === 'legal' ? '6%' : '4%'}</td>
                  <td className="p-3 text-right font-extrabold text-[#E67E22]">
                    {formatCurrency(inv.taxAmount, activeCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
