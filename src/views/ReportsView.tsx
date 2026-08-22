import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Download,
  PieChart,
  FileSpreadsheet,
  Calendar,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../context/LocalizationContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { Invoice, Client, UserProfile } from '../types';
import { formatCurrency } from '../utils/numberToWordsRu';

interface ReportsViewProps {
  invoices?: Invoice[];
  clients?: Client[];
  userProfile?: UserProfile;
  isDarkMode?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices = [],
  clients = [],
  userProfile,
  isDarkMode
}) => {
  const { language, t } = useLanguage();
  const isDark = isDarkMode ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const safeInvoices = invoices || [];
  const safeClients = clients || [];

  // Monthly chart data calculation
  const monthsRu = ['Янв', 'Фев', 'Мар', 'Апр', (t('auto.may')), (t('auto.jun')), (t('auto.jul')), 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const monthlyData = monthsRu.map((month, idx) => {
    const monthInvoices = safeInvoices.filter((i) => {
      const d = new Date(i.date);
      return d.getMonth() === idx && i.status === 'paid';
    });

    const totalIncome = monthInvoices.reduce((sum, i) => sum + i.total, 0);
    const estTax = Math.round(totalIncome * 0.05);

    return {
      month,
      income: totalIncome,
      tax: estTax
    };
  });

  // Client distribution data
  const COLORS = ['#2C3E50', '#E67E22', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
  const clientData = safeClients
    .map((cli, idx) => {
      const cliInvoices = safeInvoices.filter((i) => i.clientId === cli.id && i.status === 'paid');
      const ltv = cliInvoices.reduce((sum, i) => sum + i.total, 0) || cli.totalLtv;

      return {
        name: cli.name,
        value: ltv,
        color: COLORS[idx % COLORS.length]
      };
    })
    .filter((c) => c.value > 0);

  const totalPaidRevenue = safeInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const totalPendingRevenue = safeInvoices
    .filter((i) => i.status === 'issued' || i.status === 'sent')
    .reduce((sum, i) => sum + i.total, 0);

  const exportCSV = () => {
    try {
      const headers = '\uFEFFНомер,Клиент,Дата,Сумма,Статус\n';
      const rows = safeInvoices
        .map((i) => `"${i.number}","${i.clientName}","${i.date}",${i.total},"${i.status}"`)
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Отчет_доходов_самозанятого_${new Date().getFullYear()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Export CSV error', e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 text-[var(--text-primary)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {t('rep.fin')}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#E67E22]/15 text-[#E67E22] border border-[#E67E22]/30">
              422-ФЗ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
            {t('rep.det')}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={exportCSV}
          className="px-4 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white font-extrabold rounded-xl shadow-md text-xs flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto border border-slate-700"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>{t('rep.exp')}</span>
        </motion.button>
      </div>

      {/* Financial KPIs with soft gradients and entrance animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          className="custom-card p-5 space-y-2 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold">{t('rep.rec')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(totalPaidRevenue)}
          </div>
          <p className="text-[11px] font-semibold text-[var(--text-secondary)]">{t('rep.plan')}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          className="custom-card p-5 space-y-2 border-l-4 border-amber-500 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold">{t('rep.expRec')}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-[#E67E22]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#E67E22] font-mono">
            {formatCurrency(totalPendingRevenue)}
          </div>
          <p className="text-[11px] font-semibold text-[var(--text-secondary)]">{t('rep.sent')}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          className="custom-card p-5 space-y-2 border-l-4 border-blue-500 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold">{t('rep.tot')}</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
            {safeInvoices.length} {t('rep.pcs')}
          </div>
          <p className="text-[11px] font-semibold text-[var(--text-secondary)]">{t('rep.all')}</p>
        </motion.div>
      </div>

      {/* Main Income Trend Chart with soft gradients */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="custom-card p-6 space-y-4 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="font-extrabold text-base text-[var(--text-primary)] flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#E67E22]" />
            <span>{t('rep.dyn26')}</span>
          </h3>
          <span className="text-xs font-bold text-[var(--text-secondary)]">{t('rep.rm')}</span>
        </div>

        <div className="h-72 w-full pt-4 min-w-0" style={{ minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E67E22" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E67E22" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={isDark ? 0.6 : 0.8} />
              <XAxis
                dataKey="month"
                className="text-[var(--text-secondary)]"
                stroke="currentColor"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: isDark ? '#475569' : '#CBD5E1' }}
              />
              <YAxis
                className="text-[var(--text-secondary)]"
                stroke="currentColor"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: isDark ? '#475569' : '#CBD5E1' }}
                tickFormatter={(v) => `${Number(v) / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [`${Number(val || 0).toLocaleString('ru-RU')} ₽`, '']}
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}
              />
              <Area type="monotone" dataKey="income" name={t('rep.rev')} stroke="#E67E22" strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="tax" name={t('auto.npdtax')} stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#taxGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Client Distribution Breakdown & Official Statement Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="custom-card p-6 space-y-4 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)]"
        >
          <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-emerald-500" />
            <span>{t('rep.dist')}</span>
          </h3>

          <div className="h-60 w-full flex items-center justify-center min-w-0" style={{ minHeight: '220px' }}>
            {clientData.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] font-medium">{t('rep.nodata')}</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                <RePieChart>
                  <Pie
                    data={clientData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {clientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${Number(v || 0).toLocaleString('ru-RU')} ₽`} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {clientData.map((cli, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cli.color }} />
                  <span className="font-medium text-[var(--text-primary)]">{cli.name}</span>
                </div>
                <span className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(cli.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Official NPD Statement Rules */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="custom-card p-6 space-y-4 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)]"
        >
          <h3 className="font-bold text-base text-[var(--text-primary)]">
            Официальные справки и Акты ФНС
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
            В приложении сформированы официальные шаблоны актов оказанных услуг и счетов для самозанятых граждан РФ, полностью соответствующие нормам 422-ФЗ.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">{t('rep.act1')}</h4>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">{t('rep.act2')}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert(t('rep.actGen'))}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-800 dark:text-white cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-800 dark:text-white" />
              </motion.button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">{t('rep.cert1')}</h4>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">{t('rep.cert2')}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert(t('rep.certGen'))}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-800 dark:text-white cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-800 dark:text-white" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
