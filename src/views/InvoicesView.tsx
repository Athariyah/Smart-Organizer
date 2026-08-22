import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Copy,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  ExternalLink,
  Calendar,
  RotateCcw,
  ArrowUpDown,
  FileSpreadsheet,
  Check,
  Building2,
  User,
  Bell,
  BellRing,
  Send,
  X,
  MessageSquare
} from 'lucide-react';
import { Invoice, InvoiceStatus, UserProfile } from '../types';
import { formatCurrency, formatDateRu } from '../utils/numberToWordsRu';
import { generateInvoicePDF } from '../utils/pdfGenerator';

import { useLanguage } from '../context/LocalizationContext';
import { EmptyState } from '../components/EmptyState';

interface InvoicesViewProps {
  invoices?: Invoice[];
  userProfile?: UserProfile;
  onNavigate: (route: string) => void;
  onDeleteInvoice?: (id: string) => void;
  onDuplicateInvoice?: (invoice: Invoice) => void;
  onMarkPaid?: (id: string) => void;
}

type PeriodFilterType = 'all' | 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';
type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'due_date';

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices = [],
  userProfile,
  onNavigate,
  onDeleteInvoice,
  onDuplicateInvoice,
  onMarkPaid
}) => {
  const { t, language } = useLanguage();
  const safeInvoices = invoices || [];
  const activeCurrency = userProfile?.currency || userProfile?.invoiceSettings?.currency || 'RUB';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'legal' | 'individual'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);

  // Quick Reminder Modal State
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null);
  const [reminderTone, setReminderTone] = useState<'polite' | 'standard' | 'urgent'>('standard');
  const [reminderCopied, setReminderCopied] = useState(false);

  // Filter logic
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    return safeInvoices.filter((inv) => {
      // 1. Search Query (Number, Client Name, INN, Items description, Notes)
      const query = searchTerm.toLowerCase().trim();
      if (query) {
        const matchesNumber = inv.number.toLowerCase().includes(query);
        const matchesClient = inv.clientName.toLowerCase().includes(query);
        const matchesInn = Boolean(inv.clientInn && inv.clientInn.includes(query));
        const matchesItems = inv.items?.some((it) => it.description.toLowerCase().includes(query));
        const matchesNotes = Boolean(inv.notes && inv.notes.toLowerCase().includes(query));

        if (!matchesNumber && !matchesClient && !matchesInn && !matchesItems && !matchesNotes) {
          return false;
        }
      }

      // 2. Status Filter (all, paid, issued/pending, overdue, draft)
      if (statusFilter !== 'all') {
        if (statusFilter === 'issued' && inv.status !== 'issued') return false;
        if (statusFilter === 'paid' && inv.status !== 'paid') return false;
        if (statusFilter === 'overdue' && inv.status !== 'overdue') return false;
        if (statusFilter === 'draft' && inv.status !== 'draft') return false;
      }

      // 3. Client Type Filter
      if (clientTypeFilter !== 'all' && inv.clientType !== clientTypeFilter) {
        return false;
      }

      // 4. Time Period Filter
      const invDate = new Date(inv.date);
      if (isNaN(invDate.getTime())) return true;

      if (periodFilter === 'this_month') {
        if (invDate.getFullYear() !== currentYear || invDate.getMonth() !== currentMonth) {
          return false;
        }
      } else if (periodFilter === 'last_month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        if (invDate.getFullYear() !== lastMonthYear || invDate.getMonth() !== lastMonth) {
          return false;
        }
      } else if (periodFilter === 'this_quarter') {
        const currentQuarter = Math.floor(currentMonth / 3);
        const invQuarter = Math.floor(invDate.getMonth() / 3);
        if (invDate.getFullYear() !== currentYear || invQuarter !== currentQuarter) {
          return false;
        }
      } else if (periodFilter === 'this_year') {
        if (invDate.getFullYear() !== currentYear) {
          return false;
        }
      } else if (periodFilter === 'custom') {
        if (customStartDate && new Date(inv.date) < new Date(customStartDate)) {
          return false;
        }
        if (customEndDate && new Date(inv.date) > new Date(customEndDate + 'T23:59:59')) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount_desc') {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === 'amount_asc') {
        return (a.total || 0) - (b.total || 0);
      }
      if (sortBy === 'due_date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });
  }, [safeInvoices, searchTerm, statusFilter, periodFilter, clientTypeFilter, sortBy, customStartDate, customEndDate]);

  // Aggregated KPIs of current filtered view
  const summaryTotal = filteredInvoices.reduce((acc, i) => acc + (i.total || 0), 0);
  const summaryPaid = filteredInvoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + (i.total || 0), 0);
  const summaryPending = filteredInvoices.filter((i) => i.status === 'issued' || i.status === 'overdue').reduce((acc, i) => acc + (i.total || 0), 0);
  const summaryTax = filteredInvoices.reduce((acc, i) => acc + (i.taxAmount || 0), 0);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    periodFilter !== 'all' ||
    clientTypeFilter !== 'all' ||
    sortBy !== 'date_desc' ||
    customStartDate !== '' ||
    customEndDate !== '';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPeriodFilter('all');
    setClientTypeFilter('all');
    setSortBy('date_desc');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const getReminderText = (inv: Invoice, tone: 'polite' | 'standard' | 'urgent') => {
    const token = inv.publicToken || inv.token || inv.id;
    const publicUrl = `${window.location.origin}/invoices/public/${token}`;
    const userName = userProfile?.fullName || 'Исполнитель';

    if (tone === 'polite') {
      return `Здравствуйте, ${inv.clientName}!\n\nНапоминаю о счете № ${inv.number} от ${formatDateRu(inv.date)} на сумму ${formatCurrency(inv.total, activeCurrency)}.\nСрок оплаты был до ${formatDateRu(inv.dueDate)}.\n\nСсылка на счет и оплату: ${publicUrl}\n\nЕсли оплата уже отправлена, пожалуйста, не обращайте внимания. Спасибо за сотрудничество!\nС уважением, ${userName}.`;
    }
    if (tone === 'urgent') {
      return `СРОЧНО: Напоминание о просроченной оплате счета № ${inv.number}.\n\nУважаемый(ая) ${inv.clientName}, срок оплаты счета на сумму ${formatCurrency(inv.total, activeCurrency)} истек ${formatDateRu(inv.dueDate)}.\n\nПожалуйста, произведите оплату по ссылке: ${publicUrl}\n\nС уважением, ${userName}.`;
    }
    return `Здравствуйте, ${inv.clientName}!\n\nНапоминаем, что по счету № ${inv.number} на сумму ${formatCurrency(inv.total, activeCurrency)} истек срок оплаты (${formatDateRu(inv.dueDate)}).\n\nОзнакомиться со счетом и произвести оплату вы можете по ссылке:\n${publicUrl}\n\nС уважением, ${userName}.`;
  };

  const handleCopyReminder = (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {}
    setReminderCopied(true);
    setTimeout(() => setReminderCopied(false), 2000);
  };

  const getStatusBadge = (inv: Invoice) => {
    const status = inv.status;
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Оплачен
          </span>
        );
      case 'issued':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5 inline-block"></span>
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" /> Выставлен
          </span>
        );
      case 'overdue':
        return (
          <div className="inline-flex items-center space-x-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600 animate-pulse"></span>
              </span>
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600 dark:text-rose-400" /> Просрочен
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setReminderInvoice(inv);
                setReminderCopied(false);
              }}
              title="Отправить быстрое напоминание клиенту"
              className="p-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 cursor-pointer transition-colors relative group"
            >
              <BellRing className="w-3.5 h-3.5 animate-pulse" />
              <span className="sr-only">Напомнить</span>
            </button>
          </div>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300">
            Черновик
          </span>
        );
    }
  };

  const handleCopyPublicLink = (inv: Invoice) => {
    const token = inv.publicToken || inv.token || inv.id;
    const publicUrl = `${window.location.origin}/invoices/public/${token}`;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(publicUrl).catch(() => {});
      }
    } catch {
      // fallback
    }
    setCopiedToken(inv.id);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Export filtered invoices to CSV
  const handleExportCSV = () => {
    const headers = ['Номер счета', 'Дата', 'Срок оплаты', 'Клиент', 'Тип клиента', 'ИНН', 'Валюта', 'Сумма', 'Налог НПД', 'Статус'];
    const rows = filteredInvoices.map((inv) => [
      inv.number,
      inv.date,
      inv.dueDate,
      `"${(inv.clientName || '').replace(/"/g, '""')}"`,
      inv.clientType === 'legal' ? 'Юрлицо/ИП' : 'Физлицо',
      inv.clientInn || '',
      activeCurrency,
      inv.total,
      inv.taxAmount,
      inv.status === 'paid' ? 'Оплачен' : inv.status === 'issued' ? 'Выставлен' : inv.status === 'overdue' ? 'Просрочен' : 'Черновик'
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Реестр_счетов_${activeCurrency}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Header & Main Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">{t('inv.title')}</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            {t('inv.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{t('inv.exportCsv')}</span>
          </button>
          <button
            onClick={() => onNavigate('/invoices/create')}
            className="px-4 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold rounded-xl shadow-md text-xs sm:text-sm flex items-center space-x-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{t('inv.createNew')}</span>
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="custom-card p-5 space-y-4">
        {/* Row 1: Status Buttons & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[var(--bg-main)] p-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-black">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#2C3E50] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Все ({safeInvoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('issued')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'issued'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ожидают ({safeInvoices.filter((i) => i.status === 'issued').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Оплачены ({safeInvoices.filter((i) => i.status === 'paid').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Просрочены ({safeInvoices.filter((i) => i.status === 'overdue').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-[#2C3E50] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Черновики ({safeInvoices.filter((i) => i.status === 'draft').length})
            </button>
          </div>

          {/* Search Field & Toggle Advanced Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск: № счета, клиент, ИНН..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] text-xs font-bold hover:text-[var(--text-primary)] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-orange-50 border-[#E67E22] text-[#E67E22] dark:bg-orange-950/40'
                  : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
              title="Дополнительные фильтры"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Период & Параметры</span>
            </button>
          </div>
        </div>

        {/* Row 2: Time Period & Sorting (collapsible or always visible) */}
        <div className={`pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showAdvancedFilters ? 'block' : 'hidden sm:grid'}`}>
          {/* Period Selection */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Период времени:</span>
            </label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilterType)}
              className="w-full px-3 py-1.5 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22] cursor-pointer"
            >
              <option value="all">За всё время</option>
              <option value="this_month">Этот месяц</option>
              <option value="last_month">Прошлый месяц</option>
              <option value="this_quarter">Текущий квартал</option>
              <option value="this_year">Этот год (2026)</option>
              <option value="custom">Произвольный диапазон...</option>
            </select>
          </div>

          {/* Client Type */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-1 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Тип клиента:</span>
            </label>
            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22] cursor-pointer"
            >
              <option value="all">Все клиенты</option>
              <option value="legal">Юрлица и ИП (6% налог)</option>
              <option value="individual">Физлица (4% налог)</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-1 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500" />
              <span>Сортировка:</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-1.5 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22] cursor-pointer"
            >
              <option value="date_desc">Сначала новые (по дате)</option>
              <option value="date_asc">Сначала старые</option>
              <option value="amount_desc">По сумме: сначала крупные</option>
              <option value="amount_asc">По сумме: сначала мелкие</option>
              <option value="due_date">По крайнему сроку оплаты</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="w-full py-1.5 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить все фильтры</span>
              </button>
            ) : (
              <div className="text-[11px] text-[var(--text-muted)] font-semibold py-1.5 px-2">
                Отображаются все счета
              </div>
            )}
          </div>
        </div>

        {/* Custom Date Pickers (Shown if periodFilter === 'custom') */}
        {periodFilter === 'custom' && (
          <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-[var(--text-primary)]">Диапазон дат:</span>
            <div className="flex items-center space-x-2">
              <span className="text-[var(--text-secondary)] font-medium">От:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-[var(--border-subtle)] rounded-lg font-bold text-[var(--text-primary)]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[var(--text-secondary)] font-medium">До:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-[var(--border-subtle)] rounded-lg font-bold text-[var(--text-primary)]"
              />
            </div>
          </div>
        )}

        {/* SUMMARY STATS BAR OF FILTERED INVOICES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[var(--border-subtle)] text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-slate-200 dark:border-slate-700 space-y-1 shadow-xs">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] block">{t('inv.statsFound')}</span>
            <span className="font-black text-[var(--text-primary)] text-sm sm:text-base font-mono">{filteredInvoices.length} {t('auto.pcs')}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-slate-200 dark:border-slate-700 space-y-1 shadow-xs">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] block">{t('inv.statsTotal')}</span>
            <span className="font-black text-[var(--text-primary)] text-sm sm:text-base font-mono">{formatCurrency(summaryTotal, activeCurrency)}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-1 shadow-xs">
            <span className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-200 block">{t('inv.statsPaid')}</span>
            <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm sm:text-base font-mono">{formatCurrency(summaryPaid, activeCurrency)}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-1 shadow-xs">
            <span className="text-[11px] font-extrabold text-amber-950 dark:text-amber-200 block">{t('inv.statsPending')}</span>
            <span className="font-black text-amber-700 dark:text-amber-300 text-sm sm:text-base font-mono">{formatCurrency(summaryPending, activeCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="custom-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-900 dark:text-slate-100">
            <thead className="bg-slate-200 dark:bg-slate-800 uppercase font-black text-slate-800 dark:text-slate-200 border-b border-[var(--border-subtle)]">
              <tr>
                <th className="p-3">Номер счета</th>
                <th className="p-3">Клиент</th>
                <th className="p-3">Дата / Срок</th>
                <th className="p-3">Сумма</th>
                <th className="p-3">Налог НПД</th>
                <th className="p-3">Статус</th>
                <th className="p-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState
                      type={searchTerm ? 'search' : 'invoices'}
                      title={
                        searchTerm
                          ? 'Счета не найдены'
                          : safeInvoices.length === 0
                          ? 'У вас пока нет созданных счетов'
                          : 'Счета по заданным фильтрам не найдены'
                      }
                      description={
                        searchTerm
                          ? `По запросу «${searchTerm}» счета не обнаружены. Измените параметры запроса или очистите поле.`
                          : safeInvoices.length === 0
                          ? 'Сформируйте свой первый профессиональный счет для клиента или организации в 2 клика.'
                          : 'Попробуйте изменить выбранный статус, диапазон дат или сбросить активные фильтры.'
                      }
                      actionText={safeInvoices.length === 0 ? 'Создать первый счет' : undefined}
                      onAction={safeInvoices.length === 0 ? () => onNavigate('/invoices/create') : undefined}
                      secondaryActionText={hasActiveFilters ? 'Сбросить фильтры' : undefined}
                      onSecondaryAction={hasActiveFilters ? handleResetFilters : undefined}
                    />
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      <button
                        onClick={() => onNavigate(`/invoices/${inv.id}`)}
                        className="hover:underline flex items-center space-x-1 cursor-pointer font-black text-slate-900 dark:text-white"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#E67E22]" />
                        <span>{inv.number}</span>
                      </button>
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-slate-900 dark:text-white">{inv.clientName}</div>
                      {inv.clientInn && <div className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">ИНН {inv.clientInn}</div>}
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-slate-900 dark:text-white">{formatDateRu(inv.date)}</div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">до {formatDateRu(inv.dueDate)}</div>
                    </td>

                    <td className="p-3 font-black text-sm text-slate-900 dark:text-white font-mono">
                      {formatCurrency(inv.total, activeCurrency)}
                    </td>

                    <td className="p-3 text-slate-900 dark:text-white font-bold">
                      {formatCurrency(inv.taxAmount, activeCurrency)} ({inv.clientType === 'legal' ? '6%' : '4%'})
                    </td>

                    <td className="p-3">{getStatusBadge(inv)}</td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Quick Reminder for Overdue / Issued Invoices */}
                        {inv.status === 'overdue' && (
                          <button
                            onClick={() => {
                              setReminderInvoice(inv);
                              setReminderCopied(false);
                            }}
                            title="Быстрое напоминание об оплате"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                          >
                            <BellRing className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => onNavigate(`/invoices/${inv.id}`)}
                          title="Просмотреть счет"
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-secondary)] cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download / Print PDF */}
                        <button
                          onClick={() => generateInvoicePDF(inv, userProfile)}
                          title="Печать / Сохранить в PDF"
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Copy Public Link */}
                        <button
                          onClick={() => handleCopyPublicLink(inv)}
                          title="Скопировать ссылку для оплаты клиенту"
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 relative cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          {copiedToken === inv.id && (
                            <span className="absolute -top-7 right-0 px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded shadow">
                              Скопировано!
                            </span>
                          )}
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => {
                            if (onDuplicateInvoice) onDuplicateInvoice(inv);
                          }}
                          title="Дублировать счет"
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        {deletingInvoiceId === inv.id ? (
                          <div className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-lg border border-rose-200 dark:border-rose-900">
                            <span className="text-[10px] text-rose-600 font-bold">Удалить?</span>
                            <button
                              onClick={() => {
                                if (onDeleteInvoice) onDeleteInvoice(inv.id);
                                setDeletingInvoiceId(null);
                              }}
                              className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                            >
                              Да
                            </button>
                            <button
                              onClick={() => setDeletingInvoiceId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Нет
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingInvoiceId(inv.id)}
                            title="Удалить счет"
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK REMINDER MODAL */}
      {reminderInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                    Быстрое напоминание об оплате
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Счет {reminderInvoice.number} для {reminderInvoice.clientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderInvoice(null)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tone selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">Шаблон тональности:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReminderTone('polite')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    reminderTone === 'polite'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shadow-xs'
                      : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  Мягкое
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTone('standard')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    reminderTone === 'standard'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shadow-xs'
                      : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  Стандартное
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTone('urgent')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    reminderTone === 'urgent'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shadow-xs'
                      : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  Срочное
                </button>
              </div>
            </div>

            {/* Template preview */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">Текст сообщения:</label>
              <textarea
                rows={7}
                readOnly
                value={getReminderText(reminderInvoice, reminderTone)}
                className="w-full p-3 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono text-[var(--text-primary)] leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => handleCopyReminder(getReminderText(reminderInvoice, reminderTone))}
                className="flex-1 py-2.5 px-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                {reminderCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                <span>{reminderCopied ? 'Текст скопирован!' : 'Скопировать текст'}</span>
              </button>

              {reminderInvoice.clientEmail && (
                <a
                  href={`mailto:${reminderInvoice.clientEmail}?subject=${encodeURIComponent(
                    `Напоминание об оплате счета № ${reminderInvoice.number}`
                  )}&body=${encodeURIComponent(getReminderText(reminderInvoice, reminderTone))}`}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Отправить Email</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setReminderInvoice(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

