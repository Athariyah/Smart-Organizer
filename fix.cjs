const fs = require('fs');
const dict = {
  "Привет, ": "Hello, ",
  "Сводка доходов, выставленных счетов и налогов самозанятого за текущий период": "Summary of income, issued invoices, and self-employed taxes for the current period",
  "Сводка доходов, налога НПД, счетов и задач за текущий период": "Summary of income, NPD tax, invoices, and tasks for the current period",
  "Доход за месяц": "Monthly Revenue",
  "Ожидает оплаты": "Pending Payment",
  "Налог НПД (к уплате)": "NPD Tax (Payable)",
  "Налог НПД": "NPD Tax",
  "Выполнено задач": "Completed Tasks",
  "Быстрые действия": "Quick Actions",
  "Новый счет": "New Invoice",
  "Клиент": "Client",
  "Задача": "Task",
  "Лента событий": "Activity Feed",
  "Всего событий": "Total events",
  "Подробный аудит →": "Detailed audit →",
  "Динамика доходов": "Revenue Dynamics",
  "Май": "May",
  "Июн": "Jun",
  "Июл": "Jul",
  "Авг (план)": "Aug (plan)",
  "Физлица": "Individuals",
  "Юрлица / ИП": "Companies / IE",
  "Development Tools Sync": "Development Tools Sync",
  "Синхронизация коммитов и тикетов для Work Logs": "Commit and ticket synchronization for Work Logs",
  "Последние импортированные коммиты (GitHub)": "Latest imported commits (GitHub)",
  "мин назад": "mins ago",
  "час назад": "hour ago",
  "Вчера": "Yesterday",
  "дня назад": "days ago",
  "Горящие дедлайны": "Urgent deadlines",
  "Продуктивность за неделю": "Weekly Productivity",
  "Синхронизация с GitHub запущена. Коммиты будут импортированы как Work Logs.": "GitHub synchronization started. Commits will be imported as Work Logs.",
  "Синхронизация GitHub": "GitHub Sync",
  "Синх. GH": "Sync GH",
  "Новая задача": "New Task",
  "К выполнению": "To Do",
  "В работе": "In Progress",
  "На проверке": "Review",
  "Завершено": "Done",
  "Учтено": "Logged",
  "Прогресс": "Progress",
  "Подзадачи": "Subtasks",
  "Оплачиваемые часы vs Фактическое время (GitHub)": "Billable hours vs Actual time (GitHub)",
  "Нед 1": "Week 1",
  "Нед 2": "Week 2",
  "Нед 3": "Week 3",
  "Нед 4": "Week 4",
  "Нед 5": "Week 5",
  "Оплачиваемые (Billable)": "Billable",
  "Фактическое (Coding)": "Coding",
  "Фактическое время по коммитам (Coding)": "Actual commit time (Coding)",
  "Оплачиваемые часы (Billable)": "Billable hours",
  "Визуализация активности коммитов GitHub относительно прогресса задач (Work Logs).": "Visualization of GitHub commit activity vs task progress (Work Logs).",
  'Отношение часов, проведенных в режиме "Deep Work", к общему количеству залогированных часов.': "Ratio of hours spent in 'Deep Work' mode to total logged hours.",
  "Фокус": "Focus",
  "Всего (Billable)": "Total (Billable)",
  "Авто-категоризация профессиональных расходов (IT)": "Auto-categorization of professional expenses (IT)",
  "Для внутреннего учета чистой прибыли (Net Income) при работе на НПД. Расходы на серверы и софт не уменьшают базу НПД, но важны для аналитики.": "For internal Net Income tracking when working under NPD. Server and software expenses don't reduce the NPD base but are important for analytics.",
  "Авто-трекинг активен": "Auto-tracking active",
  "Суммарные IT-расходы за месяц:": "Total IT expenses for the month:",
  "Сканировать транзакции": "Scan transactions",
  "Сканирование завершено": "Scan complete",
  "Ключевые слова:": "Keywords:",
  "Транзакции автоматически отнесены к 'Professional Software Expense' (не влияют на базу НПД).": "Transactions automatically assigned to 'Professional Software Expense' (does not affect NPD base).",
  "Запустить сканирование": "Run scan",
  "Авто-разметка IT расходов": "IT Expense Auto-tagging",
  "Сканировать описания транзакций на наличие сервисов (AWS, Vercel, GitHub, JetBrains).": "Scan transaction descriptions for services (AWS, Vercel, GitHub, JetBrains).",
  "Добавьте этот сниппет в ваш": "Add this snippet to your",
  "для автоматической отправки логов активности (Work Logs) прямо в дашборд.": "for automatic dispatch of activity logs (Work Logs) directly to the dashboard.",
  "Сниппет скопирован в буфер обмена!": "Snippet copied to clipboard!",
  "Сфокусированная сессия завершена. Записано:": "Focused session completed. Logged:",
  "мин. Выберите задачу для привязки времени.": "mins. Select a task to link time."
};

const files = [
  'src/views/DashboardView.tsx',
  'src/views/AnalyticsView.tsx',
  'src/views/SettingsView.tsx',
  'src/views/TasksView.tsx',
  'src/views/TaxesView.tsx',
  'src/views/ReportsView.tsx',
  'src/components/Navbar.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Add import if missing
  if (!code.includes('useLanguage')) {
    code = code.replace(/import \{.*?\} from 'lucide-react';/s, match => match + "\nimport { useLanguage } from '../context/LocalizationContext';");
    // inject hook
    code = code.replace(/(export const [A-Za-z0-9_]+: React\.FC<.*?> = \([^)]*\) => \{)/s, match => match + "\n  const { language } = useLanguage();");
  }

  // Replace phrases
  Object.entries(dict).forEach(([ru, en]) => {
    // Replace JSX text: >Привет, <
    // Need to escape regex
    const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const escapedRu = escapeRegex(ru);
    
    // jsx text >ru<
    let regexJsx = new RegExp(`>\\s*${escapedRu}\\s*<`, 'g');
    code = code.replace(regexJsx, `>{language === 'en' ? '${en.replace(/'/g, "\\'")}' : '${ru.replace(/'/g, "\\'")}'}<`);
    
    // exact JSX text match without capturing angle brackets, but safer
    // Wait, let's just do a simpler text replace since it's inside React.
    // >ru< -> >{...}<
    
    // attributes = "ru"
    let regexAttr = new RegExp(`="${escapedRu}"`, 'g');
    code = code.replace(regexAttr, `={language === 'en' ? '${en.replace(/'/g, "\\'")}' : '${ru.replace(/'/g, "\\'")}'}`);
    
    // object properties or plain strings 'ru'
    let regexStr = new RegExp(`'${escapedRu}'`, 'g');
    code = code.replace(regexStr, `(language === 'en' ? '${en.replace(/'/g, "\\'")}' : '${ru.replace(/'/g, "\\'")}')`);
    
    // template literals \`ru\`
    // This is hard to get exactly right, but let's try
    // \`Привет, \${userProfile...}\` -> \`\${language === 'en' ? 'Hello,' : 'Привет, '} \${userProfile...}\`
    let regexTick = new RegExp(`\\\`${escapedRu}`, 'g');
    code = code.replace(regexTick, `\\\`\${language === 'en' ? '${en.replace(/'/g, "\\'")}' : '${ru.replace(/'/g, "\\'")}'}`);
    
    // replace exact strings in text nodes that are not caught by >ru< due to whitespace
    // like >\n   ru\n  <
    let regexJsx2 = new RegExp(`>\\s*${escapedRu}\\s*<`, 'g');
    code = code.replace(regexJsx2, `>\n{language === 'en' ? '${en.replace(/'/g, "\\'")}' : '${ru.replace(/'/g, "\\'")}'}\n<`);
    
    // plain string replacement for `ru` that's not caught
    code = code.split(`>${ru}<`).join(`>{language === 'en' ? '${en.replace(/'/g, "\\'")}' : '${ru.replace(/'/g, "\\'")}'}<`);
  });

  fs.writeFileSync(f, code);
  console.log(`Updated ${f}`);
});

