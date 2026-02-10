import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getValuationReport, type ValuationReport as Report } from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/locale'
import { useI18n } from '../contexts/I18nContext'

export default function ReportsPage() {
  const { t } = useI18n()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getValuationReport()
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="card flex items-center justify-center py-16">
          <p className="text-slate-500">{t('reports.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  const r = report!

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">{t('reports.title')}</h2>
        <p className="text-sm text-slate-500">
          {t('reports.date')}: {new Date().toLocaleDateString('el-GR', { dateStyle: 'long' })}
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-700">SKU</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{t('product.name')}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{t('reports.quantity')}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{t('product.unit')}</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">{t('reports.unitPrice')}</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">{t('reports.value')}</th>
              </tr>
            </thead>
            <tbody>
              {r.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {t('reports.noProducts')}
                  </td>
                </tr>
              ) : (
                r.items.map((row) => (
                  <tr key={row.productId} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-700">{row.sku || '—'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/product/${row.productId}`} className="text-blue-600 hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatNumber(row.stock)}</td>
                    <td className="px-4 py-3 text-slate-600">{row.unit || 'τεμ.'}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td colSpan={5} className="px-4 py-3 text-slate-700">
                  {t('reports.totalValue')}
                </td>
                <td className="px-4 py-3 text-right text-slate-800">{formatCurrency(r.totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {t('reports.exportHint')}
      </p>
    </div>
  )
}
