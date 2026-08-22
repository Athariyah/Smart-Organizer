import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Clock,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  X,
  User,
  FileText,
  Tag as TagIcon,
  Filter,
  Check,
  Trash2,
  Search,
  ArrowUpDown,
  CheckCheck,
  Zap,
  RotateCcw,
  Square,
  Flame,
  PieChart as PieChartIcon,
  Github
} from 'lucide-react';
import { useLanguage } from '../context/LocalizationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Task, TaskStatus, TaskPriority, Client, Invoice } from '../types';
import { Server } from "lucide-react";
import { EmptyState } from '../components/EmptyState';

interface TasksViewProps {
  tasks?: Task[];
  clients?: Client[];
  invoices?: Invoice[];
  onSaveTask?: (task: Task) => void;
  onAddTask?: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onNavigate?: (route: string) => void;
}

const PRESET_TAGS = ['Срочно', 'Клиент', 'Учеба', 'Дизайн', 'Разработка', 'Договор', 'Оплата', 'Маркетинг'];

const getTagColorClass = (tag: string) => {
  const lower = tag.toLowerCase();
  if (lower.includes('срочн')) {
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border-rose-200 dark:border-rose-800';
  }
  if (lower.includes('клиент')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200 border-purple-200 dark:border-purple-800';
  }
  if (lower.includes('учеб')) {
    return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200 border-sky-200 dark:border-sky-800';
  }
  if (lower.includes('дизайн')) {
    return 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-200 border-pink-200 dark:border-pink-800';
  }
  if (lower.includes('разработ')) {
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800';
  }
  if (lower.includes('договор')) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-200 dark:border-amber-800';
  }
  if (lower.includes('оплат')) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
  }
  return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

export const TasksView: React.FC<TasksViewProps> = ({
  tasks = [],
  clients = [],
  invoices = [],
  onSaveTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onNavigate
}) => {
  const { language, t } = useLanguage();
  const safeTasks = tasks || [];
  const safeClients = clients || [];
  const safeInvoices = invoices || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGithubSyncModal, setShowGithubSyncModal] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate_asc' | 'dueDate_desc' | 'createdAt_desc' | 'title_asc'>('priority');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('2026-08-15');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Collect all unique tags across tasks and presets
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>(PRESET_TAGS);
    safeTasks.forEach((t) => {
      t.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [safeTasks]);

  // Donut chart status distribution data
  const chartData = useMemo(() => {
    const todoCount = safeTasks.filter((t) => t.status === 'todo').length;
    const inProgressCount = safeTasks.filter((t) => t.status === 'in_progress').length;
    const doneCount = safeTasks.filter((t) => t.status === 'done' || (t.status as string) === 'completed').length;

    return [
      { name: (t('auto.todo')), value: todoCount, color: '#64748B' },
      { name: (t('auto.inprogress')), value: inProgressCount, color: '#E67E22' },
      { name: (t('auto.done')), value: doneCount, color: '#10B981' }
    ];
  }, [safeTasks]);

  
  const handleGithubSync = async () => {
    if (!githubRepo.trim() || !onAddTask) return;
    setIsSyncingGithub(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/issues?state=open`);
      if (!response.ok) throw new Error('Repository not found or access denied');
      const issues = await response.json();
      
      let addedCount = 0;
      for (const issue of issues) {
        // Skip pull requests
        if (issue.pull_request) continue;
        
        // Map labels to priority
        let priority: TaskPriority = 'medium';
        const labels = issue.labels.map((l: any) => l.name.toLowerCase());
        if (labels.some((l: string) => l.includes('bug') || l.includes('critical') || l.includes('high'))) {
          priority = 'high';
        } else if (labels.some((l: string) => l.includes('low') || l.includes('minor'))) {
          priority = 'low';
        }
        
        onAddTask({
          title: `[${issue.number}] ${issue.title}`,
          description: issue.body || `Imported from GitHub: ${issue.html_url}`,
          status: 'todo',
          priority,
          tags: ['github', ...labels],
          clientId: '',
          invoiceId: '',
          dueDate: '',
          deadline: '', loggedHours: 0
        });
        addedCount++;
      }
      
      alert(`Успешно импортировано ${addedCount} задач(и) из GitHub.`);
      setShowGithubSyncModal(false);
      setGithubRepo('');
    } catch (err) {
      alert('Ошибка при синхронизации GitHub: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const totalTasksCount = safeTasks.length;
  const completedTasksCount = safeTasks.filter((t) => t.status === 'done' || (t.status as string) === 'completed').length;
  const inProgressTasksCount = safeTasks.filter((t) => t.status === 'in_progress').length;
  const todoTasksCount = safeTasks.filter((t) => t.status === 'todo').length;
  const urgentTasksCount = safeTasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done').length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Filtered & Sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...safeTasks];

    // 1. Tag filter
    if (selectedTagFilter !== 'all') {
      result = result.filter((t) => t.tags && t.tags.includes(selectedTagFilter));
    }

    // 2. Search query filter (title, description, tags, client name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const client = safeClients.find((c) => c.id === t.clientId);
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        const matchTags = (t.tags || []).some((tg) => tg.toLowerCase().includes(q));
        const matchClient = client ? client.name.toLowerCase().includes(q) : false;
        return matchTitle || matchDesc || matchTags || matchClient;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const pA = PRIORITY_ORDER[a.priority] || 1;
        const pB = PRIORITY_ORDER[b.priority] || 1;
        if (pA !== pB) return pB - pA; // highest priority first
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      if (sortBy === 'dueDate_asc') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      if (sortBy === 'dueDate_desc') {
        return (b.dueDate || '').localeCompare(a.dueDate || '');
      }
      if (sortBy === 'createdAt_desc') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [safeTasks, selectedTagFilter, searchQuery, sortBy, safeClients]);

  const columns: { status: TaskStatus; label: string; color: string; badgeColor: string }[] = [
    { status: 'todo', label: 'К выполнению (To Do)', color: 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800', badgeColor: 'bg-slate-500 text-white' },
    { status: 'in_progress', label: 'В работе (In Progress)', color: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60', badgeColor: 'bg-[#E67E22] text-white' },
    { status: 'done', label: 'Завершено (Done)', color: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60', badgeColor: 'bg-emerald-600 text-white' }
  ];

  // Selection handlers
  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredAndSortedTasks.map((t) => t.id));
    }
  };

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    if (!task.subtasks) return;
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
    const updatedTask: Task = {
      ...task,
      subtasks: updatedSubtasks,
      status: allDone ? 'done' : task.status === 'done' ? 'in_progress' : task.status
    };
    if (onUpdateTask) onUpdateTask(updatedTask);
    else if (onSaveTask) onSaveTask(updatedTask);
  };

  // Bulk actions
  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    selectedTaskIds.forEach((id) => {
      const task = safeTasks.find((t) => t.id === id);
      if (task) {
        const updated = { ...task, status: newStatus };
        if (onUpdateTask) onUpdateTask(updated);
        else if (onSaveTask) onSaveTask(updated);
      }
    });
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Вы уверены, что хотите удалить ${selectedTaskIds.length} задач(и)?`)) {
      selectedTaskIds.forEach((id) => {
        if (onDeleteTask) onDeleteTask(id);
      });
      setSelectedTaskIds([]);
    }
  };

  const toggleFormTag = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter((t) => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !formTags.includes(trimmed)) {
      setFormTags([...formTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newTaskData: Omit<Task, 'id' | 'createdAt'> = {
      title,
      description,
      status: 'todo' as TaskStatus,
      priority,
      deadline: dueDate || new Date().toISOString().split('T')[0],
      dueDate,
      clientId: selectedClientId || undefined,
      tags: formTags.length > 0 ? formTags : undefined,
      comments: []
    };

    if (onAddTask) {
      onAddTask(newTaskData);
    } else if (onSaveTask) {
      onSaveTask({
        ...newTaskData,
        id: `tsk_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      });
    }

    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setFormTags([]);
    setCustomTagInput('');
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const updated = { ...task, status: newStatus };
    if (onUpdateTask) {
      onUpdateTask(updated);
    } else if (onSaveTask) {
      onSaveTask(updated);
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300 font-extrabold uppercase border border-rose-500/30 flex items-center space-x-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600 animate-pulse"></span>
            </span>
            <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400 inline" />
            <span>Срочно</span>
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold uppercase border border-amber-500/30 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
            <span>Высокий</span>
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-800 dark:text-blue-300 font-extrabold uppercase border border-blue-500/30">
            Средний
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
            Низкий
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Канбан Доска Задач</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Управление этапами выполнения проектов с поддержкой тегов, аналитики и массовых операций
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setShowGithubSyncModal(true)}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 rounded-xl shadow-xs text-xs sm:text-sm font-bold flex items-center space-x-1.5 cursor-pointer border border-slate-700 dark:border-slate-600 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Синхронизация GitHub</span>
          </button>
          <button
            id="btn-add-new-task"
            onClick={() => {
              setFormTags([]);
              setShowAddModal(true);
            }}
            className="btn-cta px-4 py-2.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white font-extrabold">{t('auto.newtask')}</span>
          </button>
        </div>
      </div>

      {/* Analytics & Donut Chart Top Widget */}
      <div className="custom-card p-4 sm:p-5 bg-[var(--bg-card)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Donut Chart with Status Distribution */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalTasksCount > 0 ? chartData : [{ name: 'Нет задач', value: 1, color: '#334155' }]}
                    innerRadius={28}
                    outerRadius={44}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(totalTasksCount > 0 ? chartData : [{ name: 'Нет задач', value: 1, color: '#334155' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} шт.`, name]}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{completionPercentage}%</span>
                <span className="text-[9px] text-[var(--text-muted)] font-bold">Готово</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <PieChartIcon className="w-4 h-4 text-[#E67E22]" />
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Распределение задач</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {t('auto.ext.97')} <strong className="text-[var(--text-primary)]">{totalTasksCount}</strong> • Готово:{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">{completedTasksCount}</strong>
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto flex-1 max-w-2xl">
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] block">📋 В плане (To Do)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-black text-[var(--text-primary)]">{todoTasksCount}</span>
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  {totalTasksCount > 0 ? Math.round((todoTasksCount / totalTasksCount) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">⚡ В работе</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{inProgressTasksCount}</span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {totalTasksCount > 0 ? Math.round((inProgressTasksCount / totalTasksCount) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">✅ Завершено</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{completedTasksCount}</span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{completionPercentage}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block">🚨 Срочные</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">{urgentTasksCount}</span>
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">в работе</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Tag Filtering & Sorting Toolbar */}
      <div className="custom-card p-4 space-y-3 bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#E67E22] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="tasks-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, тегу или клиенту..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-medium focus:border-[#E67E22] outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#E67E22]" />
              <span className="hidden sm:inline">Сортировка:</span>
            </span>
            <select
              id="tasks-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-bold bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] cursor-pointer focus:border-[#E67E22] outline-hidden"
            >
              <option value="priority">По приоритету (Срочные вверху)</option>
              <option value="dueDate_asc">По сроку (сначала ближайшие)</option>
              <option value="dueDate_desc">По сроку (сначала дальние)</option>
              <option value="createdAt_desc">По дате создания (новые)</option>
              <option value="title_asc">По алфавиту (А-Я)</option>
            </select>
          </div>
        </div>

        {/* Tag Filtering Bar & Select All */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center space-x-1 mr-1">
              <TagIcon className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Теги:</span>
            </span>

            <button
              onClick={() => setSelectedTagFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                selectedTagFilter === 'all'
                  ? 'bg-[#2C3E50] text-white border-[#2C3E50]'
                  : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#E67E22]'
              }`}
            >
              Все ({safeTasks.length})
            </button>
            {allAvailableTags.map((tag) => {
              const count = safeTasks.filter((t) => t.tags && t.tags.includes(tag)).length;
              const isSelected = selectedTagFilter === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTagFilter(tag)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-xs'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#E67E22]'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Select All Toggle */}
          {filteredAndSortedTasks.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-[#E67E22] flex items-center space-x-1.5 px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] cursor-pointer"
            >
              {selectedTaskIds.length === filteredAndSortedTasks.length ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-[#E67E22]" />
                  <span>Снять выбор со всех</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Выбрать все ({filteredAndSortedTasks.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Floating / Sticky Bulk Actions Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="p-3 bg-[#1E293B] text-white rounded-2xl border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2 pl-2">
            <CheckCheck className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-black text-white">
              Выбрано задач: <span className="text-amber-400 font-extrabold">{selectedTaskIds.length}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('done')}
              className="btn-action px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-bold">Завершить все</span>
            </button>

            <button
              onClick={() => handleBulkStatusChange('in_progress')}
              className="btn-action px-3 py-1.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-bold">В работу</span>
            </button>

            <button
              onClick={() => handleBulkStatusChange('todo')}
              className="btn-action px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-bold">В план</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="btn-action px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-bold">Удалить ({selectedTaskIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedTaskIds([])}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board Columns or Empty State */}
      {filteredAndSortedTasks.length === 0 ? (
        <EmptyState
          type={searchQuery ? 'search' : 'tasks'}
          title={
            searchQuery
              ? 'Задачи не найдены'
              : safeTasks.length === 0
              ? 'Список задач пока пуст'
              : 'Нет задач, подходящих под выбранные фильтры'
          }
          description={
            searchQuery
              ? `По запросу «${searchQuery}» ничего не найдено. Проверьте запрос или очистите поиск.`
              : safeTasks.length === 0
              ? 'Создайте первую задачу, привяжите её к клиенту и контролируйте дедлайны на удобной канбан-доске.'
              : 'Попробуйте выбрать другой тег, приоритет или сбросить активные фильтры.'
          }
          actionText={safeTasks.length === 0 ? 'Создать первую задачу' : undefined}
          onAction={safeTasks.length === 0 ? () => setShowAddModal(true) : undefined}
          secondaryActionText={searchQuery || selectedTagFilter !== 'all' ? 'Сбросить фильтры' : undefined}
          onSecondaryAction={() => {
            setSearchQuery('');
            setSelectedTagFilter('all');
          }}
          className="my-6"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = filteredAndSortedTasks.filter((t) => {
            if (col.status === 'done') {
              return t.status === 'done' || (t.status as string) === 'completed';
            }
            return t.status === col.status;
          });

          return (
            <div
              key={col.status}
              className={`custom-card p-4 space-y-3 flex flex-col justify-between min-h-[500px] ${col.color}`}
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                    {col.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${col.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3">
                  {colTasks.map((task) => {
                    const client = clients.find((c) => c.id === task.clientId);
                    const isSelected = selectedTaskIds.includes(task.id);

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.2 }}
                        className={`bg-[var(--bg-surface)] p-4 rounded-xl border transition-colors space-y-2.5 text-xs shadow-xs cursor-pointer ${
                          isSelected
                            ? 'border-[#E67E22] ring-2 ring-[#E67E22]/30 bg-amber-500/5'
                            : 'border-[var(--border-subtle)] hover:border-[#E67E22]'
                        }`}
                      >
                        {/* Task Card Header with Checkbox */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2.5 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectTask(task.id)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#E67E22] focus:ring-[#E67E22] cursor-pointer accent-[#E67E22]"
                            />
                            <span className="font-bold text-sm text-[var(--text-primary)] leading-snug">
                              {task.title}
                            </span>
                          </div>
                          {getPriorityBadge(task.priority)}
                        </div>

                        {task.description && (
                          <p className="text-[var(--text-secondary)] text-[11px] font-medium line-clamp-2 pl-6">
                            {task.description}
                          </p>
                        )}

                        {/* Task Tags List */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5 pl-6">
                            {task.tags.map((tg) => (
                              <span
                                key={tg}
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getTagColorClass(
                                  tg
                                )}`}
                              >
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}

                        {client && (
                          <div className="pl-6">
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded inline-block">
                              {client.name}
                            </span>
                          </div>
                        )}

                        {/* Nested Subtasks / Checklist */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="pl-6 pt-1 space-y-1.5 border-t border-[var(--border-subtle)]">
                            <div className="text-[10px] font-bold text-[var(--text-muted)] flex items-center justify-between">
                              <span>Подзадачи ({task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}):</span>
                            </div>
                            <div className="space-y-1">
                              {task.subtasks.map((st) => (
                                <label
                                  key={st.id}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center space-x-2 text-[11px] cursor-pointer group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => handleToggleSubtask(task, st.id)}
                                    className="w-3.5 h-3.5 rounded text-[#E67E22] accent-[#E67E22] cursor-pointer"
                                  />
                                  <span className={`transition-all ${
                                    st.completed
                                      ? 'line-through text-[var(--text-muted)]'
                                      : 'text-[var(--text-primary)] group-hover:text-[#E67E22]'
                                  }`}>
                                    {st.title}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Progress Bar (Subtasks or Time spent or Status-based) */}
                        {(() => {
                          let progressPercent = 0;
                          let progressLabel = '';

                          if (task.subtasks && task.subtasks.length > 0) {
                            const completedCount = task.subtasks.filter((st) => st.completed).length;
                            progressPercent = Math.round((completedCount / task.subtasks.length) * 100);
                            progressLabel = `${completedCount}/${task.subtasks.length} подзадач (${progressPercent}%)`;
                          } else if (task.estimatedHours && task.estimatedHours > 0) {
                            const logged = task.loggedHours || 0;
                            progressPercent = Math.min(100, Math.round((logged / task.estimatedHours) * 100));
                            progressLabel = `${logged}/${task.estimatedHours} ч (${progressPercent}%)`;
                          } else if (task.status === 'done' || (task.status as string) === 'completed') {
                            progressPercent = 100;
                            progressLabel = '100% выполнено';
                          } else if (task.status === 'in_progress') {
                            progressPercent = 50;
                            progressLabel = '50% в работе';
                          } else {
                            progressPercent = 0;
                            progressLabel = '0% ожидает';
                          }

                          const isComplete = progressPercent === 100;

                          return (
                            <div className="pl-6 pt-1 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-[var(--text-muted)]">Прогресс:</span>
                                <span className={isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#E67E22]'}>
                                  {progressLabel}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercent}%` }}
                                  transition={{ duration: 0.4, ease: 'easeOut' }}
                                  className={`h-full rounded-full transition-colors ${
                                    isComplete
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                      : progressPercent > 0
                                      ? 'bg-gradient-to-r from-[#E67E22] to-amber-400'
                                      : 'bg-slate-400'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-medium">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <span className="font-semibold text-[var(--text-secondary)]">{task.dueDate}</span>
                          </div>

                          {/* Quick Status Shift & Delete Buttons */}
                          <div className="flex items-center space-x-1">
                            {col.status !== 'todo' && (
                              <button
                                onClick={() => handleStatusChange(task, 'todo')}
                                title="Переместить в To Do"
                                className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded text-[10px] cursor-pointer"
                              >
                                ← План
                              </button>
                            )}
                            {col.status !== 'in_progress' && (
                              <button
                                onClick={() => handleStatusChange(task, 'in_progress')}
                                title="Переместить в В работе"
                                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[10px] cursor-pointer"
                              >
                                В работу
                              </button>
                            )}
                            {col.status !== 'done' && (
                              <button
                                onClick={() => handleStatusChange(task, 'done')}
                                title="Завершить"
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] cursor-pointer"
                              >
                                ✓ Готово
                              </button>
                            )}
                            {onDeleteTask && (
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                title="Удалить задачу"
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="p-6 text-center text-xs text-[var(--text-muted)] font-medium border-2 border-dashed border-[var(--border-subtle)] rounded-xl">
                      {searchQuery || selectedTagFilter !== 'all' ? 'Нет задач, подходящих под фильтр' : 'Нет задач в этой колонке'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add Task Modal with Tags Selector */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-[var(--text-primary)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Создать задачу</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-[var(--text-secondary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">Название задачи *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Разработать прототип главного экрана..."
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-bold text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">Описание задачи</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)]"
                />
              </div>

              {/* Tags Selector & Custom Tag Input */}
              <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
                <label className="block font-black text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                  <TagIcon className="w-3.5 h-3.5 text-[#E67E22]" />
                  <span>Теги задачи (категории):</span>
                </label>

                {/* Preset tags quick pills */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((pt) => {
                    const isSelected = formTags.includes(pt);
                    return (
                      <button
                        type="button"
                        key={pt}
                        onClick={() => toggleFormTag(pt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-xs'
                            : 'bg-[var(--bg-main)] text-slate-800 dark:text-slate-200 border-[var(--border-subtle)] hover:border-[#E67E22]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span className={isSelected ? 'text-white' : ''}>#{pt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Tag */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="Свой тег (напр. #Рефакторинг)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    + Добавить
                  </button>
                </div>

                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium self-center mr-1">Выбрано:</span>
                    {formTags.map((ft) => (
                      <span
                        key={ft}
                        className="inline-flex items-center space-x-1 text-[11px] font-bold bg-[#E67E22]/15 text-[#E67E22] border border-[#E67E22]/30 px-2 py-0.5 rounded-lg"
                      >
                        <span>#{ft}</span>
                        <button
                          type="button"
                          onClick={() => toggleFormTag(ft)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">Приоритет</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)]"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочно!</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">Срок (Дедлайн)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">{t('auto.client')}</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-medium text-[var(--text-primary)]"
                >
                  <option value="">-- Без клиента --</option>
                  {safeClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 font-bold text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-cta px-4 py-2 text-white font-extrabold rounded-xl shadow-sm cursor-pointer"
                >
                  <span className="text-white font-extrabold">Создать</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GitHub Sync Modal */}
      <AnimatePresence>
        {showGithubSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-main)] rounded-2xl shadow-xl w-full max-w-md p-6 border border-[var(--border-subtle)] space-y-4 text-[var(--text-primary)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg flex items-center space-x-2">
                  <Github className="w-6 h-6" />
                  <span>Синхронизация GitHub Issues</span>
                </h3>
                <button onClick={() => setShowGithubSyncModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Укажите репозиторий в формате <strong>владелец/репозиторий</strong> (например, <code>facebook/react</code>), чтобы импортировать открытые Issue в качестве задач.
              </p>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Репозиторий (owner/repo)</label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="e.g. microsoft/vscode"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGithubSync();
                  }}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setShowGithubSyncModal(false)}
                  className="px-4 py-2 font-bold text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={handleGithubSync}
                  disabled={!githubRepo.trim() || isSyncingGithub}
                  className="px-4 py-2 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSyncingGithub && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSyncingGithub ? 'Загрузка...' : 'Синхронизировать'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
