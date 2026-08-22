import { useLanguage } from "../context/LocalizationContext";
import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Banknote,
  FileText,
  BadgePercent,
  BookmarkCheck
} from 'lucide-react';
import { UserProfile } from '../types';

export interface RegionalNpdInfo {
  code: string;
  name: string;
  shortName: string;
  federalDistrict: string;
  timezone: string;
  utcOffset: string;
  myBusinessCenter: string;
  myBusinessUrl: string;
  microfinanceProgram: string;
  socialContractAmount: string;
  ausnAvailable: boolean;
  specialBenefits: string[];
  localTips: string;
}

export const RUSSIAN_REGIONS_NPD: RegionalNpdInfo[] = [
  {
    code: '77',
    name: 'г. Москва',
    shortName: 'Москва',
    federalDistrict: 'Центральный ФО',
    timezone: 'МСК (UTC+3)',
    utcOffset: '+0 ч к МСК',
    myBusinessCenter: 'ГБУ «Малый бизнес Москвы» (МБМ)',
    myBusinessUrl: 'https://mbm.mos.ru',
    microfinanceProgram: 'Фонд содействия кредитованию малого бизнеса Москвы (займы самозанятым до 500 000 ₽ по льготной ставке)',
    socialContractAmount: 'до 350 000 ₽ (на открытие и развитие своего дела через УСЗН Москвы)',
    ausnAvailable: true,
    specialBenefits: [
      'Бесплатные рабочие места в коворкинг-центрах НКО и технопарках Москвы',
      'Субсидии до 700 000 ₽ на продвижение товаров на маркетплейсах (Wildberries, Ozon, Яндекс Маркет)',
      'Доступен экспериментальный режим АУСН (Автоматизированная УСН) при переходе в статус ИП',
      'Бесплатные консультации юристов и бухгалтеров в 44 центрах услуг для бизнеса МБМ'
    ],
    localTips: 'В Москве самый высокий порог заказов от юрлиц. Напоминайте корпоративным клиентам об актах и формируйте чеки по безналу строго до 9-го числа.'
  },
  {
    code: '78',
    name: 'г. Санкт-Петербург',
    shortName: 'Санкт-Петербург',
    federalDistrict: 'Северо-Западный ФО',
    timezone: 'МСК (UTC+3)',
    utcOffset: '+0 ч к МСК',
    myBusinessCenter: 'Центр развития и поддержки предпринимательства «Мой бизнес СПб»',
    myBusinessUrl: 'https://crpp.ru',
    microfinanceProgram: 'Фонд содействия кредитованию малого бизнеса Санкт-Петербурга (микрозаймы до 500 000 ₽ под сниженный процент)',
    socialContractAmount: 'до 350 000 ₽ (социальный контракт через районные отделы соцзащиты СПб)',
    ausnAvailable: true,
    specialBenefits: [
      'Бесплатный сервис «Городской акселератор Санкт-Петербурга» с цифровыми инструментами',
      'Льготная аренда в городском бизнес-инкубаторе «Кристалл» и на площадках «Мой бизнес»',
      'Региональная программа АУСН для растущего бизнеса и перехода на ИП',
      'Бесплатные образовательные интенсивы для креативных индустрий, дизайнеров и IT-специалистов'
    ],
    localTips: 'В Петербурге развиты программы поддержки креативных индустрий. Самозанятые дизайнеры и разработчики могут бесплатно участвовать в городских маркетах и выставках.'
  },
  {
    code: '50',
    name: 'Московская область',
    shortName: 'Московская обл.',
    federalDistrict: 'Центральный ФО',
    timezone: 'МСК (UTC+3)',
    utcOffset: '+0 ч к МСК',
    myBusinessCenter: 'Центр «Мой бизнес» Московской области (Инвестпортал)',
    myBusinessUrl: 'https://invest.mosreg.ru',
    microfinanceProgram: 'Московский областной фонд микрофинансирования (микрозайм «Самозанятый» до 500 000 ₽)',
    socialContractAmount: 'до 350 000 ₽ на развитие бизнеса через портал Госуслуг МО',
    ausnAvailable: true,
    specialBenefits: [
      'Субсидии на выход на маркетплейсы до 500 000 ₽ (компенсация комиссии и доставки)',
      'Эксперимент АУСН для предпринимателей Подмосковья',
      'Компенсация затрат на покупку оборудования для производства и услуг'
    ],
    localTips: 'Подавать заявки на региональные меры поддержки МО можно полностью онлайн через региональный портал госуслуг (РПГУ).'
  },
  {
    code: '16',
    name: 'Республика Татарстан',
    shortName: 'Татарстан (Казань)',
    federalDistrict: 'Приволжский ФО',
    timezone: 'МСК (UTC+3)',
    utcOffset: '+0 ч к МСК',
    myBusinessCenter: 'Фонд поддержки предпринимательства Республики Татарстан',
    myBusinessUrl: 'https://fpprt.ru',
    microfinanceProgram: 'Микрозайм «Самозанятые» от Фонда поддержки предпринимательства РТ со спецставкой от 4.5% до ключевой',
    socialContractAmount: 'до 350 000 ₽ (социальный контракт через Минтруд РТ)',
    ausnAvailable: true,
    specialBenefits: [
      'Пилотный регион НПД с 2019 года — максимальная интеграция с банками и маркетплейсами',
      'Программа «Бизнес без границ» и центр электронной торговли «Маркетплейс.Легко»',
      'Поддержка самозанятых ремесленников, кондитеров и IT-специалистов в IT-парках Казани и Набережных Челнов',
      'Экспериментальный налоговый режим АУСН'
    ],
    localTips: 'В Татарстане действуют расширенные субсидии на обучение и сертификацию продукции для самозанятых через центр «Мой бизнес».'
  },
  {
    code: '66',
    name: 'Свердловская область',
    shortName: 'Свердловская обл. (Екатеринбург)',
    federalDistrict: 'Уральский ФО',
    timezone: 'Екатеринбург (UTC+5)',
    utcOffset: '+2 ч к МСК',
    myBusinessCenter: 'Свердловский областной фонд поддержки предпринимательства (СОФПП)',
    myBusinessUrl: 'https://sofp.ru',
    microfinanceProgram: 'Заем «Самозанятым» от СОФПП до 500 000 ₽ по ставке от 1/2 ключевой ставки Банка России',
    socialContractAmount: 'до 350 000 ₽ через Управления социальной политики региона',
    ausnAvailable: false,
    specialBenefits: [
      'Бесплатное размещение в креативном кластере «Домна» в центре Екатеринбурга',
      'Специальные ярмарки самозанятых в крупнейших ТЦ Свердловской области',
      'Бесплатная помощь с фотосессиями продукции и продвижением в соцсетях'
    ],
    localTips: 'Разница с Москвой +2 часа. Дедлайн оплаты налога 28 числа наступает в 01:59 следующего дня по местному времени, но оплачивайте до 25 числа по местному времени.'
  },
  {
    code: '23',
    name: 'Краснодарский край',
    shortName: 'Краснодарский край (Сочи/Кубань)',
    federalDistrict: 'Южный ФО',
    timezone: 'МСК (UTC+3)',
    utcOffset: '+0 ч к МСК',
    myBusinessCenter: 'Центр «Мой бизнес» Краснодарского края',
    myBusinessUrl: 'https://moibiz93.ru',
    microfinanceProgram: 'Фонд микрофинансирования Краснодарского края — микрозайм «Самозанятый» от 100 000 до 500 000 ₽ под 2-3% годовых',
    socialContractAmount: 'до 350 000 ₽ через управление соцзащиты населения Краснодарского края',
    ausnAvailable: false,
    specialBenefits: [
      'Региональный маркетплейс товаров кубанских самозанятых и мастеров',
      'Бесплатные коворкинги «Место действия» в Краснодаре и Сочи',
      'Поддержка самозанятых в сфере гостеприимства, туризма и аренды жилья'
    ],
    localTips: 'Для арендодателей курортного жилья на Кубани ставка НПД составляет 4% при сдаче туристам (физлицам). Сдача нежилых помещений на НПД запрещена.'
  },
  {
    code: '54',
    name: 'Новосибирская область',
    shortName: 'Новосибирская обл.',
    federalDistrict: 'Сибирский ФО',
    timezone: 'Красноярск/Новосибирск (UTC+7)',
    utcOffset: '+4 ч к МСК',
    myBusinessCenter: 'Центр «Мой бизнес» Новосибирской области (МБ НСО)',
    myBusinessUrl: 'https://mbnso.ru',
    microfinanceProgram: 'МКК «Фонд микрофинансирования НСО» — льготные займы для самозанятых до 500 000 ₽',
    socialContractAmount: 'до 350 000 ₽ через центры социальной поддержки населения НСО',
    ausnAvailable: false,
    specialBenefits: [
      'Доступ к образовательным программам Академпарка и IT-инкубатора',
      'Софинансирование рекламных кампаний в Яндекс Директ и ВКонтакте',
      'Бесплатные консультации по патентам и защите интеллектуальной собственности'
    ],
    localTips: 'Разница во времени +4 ч к МСК. Банковские проводки между регионами могут занимать до 24 часов — рекомендуем оплачивать налог не позднее 26 числа месяца.'
  },
  {
    code: '52',
    name: 'Нижегородская область',
    shortName: 'Нижегородская обл.',
    federalDistrict: 'Приволжский ФО',
    timezone: 'МСК (UTC+3)',
    utcOffset: '+0 ч к МСК',
    myBusinessCenter: 'Агентство по развитию системы гарантий и микрофинансирования «Мой бизнес 52»',
    myBusinessUrl: 'https://мойбизнес52.рф',
    microfinanceProgram: 'Микрозаймы для самозанятых нижегородцев под льготный процент от 3% до 6%',
    socialContractAmount: 'до 350 000 ₽ через УСЗН Нижегородской области',
    ausnAvailable: false,
    specialBenefits: [
      'Программа продвижения брендов «Покупай нижегородское»',
      'Гранты и субсидии для самозанятых мастеров народных художественных промыслов',
      'Бесплатные консультации в 35 филиалах центров «Мой бизнес» по области'
    ],
    localTips: 'Нижегородские самозанятые в сфере ремесел и промыслов могут получить дополнительную субсидию на участие во всероссийских выставках.'
  },
  {
    code: '25',
    name: 'Приморский край',
    shortName: 'Приморский край (Владивосток)',
    federalDistrict: 'Дальневосточный ФО',
    timezone: 'Владивосток (UTC+10)',
    utcOffset: '+7 ч к МСК',
    myBusinessCenter: 'Центр поддержки предпринимательства «Мой бизнес Приморье»',
    myBusinessUrl: 'https://mb.primorsky.ru',
    microfinanceProgram: 'МКК «Фонд развития Приморского края» — заем «Самозанятый» до 500 000 ₽ по ставке от 3.5%',
    socialContractAmount: 'до 350 000 ₽ через центры социальной поддержки населения Приморья',
    ausnAvailable: false,
    specialBenefits: [
      'Специальные программы для экспортеров услуг в страны АТР (Китай, Вьетнам, Индия)',
      'Поддержка самозанятых в сферах логистики, перевода, туризма и дизайна',
      'Бесплатные места на сезонных ярмарках на набережных Владивостока'
    ],
    localTips: 'Разница с Москвой составляет +7 часов. Единый налоговый платеж списывается по московскому времени, поэтому оплату по местному времени проводите заблаговременно.'
  },
  {
    code: '61',
    name: 'Ростовская область',
    shortName: 'Ростовская обл. (Дон)',
    federalDistrict: 'Южный ФО',
    timezone: 'МСК (UTC+3)',
    utcOffset: '+0 ч к МСК',
    myBusinessCenter: 'Ростовское региональное агентство поддержки предпринимательства (РРАПП)',
    myBusinessUrl: 'https://mbrostov.ru',
    microfinanceProgram: 'Микрофинансовый продукт «Самозанятый» РРАПП до 500 000 ₽ под процент от 1% до 5% годовых',
    socialContractAmount: 'до 350 000 ₽ через органы соцзащиты Ростовской области',
    ausnAvailable: false,
    specialBenefits: [
      'Бесплатные рабочие места в коворкинге «Новый Ростов»',
      'Продвижение продукции на маркетплейсах за счет регионального бюджета',
      'Консультации и обучение ведению финансового учета'
    ],
    localTips: 'В Ростове-на-Дону действует муниципальный коворкинг «Новый Ростов» — самозанятые могут бесплатно работать там до нескольких месяцев после регистрации.'
  },
  {
    code: '02',
    name: 'Республика Башкортостан',
    shortName: 'Башкортостан (Уфа)',
    federalDistrict: 'Приволжский ФО',
    timezone: 'Екатеринбург/Уфа (UTC+5)',
    utcOffset: '+2 ч к МСК',
    myBusinessCenter: 'Агентство РБ по развитию малого и среднего предпринимательства',
    myBusinessUrl: 'https://cmbrb.ru',
    microfinanceProgram: 'Микрокредитная компания малого бизнеса РБ — спецпрограмма для самозанятых до 500 000 ₽',
    socialContractAmount: 'до 350 000 ₽ (программа «АСПК» через Минтруд РБ)',
    ausnAvailable: false,
    specialBenefits: [
      'Проект «Сделано в Башкортостане» для продвижения местных самозанятых мастеров',
      'Бесплатное размещение на коллективных стендах региональных ярмарок',
      'Образовательные курсы «Школа самозанятого»'
    ],
    localTips: 'В Башкортостане действует активная программа социального контракта АСПК — можно получить до 350 000 ₽ на покупку оборудования для бизнеса.'
  },
  {
    code: '63',
    name: 'Самарская область',
    shortName: 'Самарская обл.',
    federalDistrict: 'Приволжский ФО',
    timezone: 'Самара (UTC+4)',
    utcOffset: '+1 ч к МСК',
    myBusinessCenter: 'Региональный центр «Мой бизнес Самарская область»',
    myBusinessUrl: 'https://mybiz63.ru',
    microfinanceProgram: 'Самарский региональный фонд микрофинансирования — займы самозанятым до 500 000 ₽',
    socialContractAmount: 'до 350 000 ₽ через УСЗН Самарской области',
    ausnAvailable: false,
    specialBenefits: [
      'Витрина самозанятых Самарской области на едином региональном портале',
      'Бесплатная сертификация продукции и услуг',
      'Помощь в брендинге и дизайне упаковок для местных ремесленников'
    ],
    localTips: 'Разница во времени +1 час к МСК. Все чеки и квитанции в приложении «Мой налог» формируются по московскому времени.'
  },
  {
    code: '74',
    name: 'Челябинская область',
    shortName: 'Челябинская обл.',
    federalDistrict: 'Уральский ФО',
    timezone: 'Екатеринбург (UTC+5)',
    utcOffset: '+2 ч к МСК',
    myBusinessCenter: 'Центр «Мой бизнес» Челябинской области («Территория Бизнеса»)',
    myBusinessUrl: 'https://мойбизнес74.рф',
    microfinanceProgram: 'МКК Фонд финансирования промышленности и предпринимательства — микрозаймы до 500 000 ₽',
    socialContractAmount: 'до 350 000 ₽ через УСЗН Челябинской области',
    ausnAvailable: false,
    specialBenefits: [
      'Бесплатные образовательные программы и акселераторы',
      'Помощь с регистрацией товарных знаков и патентов',
      'Организация участия в региональных ярмарках'
    ],
    localTips: 'Уральские самозанятые могут бесплатно воспользоваться услугами фотостудии и медиа-центра «Мой бизнес 74» для карточек товаров.'
  },
  {
    code: '39',
    name: 'Калининградская область',
    shortName: 'Калининградская обл.',
    federalDistrict: 'Северо-Западный ФО',
    timezone: 'Калининград (UTC+2)',
    utcOffset: '-1 ч к МСК',
    myBusinessCenter: 'Фонд «Центр поддержки предпринимательства Калининградской области»',
    myBusinessUrl: 'https://mbkaliningrad.ru',
    microfinanceProgram: 'Фонд микрофинансирования Калининградской области — льготные займы от 2% годовых',
    socialContractAmount: 'до 350 000 ₽ через Министерство соцполитики КО',
    ausnAvailable: false,
    specialBenefits: [
      'Специальные условия для самозанятых в сфере янтарного дела, туризма и IT',
      'Помощь с логистикой и выходом на общероссийские маркетплейсы',
      'Бесплатные консультации по таможенным правилам ОЭЗ'
    ],
    localTips: 'Время отстает от Москвы на 1 час. При отправке чеков клиентам в Москву учитывайте часовую разницу.'
  },
  {
    code: 'all',
    name: 'Все регионы РФ (Базовые правила)',
    shortName: 'Все регионы РФ',
    federalDistrict: 'Российская Федерация',
    timezone: 'МСК / Местное время',
    utcOffset: 'Федеральный стандарт',
    myBusinessCenter: 'Единый портал «Мой бизнес» Минэкономразвития РФ',
    myBusinessUrl: 'https://мойбизнес.рф',
    microfinanceProgram: 'Федеральные и региональные микрокредитные компании МСП (микрозаймы самозанятым до 500 000 ₽)',
    socialContractAmount: 'до 350 000 ₽ (единовременная выплата на развитие самозанятости от Минтруда РФ)',
    ausnAvailable: false,
    specialBenefits: [
      'Единый налоговый вычет 10 000 ₽ при первой регистрации (ставка 3% вместо 4% и 4% вместо 6%)',
      'Освобождение от уплаты фиксированных страховых взносов (в ПФР/СФР взносы добровольные)',
      'Отсутствие кассовых аппаратов, отчетности и деклараций — все через приложение «Мой налог»',
      'Программа «Социальный контракт» до 350 000 ₽ доступна во всех 89 субъектах РФ'
    ],
    localTips: 'Налог на профессиональный доход действует на всей территории Российской Федерации. Вы можете работать с клиентами из любого города или страны.'
  }
];

interface RegionalNpdTipsHelperProps {
  userProfile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  yearlyIncome?: number;
}

export const RegionalNpdTipsHelper: React.FC<RegionalNpdTipsHelperProps> = ({
  userProfile,
  onUpdateProfile,
  yearlyIncome = 0
}) => {
  // Try to find initial region from userProfile or default to Moscow
  const initialRegionCode = useMemo(() => {
    if (userProfile?.region) {
      const match = RUSSIAN_REGIONS_NPD.find(
        (r) =>
          userProfile.region?.includes(r.code) ||
          userProfile.region?.toLowerCase().includes(r.shortName.toLowerCase()) ||
          userProfile.region?.toLowerCase().includes(r.name.toLowerCase())
      );
      if (match) return match.code;
    }
    return '77'; // default to Moscow
  }, [userProfile?.region]);

  const [selectedCode, setSelectedCode] = useState<string>(initialRegionCode);
  const [activeTab, setActiveTab] = useState<'deadlines' | 'limits' | 'benefits' | 'checklist'>('deadlines');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedToProfile, setSavedToProfile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentRegion = useMemo(() => {
    return RUSSIAN_REGIONS_NPD.find((r) => r.code === selectedCode) || RUSSIAN_REGIONS_NPD[0];
  }, [selectedCode]);

  // Calculate days to next 28th deadline
  const deadlineCalculation = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let targetDate: Date;
    let targetMonthName: string;

    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    if (currentDay <= 28) {
      targetDate = new Date(currentYear, currentMonth, 28, 23, 59, 59);
      targetMonthName = monthNames[currentMonth];
    } else {
      targetDate = new Date(currentYear, currentMonth + 1, 28, 23, 59, 59);
      targetMonthName = monthNames[(currentMonth + 1) % 12];
    }

    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      daysRemaining: diffDays,
      targetDayStr: `28 ${targetMonthName}`,
      isUrgent: diffDays <= 3
    };
  }, []);

  const handleSaveRegion = () => {
    if (onUpdateProfile && userProfile) {
      onUpdateProfile({
        ...userProfile,
        region: `${currentRegion.name} (${currentRegion.code})`,
        city: currentRegion.shortName
      });
      setSavedToProfile(true);
      setTimeout(() => setSavedToProfile(false), 2500);
    }
  };

  const handleCopySummary = () => {
    const text = `📌 Памятка самозанятого (НПД) — ${currentRegion.name}:
⏰ Срок уплаты налога: до 28-го числа каждого месяца (до 23:59 МСК).
📊 Годовой лимит дохода: 2 400 000 ₽ (свыше — переход на УСН в течение 20 дней).
🧾 Чеки: физлицам — моментально; юрлицам по безналу — до 9-го числа следующего месяца.
🏛 Поддержка в регионе: ${currentRegion.myBusinessCenter} (${currentRegion.myBusinessUrl}).
💰 Займы и гранты: ${currentRegion.microfinanceProgram}.
💡 Часовой пояс: ${currentRegion.timezone} (${currentRegion.utcOffset}).`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return RUSSIAN_REGIONS_NPD;
    const q = searchQuery.toLowerCase();
    return RUSSIAN_REGIONS_NPD.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.shortName.toLowerCase().includes(q) ||
        r.code.includes(q) ||
        r.federalDistrict.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="custom-card p-6 space-y-6 border-2 border-[#E67E22]/30 bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-lg rounded-2xl">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#E67E22] text-white rounded-xl shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
                  Региональный помощник самозанятого (НПД)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {currentRegion.code !== 'all' ? `Код ФНС: ${currentRegion.code}` : 'Федеральный'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                Персональные советы по дедлайнам уплаты налога, контролю лимита 2.4 млн ₽ и мерам поддержки в вашем регионе
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {userProfile && onUpdateProfile && (
            <button
              onClick={handleSaveRegion}
              type="button"
              className="px-3.5 py-2 text-xs font-bold bg-[var(--bg-main)] hover:bg-slate-200 dark:hover:bg-slate-800 border border-[var(--border-subtle)] rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer text-[var(--text-primary)] shadow-xs"
              title="Сохранить выбранный регион в профиль"
            >
              {savedToProfile ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Сохранено в профиль</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Закрепить регион</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopySummary}
            type="button"
            className="px-3.5 py-2 text-xs font-bold bg-[#2C3E50] hover:bg-slate-800 text-white rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Скопировать памятку</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Region Selector Bar */}
      <div className="space-y-3 bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-[#E67E22]" />
            <span>Выберите ваш субъект РФ:</span>
          </label>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)]">
              Текущий часовой пояс:
            </span>
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[var(--text-primary)] rounded-lg text-xs font-bold font-mono">
              {currentRegion.timezone} ({currentRegion.utcOffset})
            </span>
          </div>
        </div>

        {/* Dropdown & Quick Selection Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          <div className="sm:col-span-5">
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm font-bold text-[var(--text-primary)] cursor-pointer shadow-xs focus:ring-2 focus:ring-[#E67E22]"
            >
              {RUSSIAN_REGIONS_NPD.map((reg) => (
                <option key={reg.code} value={reg.code} className="text-[var(--text-primary)] bg-white dark:bg-slate-900 font-medium">
                  {reg.code !== 'all' ? `[${reg.code}] ` : ''}{reg.name} — {reg.federalDistrict}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Chips */}
          <div className="sm:col-span-7 flex flex-wrap gap-1.5 items-center">
            {['77', '78', '50', '16', '66', '23', '54', 'all'].map((code) => {
              const r = RUSSIAN_REGIONS_NPD.find((item) => item.code === code);
              if (!r) return null;
              const isSelected = selectedCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedCode(code)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E67E22] text-white shadow-xs'
                      : 'bg-[var(--bg-surface)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {r.shortName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deadline Countdown Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        deadlineCalculation.isUrgent
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200'
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-[var(--text-primary)]'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${
            deadlineCalculation.isUrgent ? 'bg-rose-500 text-white' : 'bg-[#E67E22] text-white'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm sm:text-base text-[var(--text-primary)]">
                Ближайший дедлайн уплаты налога: {deadlineCalculation.targetDayStr}
              </span>
              {deadlineCalculation.isUrgent && (
                <span className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse">
                  Срочно!
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">
              Единый налоговый платеж (ЕНП) списывается ежемесячно до 28 числа до 23:59 МСК.
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-center shrink-0 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-muted)] block">
            Осталось времени
          </span>
          <span className="text-xl font-black text-[var(--text-primary)]">
            {deadlineCalculation.daysRemaining} {deadlineCalculation.daysRemaining === 1 ? 'день' : deadlineCalculation.daysRemaining < 5 ? 'дня' : 'дней'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-extrabold">
        <button
          type="button"
          onClick={() => setActiveTab('deadlines')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'deadlines'
              ? 'bg-[#2C3E50] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeTab === 'deadlines' ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
          <span>Сроки и дедлайны ФНС</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('limits')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'limits'
              ? 'bg-[#2C3E50] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <BadgePercent className={`w-4 h-4 ${activeTab === 'limits' ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
          <span>Лимиты и порог 2.4 млн ₽</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('benefits')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'benefits'
              ? 'bg-[#2C3E50] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'benefits' ? 'text-amber-300' : 'text-amber-500'}`} />
          <span>Льготы и поддержка в {currentRegion.shortName}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'checklist'
              ? 'bg-[#2C3E50] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'checklist' ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
          <span>Чек-лист самозанятого</span>
        </button>
      </div>

      {/* Tab 1: Deadlines & Tax Calendar */}
      {activeTab === 'deadlines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <h4 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#E67E22]" />
              <span>Главные даты налогового календаря</span>
            </h4>
            <ul className="space-y-2.5 font-medium text-[var(--text-primary)]">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">12–14 число:</span>
                <span>ФНС автоматически рассчитывает сумму налога и выставляет квитанцию в мобильном приложении «Мой налог» и личном кабинете.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">25–28 число:</span>
                <span>Срок списания автоплатежа при привязанной банковской карте. Рекомендуем пополнить счет заранее.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">28 число (23:59 МСК):</span>
                <span>Крайний срок уплаты налога за прошедший календарный месяц. При просрочке с 29-го числа начисляются пени (1/300 ключевой ставки ЦБ).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-500 shrink-0">Порог &lt; 100 ₽:</span>
                <span>Если начисленный налог за месяц составляет менее 100 рублей, квитанция не выставляется, а сумма переносится на следующий месяц без штрафов.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <h4 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Часовой пояс и сроки в регионе</span>
            </h4>
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2 font-medium text-[var(--text-primary)]">
              <p>
                <strong>Субъект:</strong> {currentRegion.name} ({currentRegion.federalDistrict})
              </p>
              <p>
                <strong>Часовой пояс:</strong> {currentRegion.timezone} ({currentRegion.utcOffset})
              </p>
              <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                {currentRegion.localTips}
              </p>
            </div>

            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-900 rounded-xl text-[11px] flex items-center space-x-2 font-semibold">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>При безналичной оплате от юрлиц/ИП чек формируется не позднее 9-го числа месяца, следующего за месяцем получения дохода.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Limits & 2.4M Threshold */}
      {activeTab === 'limits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <h4 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Правила лимита 2 400 000 ₽</span>
            </h4>
            <ul className="space-y-2 font-medium text-[var(--text-primary)]">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-[#E67E22]">•</span>
                <span><strong>Период действия:</strong> Лимит 2.4 млн ₽ действует в рамках календарного года (с 1 января по 31 декабря). 1 января лимит обнуляется.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-[#E67E22]">•</span>
                <span><strong>Что входит в лимит:</strong> Любые доходы от физлиц, юрлиц и ИП по всем видам разрешенной самозанятой деятельности.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-[#E67E22]">•</span>
                <span><strong>Что НЕ входит в лимит:</strong> Зарплата по трудовому договору, доходы от продажи личного имущества (авто, квартира), проценты по вкладам.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <h4 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Что делать при превышении 2.4 млн ₽?</span>
            </h4>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2 font-medium text-amber-950 dark:text-amber-100 text-[11px] leading-relaxed">
              <p>
                <strong>1. Право на НПД утрачивается</strong> с даты того чека, который превысил 2 400 000 ₽. Сумма до лимита облагается по ставке 4%/6%, а сумма превышения — по новому режиму.
              </p>
              <p>
                <strong>2. Срок перехода:</strong> В течение <strong>20 дней</strong> необходимо зарегистрировать статус ИП и подать заявление на УСН «Доходы» (6%) или АУСН{currentRegion.ausnAvailable ? ' (доступен в вашем регионе!)' : ''}.
              </p>
              <p>
                <strong>3. Без перехода на УСН:</strong> Доход физлица свыше 2.4 млн ₽ автоматически облагается НДФЛ по ставке 13% или 15%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Regional Benefits & Support */}
      {activeTab === 'benefits' && (
        <div className="space-y-4 text-xs">
          <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
              <div>
                <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                  Государственная поддержка в регионе: {currentRegion.name}
                </h4>
                <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                  {currentRegion.myBusinessCenter}
                </p>
              </div>

              {currentRegion.myBusinessUrl && (
                <a
                  href={currentRegion.myBusinessUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-lg text-xs inline-flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>Официальный сайт поддержки</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Financial Support Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="font-extrabold text-[#E67E22] block flex items-center space-x-1">
                  <Banknote className="w-4 h-4" />
                  <span>Льготные микрозаймы для самозанятых</span>
                </span>
                <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                  {currentRegion.microfinanceProgram}
                </p>
              </div>

              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Социальный контракт (безвозмездная субсидия)</span>
                </span>
                <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                  {currentRegion.socialContractAmount}
                </p>
              </div>
            </div>

            {/* Specific regional benefits */}
            <div className="space-y-2 pt-2">
              <h5 className="font-extrabold text-[var(--text-primary)]">
                Специальные региональные программы и возможности:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRegion.specialBenefits.map((benefit, idx) => (
                  <div key={idx} className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-start space-x-2 text-[var(--text-primary)] font-medium">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Self-Employed Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3 text-xs">
          <h4 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center space-x-1.5">
            <BookmarkCheck className="w-4 h-4 text-[#E67E22]" />
            <span>Ежемесячный чек-лист самозанятого ({currentRegion.shortName})</span>
          </h4>

          <div className="space-y-2.5 font-medium text-[var(--text-primary)]">
            <label className="flex items-start space-x-3 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#E67E22] focus:ring-[#E67E22] cursor-pointer" />
              <span><strong>1. Сформировать чеки клиентам:</strong> выдать чеки физлицам в момент оплаты, юрлицам по безналу — до 9 числа следующего месяца.</span>
            </label>

            <label className="flex items-start space-x-3 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#E67E22] focus:ring-[#E67E22] cursor-pointer" />
              <span><strong>2. Проверить начисления 12–14 числа:</strong> сверить сумму в мобильном приложении «Мой налог» с фактически полученным доходом.</span>
            </label>

            <label className="flex items-start space-x-3 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#E67E22] focus:ring-[#E67E22] cursor-pointer" />
              <span><strong>3. Оплатить налог до 28 числа:</strong> провести платеж по СБП/карте или проверить списание автоплатежа до 28 числа 23:59 МСК.</span>
            </label>

            <label className="flex items-start space-x-3 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#E67E22] focus:ring-[#E67E22] cursor-pointer" />
              <span><strong>4. Контролировать лимит 2.4 млн ₽:</strong> отслеживать общий доход за год во избежание внезапного превышения порога.</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
