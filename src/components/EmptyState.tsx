import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  CheckSquare,
  Search,
  Plus,
  RotateCcw,
  Sparkles,
  FolderOpen,
  Receipt,
  Inbox
} from 'lucide-react';

export type EmptyStateType = 'invoices' | 'clients' | 'tasks' | 'search' | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = ''
}) => {
  const getIllustration = () => {
    switch (type) {
      case 'invoices':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/10 rounded-3xl blur-md" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#162447] border border-[#23355C] flex items-center justify-center shadow-xl">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#E67E22]" />
              <motion.div
                animate={{ y: [-2, 2, -2], rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#E67E22] text-white flex items-center justify-center shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.div>
              <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Receipt className="w-3 h-3" />
              </div>
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-500/10 rounded-3xl blur-md" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#162447] border border-[#23355C] flex items-center justify-center shadow-xl">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-3xl blur-md" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#162447] border border-[#23355C] flex items-center justify-center shadow-xl">
              <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/10 rounded-3xl blur-md" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#162447] border border-[#23355C] flex items-center justify-center shadow-xl">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-500/20 to-slate-400/10 rounded-3xl blur-md" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#162447] border border-[#23355C] flex items-center justify-center shadow-xl">
              <Inbox className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`custom-card p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl ${className}`}
    >
      {getIllustration()}

      <div className="space-y-2">
        <h3 className="font-black text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-extrabold rounded-xl shadow-md text-xs sm:text-sm flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {actionIcon || <Plus className="w-4 h-4 text-white" />}
            <span>{actionText}</span>
          </button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-3.5 py-2.5 bg-[var(--bg-main)] hover:bg-slate-800 text-slate-200 font-bold rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
