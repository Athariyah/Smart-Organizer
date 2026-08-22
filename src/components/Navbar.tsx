import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Bell,
  Search,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut,
  Settings,
  CheckCheck,
  Calendar,
  Check,
  CreditCard,
  Building,
  Plus,
  ChevronDown,
  FilePlus,
  ListTodo,
  UserPlus,
  Calculator,
  Zap,
  Flame,
  Globe,
  Clock,
  ArrowRight,
  X,
  Tag,
  Users,
  ExternalLink,
  CornerDownLeft
} from 'lucide-react';
import { UserProfile, AuthUser, Task, Invoice, Client } from '../types';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../context/LocalizationContext';
import { formatCurrency } from '../utils/numberToWordsRu';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'tax' | 'invoice' | 'task' | 'general';
  read: boolean;
  route: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Напоминание по налогу НПД',
    description: 'Срок уплаты налога за прошлый месяц до 25 числа в приложении «Мой Налог».',
    time: '2 часа назад',
    type: 'tax',
    read: false,
    route: '/taxes'
  },
  {
    id: 'n2',
    title: 'Счет СЧ-2026-002 оплачен',
    description: 'Поступили средства 60 000 ₽ от заказчика.',
    time: 'Сегодня, 11:30',
    type: 'invoice',
    read: false,
    route: '/invoices'
  }
];

interface NavbarProps {
  user?: AuthUser | null;
  userProfile?: UserProfile;
  tasks?: Task[];
  invoices?: Invoice[];
  clients?: Client[];
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  currentRoute?: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userProfile,
  tasks = [],
  invoices = [],
  clients = [],
  isDarkMode = false,
  onToggleDarkMode,
  currentRoute = '/dashboard',
  onNavigate,
  onLogout
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Deep Work Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      // Pause/Stop
      setIsTimerRunning(false);
      const minutes = Math.floor(timerSeconds / 60);
      alert(`${t('auto.focusedsessioncompletedlogged')} ${minutes} мин. Выберите задачу для привязки времени.`);
      // Optional: open a modal to select a task, reset timer for now
      setTimerSeconds(0);
    } else {
      // Start
      setIsTimerRunning(true);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter global search results across Invoices, Clients, Tasks
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return { invoices: [], clients: [], tasks: [], totalCount: 0 };
    }

    const matchedInvoices = invoices.filter((inv) => {
      const numberMatch = (inv.number || '').toLowerCase().includes(query);
      const clientMatch = (inv.clientName || '').toLowerCase().includes(query);
      const innMatch = Boolean(inv.clientInn && inv.clientInn.includes(query));
      const notesMatch = Boolean(inv.notes && inv.notes.toLowerCase().includes(query));
      const itemsMatch = inv.items?.some((item) => (item.description || '').toLowerCase().includes(query));
      const statusMatch = (inv.status || '').toLowerCase().includes(query);
      return numberMatch || clientMatch || innMatch || notesMatch || itemsMatch || statusMatch;
    }).slice(0, 5);

    const matchedClients = clients.filter((client) => {
      const nameMatch = (client.name || '').toLowerCase().includes(query);
      const innMatch = Boolean(client.inn && client.inn.includes(query));
      const emailMatch = Boolean(client.email && client.email.toLowerCase().includes(query));
      const phoneMatch = Boolean(client.phone && client.phone.includes(query));
      const tagsMatch = client.tags?.some((t) => t.toLowerCase().includes(query));
      const notesMatch = Boolean(client.notes && client.notes.toLowerCase().includes(query));
      return nameMatch || innMatch || emailMatch || phoneMatch || tagsMatch || notesMatch;
    }).slice(0, 5);

    const matchedTasks = tasks.filter((task) => {
      const titleMatch = (task.title || '').toLowerCase().includes(query);
      const descMatch = Boolean(task.description && task.description.toLowerCase().includes(query));
      const tagsMatch = task.tags?.some((t) => t.toLowerCase().includes(query));
      const subtasksMatch = task.subtasks?.some((st) => (st.title || '').toLowerCase().includes(query));
      const priorityMatch = (task.priority || '').toLowerCase().includes(query);
      return titleMatch || descMatch || tagsMatch || subtasksMatch || priorityMatch;
    }).slice(0, 5);

    const totalCount = matchedInvoices.length + matchedClients.length + matchedTasks.length;
    return {
      invoices: matchedInvoices,
      clients: matchedClients,
      tasks: matchedTasks,
      totalCount
    };
  }, [searchQuery, invoices, clients, tasks]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K / '/' to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Calculate urgent tasks within 24 hours or overdue
  const now = new Date();
  const urgentTasks = tasks.filter((task) => {
    if (task.status === 'done' || (task.status as string) === 'completed') return false;
    if (!task.dueDate) return false;
    const dueTime = new Date(task.dueDate).getTime();
    if (isNaN(dueTime)) return false;
    const diffHours = (dueTime - now.getTime()) / (1000 * 60 * 60);
    // Overdue or due within 24 hours
    return diffHours <= 24;
  });

  const getDueLabel = (dueDateStr: string) => {
    const dueTime = new Date(dueDateStr).getTime();
    const diffHours = (dueTime - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0) {
      const overdueDays = Math.max(1, Math.floor(Math.abs(diffHours) / 24));
      return {
        text: language === 'ru' ? `Просрочено на ${overdueDays} дн.` : `Overdue by ${overdueDays}d`,
        isOverdue: true
      };
    }
    const remainingHours = Math.max(1, Math.round(diffHours));
    return {
      text: language === 'ru' ? `Срок: через ${remainingHours} ч` : `Due in ${remainingHours}h`,
      isOverdue: false
    };
  };

  // Close panels when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (showQuickActions && quickActionsRef.current && !quickActionsRef.current.contains(target)) {
        setShowQuickActions(false);
      }
      if (isSearchOpen && searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowQuickActions(false);
        setIsSearchOpen(false);
        setShowMobileSearch(false);
      }
    };

    if (showNotifications || showProfileMenu || showQuickActions || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications, showProfileMenu, showQuickActions, isSearchOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length + (urgentTasks.length > 0 ? urgentTasks.length : 0);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setShowNotifications(false);
    onNavigate(item.route);
  };

  const displayProfile = userProfile || {
    fullName: user?.fullName || (t('auto.alexeysmirnov')),
    email: user?.email || 'alexey.design@organizer.ru',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    inn: '772849102834',
    isSelfEmployed: true
  };

  const routeTitlesRu: Record<string, string> = {
    '/': 'Главная',
    '/dashboard': 'Обзор органайзера',
    '/invoices': 'Управление счетами',
    '/invoices/create': 'Создание счета',
    '/clients': 'База клиентов (CRM)',
    '/calendar': 'Календарь встреч и событий',
    '/tasks': 'Канбан доска задач',
    '/taxes': 'Налоговый кабинет (НПД)',
    '/analytics': 'Аналитика и Утилиты',
    '/reports': 'Отчеты и акты',
    '/settings': 'Настройки профиля',
    '/login': 'Вход в систему',
    '/register': 'Регистрация'
  };

  const routeTitlesEn: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Organizer Overview',
    '/invoices': 'Invoice Management',
    '/invoices/create': 'Create Invoice',
    '/clients': 'Client CRM Base',
    '/calendar': 'Calendar & Events',
    '/tasks': 'Kanban Task Board',
    '/taxes': 'NPD Tax Center',
    '/analytics': 'Analytics & Utilities',
    '/reports': 'Reports & Acts',
    '/settings': 'Profile Settings',
    '/login': 'Sign In',
    '/register': 'Sign Up'
  };

  const getPageTitle = () => {
    const routeStr = currentRoute || '/dashboard';
    if (routeStr.startsWith('/invoices/edit/')) return t('auto.editinvoice');
    if (routeStr.startsWith('/invoices/public/')) return t('auto.publicinvoice');
    if (routeStr.startsWith('/invoices/')) return t('auto.invoicedetails');
    
    const titles = language === 'ru' ? routeTitlesRu : routeTitlesEn;
    return titles[routeStr] || (t('auto.smartorganizer'));
  };

  return (
    <header className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-colors shadow-xs z-30">
      {/* Title & Brand */}
      <div className="flex items-center space-x-3">
        <div className="md:hidden flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('/dashboard')}>
          <BrandLogo size={32} />
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {getPageTitle()}
        </h1>
        {displayProfile.isSelfEmployed && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700 dark:text-emerald-400" />
            {t('nav.npdBadge')}
          </span>
        )}
      </div>

      {/* Global Search Component */}
      <div className="flex-1 max-w-md mx-4 relative hidden md:block" ref={searchContainerRef}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={t('auto.searchinvoicesclientstasks')}
            className="w-full pl-9 pr-16 py-2 text-xs sm:text-sm bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] transition-all shadow-2xs font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              ⌘K
            </span>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[80vh] flex flex-col"
            >
              {/* Header inside search dropdown */}
              <div className="p-3 border-b border-[var(--border-subtle)] bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {searchQuery.trim()
                    ? `${t('auto.searchresults')} (${searchResults.totalCount})`
                    : t('auto.quicknavigation')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  {t('auto.esctoclose')}
                </span>
              </div>

              <div className="overflow-y-auto p-2 divide-y divide-[var(--border-subtle)]">
                {/* No query typed yet - Quick Links */}
                {!searchQuery.trim() && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      {t('auto.typetosearchinvoices')}
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          onNavigate('/invoices');
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E67E22]/10 dark:hover:bg-[#E67E22]/20 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#E67E22] mb-1" />
                        <div className="font-bold text-xs text-slate-900 dark:text-white">Все счета</div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">{invoices.length} в базе</div>
                      </button>
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          onNavigate('/clients');
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                        <div className="font-bold text-xs text-slate-900 dark:text-white">Клиенты</div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">{clients.length} контрагентов</div>
                      </button>
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          onNavigate('/tasks');
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
                      >
                        <ListTodo className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                        <div className="font-bold text-xs text-slate-900 dark:text-white">Задачи</div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">{tasks.length} в работе</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Invoices Group */}
                {searchResults.invoices.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-[#E67E22] flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t('auto.invoices')} ({searchResults.invoices.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            onNavigate(`/invoices/${inv.id}`);
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#E67E22]">
                                {inv.number}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                  : inv.status === 'overdue'
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              }`}>
                                {inv.status === 'paid' ? 'Оплачен' : inv.status === 'overdue' ? 'Просрочен' : 'Ожидает'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate mt-0.5 font-medium">
                              {inv.clientName} {inv.clientInn ? `• ИНН ${inv.clientInn}` : ''}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">
                              {formatCurrency(inv.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clients Group */}
                {searchResults.clients.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{t('auto.clients')} ({searchResults.clients.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.clients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            onNavigate('/clients');
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                {client.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300">
                                {client.type === 'legal' ? 'Юрлицо 6%' : 'Физлицо 4%'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate mt-0.5 font-medium">
                              {client.email || client.phone || (client.inn ? `{t('nav.inn')}: ${client.inn}` : 'Без контактов')}
                            </div>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-500 dark:text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks Group */}
                {searchResults.tasks.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>{t('auto.tasks')} ({searchResults.tasks.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            onNavigate('/tasks');
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                {task.title}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                task.priority === 'urgent' || task.priority === 'high'
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                {task.priority === 'urgent' ? 'Срочно' : task.priority === 'high' ? 'Высокий' : 'Обычный'}
                              </span>
                            </div>
                            {task.description && (
                              <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate mt-0.5 font-medium">
                                {task.description}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                            {task.status === 'done' ? 'Готово' : task.status === 'in_progress' ? (t('auto.inprogress')) : (t('auto.todo'))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State inside Search */}
                {searchQuery.trim() && searchResults.totalCount === 0 && (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#E67E22] mx-auto flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'ru' ? `По запросу «${searchQuery}» ничего не найдено` : `No results for "${searchQuery}"`}
                    </p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">
                      {t('auto.trysearchingbynumber')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Right */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Search Trigger Button */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="md:hidden p-2 rounded-xl text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800 border border-[var(--border-subtle)] transition-colors cursor-pointer"
          title="Поиск"
        >
          <Search className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        </button>

        {/* Deep Work Timer */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTimerToggle}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-colors cursor-pointer border ${
            isTimerRunning
              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
              : 'bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800 border-[var(--border-subtle)]'
          }`}
          title="Deep Work Timer"
        >
          {isTimerRunning ? (
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          <span className="font-mono tracking-wider min-w-[40px] text-center">
            {timerSeconds > 0 ? formatTimer(timerSeconds) : '00:00'}
          </span>
        </motion.button>

        {/* Urgent Task Due Badge Alert Button in Navbar */}
        {urgentTasks.length > 0 && (
          <motion.button
            id="navbar-urgent-tasks-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('/tasks')}
            title={language === 'ru' ? `Внимание: ${urgentTasks.length} задач(и) с дедлайном до 24 часов!` : `Alert: ${urgentTasks.length} task(s) due within 24 hours!`}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all animate-pulse"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-black font-mono">{urgentTasks.length}</span>
            <span className="hidden sm:inline text-[11px] font-bold">
              {t('auto.due24h')}
            </span>
          </motion.button>
        )}

        {/* Quick Actions Dropdown Button */}
        <div className="relative" ref={quickActionsRef}>
          <motion.button
            id="navbar-quick-actions-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setShowQuickActions(!showQuickActions);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="btn-cta px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer hover:shadow transition-all"
            title={t('nav.create')}
          >
            <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
              <Plus className="w-4 h-4 text-white shrink-0" />
            </motion.div>
            <span className="hidden sm:inline text-white font-bold">{t('nav.create')}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl py-2 z-50 text-sm text-[var(--text-primary)]"
              >
                <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-t-xl">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-[#E67E22]" />
                    <span className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                      {t('dash.quickActions')}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onNavigate('/invoices/create');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[var(--text-primary)] hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center space-x-3 font-bold cursor-pointer transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-[#E67E22] flex items-center justify-center">
                      <FilePlus className="w-4 h-4 text-[#E67E22]" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[var(--text-primary)]">{t('nav.createInvoice')}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium">
                        {t('auto.toclientorcompany')}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onNavigate('/tasks');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[var(--text-primary)] hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center space-x-3 font-bold cursor-pointer transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                      <ListTodo className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[var(--text-primary)]">{t('tasks.addTask')}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium">
                        {t('auto.intokanbanboard')}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onNavigate('/clients');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[var(--text-primary)] hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-3 font-bold cursor-pointer transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[var(--text-primary)]">{t('clients.addClient')}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium">
                        {t('auto.intocrmdatabase')}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onNavigate('/taxes');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[var(--text-primary)] hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center space-x-3 font-bold cursor-pointer transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[var(--text-primary)]">{t('taxes.calcTitle')}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium">
                        {t('auto.46calculation')}
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationsRef}>
          <motion.button
            id="navbar-notifications-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            title={t('nav.notifications')}
            className="p-2 rounded-xl text-[var(--text-primary)] bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Bell className="w-5 h-5 text-[var(--text-primary)]" />
            </motion.div>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E67E22] rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl py-2 z-50 text-sm text-[var(--text-primary)]"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] font-extrabold flex justify-between items-center bg-[var(--bg-surface)] rounded-t-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-[var(--text-primary)] text-sm font-black">{t('nav.notifications')}</span>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 text-[11px] font-extrabold bg-[#E67E22] text-white rounded-full shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 ? (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[#E67E22] hover:text-[#D35400] font-extrabold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>{t('nav.markAllRead')}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('nav.allRead')}</span>
                    </span>
                  )}
                </div>

                {/* Urgent Tasks Section if any */}
                {urgentTasks.length > 0 && (
                  <div className="p-3 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-rose-600 dark:text-rose-400">
                      <span className="flex items-center space-x-1.5">
                        <Flame className="w-4 h-4" />
                        <span>{t('nav.urgentTasks')}</span>
                      </span>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate('/tasks');
                        }}
                        className="text-[11px] font-bold text-[#E67E22] hover:underline flex items-center space-x-0.5 cursor-pointer"
                      >
                        <span>{t('auto.alltasks')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {urgentTasks.map((tItem) => {
                        const dueInfo = getDueLabel(tItem.dueDate || '');
                        return (
                          <div
                            key={tItem.id}
                            onClick={() => {
                              setShowNotifications(false);
                              onNavigate('/tasks');
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 hover:border-rose-400 flex items-center justify-between text-xs cursor-pointer transition-colors shadow-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-extrabold text-[var(--text-primary)] truncate text-[11px]">
                                {tItem.title}
                              </p>
                              {tItem.clientName && (
                                <p className="text-[10px] text-[var(--text-muted)] truncate">
                                  {tItem.clientName}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                              dueInfo.isOverdue
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}>
                              {dueInfo.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Regular Items List */}
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/80">
                  {notifications.length === 0 && urgentTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[var(--text-muted)] font-bold">
                      {t('nav.noNotifications')}
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex items-start space-x-3.5 ${
                          !item.read ? 'bg-amber-500/10' : 'bg-[var(--bg-card)]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'tax' && (
                            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200 dark:border-transparent">
                              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                          )}
                          {item.type === 'invoice' && (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200 dark:border-transparent">
                              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          )}
                          {item.type === 'task' && (
                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-200 dark:border-transparent">
                              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          {item.type === 'general' && (
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] flex items-center justify-center font-bold border border-slate-200 dark:border-transparent">
                              <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {item.title}
                            </p>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug font-medium">
                            {item.description}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)] font-bold block mt-1">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-b-xl text-center">
                  <button
                    onClick={() => {
                      handleMarkAllAsRead();
                      setShowNotifications(false);
                    }}
                    className="w-full py-1.5 text-xs text-[var(--text-secondary)] hover:text-[#E67E22] dark:hover:text-[#E67E22] font-extrabold transition-colors cursor-pointer"
                  >
                    {t('nav.closeNotifications')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar Menu */}
        <div className="relative" ref={profileMenuRef}>
          <motion.button
            id="navbar-profile-menu-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 p-1 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <img
              src={displayProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={displayProfile.fullName}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
            />
            <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] hidden lg:inline-block px-1">
              {displayProfile.fullName.split(' ')[0]}
            </span>
          </motion.button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl py-2 z-50 text-sm text-[var(--text-primary)]"
              >
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-t-xl">
                  <p className="font-extrabold text-sm text-[var(--text-primary)] truncate">
                    {displayProfile.fullName}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] font-bold truncate mt-0.5">
                    {displayProfile.email}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 font-bold cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#E67E22]" />
                    <span>{t('nav.profileSettings')}</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('/taxes');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 font-bold cursor-pointer transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    <span>{t('nav.inn')}: {displayProfile.inn}</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('/invoices');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 font-bold cursor-pointer transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>{t('nav.myInvoices')}</span>
                  </button>
                </div>

                <div className="border-t border-[var(--border-subtle)] my-1" />

                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    else onNavigate('/login');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2.5 font-bold cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>{t('nav.logout')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Search Modal Overlay */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs p-4 flex flex-col justify-start md:hidden"
            onClick={() => setShowMobileSearch(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col mt-2"
            >
              <div className="p-3 border-b border-[var(--border-subtle)] flex items-center space-x-2">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPl')}
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-2 divide-y divide-[var(--border-subtle)] flex-1">
                {/* Invoices */}
                {searchResults.invoices.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-[#E67E22] flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t('nav.inv')} ({searchResults.invoices.length})</span>
                    </div>
                    {searchResults.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setShowMobileSearch(false);
                          onNavigate(`/invoices/${inv.id}`);
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {inv.number}
                          </div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-medium">
                            {inv.clientName}
                          </div>
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">
                          {formatCurrency(inv.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clients */}
                {searchResults.clients.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{t('nav.cli')} ({searchResults.clients.length})</span>
                    </div>
                    {searchResults.clients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => {
                          setShowMobileSearch(false);
                          onNavigate('/clients');
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {client.name}
                          </div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-medium">
                            {client.email || client.phone || (client.inn ? `{t('nav.inn')}: ${client.inn}` : '')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks */}
                {searchResults.tasks.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>{t('nav.tsk')} ({searchResults.tasks.length})</span>
                    </div>
                    {searchResults.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setShowMobileSearch(false);
                          onNavigate('/tasks');
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-medium">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.trim() && searchResults.totalCount === 0 && (
                  <div className="p-6 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t('nav.notF')}</p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">{t('nav.try')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
