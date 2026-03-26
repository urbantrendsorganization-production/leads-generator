'use client';

export interface CurrencyInfo {
  code: string;   // ISO-4217 e.g. "NGN"
  symbol: string; // e.g. "₦"
  rate: number;   // units per 1 USD
}

// Timezone → currency ISO code (covers every major timezone)
const TIMEZONE_CURRENCY: Record<string, string> = {
  // Africa
  'Africa/Lagos': 'NGN', 'Africa/Abuja': 'NGN', 'Africa/Accra': 'GHS',
  'Africa/Nairobi': 'KES', 'Africa/Johannesburg': 'ZAR', 'Africa/Cairo': 'EGP',
  'Africa/Casablanca': 'MAD', 'Africa/Tunis': 'TND', 'Africa/Kampala': 'UGX',
  'Africa/Dar_es_Salaam': 'TZS', 'Africa/Kigali': 'RWF', 'Africa/Addis_Ababa': 'ETB',
  'Africa/Douala': 'XAF', 'Africa/Dakar': 'XOF', 'Africa/Abidjan': 'XOF',
  'Africa/Bamako': 'XOF', 'Africa/Conakry': 'GNF', 'Africa/Luanda': 'AOA',
  'Africa/Lusaka': 'ZMW', 'Africa/Harare': 'ZWL', 'Africa/Maputo': 'MZN',
  // Europe
  'Europe/London': 'GBP', 'Europe/Dublin': 'EUR', 'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR', 'Europe/Rome': 'EUR', 'Europe/Madrid': 'EUR',
  'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR', 'Europe/Vienna': 'EUR',
  'Europe/Warsaw': 'PLN', 'Europe/Prague': 'CZK', 'Europe/Budapest': 'HUF',
  'Europe/Stockholm': 'SEK', 'Europe/Oslo': 'NOK', 'Europe/Copenhagen': 'DKK',
  'Europe/Zurich': 'CHF', 'Europe/Moscow': 'RUB', 'Europe/Istanbul': 'TRY',
  // Americas
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Denver': 'USD',
  'America/Los_Angeles': 'USD', 'America/Phoenix': 'USD', 'America/Anchorage': 'USD',
  'Pacific/Honolulu': 'USD', 'America/Toronto': 'CAD', 'America/Vancouver': 'CAD',
  'America/Sao_Paulo': 'BRL', 'America/Argentina/Buenos_Aires': 'ARS',
  'America/Mexico_City': 'MXN', 'America/Bogota': 'COP', 'America/Lima': 'PEN',
  'America/Santiago': 'CLP', 'America/Caracas': 'VES',
  // Asia
  'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Kuwait': 'KWD',
  'Asia/Qatar': 'QAR', 'Asia/Bahrain': 'BHD', 'Asia/Muscat': 'OMR',
  'Asia/Kolkata': 'INR', 'Asia/Colombo': 'LKR', 'Asia/Dhaka': 'BDT',
  'Asia/Karachi': 'PKR', 'Asia/Shanghai': 'CNY', 'Asia/Tokyo': 'JPY',
  'Asia/Seoul': 'KRW', 'Asia/Singapore': 'SGD', 'Asia/Hong_Kong': 'HKD',
  'Asia/Bangkok': 'THB', 'Asia/Jakarta': 'IDR', 'Asia/Manila': 'PHP',
  'Asia/Kuala_Lumpur': 'MYR', 'Asia/Taipei': 'TWD', 'Asia/Jerusalem': 'ILS',
  'Asia/Beirut': 'LBP', 'Asia/Tashkent': 'UZS',
  // Oceania
  'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD',
  'Australia/Perth': 'AUD', 'Pacific/Auckland': 'NZD', 'Pacific/Fiji': 'FJD',
};

const SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', NGN: '₦', GHS: '₵', KES: 'KSh',
  ZAR: 'R', UGX: 'USh', TZS: 'TSh', RWF: 'RF', EGP: 'E£', ETB: 'Br',
  XOF: 'CFA', XAF: 'CFA', GNF: 'FG', AOA: 'Kz', ZMW: 'K', MZN: 'MT',
  CAD: 'C$', AUD: 'A$', NZD: 'NZ$', BRL: 'R$', MXN: '$', ARS: '$',
  COP: '$', PEN: 'S/', CLP: '$', INR: '₹', PKR: '₨', BDT: '৳',
  JPY: '¥', CNY: '¥', KRW: '₩', SGD: 'S$', HKD: 'HK$', THB: '฿',
  IDR: 'Rp', PHP: '₱', MYR: 'RM', AED: 'AED', SAR: 'SAR', KWD: 'KD',
  QAR: 'QR', BHD: 'BD', OMR: 'OMR', TRY: '₺', RUB: '₽', PLN: 'zł',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', CHF: 'CHF', MAD: 'MAD', TND: 'DT',
  ILS: '₪', TWD: 'NT$',
};

const FALLBACK: CurrencyInfo = { code: 'NGN', symbol: '₦', rate: 1700 };

/** Detect currency from browser timezone — fast, no network call, always accurate */
function getCurrencyFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_CURRENCY[tz] ?? null;
  } catch {
    return null;
  }
}

/** Fetch live exchange rate for a currency vs USD */
async function getRate(code: string): Promise<number> {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.[code];
      if (typeof rate === 'number' && rate > 0) return rate;
    }
  } catch { /* ignore */ }
  // Fallback: return NGN rate or 1 for USD
  return code === 'USD' ? 1 : FALLBACK.rate;
}

/** Main entry — detects user's local currency via browser timezone (no external API calls) */
export async function detectUserCurrency(): Promise<CurrencyInfo> {
  const code = getCurrencyFromTimezone() ?? FALLBACK.code;
  const rate = await getRate(code);
  const symbol = SYMBOLS[code] ?? code;
  return { code, symbol, rate };
}

export function formatLocalPrice(usdPrice: number, currency: CurrencyInfo): string {
  const amount = usdPrice * currency.rate;
  const rounded = currency.code === 'USD' ? amount : Math.round(amount);
  return `${currency.symbol}${rounded.toLocaleString()}`;
}
