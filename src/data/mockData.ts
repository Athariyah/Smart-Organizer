import { UserProfile, Client, Invoice, Task, CalendarEvent, ActivityLog, InvoiceTemplate } from '../types';

export const initialUserProfile: UserProfile = {
  id: 'usr_01',
  email: 'alexey.design@organizer.ru',
  fullName: 'Алексей Смирнов',
  occupation: 'Дизайнер интерфейсов & UI/UX',
  profession: 'designer',
  isSelfEmployed: true,
  inn: '772849102834',
  phone: '+7 (999) 123-45-67',
  region: 'г. Москва (77)',
  city: 'Москва',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  socialLinks: {
    telegram: 'https://t.me/alexey_uiux',
    website: 'https://alexey-design.ru',
    behance: 'https://behance.net/alexey_smirnov',
    github: 'https://github.com/alexey-dev'
  },
  bankDetails: {
    bankName: 'АО "Т-Банк"',
    bik: '044525974',
    accountNumber: '40802810400001234567',
    corrAccount: '30101810145250000974'
  },
  invoiceSettings: {
    defaultNotes: 'Оплата производится по НПД (Налог на профессиональный доход). Чек Мой Налог высылается сразу после поступления средств.',
    paymentInstructions: 'Перевод по СБП на номер +7 (999) 123-45-67 или по реквизитам счета.',
    colorTheme: '#2C3E50'
  }
};

export const initialClients: Client[] = [
  {
    id: 'cli_01',
    name: 'ООО "ТехноАрт Солюшнс"',
    type: 'legal',
    inn: '7701982341',
    email: 'finance@technoart.ru',
    phone: '+7 (495) 888-21-00',
    address: 'г. Москва, ул. Тверская, д. 12, стр. 1',
    tags: ['Постоянный', 'Юрлицо', 'UI/UX'],
    notes: 'Крупный заказчик мобильных приложений. Оплата в течение 5 рабочих дней.',
    totalLtv: 340000,
    createdAt: '2026-01-10'
  },
  {
    id: 'cli_02',
    name: 'ИП Ковалев Максим Игоревич',
    type: 'legal',
    inn: '502419283410',
    email: 'm.kovalev@ecom-shop.ru',
    phone: '+7 (916) 555-11-22',
    address: 'г. Красногорск, ул. Ленина, д. 45',
    tags: ['Интернет-магазин', 'ИП'],
    notes: 'Разработка брендбука и сайта на Tilda.',
    totalLtv: 120000,
    createdAt: '2026-03-15'
  },
  {
    id: 'cli_03',
    name: 'Анна Соколова (Физлицо)',
    type: 'individual',
    email: 'sokolova.design@gmail.com',
    phone: '+7 (903) 777-33-44',
    tags: ['Физлицо', 'Логотип'],
    notes: 'Персональный заказ редизайна портофолио.',
    totalLtv: 45000,
    createdAt: '2026-05-20'
  },
  {
    id: 'cli_04',
    name: 'Digital Agency "StartUp Hub"',
    type: 'legal',
    inn: '7810992812',
    email: 'pm@startuphub.io',
    phone: '+7 (812) 400-99-88',
    address: 'г. Санкт-Петербург, Невский пр., д. 88',
    tags: ['Агентство', 'Аутстафф'],
    notes: 'Ежемесячный аутстафф UX аналитики.',
    totalLtv: 210000,
    createdAt: '2026-06-01'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv_01',
    number: 'СЧ-2026-001',
    date: '2026-07-05',
    dueDate: '2026-07-15',
    clientId: 'cli_01',
    clientName: 'ООО "ТехноАрт Солюшнс"',
    clientType: 'legal',
    clientInn: '7701982341',
    clientEmail: 'finance@technoart.ru',
    items: [
      {
        id: 'itm_01',
        description: 'Дизайн UX/UI системы личного кабинета (30 экранов)',
        quantity: 1,
        unitPrice: 150000,
        total: 150000
      },
      {
        id: 'itm_02',
        description: 'Создание интерактивного Figma-прототипа',
        quantity: 1,
        unitPrice: 30000,
        total: 30000
      }
    ],
    subtotal: 180000,
    taxRate: 0,
    taxAmount: 10800, // 6% от юрлица
    total: 180000,
    status: 'paid',
    notes: 'Работа выполнена в полном объеме по ТЗ №4.',
    paymentLink: 'https://sbp.nspk.ru/pay?id=inv_01',
    token: 'tok_techart_01',
    paidAt: '2026-07-12',
    createdAt: '2026-07-05',
    updatedAt: '2026-07-12'
  },
  {
    id: 'inv_02',
    number: 'СЧ-2026-002',
    date: '2026-07-18',
    dueDate: '2026-07-28',
    clientId: 'cli_02',
    clientName: 'ИП Ковалев Максим Игоревич',
    clientType: 'legal',
    clientInn: '502419283410',
    clientEmail: 'm.kovalev@ecom-shop.ru',
    items: [
      {
        id: 'itm_03',
        description: 'Разработка карточек товаров для маркетплейса',
        quantity: 20,
        unitPrice: 3000,
        total: 60000
      }
    ],
    subtotal: 60000,
    taxRate: 0,
    taxAmount: 3600, // 6%
    total: 60000,
    status: 'paid',
    notes: 'Без НДС на основании ст. 346.11 НК РФ (НПД).',
    paymentLink: 'https://sbp.nspk.ru/pay?id=inv_02',
    token: 'tok_kovalev_02',
    paidAt: '2026-07-25',
    createdAt: '2026-07-18',
    updatedAt: '2026-07-25'
  },
  {
    id: 'inv_03',
    number: 'СЧ-2026-003',
    date: '2026-08-01',
    dueDate: '2026-08-10',
    clientId: 'cli_03',
    clientName: 'Анна Соколова (Физлицо)',
    clientType: 'individual',
    clientEmail: 'sokolova.design@gmail.com',
    items: [
      {
        id: 'itm_04',
        description: 'Разработка индивидуального айдентика и логобука',
        quantity: 1,
        unitPrice: 45000,
        total: 45000
      }
    ],
    subtotal: 45000,
    taxRate: 0,
    taxAmount: 1800, // 4% от физлица
    total: 45000,
    status: 'issued',
    notes: 'Ожидается авансовая оплата 50%.',
    paymentLink: 'https://sbp.nspk.ru/pay?id=inv_03',
    token: 'tok_sokolova_03',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  },
  {
    id: 'inv_04',
    number: 'СЧ-2026-004',
    date: '2026-07-20',
    dueDate: '2026-07-30',
    clientId: 'cli_04',
    clientName: 'Digital Agency "StartUp Hub"',
    clientType: 'legal',
    clientInn: '7810992812',
    clientEmail: 'pm@startuphub.io',
    items: [
      {
        id: 'itm_05',
        description: 'Аутстафф UI дизайна (40 часов)',
        quantity: 40,
        unitPrice: 2500,
        total: 100000
      }
    ],
    subtotal: 100000,
    taxRate: 0,
    taxAmount: 6000, // 6%
    total: 100000,
    status: 'overdue',
    notes: 'Напомнить ПМ о задержке оплаты за июль.',
    paymentLink: 'https://sbp.nspk.ru/pay?id=inv_04',
    token: 'tok_startuphub_04',
    createdAt: '2026-07-20',
    updatedAt: '2026-07-31'
  }
];

export const initialTasks: Task[] = [
  {
    id: 'tsk_01',
    title: 'Подготовить финальные макеты главного экрана для ТехноАрт',
    description: 'Передать в Figma dev-mode 3 варианта анимации кликов',
    status: 'in_progress',
    priority: 'high',
    deadline: '2026-08-05',
    dueDate: '2026-08-05',
    clientId: 'cli_01',
    invoiceId: 'inv_01',
    comments: [
      { id: 'c1', authorName: 'ПМ ТехноАрт', text: 'Ждем созвона в среду для согласования', createdAt: '2026-08-02 11:30' }
    ],
    createdAt: '2026-08-01'
  },
  {
    id: 'tsk_02',
    title: 'Отправить чек НПД из Мой Налог для ИП Ковалева',
    description: 'Сформировать чек на 60 000 руб и отправь ссылку на почту клиенту',
    status: 'done',
    priority: 'medium',
    deadline: '2026-07-26',
    dueDate: '2026-07-26',
    clientId: 'cli_02',
    invoiceId: 'inv_02',
    comments: [],
    createdAt: '2026-07-25'
  },
  {
    id: 'tsk_03',
    title: 'Согласовать мудборд логотипа с Анной Соколовой',
    description: 'Подготовить 3 стилевых направления (минимализм, швейцарский стиль, монограмма)',
    status: 'todo',
    priority: 'high',
    deadline: '2026-08-08',
    dueDate: '2026-08-08',
    clientId: 'cli_03',
    invoiceId: 'inv_03',
    comments: [],
    createdAt: '2026-08-02'
  },
  {
    id: 'tsk_04',
    title: 'Уплатить налог НПД за июль до 25 августа',
    description: 'Расчетная сумма налога: 20 400 ₽ (с учетом вычета)',
    status: 'todo',
    priority: 'urgent',
    deadline: '2026-08-25',
    dueDate: '2026-08-25',
    comments: [
      { id: 'c2', authorName: 'Система Налоги', text: 'Сформирован налоговый отчет за июль 2026', createdAt: '2026-08-01 09:00' }
    ],
    createdAt: '2026-08-01'
  }
];

export const initialEvents: CalendarEvent[] = [
  {
    id: 'evt_01',
    title: 'Созвон по проекту "ТехноАрт Личный Кабинет"',
    description: 'Демонстрация обновленного UX личного кабинета и прототипа',
    startTime: '2026-08-05T14:00',
    endTime: '2026-08-05T15:00',
    type: 'meeting',
    clientId: 'cli_01',
    invoiceId: 'inv_01',
    location: 'Google Meet / Yandex Telemost',
    createdAt: '2026-08-01'
  },
  {
    id: 'evt_02',
    title: 'Дедлайн оплаты счета СЧ-2026-003 (Анна Соколова)',
    description: 'Проверить поступление аванса 45 000 руб',
    startTime: '2026-08-10T18:00',
    endTime: '2026-08-10T19:00',
    type: 'deadline',
    clientId: 'cli_03',
    invoiceId: 'inv_03',
    createdAt: '2026-08-01'
  },
  {
    id: 'evt_03',
    title: 'Напоминание о задолженности StartUp Hub',
    description: 'Связаться с финансовым отделом по счету СЧ-2026-004',
    startTime: '2026-08-04T11:00',
    endTime: '2026-08-04T11:30',
    type: 'call',
    clientId: 'cli_04',
    invoiceId: 'inv_04',
    createdAt: '2026-08-01'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act_01',
    title: 'Счет оплачен',
    description: 'Получена оплата 60 000 ₽ по счету СЧ-2026-002 от ИП Ковалев М. И.',
    type: 'invoice',
    timestamp: '25 июля 2026, 14:32'
  },
  {
    id: 'act_02',
    title: 'Выставлен новый счет',
    description: 'Создан счет СЧ-2026-003 на 45 000 ₽ для Анны Соколовой',
    type: 'invoice',
    timestamp: '1 августа 2026, 10:15'
  },
  {
    id: 'act_03',
    title: 'Новый клиент в CRM',
    description: 'Добавлены контакты клиента StartUp Hub',
    type: 'client',
    timestamp: '1 июня 2026, 16:20'
  },
  {
    id: 'act_04',
    title: 'Рассчитан налог НПД',
    description: 'Сформирован предварительный расчет налога за июль (20 400 ₽)',
    type: 'tax',
    timestamp: '1 августа 2026, 09:00'
  }
];

export const initialTemplates: InvoiceTemplate[] = [
  {
    id: 'tmpl_01',
    title: 'Дизайн лендинга / промостраницы',
    description: 'Стандартный комплект дизайна 1 страницы с мобильной адаптацией',
    clientType: 'legal',
    items: [
      { description: 'UX исследование и прототип страницы', quantity: 1, unitPrice: 20000 },
      { description: 'UI дизайн десктоп и мобильной версии в Figma', quantity: 1, unitPrice: 35000 },
      { description: 'Подготовка стайлгайда и передача разработчикам', quantity: 1, unitPrice: 10000 }
    ]
  },
  {
    id: 'tmpl_02',
    title: 'Разработка логотипа и базового гайдлайна',
    description: '3 концепции логотипа + подбор шрифтов и фирменных цветов',
    clientType: 'individual',
    items: [
      { description: 'Разработка 3 варианта концепции логотипа', quantity: 1, unitPrice: 30000 },
      { description: 'Формирование мини-гайдлайна по логотипу', quantity: 1, unitPrice: 15000 }
    ]
  },
  {
    id: 'tmpl_03',
    title: 'Почасовая поддержка / Аутстафф',
    description: 'Пакет рабочих часов специалиста на месяц',
    clientType: 'legal',
    items: [
      { description: 'Консультации и выполнение задач по UX/UI (30 часов)', quantity: 30, unitPrice: 2500 }
    ]
  }
];
