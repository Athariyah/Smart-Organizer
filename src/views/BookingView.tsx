import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Link, Check, Plus, User, Video, ExternalLink, Copy } from 'lucide-react';
import { UserProfile } from '../types';
import { formatDateRu } from '../utils/numberToWordsRu';

interface BookingViewProps {
  userProfile?: UserProfile;
}

interface ServiceSlot {
  id: string;
  title: string;
  durationMinutes: number;
  price: number;
  description: string;
}

interface BookingAppointment {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export const BookingView: React.FC<BookingViewProps> = ({ userProfile }) => {
  const profile = userProfile || {
    fullName: 'Самозанятый Пользователь',
    email: 'user@example.com',
    inn: '770000000000',
    phone: '+7 (900) 000-00-00',
    profession: 'freelancer' as const,
    isSelfEmployed: true,
    avatar: '',
    bankDetails: {
      bankName: 'АО Тинькофф Банк',
      bik: '044525974',
      accountNumber: '40817810000000000000',
      corrAccount: '30101810145250000974'
    },
    invoiceSettings: {
      defaultVatRate: 0,
      defaultNotes: 'Без НДС. Налог на профессиональный доход (НПД).',
      prefix: 'СЧ',
      nextNumber: 1
    }
  };

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'appointments'>('slots');

  // Sample service offerings
  const [services, setServices] = useState<ServiceSlot[]>([
    {
      id: 's1',
      title: 'Экспресс-консультация по проекту',
      durationMinutes: 30,
      price: 2500,
      description: 'Аудит текущей задачи, разбор вопросов по дизайну/разработке и составление пошагового плана.'
    },
    {
      id: 's2',
      title: 'Часовая сессия / ТЗ проекта',
      durationMinutes: 60,
      price: 5000,
      description: 'Детальная проработка требований, проектирование архитектуры или дизайна с фиксацией в протоколе.'
    }
  ]);

  // Sample scheduled appointments
  const [appointments, setAppointments] = useState<BookingAppointment[]>([
    {
      id: 'b1',
      clientName: 'Алексей Смирнов (ООО Вектор)',
      clientEmail: 'smirnov@vector.ru',
      serviceTitle: 'Часовая сессия / ТЗ проекта',
      date: '2026-08-15',
      time: '14:00',
      status: 'confirmed'
    },
    {
      id: 'b2',
      clientName: 'Мария Ковалева',
      clientEmail: 'mk@design.io',
      serviceTitle: 'Экспресс-консультация по проекту',
      date: '2026-08-18',
      time: '11:30',
      status: 'confirmed'
    }
  ]);

  const publicLink = `${window.location.origin}/book/${profile.fullName.toLowerCase().replace(/\s+/g, '-')}`;

  const copyLink = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(publicLink).catch(() => {});
      }
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Онлайн-запись и Календарь (Аналог Calendly)</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Персональная страница бронирования консультаций для заказчиков с автоматической генерацией счета
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyLink}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copied ? 'Ссылка скопирована!' : 'Скопировать ссылку для заказчиков'}</span>
          </button>
        </div>
      </div>

      {/* Public Link Card */}
      <div className="custom-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl">
            <Link className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[var(--text-primary)] text-sm">Ваша визитка бронирования</h4>
            <p className="text-[var(--text-secondary)] font-semibold text-xs truncate max-w-md">{publicLink}</p>
          </div>
        </div>

        <a
          href={publicLink}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 font-bold border border-blue-300 dark:border-slate-600 rounded-lg text-xs flex items-center space-x-1 hover:bg-blue-50 shrink-0"
        >
          <span>Предпросмотр</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[var(--border-subtle)] space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('slots')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'slots'
              ? 'border-b-2 border-[#E67E22] text-[#E67E22] font-black'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold'
          }`}
        >
          Услуги и Тарифы консультаций
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'appointments'
              ? 'border-b-2 border-[#E67E22] text-[#E67E22] font-black'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold'
          }`}
        >
          Запланированные встречи ({appointments.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'slots' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div key={srv.id} className="custom-card p-5 space-y-3 relative hover:border-[#E67E22] transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-[var(--text-primary)]">{srv.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-[var(--text-secondary)] font-bold mt-1">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-[#E67E22]" />
                        {srv.durationMinutes} минут
                      </span>
                      <span className="font-black text-[#E67E22] text-sm">
                        {srv.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{srv.description}</p>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-bold">
                  <span className="flex items-center">
                    <Video className="w-3.5 h-3.5 text-blue-500 mr-1" />
                    Онлайн (Яндекс Телемост / Сферум)
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Активна</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="custom-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">{apt.serviceTitle}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-[10px] font-black rounded">
                    Подтверждена
                  </span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center space-x-3">
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-[var(--text-muted)]" />
                    {apt.clientName} ({apt.clientEmail})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs font-black text-[var(--text-primary)] bg-[var(--bg-main)] px-3 py-2 rounded-xl border border-[var(--border-subtle)]">
                <CalendarIcon className="w-4 h-4 text-[#E67E22]" />
                <span>{formatDateRu(apt.date)} в {apt.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
