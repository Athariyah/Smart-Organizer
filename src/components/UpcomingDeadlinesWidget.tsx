import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  CheckSquare,
  ArrowRight,
  Calculator,
  Flame
} from 'lucide-react';
import { Invoice, Task, CalendarEvent } from '../types';
import { formatCurrency, formatDateRu } from '../utils/numberToWordsRu';

interface DeadlineItem {
  id: string;
  type: 'invoice' | 'task' | 'event' | 'tax';
  title: string;
  subtitle: string;
  amount?: number;
  dateStr: string;
  daysDiff: number; // < 0 is overdue, 0 is today, > 0 is future days
  urgency: 'overdue' | 'today' | 'soon' | 'upcoming';
  priority?: string;
  actionRoute: string;
  actionLabel: string;
}

interface UpcomingDeadlinesWidgetProps {
  invoices?: Invoice[];
  tasks?: Task[];
  events?: CalendarEvent[];
  onNavigate: (route: string) => void;
}

export const UpcomingDeadlinesWidget: React.FC<UpcomingDeadlinesWidgetProps> = ({
  invoices = [],
  tasks = [],
  events = [],
  onNavigate
}) => {
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'task' | 'event' | 'tax'>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateDaysDiff = (dateString: string): number => {
    try {
      const target = new Date(dateString);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 999;
    }
  };

  const getUrgency = (diff: number): 'overdue' | 'today' | 'soon' | 'upcoming' => {
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'today';
    if (diff <= 3) return 'soon';
    return 'upcoming';
  };

  const items: DeadlineItem[] = [];

  // 1. Invoices (pending or overdue)
  invoices.forEach((inv) => {
    if (inv.status === 'issued' || inv.status === 'overdue') {
      const days = calculateDaysDiff(inv.dueDate);
      items.push({
        id: `inv-${inv.id}`,
        type: 'invoice',
        title: `Счет №${inv.number} — ${inv.clientName}`,
        subtitle: `Ожидается оплата до ${formatDateRu(inv.dueDate)}`,
        amount: inv.total,
        dateStr: inv.dueDate,
        daysDiff: days,
        urgency: inv.status === 'overdue' || days < 0 ? 'overdue' : getUrgency(days),
        actionRoute: `/invoices/${inv.id}`,
        actionLabel: 'Открыть счет'
      });
    }
  });

  // 2. Tasks with due dates
  tasks.forEach((task) => {
    if (task.status !== 'done' && task.status !== 'completed' && task.dueDate) {
      const days = calculateDaysDiff(task.dueDate);
      items.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        subtitle: `Проект / Канбан · Срок: ${formatDateRu(task.dueDate)}`,
        dateStr: task.dueDate,
        daysDiff: days,
        urgency: getUrgency(days),
        priority: task.priority,
        actionRoute: '/tasks',
        actionLabel: 'В канбан'
      });
    }
  });

  // 3. Calendar events
  events.forEach((evt) => {
    if (evt.startTime) {
      const eventDate = evt.startTime.split('T')[0];
      const days = calculateDaysDiff(eventDate);
      if (days >= 0 && days <= 14) {
        items.push({
          id: `evt-${evt.id}`,
          type: 'event',
          title: evt.title,
          subtitle: `${evt.startTime.replace('T', ' в ')} · ${evt.location || 'Онлайн'}`,
          dateStr: eventDate,
          daysDiff: days,
          urgency: getUrgency(days),
          actionRoute: '/calendar',
          actionLabel: 'В календарь'
        });
      }
    }
  });

  // 4. Tax Deadline (28th of current or next month)
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let taxDeadline = new Date(currentYear, currentMonth, 28);
  if (today.getDate() > 28) {
    taxDeadline = new Date(currentYear, currentMonth + 1, 28);
  }
  const taxDays = Math.round((taxDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  items.push({
    id: 'tax-npd-deadline',
    type: 'tax',
    title: 'Уплата налога НПД за прошлый месяц',
    subtitle: `Крайний срок в ФНС "Мой налог": 28 ${taxDeadline.toLocaleString('ru-RU', { month: 'long' })}`,
    dateStr: taxDeadline.toISOString().split('T')[0],
    daysDiff: taxDays,
    urgency: taxDays <= 3 ? 'soon' : 'upcoming',
    actionRoute: '/taxes',
    actionLabel: 'Рассчитать налог'
  });

  // Sort: Overdue first, then today, then chronological ascending
  items.sort((a, b) => a.daysDiff - b.daysDiff);

  const filteredItems = items.filter((item) => filterType === 'all' || item.type === filterType);

  const overdueCount = items.filter((i) => i.urgency === 'overdue').length;
  const todayCount = items.filter((i) => i.urgency === 'today').length;

  return (
    <div className="custom-card p-5 space-y-4 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-[#E67E22] flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[var(--text-primary)] flex items-center space-x-2">
              <span>Ближайшие дедлайны и сроки</span>
              {overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {overdueCount} просрочено
                </span>
              )}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Контроль оплаты счетов, задач, созвонов и налоговых обязательств
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-[#2C3E50] text-white'
                : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Все ({items.length})
          </button>
          <button
            onClick={() => setFilterType('invoice')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'invoice'
                ? 'bg-[#2C3E50] text-white'
                : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Счета ({items.filter((i) => i.type === 'invoice').length})
          </button>
          <button
            onClick={() => setFilterType('task')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'task'
                ? 'bg-[#2C3E50] text-white'
                : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Задачи ({items.filter((i) => i.type === 'task').length})
          </button>
          <button
            onClick={() => setFilterType('event')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'event'
                ? 'bg-[#2C3E50] text-white'
                : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            События ({items.filter((i) => i.type === 'event').length})
          </button>
          <button
            onClick={() => setFilterType('tax')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'tax'
                ? 'bg-[#2C3E50] text-white'
                : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Налог НПД
          </button>
        </div>
      </div>

      {/* List of Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-[var(--text-muted)] font-medium space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p>Нет активных дедлайнов в выбранной категории</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            let badgeBg = 'bg-slate-100 text-[var(--text-primary)] dark:bg-slate-800 dark:text-slate-200';
            let badgeText = `Через ${item.daysDiff} дн.`;
            let borderAccent = 'border-slate-200 dark:border-slate-700';

            if (item.urgency === 'overdue') {
              badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200';
              badgeText = `Просрочен (${Math.abs(item.daysDiff)} дн.)`;
              borderAccent = 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20';
            } else if (item.urgency === 'today') {
              badgeBg = 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200';
              badgeText = 'Сегодня!';
              borderAccent = 'border-amber-300 dark:border-amber-800 bg-amber-50/20';
            } else if (item.urgency === 'soon') {
              badgeBg = 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200';
              badgeText = `Через ${item.daysDiff} ${item.daysDiff === 1 ? 'день' : 'дня'}`;
              borderAccent = 'border-blue-200 dark:border-blue-900';
            }

            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.actionRoute)}
                className={`p-3.5 rounded-xl border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-2.5 ${borderAccent} bg-[var(--bg-card)]`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {item.type === 'invoice' && <FileText className="w-3.5 h-3.5 text-[#E67E22]" />}
                      {item.type === 'task' && <CheckSquare className="w-3.5 h-3.5 text-blue-500" />}
                      {item.type === 'event' && <Calendar className="w-3.5 h-3.5 text-emerald-500" />}
                      {item.type === 'tax' && <Calculator className="w-3.5 h-3.5 text-[#E67E22]" />}
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                        {item.type === 'invoice' ? 'Счет' : item.type === 'task' ? 'Задача' : item.type === 'event' ? 'Встреча' : 'ФНС Налог'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${badgeBg}`}>
                      {badgeText}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-[var(--text-primary)] line-clamp-1 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  {item.amount !== undefined ? (
                    <span className="font-black text-[#E67E22] text-sm">
                      {formatCurrency(item.amount)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                      Срок: {formatDateRu(item.dateStr)}
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-[#E67E22] flex items-center space-x-0.5 hover:underline">
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 text-[#E67E22]" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
