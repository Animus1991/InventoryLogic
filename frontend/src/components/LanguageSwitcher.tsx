import { useI18n } from '../contexts/I18nContext'
import { LANG_OPTIONS, type Lang } from '../lib/i18n'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="lang-select" className="text-sm text-slate-500">
        {t('lang.label')}
      </label>
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {LANG_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
