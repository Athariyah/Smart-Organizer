import {
  UserProfile,
  Client,
  Invoice,
  Task,
  CalendarEvent,
  ActivityLog,
  InvoiceTemplate,
  TaxCalculationResult,
  AuthUser
} from '../types';
import {
  initialUserProfile,
  initialClients,
  initialInvoices,
  initialTasks,
  initialEvents,
  initialActivityLogs,
  initialTemplates
} from '../data/mockData';

const STORAGE_KEYS = {
  USER_PROFILE: 'organizer_user_profile',
  CLIENTS: 'organizer_clients',
  INVOICES: 'organizer_invoices',
  TASKS: 'organizer_tasks',
  EVENTS: 'organizer_events',
  ACTIVITY_LOGS: 'organizer_activity_logs',
  TEMPLATES: 'organizer_templates',
  THEME: 'organizer_theme',
  AUTH_USER: 'organizer_auth_user'
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
  }
  return defaultValue;
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Named Exports for smooth API usage across components
export const loadUserProfile = (): UserProfile => getItem(STORAGE_KEYS.USER_PROFILE, initialUserProfile);
export const saveUserProfile = (profile: UserProfile): void => setItem(STORAGE_KEYS.USER_PROFILE, profile);

export const loadClients = (): Client[] => getItem(STORAGE_KEYS.CLIENTS, initialClients);
export const saveClients = (clients: Client[]): void => setItem(STORAGE_KEYS.CLIENTS, clients);

export const loadInvoices = (): Invoice[] => getItem(STORAGE_KEYS.INVOICES, initialInvoices);
export const saveInvoices = (invoices: Invoice[]): void => setItem(STORAGE_KEYS.INVOICES, invoices);

export const loadTasks = (): Task[] => getItem(STORAGE_KEYS.TASKS, initialTasks);
export const saveTasks = (tasks: Task[]): void => setItem(STORAGE_KEYS.TASKS, tasks);

export const loadEvents = (): CalendarEvent[] => getItem(STORAGE_KEYS.EVENTS, initialEvents);
export const saveEvents = (events: CalendarEvent[]): void => setItem(STORAGE_KEYS.EVENTS, events);

export const loadActivityLogs = (): ActivityLog[] => getItem(STORAGE_KEYS.ACTIVITY_LOGS, initialActivityLogs);
export const saveActivityLogs = (logs: ActivityLog[]): void => setItem(STORAGE_KEYS.ACTIVITY_LOGS, logs);

export const loadTemplates = (): InvoiceTemplate[] => getItem(STORAGE_KEYS.TEMPLATES, initialTemplates);
export const saveTemplates = (templates: InvoiceTemplate[]): void => setItem(STORAGE_KEYS.TEMPLATES, templates);

export const getMockAuthUser = (): AuthUser | null => getItem<AuthUser | null>(STORAGE_KEYS.AUTH_USER, {
  id: 'usr-1',
  email: 'alexey.design@organizer.ru',
  fullName: 'Алексей Смирнов',
  occupation: 'Дизайнер интерфейсов & UI/UX'
});

export const setMockAuthUser = (user: AuthUser | null): void => setItem(STORAGE_KEYS.AUTH_USER, user);

// Helper for NPD tax calculation
export const calculateNpdTax = (invoices?: Invoice[]): TaxCalculationResult => {
  const safeInvoices = invoices || [];
  const currentYear = new Date().getFullYear();
  const yearlyLimit = 2400000;

  let yearlyIncome = 0;
  let incomeFromIndividuals = 0;
  let incomeFromLegal = 0;

  safeInvoices.forEach((inv) => {
    if (inv && inv.status === 'paid') {
      const invTotal = typeof inv.total === 'number' ? inv.total : 0;
      yearlyIncome += invTotal;
      if (inv.clientType === 'individual') {
        incomeFromIndividuals += invTotal;
      } else {
        incomeFromLegal += invTotal;
      }
    }
  });

  const taxIndivBase = incomeFromIndividuals * 0.04;
  const taxLegalBase = incomeFromLegal * 0.06;
  const baseTax = taxIndivBase + taxLegalBase;

  // Initial tax bonus deduction for self-employed in Russia = 10,000 RUB
  const initialDeduction = 10000;
  const deductionUsed = Math.min(initialDeduction, incomeFromIndividuals * 0.01 + incomeFromLegal * 0.02);
  const taxDeductionRemaining = Math.max(0, initialDeduction - deductionUsed);

  const estimatedTax = Math.max(0, Math.round(baseTax - deductionUsed));
  const remainingLimit = Math.max(0, yearlyLimit - yearlyIncome);

  return {
    yearlyIncome,
    yearlyLimit,
    remainingLimit,
    incomeFromIndividuals,
    incomeFromLegal,
    estimatedTax,
    taxDeductionRemaining
  };
};

export const storage = {
  getUserProfile: loadUserProfile,
  setUserProfile: saveUserProfile,
  getClients: loadClients,
  setClients: saveClients,
  getInvoices: loadInvoices,
  setInvoices: saveInvoices,
  getTasks: loadTasks,
  setTasks: saveTasks,
  getEvents: loadEvents,
  setEvents: saveEvents,
  getActivityLogs: loadActivityLogs,
  setActivityLogs: saveActivityLogs,
  getTemplates: loadTemplates,
  setTemplates: saveTemplates,
  getMockAuthUser,
  setMockAuthUser,
  resetToMockData: (): void => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      // ignore
    }
  }
};
