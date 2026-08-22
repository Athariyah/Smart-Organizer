/**
 * Преобразование числа в сумму прописью на русском языке.
 * Пример: 12500.50 -> "Двенадцать тысяч пятьсот рублей 50 копеек"
 */
export function numberToWordsRu(amount?: number | null): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  if (val <= 0) return 'Ноль рублей 00 копеек';

  const rub = Math.floor(val);
  const kop = Math.round((val - rub) * 100);

  const kopStr = kop < 10 ? `0${kop}` : `${kop}`;

  if (rub === 0) {
    return `Ноль рублей ${kopStr} копеек`;
  }

  const units = [
    ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'],
    ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
  ];

  const teens = [
    'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
    'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'
  ];

  const tens = [
    '', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят',
    'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'
  ];

  const hundreds = [
    '', 'сто', 'двести', 'триста', 'четыреста',
    'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'
  ];

  function declension(count: number, titles: [string, string, string]): string {
    const c100 = Math.abs(count) % 100;
    const c10 = c100 % 10;
    if (c100 > 10 && c100 < 20) return titles[2];
    if (c10 > 1 && c10 < 5) return titles[1];
    if (c10 === 1) return titles[0];
    return titles[2];
  }

  function triadToWords(num: number, genderIndex: number): string {
    let result = '';
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;

    if (h > 0) result += hundreds[h] + ' ';

    if (t === 1) {
      result += teens[u] + ' ';
    } else {
      if (t > 1) result += tens[t] + ' ';
      if (u > 0) result += units[genderIndex][u] + ' ';
    }

    return result.trim();
  }

  const millions = Math.floor(rub / 1000000);
  const thousands = Math.floor((rub % 1000000) / 1000);
  const remainder = rub % 1000;

  let words = '';

  if (millions > 0) {
    const millionStr = triadToWords(millions, 0);
    const decl = declension(millions, ['миллион', 'миллиона', 'миллионов']);
    words += `${millionStr} ${decl} `;
  }

  if (thousands > 0) {
    const thousandStr = triadToWords(thousands, 1);
    const decl = declension(thousands, ['тысяча', 'тысячи', 'тысяч']);
    words += `${thousandStr} ${decl} `;
  }

  if (remainder > 0 || rub === 0) {
    const remainderStr = triadToWords(remainder, 0);
    words += `${remainderStr} `;
  }

  words = words.trim();
  if (words.length > 0) {
    words = words.charAt(0).toUpperCase() + words.slice(1);
  }

  const rubDecl = declension(rub, ['рубль', 'рубля', 'рублей']);
  const kopDecl = declension(kop, ['копейка', 'копейки', 'копеек']);

  return `${words} ${rubDecl} ${kopStr} ${kopDecl}`.trim();
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KZT: '₸',
  BYN: 'Br',
  CNY: '¥'
};

export const CURRENCY_NAMES: Record<string, string> = {
  RUB: 'Рубли (RUB, ₽)',
  USD: 'Доллары США (USD, $)',
  EUR: 'Евро (EUR, €)',
  KZT: 'Казахстанский тенге (KZT, ₸)',
  BYN: 'Белорусский рубль (BYN, Br)',
  CNY: 'Китайский юань (CNY, ¥)'
};

/**
 * Форматирование суммы в выбранную валюту (по умолчанию RUB): 12500 -> "12 500 ₽"
 */
export function formatCurrency(amount?: number | null, currency: string = 'RUB'): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const safeCurr = currency || 'RUB';

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: safeCurr,
      maximumFractionDigits: 0
    }).format(val);
  } catch {
    const sym = CURRENCY_SYMBOLS[safeCurr] || '₽';
    return `${Math.round(val).toLocaleString('ru-RU')} ${sym}`;
  }
}

/**
 * Форматирование даты в русскую локаль: "2026-08-15" -> "15 августа 2026"
 */
export function formatDateRu(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString || '';
  }
}
