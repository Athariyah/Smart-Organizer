import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Sparkles } from 'lucide-react';
import { SHORTCUTS_LIST } from '../hooks/useKeyboardShortcuts';
import { useLanguage } from '../context/LocalizationContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  const categories = language === 'ru'
    ? (['Навигация', 'Действия', 'Справка'] as const)
    : (['Navigation', 'Actions', 'Help'] as const);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[var(--text-primary)] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-[#E67E22] border border-amber-500/20">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                  {t('auto.keyboardshortcuts')}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {t('auto.quicknavigationanddocument')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] rounded-xl cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List by Category */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {categories.map((catName, idx) => {
              const catRu = ['Навигация', 'Действия', 'Справка'][idx];
              const items = SHORTCUTS_LIST.filter((s) => s.category === catRu);
              if (items.length === 0) return null;

              return (
                <div key={catName} className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-[var(--text-muted)] tracking-wider block">
                    {catName}
                  </span>
                  <div className="space-y-1.5">
                    {items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                      >
                        <span className="text-[var(--text-secondary)] font-semibold">
                          {item.description}
                        </span>
                        <div className="flex items-center space-x-1 shrink-0">
                          {item.key.includes('затем') ? (
                            <div className="flex items-center space-x-1">
                              <kbd className="inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 rounded-md bg-[var(--bg-surface)] border border-slate-300 dark:border-slate-700 font-mono font-bold text-[11px] text-[var(--text-primary)] leading-none shadow-xs">
                                {item.key.split(' затем ')[0]}
                              </kbd>
                              <span className="text-[10px] text-[var(--text-muted)]">→</span>
                              <kbd className="inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 rounded-md bg-[var(--bg-surface)] border border-[#E67E22]/40 font-mono font-bold text-[11px] text-[#E67E22] leading-none shadow-xs">
                                {item.key.split(' затем ')[1]}
                              </kbd>
                            </div>
                          ) : (
                            <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-md bg-[var(--bg-surface)] border border-slate-300 dark:border-slate-700 font-mono font-bold text-[11px] text-[var(--text-primary)] leading-none shadow-xs">
                              {item.key}
                            </kbd>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>{t('auto.press')} <strong className="text-[var(--text-primary)]">?</strong> {t('auto.anytime')}</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 text-white font-bold rounded-lg text-xs hover:bg-slate-700 cursor-pointer"
            >
              {t('auto.close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
