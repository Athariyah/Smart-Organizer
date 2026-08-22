import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Plus,
  ArrowUpRight,
  Calculator,
  Activity,
  FileSpreadsheet,
  CheckSquare,
  Sparkles,
  Flame,
  Zap,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../context/LocalizationContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Invoice, Client, CalendarEvent, Task, ActivityLog, UserProfile } from '../types';
import { formatCurrency } from '../utils/numberToWordsRu';
import { UpcomingDeadlinesWidget } from '../components/UpcomingDeadlinesWidget';
import { WeeklyProductivityWidget } from '../components/WeeklyProductivityWidget';

interface DashboardViewProps {
  userProfile?: UserProfile;
  invoices?: Invoice[];
  clients?: Client[];
  events?: CalendarEvent[];
  tasks?: Task[];
  logs?: ActivityLog[];
  activityLogs?: ActivityLog[];
  onNavigate: (route: string) => void;
  onQuickCreateInvoice?: () => void;
  isDarkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  invoices = [],
  clients = [],
  events = [],
  tasks = [],
  logs = [],
  activityLogs = [],
  onNavigate,
  onQuickCreateInvoice,
  isDarkMode
}) => {
  const { language, t } = useLanguage();
  const [isJiraSyncEnabled, setIsJiraSyncEnabled] = React.useState(false);
  const [isGithubSyncEnabled, setIsGithubSyncEnabled] = React.useState(true);
  const isDark = isDarkMode ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const safeInvoices = invoices || [];
  const safeClients = clients || [];
  const safeEvents = events || [];
  const safeTasks = tasks || [];
  const safeLogs = activityLogs.length > 0 ? activityLogs : logs || [];

  // Summary Metrics calculations
  const paidInvoices = safeInvoices.filter((i) => i.status === 'paid');
  const issuedInvoices = safeInvoices.filter((i) => i.status === 'issued' || i.status === 'sent');
  const overdueInvoices = safeInvoices.filter((i) => i.status === 'overdue');

  const paidAmount = paidInvoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const issuedAmount = issuedInvoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const overdueAmount = overdueInvoices.reduce((acc, curr) => acc + (curr.total || 0), 0);

  const issuedCount = issuedInvoices.length;
  const overdueCount = overdueInvoices.length;

  // Approximate tax calculations
  const taxFromIndividuals = safeInvoices
    .filter((i) => i.status === 'paid' && i.clientType === 'individual')
    .reduce((acc, curr) => acc + (curr.total || 0) * 0.04, 0);

  const taxFromLegal = safeInvoices
    .filter((i) => i.status === 'paid' && i.clientType === 'legal')
    .reduce((acc, curr) => acc + (curr.total || 0) * 0.06, 0);

  const totalTaxAmount = Math.round(taxFromIndividuals + taxFromLegal);

  // Chart data for monthly income
  const chartData = [
    { name: (t('auto.may')), ind: 20000, leg: 60000 },
    { name: (t('auto.jun')), ind: 35000, leg: 110000 },
    { name: (t('auto.jul')), ind: 45000, leg: 240000 },
    { name: (t('auto.augplan')), ind: 45000, leg: 100000 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 text-[var(--text-primary)]"
    >
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {t('dash.hi')} {userProfile?.fullName?.split(' ')[0] || 'Алексей'}!
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#E67E22]/15 text-[#E67E22] border border-[#E67E22]/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#E67E22]" />
              <span>{t('dash.npd')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">{t('auto.summaryofincomeissued')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => (onQuickCreateInvoice ? onQuickCreateInvoice() : onNavigate('/invoices/create'))}
            className="px-4 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold rounded-xl shadow-md text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-4 h-4 text-white" />
            </motion.div>
            <span>{t('dash.newInv')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('/taxes')}
            className="px-3.5 py-2.5 bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] font-bold rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-[#E67E22]" />
            <span>{t('auto.npdtax')}</span>
          </motion.button>
        </div>
      </div>

      {/* KPI Stats Grid with soft gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Invoices */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigate('/invoices')}
          className="custom-card p-5 space-y-2 border-l-4 border-amber-500 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{t('dash.await')}</span>
            </span>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"
            >
              <Clock className="w-4 h-4" />
            </motion.div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{issuedCount}</p>
          <p className="text-xs text-[var(--text-primary)] font-bold">
            {formatCurrency(issuedAmount)}
          </p>
        </motion.div>

        {/* Metric 2: Overdue Invoices */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigate('/invoices')}
          className="custom-card p-5 space-y-2 border-l-4 border-rose-500 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold flex items-center space-x-1.5">
              {overdueCount > 0 ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              )}
              <span>{t('dash.overdue')}</span>
            </span>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400"
            >
              <AlertTriangle className="w-4 h-4" />
            </motion.div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{overdueCount}</p>
          <p className="text-xs text-[var(--text-primary)] font-bold">
            {formatCurrency(overdueAmount)}
          </p>
        </motion.div>

        {/* Metric 3: Total Paid Inflow */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigate('/invoices')}
          className="custom-card p-5 space-y-2 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t('dash.recv')}</span>
            </span>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"
            >
              <TrendingUp className="w-4 h-4" />
            </motion.div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(paidAmount)}
          </p>
          <p className="text-xs text-[var(--text-secondary)] font-semibold">
            {paidInvoices.length} {t('dash.paid')}
          </p>
        </motion.div>

        {/* Metric 4: Estimated Tax Due */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigate('/taxes')}
          className="custom-card p-5 space-y-2 border-l-4 border-[#E67E22] bg-gradient-to-br from-[#E67E22]/10 via-transparent to-transparent cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E67E22]"></span>
              <span>{t('dash.tax')}</span>
            </span>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              className="p-1.5 rounded-lg bg-[#E67E22]/10 text-[#E67E22]"
            >
              <Calculator className="w-4 h-4" />
            </motion.div>
          </div>
          <p className="text-2xl font-black text-[#E67E22] font-mono">
            {formatCurrency(totalTaxAmount)}
          </p>
          <p className="text-xs text-[var(--text-primary)] font-bold">
            К уплате до 25 числа в ФНС
          </p>
        </motion.div>
      </div>

      {/* Integration Status Widget */}
      <div className="custom-card p-5 lg:p-6 space-y-4 border-l-4 border-l-slate-700 dark:border-l-slate-400">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 dark:text-slate-300"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)] no-underline">Integration Status</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Статус подключения GitHub и Jira</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-xs font-bold text-[var(--text-primary)]">Синхронизация GitHub</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isGithubSyncEnabled} onChange={(e) => setIsGithubSyncEnabled(e.target.checked)} />
                <div className={`block w-8 h-5 rounded-full transition-colors ${isGithubSyncEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition transform ${isGithubSyncEnabled ? 'translate-x-3' : ''}`}></div>
              </div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-xs font-bold text-[var(--text-primary)]">Синхронизация Jira</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isJiraSyncEnabled}
                  onChange={(e) => setIsJiraSyncEnabled(e.target.checked)}
                />
                <div className={`block w-8 h-5 rounded-full transition-colors ${isJiraSyncEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition transform ${isJiraSyncEnabled ? 'translate-x-3' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{t('auto.latestimportedcommitsgithub')}</h4>
          <div className="space-y-2">
            {[
              { repo: 'api-gateway', msg: 'feat: добавлен таймер глубокой работы', hash: 'a1b2c3d', time: '10 мин назад' },
              { repo: 'frontend-app', msg: 'fix: исправлена автокатегоризация проф. расходов', hash: 'e4f5g6h', time: '1 час назад' },
              { repo: 'billing-service', msg: 'refactor: очистка генерации PDF счетов', hash: 'j7k8l9m', time: (t('auto.yesterday')) },
              { repo: 'api-gateway', msg: 'chore: обновление dev зависимостей', hash: 'n0p1q2r', time: (t('auto.yesterday')) },
              { repo: 'frontend-app', msg: 'feat: добавлен модуль синхронизации github', hash: 's3t4u5v', time: '2 дня назад' },
            ].map((commit, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center space-x-3 truncate min-w-0 pr-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    {commit.repo}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-primary)] truncate">{commit.msg}</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-mono text-indigo-500">{commit.hash}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] w-16 text-right">{commit.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadlines & Urgent Actions Widget */}
      <UpcomingDeadlinesWidget
        invoices={safeInvoices}
        tasks={safeTasks}
        events={safeEvents}
        onNavigate={onNavigate}
      />

      {/* Weekly Productivity & Closed Invoices Widget */}
      <WeeklyProductivityWidget
        tasks={safeTasks}
        invoices={safeInvoices}
        onNavigate={onNavigate}
      />

      {/* Main Content Row: Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Chart (Recharts) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="custom-card p-5 lg:col-span-2 space-y-4 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Динамика доходов по месяцам
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Разделение на доходы от физлиц (4%) и юрлиц/ИП (6%)
              </p>
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => onNavigate('/taxes')}
              className="text-xs text-[#E67E22] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>{t('dash.taxRep')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#E67E22]" />
            </motion.button>
          </div>

          <div className="h-68 w-full pt-2 min-w-0" style={{ minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={isDark ? 0.6 : 0.8} />
                <XAxis
                  dataKey="name"
                  stroke={isDark ? '#475569' : '#94A3B8'}
                  tick={{ fill: isDark ? '#475569' : '#94A3B8', fontSize: 12, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#475569' : '#CBD5E1' }}
                />
                <YAxis
                  stroke={isDark ? '#475569' : '#94A3B8'}
                  tick={{ fill: isDark ? '#475569' : '#94A3B8', fontSize: 12, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#475569' : '#CBD5E1' }}
                  tickFormatter={(v) => `${Number(v) / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }}
                  formatter={(val: any, name: any) => [
                    `${Number(val || 0).toLocaleString('ru-RU')} ₽`,
                    name === 'leg' ? t('dash.comp') : t('dash.ind')
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    padding: '10px 14px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 700, padding: '2px 0' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '6px' }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {value === 'leg' ? t('dash.comp') : t('dash.ind')}
                    </span>
                  )}
                />
                <Bar dataKey="leg" name="leg" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ind" name="ind" fill="#E67E22" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Activity Feed Side Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="custom-card p-5 space-y-4 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center space-x-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-[#E67E22]" />
                  <span>{t('auto.activityfeed')}</span>
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>

            <div className="space-y-3 pt-3 max-h-80 overflow-y-auto pr-1">
              {safeLogs.length > 0 ? (
                safeLogs.slice(0, 8).map((log, idx) => (
                  <motion.div
                    key={log.id || idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-[#E67E22]/40 transition-colors space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[var(--text-primary)] leading-tight">
                        {log.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium shrink-0 pl-2">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-[11px] leading-tight">
                      {log.description}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                  {t('dash.logEmp')}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              {t('dash.totEvt')} <strong className="text-[var(--text-primary)]">{safeLogs.length}</strong>
            </span>
            <button
              onClick={() => onNavigate('/reports')}
              className="text-xs text-[#E67E22] font-bold hover:underline cursor-pointer"
            >{t('auto.detailedaudit')}</button>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Events & Tasks Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Events Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="custom-card p-5 space-y-3 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-[var(--text-primary)]">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>{t('dash.meet')}</span>
            </h3>
            <button
              onClick={() => onNavigate('/calendar')}
              className="text-xs text-[#E67E22] font-bold hover:underline cursor-pointer"
            >
              {t('dash.allCal')}
            </button>
          </div>

          <div className="space-y-2.5">
            {safeEvents.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-3 text-center font-medium">
                {t('dash.noMeet')}
              </p>
            ) : (
              safeEvents.slice(0, 3).map((evt) => (
                <motion.div
                  key={evt.id}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between text-xs cursor-pointer"
                  onClick={() => onNavigate('/calendar')}
                >
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{evt.title}</p>
                    <p className="text-[var(--text-secondary)] font-medium">
                      {evt.startTime.replace('T', t('dash.at'))} · {evt.location || t('dash.online')}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300">
                    {evt.type === 'meeting' ? t('dash.meeting') : t('dash.call')}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Active Tasks Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="custom-card p-5 space-y-3 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-main)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-[var(--text-primary)]">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              <span>{t('dash.actTask')}</span>
            </h3>
            <button
              onClick={() => onNavigate('/tasks')}
              className="text-xs text-[#E67E22] font-bold hover:underline cursor-pointer"
            >
              {t('dash.kanban')}
            </button>
          </div>

          <div className="space-y-2.5">
            {safeTasks.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-3 text-center font-medium">
                {t('dash.allDone')}
              </p>
            ) : (
              safeTasks.slice(0, 3).map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between text-xs cursor-pointer"
                  onClick={() => onNavigate('/tasks')}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[var(--text-primary)]">{task.title}</p>
                    <p className="text-[var(--text-secondary)] font-medium">
                      {t('dash.due')}: {task.dueDate || t('dash.noDue')}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                    {task.priority === 'urgent' ? t('dash.urg') : (t('auto.inprogress'))}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
