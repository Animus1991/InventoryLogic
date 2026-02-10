import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { getStoredLang, setStoredLang, t as tRaw, type Lang } from '../lib/i18n'

type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang)
  const setLang = useCallback((l: Lang) => {
    setStoredLang(l)
    setLangState(l)
  }, [])
  const t = useCallback((key: string) => tRaw(lang, key), [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
