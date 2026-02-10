/** Νομίσματα για επιλογή χρήστη (χώρα / τοπικό νόμισμα). */
export const CURRENCIES: { code: string; name: string; symbol: string }[] = [
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc (CHF)', symbol: 'CHF' },
  { code: 'ALL', name: 'Albanian Lek (L)', symbol: 'L' },
  { code: 'RON', name: 'Romanian Leu (lei)', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev (лв)', symbol: 'лв' },
  { code: 'TRY', name: 'Turkish Lira (₺)', symbol: '₺' },
  { code: 'PLN', name: 'Polish Złoty (zł)', symbol: 'zł' },
  { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
]

const STORAGE_KEY = 'app_currency'

export function getStoredCurrency(): string {
  if (typeof window === 'undefined') return 'EUR'
  const s = localStorage.getItem(STORAGE_KEY)
  return s && CURRENCIES.some((c) => c.code === s) ? s : 'EUR'
}

export function setStoredCurrency(code: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, code)
}

export function formatCurrencyWith(value: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('el-GR', { style: 'currency', currency: currencyCode }).format(value)
  } catch {
    const c = CURRENCIES.find((x) => x.code === currencyCode)
    return `${c?.symbol ?? currencyCode} ${value.toFixed(2)}`
  }
}
