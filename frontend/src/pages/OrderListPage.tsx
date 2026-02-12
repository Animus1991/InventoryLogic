import { useEffect, useState } from 'react'
import { listProducts, type Product } from '../lib/api'
import { formatNumber, formatUnit } from '../lib/locale'
import { useI18n } from '../contexts/I18nContext'

export default function OrderListPage() {
  const { t } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listProducts({ lowStockOnly: true })
      .then((page) => setProducts(page.items))
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
      .finally(() => setLoading(false))
  }, [])

  const lowStockList = products.filter((p) => p.minStock > 0 && p.stock <= p.minStock)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">{t('order.title')}</h2>
      <p className="mb-4 text-sm text-slate-600">{t('order.hint')}</p>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <p className="text-slate-500">{t('common.loading')}</p>
        </div>
      ) : lowStockList.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-slate-500">{t('order.noLowStock')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lowStockList.map((p) => {
            const suggest = Math.max(0, p.minStock - p.stock + 5)
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <span className="font-medium text-slate-800">{p.name}</span>
                  {p.sku && <span className="ml-2 text-sm text-slate-500">{p.sku}</span>}
                </div>
                <span className="text-slate-500">
                  {t('order.stock')}: {formatNumber(p.stock)} / {t('product.minShort')} {formatNumber(p.minStock)} {formatUnit(p.unit, t)}
                </span>
                <span className="rounded bg-amber-100 px-3 py-1 font-medium text-amber-800">
                  {t('order.suggest')}: +{formatNumber(suggest)} {formatUnit(p.unit, t)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
