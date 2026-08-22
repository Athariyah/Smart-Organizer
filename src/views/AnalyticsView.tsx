import React, { useState, useMemo } from 'react';
import {
  Zap,
  TrendingUp,
  Calculator,
  RefreshCw,
  Sparkles,
  Users,
  Copy,
  DollarSign,
  Euro,
  FileText,
  Calendar,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LocalizationContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Client, Invoice, InvoiceTemplate } from '../types';
import { formatCurrency } from '../utils/numberToWordsRu';

interface AnalyticsViewProps {
  clients?: Client[];
  invoices?: Invoice[];
  templates?: InvoiceTemplate[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  clients = [],
  invoices = [],
  templates = []
}) => {
  const { language, t } = useLanguage();
  const safeClients = clients || [];
  const safeInvoices = invoices || [];
  const safeTemplates = templates || [];

  // Monthly Revenue Data calculation for Recharts Line Chart
  const [chartMetric, setChartMetric] = useState<'paid' | 'all'>('paid');

  const monthlyChartData = useMemo(() => {
    const monthsRu = [
      'Янв', 'Фев', 'Мар', 'Апр', (t('auto.may')), (t('auto.jun')),
      (t('auto.jul')), 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];

    // Collect last 6-12 months or initialize current year months
    const currentYear = new Date().getFullYear();
    const monthlyMap: Record<number, { monthIndex: number; name: string; paidAmount: number; totalAmount: number; invoiceCount: number; paidCount: number }> = {};

    for (let i = 0; i < 12; i++) {
      monthlyMap[i] = {
        monthIndex: i,
        name: monthsRu[i],
        paidAmount: 0,
        totalAmount: 0,
        invoiceCount: 0,
        paidCount: 0
      };
    }

    safeInvoices.forEach((inv) => {
      const invDate = new Date(inv.date);
      if (!isNaN(invDate.getTime())) {
        const m = invDate.getMonth();
        if (monthlyMap[m]) {
          monthlyMap[m].totalAmount += inv.total || 0;
          monthlyMap[m].invoiceCount += 1;
          if (inv.status === 'paid') {
            monthlyMap[m].paidAmount += inv.total || 0;
            monthlyMap[m].paidCount += 1;
          }
        }
      }
    });

    return Object.values(monthlyMap);
  }, [safeInvoices]);

  const totalPaidRevenue = useMemo(() => {
    return safeInvoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0);
  }, [safeInvoices]);

  const totalBilledRevenue = useMemo(() => {
    return safeInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
  }, [safeInvoices]);

  const bestMonth = useMemo(() => {
    return [...monthlyChartData].sort((a, b) => b.paidAmount - a.paidAmount)[0];
  }, [monthlyChartData]);

  // Hourly Rate Calculator State
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState<number>(150000);
  const [workingHoursPerWeek, setWorkingHoursPerWeek] = useState<number>(30);
  const [overheadExpenses, setOverheadExpenses] = useState<number>(15000); // софт, налоги, подписки

  // Rate calculation math
  const totalRequired = targetMonthlyIncome + overheadExpenses;
  const monthlyHours = workingHoursPerWeek * 4;
  const calculatedHourlyRate = Math.ceil(totalRequired / monthlyHours);

  // Currency Converter State
  const [amountForeign, setAmountForeign] = useState<number>(1000);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'USDT' | 'KZT'>('USD');

  const exchangeRates = {
    USD: 92.5,
    EUR: 100.2,
    USDT: 92.8,
    KZT: 0.20
  };

  const convertedRubles = Math.round(amountForeign * exchangeRates[currency]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Аналитика & Полезные Утилиты</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Динамика доходов, калькулятор стоимости часа, конвертация валют и LTV клиентов
          </p>
        </div>
      </div>

      {/* Main Income Dynamics Widget (Recharts Line Chart) */}
      <div className="custom-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Динамика доходов по месяцам
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Наглядный график фактических поступлений и выставленных счетов
              </p>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center space-x-1.5 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setChartMetric('paid')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                chartMetric === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Оплаченная выручка
            </button>
            <button
              onClick={() => setChartMetric('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                chartMetric === 'all'
                  ? 'bg-[#2C3E50] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Все выставленные счета
            </button>
          </div>
        </div>

        {/* Top KPIs summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)] block">Всего поступило (Оплачено):</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">{formatCurrency(totalPaidRevenue)}</span>
          </div>
          <div className="p-3.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)] block">Всего выставлено:</span>
            <span className="text-lg font-black text-[var(--text-primary)] block">{formatCurrency(totalBilledRevenue)}</span>
          </div>
          <div className="p-3.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)] block">Лучший месяц:</span>
            <span className="text-lg font-black text-[#E67E22] block">
              {bestMonth && bestMonth.paidAmount > 0 ? `${bestMonth.name} (${formatCurrency(bestMonth.paidAmount)})` : '—'}
            </span>
          </div>
        </div>

        {/* Recharts Line / Area Chart Container */}
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyChartData}
              margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600 }}
                className="text-[var(--text-secondary)]"
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tickFormatter={(val) => `${val >= 1000 ? Math.round(val / 1000) + 'k' : val} ₽`}
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                className="text-[var(--text-secondary)]"
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-40">
                        <p className="font-extrabold text-sm border-b border-slate-700 pb-1 text-[#E67E22]">
                          Месяц: {label}
                        </p>
                        <div className="flex justify-between items-center space-x-3 text-emerald-400 font-bold">
                          <span>Оплачено:</span>
                          <span>{formatCurrency(data.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center space-x-3 text-slate-300 font-medium">
                          <span>Выставлено:</span>
                          <span>{formatCurrency(data.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center space-x-3 text-slate-400 text-[10px]">
                          <span>Счетов:</span>
                          <span>{data.paidCount} из {data.invoiceCount} оплачено</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}
              />
              {chartMetric === 'paid' ? (
                <Line
                  type="monotone"
                  dataKey="paidAmount"
                  name="Оплачено (выручка)"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#10B981' }}
                  activeDot={{ r: 7, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="totalAmount"
                    name="Всего выставлено"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#3B82F6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="paidAmount"
                    name="Фактически оплачено"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#10B981' }}
                    activeDot={{ r: 7, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Hourly Rate Calculator */}
        <div className="custom-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[var(--border-subtle)] pb-3">
            <Calculator className="w-5 h-5 text-[#E67E22]" />
            <h3 className="font-extrabold text-base text-[var(--text-primary)]">Калькулятор почасовой ставки</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1 flex justify-between text-[var(--text-primary)]">
                <span>Желаемый чистый доход в месяц:</span>
                <span className="font-extrabold text-[#E67E22]">{targetMonthlyIncome.toLocaleString('ru-RU')} ₽</span>
              </label>
              <input
                type="range"
                min="50000"
                max="500000"
                step="10000"
                value={targetMonthlyIncome}
                onChange={(e) => setTargetMonthlyIncome(Number(e.target.value))}
                className="w-full accent-[#E67E22] cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 flex justify-between text-[var(--text-primary)]">
                <span>Накладные расходы и налоги в месяц:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{overheadExpenses.toLocaleString('ru-RU')} ₽</span>
              </label>
              <input
                type="range"
                min="0"
                max="50000"
                step="2500"
                value={overheadExpenses}
                onChange={(e) => setOverheadExpenses(Number(e.target.value))}
                className="w-full accent-[#E67E22] cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 flex justify-between text-[var(--text-primary)]">
                <span>Оплачиваемые рабочие часы в неделю:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{workingHoursPerWeek} ч/нед</span>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={workingHoursPerWeek}
                onChange={(e) => setWorkingHoursPerWeek(Number(e.target.value))}
                className="w-full accent-[#E67E22] cursor-pointer"
              />
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-1">
              <span className="text-xs text-amber-900 dark:text-amber-300 font-bold block">Ваша минимальная ставка в час:</span>
              <span className="text-3xl font-black text-[#E67E22]">{calculatedHourlyRate.toLocaleString('ru-RU')} ₽ / час</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium block pt-1">
                Для выполнения планового дохода вам необходимо продавать не менее {monthlyHours} часов в месяц.
              </span>
            </div>
          </div>
        </div>

        {/* Widget 2: Currency Converter */}
        <div className="custom-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[var(--border-subtle)] pb-3">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-base text-[var(--text-primary)]">Конвертер валют для заграничных заказов</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-[var(--text-primary)]">Валюта</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg font-bold text-[var(--text-primary)] cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USDT">USDT (₮)</option>
                  <option value="KZT">KZT (₸)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[var(--text-primary)]">Сумма в валюте</label>
                <input
                  type="number"
                  value={amountForeign}
                  onChange={(e) => setAmountForeign(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg font-bold text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center space-y-1">
              <span className="text-xs text-blue-900 dark:text-blue-300 font-bold block">Эквивалент в рублях:</span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {convertedRubles.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                Курс расчетов: 1 {currency} = {exchangeRates[currency]} ₽
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Widget: Billable Hours vs Coding Time for IT Professionals */}
      <div className="custom-card p-6 space-y-4 mb-6">
        <div className="flex items-center space-x-2 border-b border-[var(--border-subtle)] pb-3">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-extrabold text-base text-[var(--text-primary)]">{t('auto.billablehoursvsactual')}</h3>
        </div>
        
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { name: (t('auto.week1')), billable: 20, coding: 25 },
                { name: (t('auto.week2')), billable: 30, coding: 38 },
                { name: (t('auto.week3')), billable: 25, coding: 28 },
                { name: (t('auto.week4')), billable: 35, coding: 45 },
                { name: (t('auto.week5')), billable: 28, coding: 30 },
              ]}
              margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600 }}
                className="text-[var(--text-secondary)]"
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tickFormatter={(val) => `${val} ч`}
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                className="text-[var(--text-secondary)]"
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-40">
                        <p className="font-extrabold text-sm border-b border-slate-700 pb-1 text-indigo-400">
                          {label}
                        </p>
                        <div className="flex justify-between items-center space-x-3 text-emerald-400 font-bold">
                          <span>Оплачиваемые (Billable):</span>
                          <span>{payload[0].value} ч</span>
                        </div>
                        <div className="flex justify-between items-center space-x-3 text-indigo-400 font-medium">
                          <span>Фактическое (Coding):</span>
                          <span>{payload[1].value} ч</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="coding" name={t('auto.actualcommittimecoding')} stroke="#6366f1" fillOpacity={0.1} fill="#6366f1" />
              <Area type="monotone" dataKey="billable" name={t('auto.billablehours')} stroke="#10b981" fillOpacity={0.8} fill="#10b981" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Coding Heatmap (Simplified Scatter/Bar concept) */}
          <div className="custom-card p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-[var(--border-subtle)] pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Coding Heatmap</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{t('auto.visualizationofgithubcommit')}</p>
            <div className="grid grid-cols-7 gap-1 pt-2">
              {Array.from({ length: 28 }).map((_, i) => {
                const intensity = Math.floor(Math.random() * 4);
                const bgColors = ['bg-slate-100 dark:bg-slate-800', 'bg-purple-300 dark:bg-purple-900', 'bg-purple-500 dark:bg-purple-700', 'bg-purple-700 dark:bg-purple-500'];
                return (
                  <div key={i} className={`w-full aspect-square rounded ${bgColors[intensity]} transition-colors`} title={`${intensity * 3} коммитов`}></div>
                )
              })}
            </div>
          </div>

          {/* Flow Efficiency */}
          <div className="custom-card p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-[var(--border-subtle)] pb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Flow Efficiency</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Отношение часов, проведенных в режиме "Deep Work", к общему количеству залогированных часов.</p>
            <div className="flex flex-col items-center justify-center pt-4 pb-2">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-amber-500" strokeDasharray="75, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[var(--text-primary)]">75%</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold">{t('auto.focus')}</span>
                </div>
              </div>
              <div className="flex justify-between w-full text-xs font-bold px-4">
                <div className="text-center">
                  <span className="block text-amber-600 dark:text-amber-400">30 ч</span>
                  <span className="text-[var(--text-muted)] text-[10px]">Deep Work</span>
                </div>
                <div className="text-center">
                  <span className="block text-emerald-600 dark:text-emerald-400">40 ч</span>
                  <span className="text-[var(--text-muted)] text-[10px]">{t('auto.totalbillable')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Widget 3: Client LTV Ranking */}
      <div className="custom-card p-6 space-y-4">
        <h3 className="font-extrabold text-base text-[var(--text-primary)] flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <span>Аналитика клиентов (Топ по выручке)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {safeClients.map((c) => (
            <div key={c.id} className="p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="font-extrabold block text-sm text-[var(--text-primary)]">{c.name}</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium block">{c.type === 'legal' ? 'Юрлицо/ИП' : 'Физлицо'}</span>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs">
                <span className="text-[var(--text-secondary)] font-bold">LTV Выручка:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(c.totalLtv)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

