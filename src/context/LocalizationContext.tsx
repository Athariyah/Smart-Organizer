import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ru';

export interface Translations {
  [key: string]: string;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    'rep.certGen': 'Справка сформирована.',
    'rep.cert2': 'Для предъявления в банки при получении ипотеки/кредита',
    'rep.cert1': 'Справка о доходах за 2026 год (КНД 1122002)',
    'rep.actGen': 'Акт сгенерирован и загружен.',
    'rep.act2': 'Необходим юридическим лицам для закрытия бухгалтерии',
    'rep.act1': 'Акт выполненных работ (Универсальный)',
    'rep.offDesc': 'В приложении сформированы официальные шаблоны актов оказанных услуг и счетов для самозанятых граждан РФ, полностью соответствующие нормам 422-ФЗ.',
    'rep.off': 'Официальные справки и Акты ФНС',
    'rep.nodata': 'Нет данных об оплаченных счетах',
    'rep.dist': 'Распределение выручки по клиентам',
    'rep.rev': 'Выручка',
    'rep.rm': '₽ / Месяц',
    'rep.dyn26': 'Динамика доходов и налоговых отчислений за 2026 год',
    'rep.all': 'За весь период работы',
    'rep.pcs': 'шт.',
    'rep.tot': 'Всего выставлено счетов',
    'rep.sent': 'Счета в статусе выставлен/отправлен',
    'rep.expRec': 'Ожидается к получению',
    'rep.plan': 'Налог спланирован к уплате',
    'rep.rec': 'Полученная выручка (Оплачено)',
    'rep.exp': 'Выгрузить CSV отчет',
    'rep.det': 'Детализация доходов по месяцам, структура выручки по клиентам и экспорт выписок',
    'rep.fin': 'Финансовая аналитика и Отчеты НПД',
    'dash.at': 'в',
    'dash.urg': 'Срочно',
    'dash.noDue': 'Без срока',
    'dash.due': 'Дедлайн',
    'dash.allDone': 'Все задачи завершены!',
    'dash.kanban': 'Канбан доска →',
    'dash.actTask': 'Активные задачи в работе',
    'dash.call': 'Созвон',
    'dash.meeting': 'Встреча',
    'dash.online': 'Онлайн',
    'dash.noMeet': 'Нет запланированных встреч',
    'dash.allCal': 'Весь календарь →',
    'dash.meet': 'Ближайшие созвоны и встречи',
    'dash.totEvt': 'Всего событий:',
    'dash.logEmp': 'Журнал действий пуст',
    'dash.ind': 'Физлица (4%)',
    'dash.comp': 'Юрлица / ИП (6%)',
    'dash.taxRep': 'Налоговый отчет',
    'dash.split': 'Разделение на доходы от физлиц (4%) и юрлиц/ИП (6%)',
    'dash.dyn': 'Динамика доходов по месяцам',
    'dash.payTo': 'К уплате до 25 числа в ФНС',
    'dash.tax': 'Налог НПД (4% / 6%)',
    'dash.paid': 'оплаченных счетов',
    'dash.recv': 'Получено доходов',
    'dash.overdue': 'Просрочено',
    'dash.await': 'Ожидают оплаты',
    'dash.newInv': 'Выставить счет',
    'dash.npd': 'НПД',
    'dash.hi': 'Привет,',
    'nav.inn': 'ИНН',
    'nav.try': 'Попробуйте изменить запрос',
    'nav.notF': 'Ничего не найдено',
    'nav.tsk': 'Задачи',
    'nav.cli': 'Клиенты',
    'nav.inv': 'Счета',
    'nav.searchPl': 'Поиск счетов, клиентов, задач...',
    'auto.smartorganizer': 'Умный Органайзер',
    'auto.opendashboard': 'Войти в личный кабинет',
    'auto.autocategorizationofprofessionalexpenses': 'Авто-категоризация профессиональных расходов (IT)',
    'auto.scantransactions': 'Сканировать транзакции',
    'auto.autotrackingactive': 'Авто-трекинг активен',
    'auto.totalitexpensesfor': 'Суммарные IT-расходы за месяц:',
    'auto.todo': 'К выполнению',
    'auto.inprogress': 'В работе',
    'auto.done': 'Завершено',
    'auto.githubsynchronizationstartedcommits': 'Синхронизация с GitHub запущена. Коммиты будут импортированы как Work Logs.',
    'auto.githubsync': 'Синхронизация GitHub',
    'auto.syncgh': 'Синх. GH',
    'auto.newtask': 'Новая задача',
    'auto.client': 'Клиент',
    'auto.addthissnippetto': 'Добавьте этот сниппет в ваш',
    'auto.forautomaticdispatchof': 'для автоматической отправки логов активности (Work Logs) прямо в дашборд.',
    'auto.snippetcopiedtoclipboard': 'Сниппет скопирован в буфер обмена!',
    'auto.may': 'Май',
    'auto.jun': 'Июн',
    'auto.jul': 'Июл',
    'auto.npdtax': 'Налог НПД',
    'auto.officialinvoiceswithqr': 'Официальные счета с QR-кодом и PDF',
    'auto.viewinvoices': 'Смотреть счета',
    'auto.autocalculatednpdtax4': 'Авторасчет налога НПД (4% и 6%)',
    'auto.calculatetax': 'Рассчитать налог',
    'auto.clientcrmltv': 'CRM-база клиентов и расчет выручки (LTV)',
    'auto.viewcrmdatabase': 'Смотреть базу CRM',
    'auto.meetingcalendarslot': 'Календарь встреч и онлайн-букинг',
    'auto.opencalendar': 'Открыть календарь',
    'auto.kanbanprojecttask': 'Канбан-доска проектов и задач',
    'auto.gototasks': 'Перейти к задачам',
    'auto.analyticsactshourly': 'Аналитика, акты и калькулятор ставки часа',
    'auto.viewanalytics': 'Смотреть аналитику',
    'auto.addclientdetails': 'Добавьте заказчика',
    'auto.generateinvoicewithqr': 'Сформируйте счет с QR-кодом',
    'auto.trackpaymentnpd': 'Отслеживайте оплату и налог',
    'auto.istheservicecompliant': 'Подходит ли сервис для официальной работы по 422-ФЗ?',
    'auto.howisthenpd': 'Как рассчитывается налог НПД (4% и 6%)?',
    'auto.howdoesaclient': 'Как клиент может оплатить счет по QR-коду?',
    'auto.whereismydata': 'Где хранятся мои данные?',
    'auto.freelanceworkspace': 'Самозанятый 422-ФЗ',
    'auto.features': 'Возможности',
    'auto.taxcalculator': 'Калькулятор НПД',
    'auto.howitworks': 'Как это работает',
    'auto.faq': 'Вопросы и ответы',
    'auto.str': 'Switch to English',
    'auto.422fzcompliant': 'Соответствует 422-ФЗ',
    'auto.gostbankqr': 'QR-код для банков РФ',
    'auto.100privatelocal': '100% Конфиденциально',
    'auto.realtimeinteractivecalculation': 'Интерактивный расчет в реальном времени',
    'auto.lowersratesto3': 'Снижает ставки до 3% и 4%',
    'auto.withdeductiondiscount': 'со скидкой по вычету',
    'auto.standardrate': 'по базовой ставке',
    'auto.opentaxcenter': 'Перейти в налоговый модуль',
    'auto.6in1toolkit': 'Функционал 6-в-1',
    'auto.simpleprocess': 'Простой процесс',
    'auto.howyourdayworks': 'Как устроен ваш рабочий день',
    'auto.whysmartorganizer': 'Почему выбирают Умный Органайзер',
    'auto.excelmanual': 'Excel / Блокноты',
    'auto.manual46': 'Ручной пересчет налога 4% и 6%',
    'auto.noinstantbankingqr': 'Сложно сгенерировать ГОСТ QR-код',
    'auto.misseddeadlinesandlate': 'Риск пропустить дедлайн уплаты',
    'auto.nounifiedcrmor': 'Нет единой базы клиентов и LTV',
    'auto.auto46tax': 'Автоматический расчет НПД и вычета',
    'auto.standardbankingqron': 'ГОСТ QR-код для мгновенной оплаты',
    'auto.24hoururgencyalerts': 'Уведомления за 24 часа до дедлайна',
    'auto.fullcrmkanbanboard': 'CRM 360°, канбан и калькулятор часа',
    'auto.frequentlyaskedquestions': 'Часто задаваемые вопросы',
    'auto.smartorganizerforselfemployed': 'Умный Органайзер Самозанятого',
    'auto.builtinaccordancewith': 'Разработано в соответствии с 422-ФЗ и стандартами ФНС РФ.',
    'auto.gostqrcode': 'ГОСТ QR-код',
    'auto.422fztaxlaw': '422-ФЗ',
    'auto.crm360': 'CRM 360°',
    'auto.pcs': 'шт.',
    'auto.augplan': 'Авг (план)',
    'auto.summaryofincomeissued': 'Сводка доходов, выставленных счетов и налогов самозанятого за текущий период',
    'auto.latestimportedcommitsgithub': 'Последние импортированные коммиты (GitHub)',
    'auto.yesterday': 'Вчера',
    'auto.activityfeed': 'Лента событий',
    'auto.detailedaudit': 'Подробный аудит →',
    'auto.billablehoursvsactual': 'Оплачиваемые часы vs Фактическое время (GitHub)',
    'auto.week1': 'Нед 1',
    'auto.week2': 'Нед 2',
    'auto.week3': 'Нед 3',
    'auto.week4': 'Нед 4',
    'auto.week5': 'Нед 5',
    'auto.actualcommittimecoding': 'Фактическое время по коммитам (Coding)',
    'auto.billablehours': 'Оплачиваемые часы (Billable)',
    'auto.visualizationofgithubcommit': 'Визуализация активности коммитов GitHub относительно прогресса задач (Work Logs).',
    'auto.focus': 'Фокус',
    'auto.totalbillable': 'Всего (Billable)',
    'auto.ru': 'en',
    'auto.act': 'актив.',
    'auto.422fzfreelance': '422-ФЗ Самозанятый',
    'auto.taxservice422fz': 'ФНС Мой Налог & 422-ФЗ',
    'auto.alexeysmirnov': 'Алексей Смирнов',
    'auto.editinvoice': 'Редактирование счета',
    'auto.publicinvoice': 'Публичный счет на оплату',
    'auto.invoicedetails': 'Детали счета',
    'auto.searchinvoicesclientstasks': 'Поиск счетов, клиентов, задач...',
    'auto.searchresults': 'Результаты поиска',
    'auto.quicknavigation': 'Быстрый переход',
    'auto.esctoclose': 'Esc чтобы закрыть',
    'auto.typetosearchinvoices': 'Введите поисковый запрос (номер счета, ИНН, имя клиента, название задачи)',
    'auto.invoices': 'Счета на оплату',
    'auto.clients': 'Клиенты и контрагенты',
    'auto.tasks': 'Задачи',
    'auto.trysearchingbynumber': 'Попробуйте изменить запрос или поискать по ИНН, номеру или названию',
    'auto.switchtorussian': 'Переключить на English',
    'auto.due24h': 'дедлайн 24ч',
    'auto.toclientorcompany': 'Клиенту или юрлицу',
    'auto.intokanbanboard': 'В канбан-доску',
    'auto.intocrmdatabase': 'В базу CRM',
    'auto.46calculation': 'Расчет 4% и 6% НПД',
    'auto.alltasks': 'Все задачи',
    'auto.focusedsessioncompletedlogged': 'Сфокусированная сессия завершена. Записано:',
    'auto.keyboardshortcuts': 'Горячие клавиши (Keyboard Shortcuts)',
    'auto.quicknavigationanddocument': 'Быстрая навигация и создание документов',
    'auto.press': 'Нажмите',
    'auto.anytime': 'в любое время',
    'auto.close': 'Закрыть',
    // Navigation & Common
    'nav.dashboard': 'Обзор',
    'nav.invoices': 'Счета',
    'nav.clients': 'Клиенты (CRM)',
    'nav.calendar': 'Календарь',
    'nav.tasks': 'Задачи',
    'nav.taxes': 'Налоги НПД',
    'nav.analytics': 'Аналитика',
    'nav.reports': 'Отчеты и акты',
    'nav.settings': 'Настройки',
    'nav.landing': 'О продукте (Лендинг)',
    'nav.createInvoice': 'Создать новый счет',
    'nav.create': 'Создать',
    'nav.search': 'Поиск счетов, клиентов, задач...',
    'nav.notifications': 'Уведомления',
    'nav.allRead': 'Все прочитаны',
    'nav.markAllRead': 'Прочитано все',
    'nav.closeNotifications': 'Закрыть уведомления',
    'nav.noNotifications': 'Нет активных уведомлений',
    'nav.urgentTasks': 'Горящие дедлайны (24ч)',
    'nav.dueIn': 'Осталось',
    'nav.overdue': 'Просрочено',
    'nav.hours': 'ч',
    'nav.days': 'д',
    'nav.profileSettings': 'Настройки профиля',
    'nav.myInvoices': 'Мои счета и акты',
    'nav.logout': 'Выйти из аккаунта',
    'nav.npdBadge': 'НПД Самозанятый',
    'nav.lightTheme': 'Включить светлую тему',
    'nav.darkTheme': 'Включить тёмную тему',

    // Keyboard Shortcuts HUD
    'hud.press': 'Нажмите',
    'hud.overview': 'Обзор',
    'hud.invoices': 'Счета',
    'hud.clients': 'Клиенты',
    'hud.tasks': 'Задачи',
    'hud.help': 'Справка (?)',

    // Dashboard
    'dash.title': 'Панель управления',
    'dash.subtitle': 'Сводка доходов, налога НПД, счетов и задач за текущий период',
    'dash.monthRevenue': 'Доход за месяц',
    'dash.npdTax': 'Налог НПД (к уплате)',
    'dash.activeInvoices': 'Активные счета',
    'dash.pendingRevenue': 'Ожидает оплаты',
    'dash.completedTasks': 'Выполнено задач',
    'dash.annualLimit': 'Годовой лимит 2.4 млн ₽',
    'dash.quickActions': 'Быстрые действия',
    'dash.revenueDynamics': 'Динамика доходов',
    'dash.liveFeed': 'Лента событий',
    'dash.allEvents': 'Всего событий',
    'dash.detailedAudit': 'Подробный аудит →',
    'dash.dueSoonAlert': 'Есть задачи со сроком сдачи менее 24 часов!',

    // Invoices
    'inv.title': 'Управление счетами',
    'inv.subtitle': 'Фильтрация по статусам и периодам, выставление счетов и экспорт в PDF',
    'inv.exportCsv': 'Экспорт в CSV',
    'inv.createNew': 'Создать новый счет',
    'inv.filterAll': 'Все',
    'inv.filterDraft': 'Черновики',
    'inv.filterIssued': 'Выставлены',
    'inv.filterPaid': 'Оплачены',
    'inv.filterOverdue': 'Просрочены',
    'inv.filterCancelled': 'Отменены',
    'inv.searchPlaceholder': 'Поиск по номеру счета или имени контрагента...',
    'inv.statsFound': 'Найдено счетов:',
    'inv.statsTotal': 'Общая сумма:',
    'inv.statsPaid': 'Оплачено (Выручка):',
    'inv.statsPending': 'К получению (В счетах):',
    'inv.colNumber': 'Номер счета',
    'inv.colClient': 'Клиент',
    'inv.colDate': 'Дата / Срок',
    'inv.colAmount': 'Сумма',
    'inv.colTax': 'Налог НПД',
    'inv.colStatus': 'Статус',
    'inv.colActions': 'Действия',
    'inv.notFound': 'Счета по заданным фильтрам не найдены',
    'inv.notFoundDesc': 'Попробуйте изменить параметры поиска или сбросить фильтры.',
    'inv.resetFilters': 'Сбросить фильтры',
    'inv.markPaid': 'Отметить оплаченным',
    'inv.duplicate': 'Дублировать счет',
    'inv.edit': 'Редактировать',
    'inv.delete': 'Удалить',
    'inv.downloadPdf': 'Скачать PDF',

    // Tasks
    'tasks.title': 'Канбан доска задач',
    'tasks.subtitle': 'Управление проектами, дедлайнами и отслеживание затраченного времени',
    'tasks.addTask': 'Новая задача',
    'tasks.todo': 'К выполнению',
    'tasks.inProgress': 'В работе',
    'tasks.review': 'На проверке',
    'tasks.done': 'Завершено',
    'tasks.urgentNotice': 'Горящие задачи (дедлайн до 24 ч)',
    'tasks.progress': 'Прогресс',
    'tasks.subtasks': 'Подзадачи',
    'tasks.tracked': 'Учтено',
    'tasks.hours': 'ч',

    // Clients
    'clients.title': 'База клиентов (CRM)',
    'clients.subtitle': 'Картотека заказчиков, учет выручки LTV и заметки со встреч',
    'clients.addClient': 'Добавить клиента',
    'clients.searchPlaceholder': 'Поиск по имени, компании или ИНН...',
    'clients.legal': 'Юрлицо / ИП (6%)',
    'clients.individual': 'Физлицо (4%)',
    'clients.ltv': 'Выручка (LTV)',
    'clients.notes': 'Заметки',
    'clients.createInvoice': 'Выставить счет',

    // Taxes
    'taxes.title': 'Налоговый кабинет (НПД)',
    'taxes.subtitle': 'Расчет налога 4% и 6%, учет вычета 10 000 ₽ и контроль лимита 2.4 млн ₽',
    'taxes.calcTitle': 'Калькулятор налога НПД',
    'taxes.fromInd': 'От физлиц (4%)',
    'taxes.fromLeg': 'От юрлиц и ИП (6%)',
    'taxes.deduction': 'Учитывать вычет 10 000 ₽',
    'taxes.totalIncome': 'Совокупный доход',
    'taxes.taxToPay': 'Налог к уплате',
    'taxes.annualLimit': 'Годовой лимит 2.4 млн ₽',

    // Reports & Analytics
    'reports.title': 'Отчеты и акты',
    'reports.subtitle': 'Генерация актов выполненных работ, сводные справки о доходах и экспорт',
    'analytics.title': 'Аналитика и Утилиты',
    'analytics.subtitle': 'Калькулятор себестоимости часа, финансовые графики и шаблоны',

    // Settings
    'settings.title': 'Настройки профиля',
    'settings.subtitle': 'Реквизиты самозанятого, банковские счета, язык и темы',
    'settings.language': 'Язык интерфейса',
    'settings.langRu': 'Русский (RU)',
    'settings.langEn': 'English (EN)',

    // Landing
    'landing.badge': 'Профессиональная среда для IT-фрилансеров и разработчиков',
    'landing.heroTitle': 'Умный биллинг, интеграции с GitHub и авторасчет НПД для разработчиков',
    'landing.heroDesc': 'Выставляйте счета за спринты с ГОСТ QR-кодом, привязывайте коммиты GitHub к рабочим логам и автоматически учитывайте облачные сервисы в профессиональных расходах. Полный контроль лимита 2.4 млн ₽.',
    'landing.startFree': 'Начать работу бесплатно',
    'landing.createQuick': 'Создать быстрый счет',
    'landing.toDashboard': 'В личный кабинет',
    'landing.backToApp': 'Вернуться в приложение'
  },
  };

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType>({
  language: 'ru',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key
});

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ru');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('organizer_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang: Language = 'ru';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to Russian dictionary
    if (TRANSLATIONS.ru[key]) {
      return TRANSLATIONS.ru[key];
    }
    return defaultText || key;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLanguage = () => useContext(LocalizationContext);
