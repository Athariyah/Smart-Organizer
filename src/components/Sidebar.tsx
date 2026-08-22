import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Calculator,
  Plus,
  Settings,
  Sparkles,
  BarChart3,
  Home,
  ShieldCheck,
  FileSpreadsheet,
  Terminal
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../context/LocalizationContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  unpaidCount?: number;
  tasksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  unpaidCount = 1,
  tasksCount = 3
}) => {
  const { t, language } = useLanguage();

  const navigationItems = [
    { label: t('nav.dashboard'), route: '/dashboard', icon: LayoutDashboard, hotkey: 'D' },
    {
      label: t('nav.invoices'),
      route: '/invoices',
      icon: FileText,
      hotkey: 'I',
      badge: unpaidCount > 0 ? `${unpaidCount} ${t('auto.act')}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { label: t('nav.clients'), route: '/clients', icon: Users, hotkey: 'C' },
    { label: t('nav.calendar'), route: '/calendar', icon: Calendar, hotkey: 'K' },
    {
      label: t('nav.tasks'),
      route: '/tasks',
      icon: CheckSquare,
      hotkey: 'T',
      badge: `${tasksCount}`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    { label: t('nav.taxes'), route: '/taxes', icon: Calculator, isKeyFeature: true, hotkey: 'X' },
    { label: 'IT Tools', route: '/devtools', icon: Terminal, badge: 'New', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30', hotkey: 'E' },
    { label: t('nav.analytics'), route: '/analytics', icon: BarChart3, hotkey: 'A' },
    { label: t('nav.reports'), route: '/reports', icon: FileSpreadsheet, hotkey: 'R' },
    { label: t('nav.settings'), route: '/settings', icon: Settings, hotkey: 'S' },
    { label: t('nav.landing'), route: '/', icon: Home, hotkey: 'L' }
  ];

  return (
    <aside className="w-64 min-w-[16rem] max-w-[16rem] bg-[#0F172A] text-slate-100 flex flex-col h-screen sticky top-0 left-0 border-r border-[#23355C] shrink-0 flex-shrink-0 !m-0 !p-0 overflow-hidden select-none z-30 shadow-2xl">
      <div className="w-full h-full p-4 flex flex-col justify-between flex-1 gap-4 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="flex flex-col gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 cursor-pointer group px-1"
            onClick={() => onNavigate('/')}
          >
            <div className="relative shrink-0">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <BrandLogo size={34} />
              </motion.div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>
            <div className="overflow-hidden">
              <span className="font-black text-sm tracking-tight block text-white group-hover:text-amber-400 transition-colors truncate">
                {t('auto.smartorganizer')}
              </span>
              <span className="text-[10px] text-amber-400 font-extrabold tracking-wide uppercase flex items-center">
                <Sparkles className="w-3 h-3 mr-1 inline text-amber-300 shrink-0" />
                {t('auto.422fzfreelance')}
              </span>
            </div>
          </motion.div>

          {/* Primary CTA Button: Создать новый счет */}
          <motion.button
            id="sidebar-create-invoice-btn"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => onNavigate('/invoices/create')}
            title={t('nav.createInvoice')}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#E67E22] via-[#F39C12] to-[#E67E22] text-white font-black text-xs sm:text-sm shadow-md shadow-orange-950/40 flex items-center justify-center space-x-2 transition-all cursor-pointer border-0 outline-none hover:brightness-105 active:scale-[0.98] group"
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0 group-hover:rotate-90 transition-transform duration-200">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-tight font-black whitespace-nowrap">{t('nav.createInvoice')}</span>
          </motion.button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 flex-1 py-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const routeStr = currentRoute || '';
            const isActive =
              routeStr === item.route ||
              (item.route !== '/' && item.route !== '' && routeStr.startsWith(item.route));

            return (
              <motion.button
                key={item.route}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.12 }}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer relative overflow-hidden outline-none border-0 group ${
                  isActive
                    ? 'bg-slate-800/90 text-white shadow-inner'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveBar"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#E67E22] rounded-r-full shadow-sm"
                  />
                )}

                <div className="flex items-center space-x-3 pl-1 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="shrink-0"
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#E67E22]' : 'text-slate-400 group-hover:text-amber-400'
                      }`}
                    />
                  </motion.div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.isKeyFeature && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 shrink-0 group-hover:opacity-0 transition-opacity">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>НПД 4/6%</span>
                  </span>
                )}

                {item.badge && !item.isKeyFeature && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full border shrink-0 group-hover:opacity-0 transition-opacity ${
                      item.badgeColor || 'bg-slate-700 text-slate-200 border-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Hotkey hint shown on hover or when sequence is active, or just faintly always */}
                {item.hotkey && (
                  <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <kbd className="px-1.5 h-5 flex items-center justify-center rounded bg-slate-800/80 border border-slate-600/50 text-slate-400 font-mono text-[10px] font-bold shadow-xs">G</kbd>
                    <kbd className="px-1.5 h-5 flex items-center justify-center rounded bg-slate-800/80 border border-slate-600/50 text-slate-400 font-mono text-[10px] font-bold shadow-xs">{item.hotkey}</kbd>
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer Info Card */}
        <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/50 shadow-xs space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-200">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </motion.div>
            <span className="font-extrabold text-white text-xs">
              {t('auto.taxservice422fz')}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
            {language === 'ru'
              ? 'Автоматический расчет ставок 4% (физлица) и 6% (юрлица и ИП).'
              : 'Automatic 4% (Individuals) and 6% (Companies) rate calculation.'}
          </p>
        </div>

      </div>
    </aside>
  );
};
