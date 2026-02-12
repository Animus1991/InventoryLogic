import { getStoredCurrency, formatCurrencyWith } from './currency';

/** Maps stored unit abbreviations to i18n keys so they display in the UI language. */
const UNIT_TO_KEY: Record<string, string> = {
  'τεμ.': 'units.pcs',
  'τεμ': 'units.pcs',
  'τεμάχια': 'units.pcs',
  'τ.μ.': 'units.sqm',
  'τμ': 'units.sqm',
  'ζευγάρια': 'units.pairs',
  'ζευγ.': 'units.pairs',
  'κουτί': 'units.box',
  'pcs': 'units.pcs',
  'copë': 'units.pcs',
  'pce': 'units.pcs',
  'stk.': 'units.pcs',
  'pz.': 'units.pcs',
  'ud.': 'units.pcs',
  'box': 'units.box',
  'kuti': 'units.box',
  'boîte': 'units.box',
  'kiste': 'units.box',
  'scatola': 'units.box',
  'caja': 'units.box',
  'pairs': 'units.pairs',
  'çifte': 'units.pairs',
  'paires': 'units.pairs',
  'paare': 'units.pairs',
  'paia': 'units.pairs',
  'pares': 'units.pairs',
}

/** Returns localized unit label for display. If unit is "τεμ." or "κουτί" etc., returns translated label; otherwise returns unit as-is. */
export function formatUnit(unit: string | null | undefined, t: (key: string) => string): string {
  if (unit == null || unit === '') return t('units.pcs')
  const u = unit.trim()
  const direct = UNIT_TO_KEY[u.toLowerCase()] ?? UNIT_TO_KEY[u]
  if (direct) return t(direct)
  const lower = u.toLowerCase()
  if (lower.startsWith('κουτί') || lower.startsWith('kuti') || lower.startsWith('box')) {
    const suffix = /(\s+x\s*\d.*)$/i.exec(u)
    return suffix ? t('units.box') + suffix[1] : t('units.box')
  }
  if (lower.startsWith('τεμ') || lower.startsWith('τεμάχια')) return t('units.pcs')
  if (lower.includes('ζευγ') || lower.includes('çifte') || lower.includes('pair')) return t('units.pairs')
  if (lower.includes('τ.μ') || lower.includes('τμ') || lower.includes('m²')) return t('units.sqm')
  return unit
}

/** Replaces known Greek (or other) unit/package words in free text (e.g. packagingInfo) with the UI-language equivalent. */
export function translateKnownUnitsInText(text: string | null | undefined, t: (key: string) => string): string {
  if (text == null || text === '') return ''
  let s = text
  const replacements: [RegExp | string, string][] = [
    [/\bκουτί\b/gi, t('units.box')],
    [/\bτεμ\.?\b/gi, t('units.pcs')],
    [/\bτεμάχια\b/gi, t('units.pcs')],
    [/\bτ\.μ\.?\b/g, t('units.sqm')],
    [/\bζευγάρια\b/gi, t('units.pairs')],
    [/\bζευγ\.?\b/gi, t('units.pairs')],
  ]
  for (const [pattern, replacement] of replacements) {
    s = typeof pattern === 'string' ? s.replace(new RegExp(escapeRegex(pattern), 'gi'), replacement) : s.replace(pattern, replacement)
  }
  return s
}
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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
