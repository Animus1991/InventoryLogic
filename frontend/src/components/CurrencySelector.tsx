import { CURRENCIES, getStoredCurrency, setStoredCurrency } from '../lib/currency'
import { useI18n } from '../contexts/I18nContext'

type Props = {
  onCurrencyChange?: () => void
}

export default function CurrencySelector({ onCurrencyChange }: Props) {
  const current = getStoredCurrency()
  const { t } = useI18n()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value
    setStoredCurrency(code)
    onCurrencyChange?.()
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="currency-select" className="text-sm text-slate-500">
        {t('currency.label')}:
      </label>
      <select
        id="currency-select"
        value={current}
        onChange={handleChange}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} ({c.symbol})
          </option>
        ))}
      </select>
    </div>
  )
}
