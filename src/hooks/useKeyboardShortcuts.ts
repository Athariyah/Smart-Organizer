import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LocalizationContext';

export interface ShortcutConfig {
  key: string;
  description: string;
  category: 'Навигация' | 'Действия' | 'Справка';
}

export const SHORTCUTS_LIST: ShortcutConfig[] = [
  { key: 'G затем D', description: 'Перейти в Обзор (Dashboard)', category: 'Навигация' },
  { key: 'G затем I', description: 'Перейти в раздел Счета', category: 'Навигация' },
  { key: 'G затем C', description: 'Перейти в Клиенты (CRM)', category: 'Навигация' },
  { key: 'G затем T', description: 'Перейти в Канбан Задач', category: 'Навигация' },
  { key: 'G затем K', description: 'Перейти в Календарь', category: 'Навигация' },
  { key: 'G затем X', description: 'Перейти в Налоги НПД (Калькулятор)', category: 'Навигация' },
  { key: 'G затем A', description: 'Перейти в Аналитику', category: 'Навигация' },
  { key: 'G затем E', description: 'Перейти в IT-Инструменты (DevTools)', category: 'Навигация' },
  { key: 'G затем R', description: 'Перейти в Отчеты и Акты', category: 'Навигация' },
  { key: 'G затем S', description: 'Перейти в Настройки', category: 'Навигация' },
  { key: 'G затем H / L', description: 'Перейти на Лендинг (О сервисе)', category: 'Навигация' },
  { key: 'Cmd+N / Ctrl+N', description: 'Создать новый счет', category: 'Действия' },
  { key: '?', description: 'Показать/скрыть список горячих клавиш', category: 'Справка' },
  { key: 'Escape', description: 'Закрыть модальное окно / отмена', category: 'Действия' }
];

export function useKeyboardShortcuts(
  onNavigate: (route: string) => void,
  onOpenNewInvoice: () => void,
  onToggleShortcutsModal: () => void
) {
  const [sequenceKey, setSequenceKey] = useState<string | null>(null);

  const resetSequence = useCallback(() => {
    setSequenceKey(null);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut triggers when user is typing inside text fields
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Handle Cmd+N / Ctrl+N or Alt+N globally (even inside some forms if needed, but safe)
      if ((e.metaKey || e.ctrlKey || e.altKey) && (e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т')) {
        e.preventDefault();
        onOpenNewInvoice();
        return;
      }

      // If user is actively typing, don't trigger single-letter sequences
      if (isEditable) return;


      // Question mark for help modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onToggleShortcutsModal();
        return;
      }

      // Sequence leader: 'G' or 'g' or Russian 'П'/'п'
      if (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'п') {
        e.preventDefault();
        setSequenceKey('g');
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          setSequenceKey(null);
        }, 1500);
        return;
      }

      // Sequence follower when 'g' was pressed
      if (sequenceKey === 'g') {
        const k = e.key.toLowerCase();
        let handled = false;

        switch (k) {
          case 'd': // Dashboard / В
          case 'в':
            onNavigate('/dashboard');
            handled = true;
            break;
          case 'i': // Invoices / Ш
          case 'ш':
            onNavigate('/invoices');
            handled = true;
            break;
          case 'c': // Clients / С
          case 'с':
            onNavigate('/clients');
            handled = true;
            break;
          case 't': // Tasks / Е
          case 'е':
            onNavigate('/tasks');
            handled = true;
            break;
          case 'k': // Calendar / Л
          case 'л':
            onNavigate('/calendar');
            handled = true;
            break;
          case 'x': // Taxes / Ч
          case 'ч':
            onNavigate('/taxes');
            handled = true;
            break;
          case 's': // Settings / Ы
          case 'ы':
            onNavigate('/settings');
            handled = true;
            break;

          case 'a': // Analytics / Ф
          case 'ф':
            onNavigate('/analytics');
            handled = true;
            break;
          case 'e': // DevTools / У
          case 'у':
            onNavigate('/devtools');
            handled = true;
            break;
          case 'r': // Reports / К
          case 'к':
            onNavigate('/reports');
            handled = true;
            break;

          case 'h': // Home / Р
          case 'l': // Landing / Д
          case 'р':
          case 'д':
            onNavigate('/');
            handled = true;
            break;
          default:
            break;
        }

        if (handled) {
          e.preventDefault();
        }
        setSequenceKey(null);
        if (timer) clearTimeout(timer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [sequenceKey, onNavigate, onOpenNewInvoice, onToggleShortcutsModal]);

  return {
    sequenceActive: Boolean(sequenceKey),
    sequenceKey,
    resetSequence
  };
}
