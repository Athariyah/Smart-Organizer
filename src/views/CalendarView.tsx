import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  ExternalLink,
  Users,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  ListFilter,
  CheckCircle2,
  CalendarDays,
  List,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import { CalendarEvent, Client, Invoice } from '../types';

interface CalendarViewProps {
  events?: CalendarEvent[];
  clients?: Client[];
  invoices?: Invoice[];
  onSaveEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events = [],
  clients = [],
  invoices = [],
  onSaveEvent,
  onDeleteEvent
}) => {
  const safeEvents = events || [];
  const safeClients = clients || [];
  const safeInvoices = invoices || [];

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(10);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(7); // 0-based: 7 is August
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick form state
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('2026-08-10T14:00');
  const [endTime, setEndTime] = useState('2026-08-10T15:00');
  const [type, setType] = useState<'meeting' | 'call' | 'deadline' | 'invoice'>('meeting');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [location, setLocation] = useState('Google Meet');
  const [description, setDescription] = useState('');

  const monthsNames = [
    'Январь 2026', 'Февраль 2026', 'Март 2026', 'Апрель 2026',
    'Май 2026', 'Июнь 2026', 'Июль 2026', 'Август 2026',
    'Сентябрь 2026', 'Октябрь 2026', 'Ноябрь 2026', 'Декабрь 2026'
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt_${Date.now()}`,
      title: title.trim(),
      startTime,
      endTime,
      type,
      clientId: selectedClientId || undefined,
      location: location.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveEvent?.(newEvt);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  // Google Calendar Link Generator
  const getGoogleCalendarUrl = (evt: CalendarEvent) => {
    const startIso = (evt?.startTime || '').replace(/[-:]/g, '');
    const endIso = (evt?.endTime || '').replace(/[-:]/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      evt?.title || ''
    )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
      evt?.description || 'Событие из Умного Органайзера'
    )}&location=${encodeURIComponent(evt?.location || '')}`;
  };

  const filteredEvents = safeEvents.filter((evt) => {
    const matchesFilter = filterType === 'all' || evt.type === filterType;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.location && evt.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Week days representation (Week of Aug 10 - Aug 16, 2026)
  const weekDays = [
    { name: 'Пн', date: '2026-08-10', dayNumber: 10, label: '10 авг' },
    { name: 'Вт', date: '2026-08-11', dayNumber: 11, label: '11 авг' },
    { name: 'Ср', date: '2026-08-12', dayNumber: 12, label: '12 авг' },
    { name: 'Чт', date: '2026-08-13', dayNumber: 13, label: '13 авг' },
    { name: 'Пт', date: '2026-08-14', dayNumber: 14, label: '14 авг' },
    { name: 'Сб', date: '2026-08-15', dayNumber: 15, label: '15 авг' },
    { name: 'Вс', date: '2026-08-16', dayNumber: 16, label: '16 авг' }
  ];

  const timeSlots = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

  const getTypeBadge = (evtType: string) => {
    switch (evtType) {
      case 'meeting':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">Встреча</span>;
      case 'call':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">Созвон</span>;
      case 'deadline':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">Дедлайн</span>;
      case 'invoice':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">Оплата</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Событие</span>;
    }
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Календарь встреч и событий
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            Интеграция с Google Meet & Calendly, дедлайны счетов и созвоны с заказчиками
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* View Mode Switcher */}
          <div className="bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-1 rounded-xl text-xs font-black flex shadow-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 ${
                viewMode === 'month'
                  ? 'bg-[#E67E22] text-white shadow-sm font-black'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Месяц</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 ${
                viewMode === 'week'
                  ? 'bg-[#E67E22] text-white shadow-sm font-black'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Неделя</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 ${
                viewMode === 'list'
                  ? 'bg-[#E67E22] text-white shadow-sm font-black'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Список</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold rounded-xl shadow-md text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Запланировать</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: MONTH */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid Representation */}
          <div className="custom-card p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-[#E67E22]" />
                <span>{monthsNames[currentMonthIndex]}</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[var(--text-secondary)] cursor-pointer"
                  title="Предыдущий месяц"
                >
                  <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
                <button
                  onClick={() => setCurrentMonthIndex(7)}
                  className="px-2.5 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[var(--text-secondary)] cursor-pointer"
                >
                  Сегодня
                </button>
                <button
                  onClick={() => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[var(--text-secondary)] cursor-pointer"
                  title="Следующий месяц"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>

            {/* Days Grid View */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--text-primary)]">
              <div className="py-1">Пн</div>
              <div className="py-1">Вт</div>
              <div className="py-1">Ср</div>
              <div className="py-1">Чт</div>
              <div className="py-1">Пт</div>
              <div className="py-1 text-amber-600 dark:text-amber-400">Сб</div>
              <div className="py-1 text-rose-600 dark:text-rose-400">Вс</div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
                const dayEvents = safeEvents.filter((e) => e.startTime.startsWith(dateStr));
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[84px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#E67E22] ring-2 ring-amber-400/40 bg-amber-500/10'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-black text-xs ${isSelected ? 'text-[#E67E22]' : 'text-[var(--text-primary)]'}`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#E67E22]" />
                      )}
                    </div>

                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="p-1 rounded bg-[#2C3E50] text-white text-[10px] font-semibold truncate leading-tight shadow-xs"
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] font-bold text-[var(--text-muted)] block">
                          +{dayEvents.length - 2} еще
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Details / Upcoming Agenda Sidebar */}
          <div className="custom-card p-5 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                <span>События {selectedDay} августа</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Расписание на выбранный день
              </p>
            </div>

            <div className="space-y-3">
              {safeEvents
                .filter((e) => e.startTime.startsWith(`2026-08-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`))
                .length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-muted)] border border-dashed border-slate-300 dark:border-slate-700 rounded-xl space-y-2">
                  <CalendarCheck className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-60" />
                  <p className="font-semibold text-[var(--text-secondary)]">На этот день событий пока нет</p>
                  <button
                    onClick={() => {
                      setStartTime(`2026-08-${selectedDay < 10 ? '0' + selectedDay : selectedDay}T12:00`);
                      setEndTime(`2026-08-${selectedDay < 10 ? '0' + selectedDay : selectedDay}T13:00`);
                      setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#E67E22] text-white font-bold text-xs rounded-lg hover:bg-[#D35400] transition-colors cursor-pointer"
                  >
                    + Добавить событие
                  </button>
                </div>
              ) : (
                safeEvents
                  .filter((e) => e.startTime.startsWith(`2026-08-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`))
                  .map((evt) => {
                    const client = safeClients.find((c) => c.id === evt.clientId);

                    return (
                      <div
                        key={evt.id}
                        className="p-3.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-[var(--text-primary)] text-sm block">
                              {evt.title}
                            </span>
                            {getTypeBadge(evt.type)}
                          </div>
                          {onDeleteEvent && (
                            <button
                              onClick={() => onDeleteEvent(evt.id)}
                              className="text-[var(--text-muted)] hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="Удалить событие"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="text-[var(--text-secondary)] space-y-1 pt-1 font-medium">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#E67E22] shrink-0" />
                            <span className="font-semibold">{evt.startTime.replace('T', ' в ')}</span>
                          </div>

                          {evt.location && (
                            <div className="flex items-center space-x-2">
                              <Video className="w-4 h-4 text-blue-500 shrink-0" />
                              <span>{evt.location}</span>
                            </div>
                          )}

                          {client && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-purple-500 shrink-0" />
                              <span className="font-bold text-[var(--text-primary)]">{client.name}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[var(--border-subtle)]">
                          <a
                            href={getGoogleCalendarUrl(evt)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center space-x-1.5"
                          >
                            <span>Добавить в Google Calendar</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK */}
      {viewMode === 'week' && (
        <div className="custom-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-[#E67E22]" />
                <span>Неделя: 10 августа — 16 августа 2026</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Почасовая сетка встреч и онлайн-созвонов
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px] grid grid-cols-8 gap-2">
              {/* Time Column Header */}
              <div className="p-2 font-black text-xs text-slate-800 dark:text-slate-200 text-center uppercase tracking-wider">
                Время
              </div>
              {/* Days Header */}
              {weekDays.map((w) => (
                <div
                  key={w.date}
                  className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-center border border-slate-300 dark:border-slate-700 shadow-xs"
                >
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{w.name}</p>
                  <p className="text-[11px] font-extrabold text-[#E67E22]">{w.label}</p>
                </div>
              ))}

              {/* Time rows */}
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="p-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 text-center self-center">
                    {time}
                  </div>

                  {weekDays.map((w) => {
                    const dayEvents = safeEvents.filter(
                      (e) => e.startTime.startsWith(w.date) && e.startTime.includes(time.slice(0, 2))
                    );

                    return (
                      <div
                        key={`${w.date}-${time}`}
                        onClick={() => {
                          setStartTime(`${w.date}T${time}`);
                          setEndTime(`${w.date}T${Number(time.slice(0, 2)) + 1}:00`);
                          setShowAddModal(true);
                        }}
                        className={`min-h-[68px] p-1.5 rounded-xl border border-[var(--border-subtle)] transition-all cursor-pointer flex flex-col justify-start space-y-1 ${
                          dayEvents.length > 0
                            ? 'bg-amber-500/10 border-amber-400/60'
                            : 'bg-[var(--bg-main)] hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        {dayEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-1.5 rounded-lg bg-[#2C3E50] text-white text-[10px] font-semibold shadow-xs"
                            title={`${evt.title} (${evt.location || ''})`}
                          >
                            <p className="font-bold truncate">{evt.title}</p>
                            <p className="text-[9px] text-amber-300 font-mono truncate">{evt.startTime.split('T')[1]} - {evt.location || 'Онлайн'}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: LIST / AGENDA */}
      {viewMode === 'list' && (
        <div className="custom-card p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center space-x-2">
                <List className="w-5 h-5 text-[#E67E22]" />
                <span>Хронологический список всех событий и дедлайнов</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Всего запланировано: {filteredEvents.length} событий
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'meeting', 'call', 'deadline', 'invoice'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                    filterType === t
                      ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t === 'all' && 'Все'}
                  {t === 'meeting' && 'Встречи'}
                  {t === 'call' && 'Созвоны'}
                  {t === 'deadline' && 'Дедлайны'}
                  {t === 'invoice' && 'Счета'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-slate-300 dark:border-slate-700 rounded-xl space-y-2">
                <p className="font-semibold text-[var(--text-secondary)]">События по указанному фильтру не найдены</p>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const client = safeClients.find((c) => c.id === evt.clientId);

                return (
                  <div
                    key={evt.id}
                    className="p-4 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#E67E22]/30 flex items-center justify-center text-[#E67E22] font-bold shrink-0">
                        <Clock className="w-5 h-5 text-[#E67E22]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                            {evt.title}
                          </h4>
                          {getTypeBadge(evt.type)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)] font-medium">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-[#E67E22]" />
                            <span className="font-semibold">{evt.startTime.replace('T', ' в ')}</span>
                          </span>

                          {evt.location && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                              <span>{evt.location}</span>
                            </span>
                          )}

                          {client && (
                            <span className="flex items-center space-x-1">
                              <Users className="w-3.5 h-3.5 text-purple-500" />
                              <span className="font-bold text-[var(--text-primary)]">{client.name}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <a
                        href={getGoogleCalendarUrl(evt)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs rounded-lg inline-flex items-center space-x-1.5 transition-colors"
                      >
                        <span>В Google Calendar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {onDeleteEvent && (
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Запланировать встречу или событие
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  Название события / Тема встречи *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Созвон по согласованию макетов"
                  required
                  className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    Начало события
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    Завершение
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    Тип события
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
                  >
                    <option value="meeting">Личная встреча</option>
                    <option value="call">Онлайн созвон (Meet)</option>
                    <option value="deadline">Дедлайн по этапу</option>
                    <option value="invoice">Оплата счета</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    Клиент (опционально)
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
                  >
                    <option value="">Не привязан</option>
                    {safeClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  Место встречи / Ссылка на созвон
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Google Meet / Telegram / Офис"
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl font-semibold text-[var(--text-primary)]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
