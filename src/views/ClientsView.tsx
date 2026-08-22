import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Tag,
  Edit,
  Trash2,
  FileText,
  X,
  ArrowUpDown,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Archive,
  ArchiveRestore,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  FolderArchive,
  BookOpen,
  MessageSquare,
  Calendar,
  Bold,
  List,
  Quote,
  Clock,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Client, ClientType, ClientStatus, Invoice, ClientNote } from '../types';
import { formatCurrency } from '../utils/numberToWordsRu';
import { EmptyState } from '../components/EmptyState';

interface ClientsViewProps {
  clients?: Client[];
  invoices?: Invoice[];
  onAddClient?: (client: Omit<Client, 'id' | 'createdAt' | 'totalLtv'>) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients = [],
  invoices = [],
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onNavigate
}) => {
  const safeClients = clients || [];
  const safeInvoices = invoices || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'legal' | 'individual'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [sortBy, setSortBy] = useState<'ltv' | 'name' | 'recent'>('ltv');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [archiveSuccessMessage, setArchiveSuccessMessage] = useState<string | null>(null);

  // Detail View & Notes state
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'meeting' | 'summary' | 'remark'>('meeting');

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<ClientType>('legal');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [inn, setInn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState('Постоянный, Проекты');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setType('legal');
    setStatus('active');
    setInn('');
    setEmail('');
    setPhone('');
    setAddress('');
    setTags('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name || '');
    setType(client.type || 'legal');
    setStatus(client.status || 'active');
    setInn(client.inn || '');
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setTags((client.tags || []).join(', '));
    setNotes(client.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingClient) {
      if (onUpdateClient) {
        onUpdateClient({
          ...editingClient,
          name,
          type,
          status,
          inn: inn || undefined,
          email,
          phone,
          address: address || undefined,
          tags: parsedTags,
          notes: notes || undefined
        });
      }
    } else {
      if (onAddClient) {
        onAddClient({
          name,
          type,
          status: 'active',
          inn: inn || undefined,
          email,
          phone,
          address: address || undefined,
          tags: parsedTags,
          notes: notes || undefined
        });
      }
    }

    setShowModal(false);
  };

  // Toggle archive status handler
  const handleToggleArchive = (client: Client) => {
    const isCurrentlyArchived = client.status === 'archived';
    const newStatus: ClientStatus = isCurrentlyArchived ? 'active' : 'archived';
    
    if (onUpdateClient) {
      onUpdateClient({
        ...client,
        status: newStatus
      });
      const msg = isCurrentlyArchived
        ? `Клиент «${client.name}» восстановлен из архива!`
        : `Клиент «${client.name}» перемещен в архив (история сохранена).`;
      setArchiveSuccessMessage(msg);
      setTimeout(() => setArchiveSuccessMessage(null), 3500);
    }
  };

  // Meeting Notes Handlers
  const handleAddMeetingNote = () => {
    if (!detailClient || !newNoteContent.trim()) return;

    const newNote: ClientNote = {
      id: `note_${Date.now()}`,
      title: newNoteTitle.trim() || `Заметка от ${new Date().toLocaleDateString('ru-RU')}`,
      content: newNoteContent.trim(),
      createdAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      category: newNoteCategory
    };

    const existingNotes = detailClient.meetingNotes || [];
    const updatedClient: Client = {
      ...detailClient,
      meetingNotes: [newNote, ...existingNotes]
    };

    setDetailClient(updatedClient);
    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }

    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleDeleteMeetingNote = (noteId: string) => {
    if (!detailClient) return;

    const updatedNotes = (detailClient.meetingNotes || []).filter((n) => n.id !== noteId);
    const updatedClient: Client = {
      ...detailClient,
      meetingNotes: updatedNotes
    };

    setDetailClient(updatedClient);
    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
  };

  // Compute LTV map for fast lookup
  const clientLtvMap = useMemo(() => {
    const map = new Map<string, number>();
    safeInvoices.forEach((inv) => {
      if (inv.clientId && inv.status === 'paid') {
        const current = map.get(inv.clientId) || 0;
        map.set(inv.clientId, current + (inv.total || 0));
      }
    });
    return map;
  }, [safeInvoices]);

  // Compute active invoice count per client
  const clientActiveInvoicesMap = useMemo(() => {
    const map = new Map<string, number>();
    safeInvoices.forEach((inv) => {
      if (inv.clientId && inv.status !== 'paid') {
        const current = map.get(inv.clientId) || 0;
        map.set(inv.clientId, current + 1);
      }
    });
    return map;
  }, [safeInvoices]);

  // Total metrics
  const activeClientsCount = safeClients.filter((c) => c.status !== 'archived').length;
  const archivedClientsCount = safeClients.filter((c) => c.status === 'archived').length;
  const totalLtvSum = safeClients.reduce((sum, c) => sum + (clientLtvMap.get(c.id) ?? (c.totalLtv || 0)), 0);

  // Filter & search logic
  const filteredAndSortedClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const cleanPhoneQuery = query.replace(/[^\d+]/g, '');

    const filtered = safeClients.filter((cli) => {
      // Archive Status Filter
      const isArchived = cli.status === 'archived';
      if (statusFilter === 'active' && isArchived) return false;
      if (statusFilter === 'archived' && !isArchived) return false;

      // Type filter
      if (typeFilter !== 'all' && cli.type !== typeFilter) {
        return false;
      }

      if (!query) return true;

      // Match fields
      const nameMatch = (cli.name || '').toLowerCase().includes(query);
      const emailMatch = (cli.email || '').toLowerCase().includes(query);
      const innMatch = (cli.inn || '').includes(query);
      const rawPhone = (cli.phone || '').toLowerCase();
      const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
      const phoneMatch = rawPhone.includes(query) || (cleanPhoneQuery && cleanPhone.includes(cleanPhoneQuery));
      const addressMatch = (cli.address || '').toLowerCase().includes(query);
      const tagsMatch = (cli.tags || []).some((t) => t.toLowerCase().includes(query));
      const notesMatch = (cli.notes || '').toLowerCase().includes(query);

      return nameMatch || emailMatch || innMatch || phoneMatch || addressMatch || tagsMatch || notesMatch;
    });

    // Sorting
    return filtered.sort((a, b) => {
      const ltvA = clientLtvMap.get(a.id) ?? (a.totalLtv || 0);
      const ltvB = clientLtvMap.get(b.id) ?? (b.totalLtv || 0);

      if (sortBy === 'ltv') {
        return ltvB - ltvA;
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '', 'ru');
      }
      if (sortBy === 'recent') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });
  }, [safeClients, searchTerm, typeFilter, statusFilter, sortBy, clientLtvMap]);

  // Export Clients to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Название / ФИО',
      'Тип клиента',
      'Статус',
      'ИНН',
      'Телефон',
      'Email',
      'Адрес / Город',
      'Теги',
      'LTV Выручка (руб.)',
      'Заметки'
    ];

    const rows = filteredAndSortedClients.map((client) => {
      const computedLtv = clientLtvMap.get(client.id) ?? (client.totalLtv || 0);
      return [
        `"${(client.name || '').replace(/"/g, '""')}"`,
        client.type === 'legal' ? 'Юрлицо/ИП (6%)' : 'Физлицо (4%)',
        client.status === 'archived' ? 'В архиве' : 'Активный',
        client.inn || '',
        client.phone || '',
        client.email || '',
        `"${(client.address || '').replace(/"/g, '""')}"`,
        `"${(client.tags || []).join(', ').replace(/"/g, '""')}"`,
        computedLtv,
        `"${(client.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `База_клиентов_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Toast Notification */}
      {archiveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#1E293B] border border-slate-700 shadow-2xl text-white flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-white">{archiveSuccessMessage}</span>
          <button onClick={() => setArchiveSuccessMessage(null)} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/30 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>CRM & База контактов</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Клиенты и контрагенты</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Учет договоров, ИНН, типов налогообложения (4% / 6%), LTV выручки и архивное хранение
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Скачать реестр клиентов в CSV (Excel)"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">Экспорт в CSV</span>
          </button>

          <button
            id="btn-create-new-client"
            onClick={openCreateModal}
            className="btn-cta px-4 py-2.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white font-extrabold">Добавить клиента</span>
          </button>
        </div>
      </div>

      {/* Top Stat Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="custom-card p-3.5 bg-[var(--bg-card)] border-l-4 border-l-purple-500">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Всего в базе</span>
          <div className="text-xl font-black text-[var(--text-primary)] mt-0.5">{safeClients.length}</div>
        </div>

        <div className="custom-card p-3.5 bg-[var(--bg-card)] border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Активные клиенты</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeClientsCount}</div>
        </div>

        <div className="custom-card p-3.5 bg-[var(--bg-card)] border-l-4 border-l-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">В архиве</span>
          <div className="text-xl font-black text-slate-500 dark:text-slate-400 mt-0.5">{archivedClientsCount}</div>
        </div>

        <div className="custom-card p-3.5 bg-[var(--bg-card)] border-l-4 border-l-[#E67E22]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E67E22]">Суммарный LTV</span>
          <div className="text-lg font-black text-[#E67E22] mt-0.5 truncate">{formatCurrency(totalLtvSum)}</div>
        </div>
      </div>

      {/* Filter, Search & Status Bar */}
      <div className="custom-card p-4 space-y-3 bg-[var(--bg-card)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status & Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[var(--bg-main)] p-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-bold">
            {/* Statuses */}
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                statusFilter === 'active'
                  ? 'btn-dark shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Активные ({activeClientsCount})
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center space-x-1 ${
                statusFilter === 'archived'
                  ? 'btn-dark shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Архив ({archivedClientsCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'btn-dark shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Все ({safeClients.length})
            </button>

            <span className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

            {/* Type selector */}
            <button
              onClick={() => setTypeFilter(typeFilter === 'legal' ? 'all' : 'legal')}
              className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-[11px] ${
                typeFilter === 'legal'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-[var(--text-secondary)] hover:bg-blue-500/10'
              }`}
            >
              Юрлица (6%)
            </button>
            <button
              onClick={() => setTypeFilter(typeFilter === 'individual' ? 'all' : 'individual')}
              className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-[11px] ${
                typeFilter === 'individual'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-[var(--text-secondary)] hover:bg-emerald-500/10'
              }`}
            >
              Физлица (4%)
            </button>
          </div>

          {/* Search Input & Sort Selection */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск: имя, телефон, email, ИНН..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  title="Очистить поиск"
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 bg-[var(--bg-main)] px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#E67E22] shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ltv">По выручке (LTV)</option>
                <option value="name">По имени (А-Я)</option>
                <option value="recent">Сначала новые</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Status info if filtered */}
        {(searchTerm || typeFilter !== 'all' || statusFilter !== 'active') && (
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                Показано: <strong className="text-[var(--text-primary)] font-bold">{filteredAndSortedClients.length}</strong> из {safeClients.length}
              </span>
              {statusFilter === 'archived' && (
                <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                  Режим просмотра архива
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('active');
              }}
              className="text-[#E67E22] hover:underline font-bold text-xs cursor-pointer"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {/* Clients Cards Grid */}
      {filteredAndSortedClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedClients.map((client) => {
            const computedLtv = clientLtvMap.get(client.id) ?? (client.totalLtv || 0);
            const activeInvoicesCount = clientActiveInvoicesMap.get(client.id) || 0;
            const isArchived = client.status === 'archived';

            return (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.015, y: -2 }}
                transition={{ duration: 0.2 }}
                className={`custom-card p-5 space-y-4 transition-all duration-200 hover:shadow-lg ${
                  isArchived
                    ? 'opacity-85 bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700'
                    : 'bg-[var(--bg-card)] hover:border-[#E67E22]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center space-x-1.5">
                        {!isArchived && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse"></span>
                          </span>
                        )}
                        <h3 className="font-bold text-base text-[var(--text-primary)]">{client.name}</h3>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.type === 'legal'
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {client.type === 'legal' ? 'Юрлицо/ИП (6%)' : 'Физлицо (4%)'}
                      </span>

                      {isArchived && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                          <FolderArchive className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          <span>В архиве</span>
                        </span>
                      )}
                    </div>

                    {client.inn && (
                      <p className="text-xs text-[var(--text-muted)] font-medium">
                        ИНН: <span className="font-mono">{client.inn}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions (Edit, Archive, Delete) */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Toggle Archive Action Button */}
                    <button
                      onClick={() => handleToggleArchive(client)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isArchived
                          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
                          : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                      title={isArchived ? 'Восстановить из архива' : 'Переместить в архив (скрыть из основного списка)'}
                    >
                      {isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => openEditModal(client)}
                      className="p-1.5 text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                      title="Редактировать клиента"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {deletingClientId === client.id ? (
                      <div className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-lg border border-rose-200 dark:border-rose-900">
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Удалить?</span>
                        <button
                          onClick={() => {
                            if (onDeleteClient) onDeleteClient(client.id);
                            setDeletingClientId(null);
                          }}
                          className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Да
                        </button>
                        <button
                          onClick={() => setDeletingClientId(null)}
                          className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Нет
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingClientId(client.id)}
                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-colors"
                        title="Удалить навсегда"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] font-medium">
                  {client.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <a
                        href={`mailto:${client.email}`}
                        className="hover:text-[#E67E22] transition-colors underline-offset-2 hover:underline"
                        title="Написать email"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <a
                        href={`tel:${client.phone.replace(/[^\d+]/g, '')}`}
                        className="hover:text-[#E67E22] transition-colors font-mono"
                        title="Позвонить"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {client.tags.map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchTerm(tag)}
                        className="px-2 py-0.5 bg-[var(--bg-main)] hover:bg-slate-200 dark:hover:bg-slate-800 border border-[var(--border-subtle)] text-[10px] font-bold rounded-md text-[var(--text-secondary)] cursor-pointer transition-colors"
                        title={`Фильтровать по тегу #${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bottom Stats & CTA */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] font-bold">
                      Выручка LTV {activeInvoicesCount > 0 && `(активных счетов: ${activeInvoicesCount})`}
                    </span>
                    <span className="font-extrabold text-[#E67E22] text-sm">{formatCurrency(computedLtv)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDetailClient(client)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-main)] hover:bg-amber-500/10 hover:border-[#E67E22] border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Открыть заметки по встречам и историю клиента"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>Заметки ({client.meetingNotes?.length || 0})</span>
                    </button>

                    {isArchived ? (
                      <button
                        onClick={() => handleToggleArchive(client)}
                        className="btn-dark px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-white font-bold">Восстановить</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('/invoices/create')}
                        className="btn-dark px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-white font-bold">+ Счет</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          type={searchTerm ? 'search' : 'clients'}
          title={
            searchTerm
              ? 'Клиенты не найдены'
              : statusFilter === 'archived'
              ? 'Архив пуст'
              : 'В базе пока нет клиентов'
          }
          description={
            searchTerm
              ? `По запросу «${searchTerm}» ничего не найдено. Проверьте правильность написания или сбросьте параметры поиска.`
              : statusFilter === 'archived'
              ? 'В архиве пока нет клиентов. Вы можете архивировать неактивных контрагентов в любой момент.'
              : 'Добавьте своего первого клиента или контрагента (юрлицо, ИП или физлицо) для быстрого выставления счетов и аналитики.'
          }
          actionText={!searchTerm && statusFilter !== 'archived' ? 'Добавить клиента' : undefined}
          onAction={!searchTerm && statusFilter !== 'archived' ? openCreateModal : undefined}
          secondaryActionText={searchTerm || typeFilter !== 'all' || statusFilter !== 'active' ? 'Сбросить фильтры' : undefined}
          onSecondaryAction={() => {
            setSearchTerm('');
            setTypeFilter('all');
            setStatusFilter('active');
          }}
          className="my-6"
        />
      )}

      {/* Modal Add / Edit Client */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">
                {editingClient ? 'Редактировать контрагента' : 'Новый клиент / Контрагент'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[var(--text-secondary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  Название компании или ФИО клиента *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ООО «ТехноПарк» или Иван Петров"
                  required
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                    Тип контрагента (НПД ставка) *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClientType)}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                  >
                    <option value="legal">Юрлицо / ИП (ставка налога 6%)</option>
                    <option value="individual">Физлицо (ставка налога 4%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                    Статус в базе
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                  >
                    <option value="active">Активный клиент</option>
                    <option value="archived">В архиве (скрыт из списка)</option>
                    <option value="lead">Потенциальный лид</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                    ИНН (для чеков и актов)
                  </label>
                  <input
                    type="text"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    placeholder="7701234567"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-mono text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                  Email для отправки счетов
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@company.ru"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                  Юридический адрес / Город
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="г. Москва, Пресненская наб., 12"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="VIP, Постоянный, Дизайн"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                  Заметки и особенности сотрудничества
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Оплата по постоплате 10 дней, контактное лицо Мария..."
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[#E67E22] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-cta px-5 py-2.5 rounded-xl text-white font-extrabold cursor-pointer shadow-md"
                >
                  <span className="text-white font-extrabold">{editingClient ? 'Сохранить изменения' : 'Создать контрагента'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Client Detail & Rich Text Meeting Notes CRM */}
      {detailClient && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setDetailClient(null)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl max-w-2xl w-full space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-lg text-[var(--text-primary)]">{detailClient.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailClient.type === 'legal'
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {detailClient.type === 'legal' ? 'Юрлицо/ИП (6%)' : 'Физлицо (4%)'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {detailClient.inn ? `ИНН: ${detailClient.inn} • ` : ''}
                  {detailClient.email || 'Email не указан'}
                </p>
              </div>
              <button
                onClick={() => setDetailClient(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-[var(--text-secondary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] text-center text-xs">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block font-bold">Выручка (LTV)</span>
                <span className="font-black text-[#E67E22]">{formatCurrency(clientLtvMap.get(detailClient.id) || 0)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block font-bold">Счетов выставлено</span>
                <span className="font-black text-[var(--text-primary)]">
                  {safeInvoices.filter((i) => i.clientId === detailClient.id).length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block font-bold">Статус в CRM</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {detailClient.status === 'archived' ? 'В архиве' : 'Активный'}
                </span>
              </div>
            </div>

            {/* Rich Text Notes Editor Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-[#E67E22]" />
                  <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                    Заметки со встреч и приватные ремарки
                  </h4>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  {detailClient.meetingNotes?.length || 0} записей
                </span>
              </div>

              {/* Note Composer Box */}
              <div className="p-3.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Тема встречи или заголовок (например: Звонок по правкам ТЗ)"
                      className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs font-bold text-[var(--text-primary)] focus:ring-1 focus:ring-[#E67E22] outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs font-medium text-[var(--text-primary)] focus:ring-1 focus:ring-[#E67E22] outline-none"
                    >
                      <option value="meeting">📅 Встреча / Звонок</option>
                      <option value="summary">📝 Резюме договоренностей</option>
                      <option value="remark">🔒 Частное примечание</option>
                    </select>
                  </div>
                </div>

                {/* Quick formatting toolbar */}
                <div className="flex items-center space-x-1 text-[11px] text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-1.5">
                  <button
                    type="button"
                    onClick={() => setNewNoteContent((prev) => prev + ' **важно** ')}
                    className="px-2 py-1 bg-[var(--bg-card)] hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-bold cursor-pointer flex items-center space-x-1"
                    title="Жирный текст"
                  >
                    <Bold className="w-3 h-3" />
                    <span>Жирный</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNoteContent((prev) => prev + '\n• ')}
                    className="px-2 py-1 bg-[var(--bg-card)] hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-medium cursor-pointer flex items-center space-x-1"
                    title="Список"
                  >
                    <List className="w-3 h-3" />
                    <span>Список</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNoteContent((prev) => prev + '\n> Цитата клиента: ')}
                    className="px-2 py-1 bg-[var(--bg-card)] hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-medium cursor-pointer flex items-center space-x-1"
                    title="Цитата"
                  >
                    <Quote className="w-3 h-3" />
                    <span>Цитата</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Зафиксируйте итоги встречи, требования заказчика, дедлайны или контактные нюансы..."
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] font-medium focus:ring-1 focus:ring-[#E67E22] outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddMeetingNote}
                    disabled={!newNoteContent.trim()}
                    className="px-3.5 py-1.5 bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>Сохранить заметку</span>
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {detailClient.meetingNotes && detailClient.meetingNotes.length > 0 ? (
                  detailClient.meetingNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-1.5 relative group hover:border-[#E67E22]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-[var(--text-primary)]">
                            {note.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-[#E67E22] border border-amber-500/20">
                            {note.category === 'meeting' ? 'Встреча' : note.category === 'summary' ? 'Резюме' : 'Примечание'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                            <span>{note.createdAt}</span>
                          </span>
                          <button
                            onClick={() => handleDeleteMeetingNote(note.id)}
                            className="text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                            title="Удалить заметку"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-main)] rounded-xl border border-dashed border-[var(--border-subtle)]">
                    Пока нет заметок по встречам для этого клиента. Добавьте первую запись выше.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => {
                  const cli = detailClient;
                  setDetailClient(null);
                  openEditModal(cli);
                }}
                className="text-xs font-bold text-[#E67E22] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Редактировать данные контрагента</span>
              </button>
              <button
                onClick={() => setDetailClient(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
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
