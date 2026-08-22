import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Trello, Globe, Server, CheckCircle2, RotateCw } from 'lucide-react';
import { useLanguage } from '../context/LocalizationContext';

interface ITIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ITIntegrationsModal: React.FC<ITIntegrationsModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [syncing, setSyncing] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = (service: string) => {
    setSyncing(service);
    setTimeout(() => {
      setSyncing(null);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[var(--bg-main)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[var(--border-subtle)]"
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <Server className="w-5 h-5 text-indigo-500" />
              <span>{language === 'ru' ? 'Синхронизация для IT' : 'IT Integrations Sync'}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {language === 'ru' 
                ? 'Подключите ваши рабочие трекеры для автоматического импорта задач и учета времени.'
                : 'Connect your developer trackers for automatic task import and time tracking.'}
            </p>

            <div className="space-y-3">
              {/* Jira */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">Jira Software</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {language === 'ru' ? 'Импорт спринтов и эпиков' : 'Import sprints and epics'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSync('jira')}
                  disabled={syncing !== null}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {syncing === 'jira' ? <RotateCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>{syncing === 'jira' ? 'Syncing...' : 'Sync'}</span>
                </button>
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-gray-900">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">GitHub Issues</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {language === 'ru' ? 'Статусы PR и коммиты' : 'PR status and commits'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSync('github')}
                  disabled={syncing !== null}
                  className="px-4 py-2 bg-gray-900 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {syncing === 'github' ? <RotateCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                  <span>{syncing === 'github' ? 'Syncing...' : 'Sync'}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-start space-x-2 border border-emerald-100 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                {language === 'ru'
                  ? 'Синхронизация работает в фоновом режиме. Новые задачи появятся в колонке "К выполнению".'
                  : 'Syncing works in the background. New tasks will appear in the "To Do" column.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
