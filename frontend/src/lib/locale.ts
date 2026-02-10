import { getStoredCurrency, formatCurrencyWith } from './currency';

/** Μορφή νομίσματος με το επιλεγμένο νόμισμα της εφαρμογής (από ρυθμίσεις). */
export function formatCurrency(value: number, currencyCode?: string): string {
  const code = currencyCode ?? getStoredCurrency();
  return formatCurrencyWith(value, code);
}

/** Ελληνική μορφή αριθμού (ακέραιος ή δεκαδικός). */
export function formatNumber(value: number, decimals?: number): string {
  if (decimals != null) {
    return new Intl.NumberFormat('el-GR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  }
  return new Intl.NumberFormat('el-GR').format(value);
}

/** Ελληνική μορφή ημερομηνίας/ώρας. */
export function formatDateTime(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('el-GR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/** Ελληνική μορφή μόνο ημερομηνίας. */
export function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('el-GR', { dateStyle: 'short' }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}
