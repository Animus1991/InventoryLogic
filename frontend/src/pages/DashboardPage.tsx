import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { getDashboardStats, getByBarcode, type DashboardStats as Stats } from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/locale'
import BarcodeScanner from '../components/BarcodeScanner'
import { useI18n } from '../contexts/I18nContext'

export default function DashboardPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [installQrDataUrl, setInstallQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = typeof window !== 'undefined' ? window.location.origin : ''
    if (url) QRCode.toDataURL(url, { width: 160, margin: 1 }).then(setInstallQrDataUrl).catch(() => {})
  }, [])

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="card flex items-center justify-center py-16">
          <p className="text-slate-500">{t('dashboard.loading')}</p>
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

  const s = stats!

  function handleScan(code: string) {
    setShowScanner(false)
    setScanError(null)
    getByBarcode(code.trim())
      .then((product) => {
        if (product) navigate(`/product/${product.id}`)
        else setScanError(t('dashboard.scanNotFound'))
      })
      .catch(() => setScanError(t('dashboard.scanError')))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <h2 className="mb-6 text-xl font-semibold text-slate-800">{t('dashboard.title')}</h2>

      <div className="mb-6 rounded-xl border-2 border-blue-200 bg-blue-50/60 p-4">
        <h3 className="mb-2 text-base font-semibold text-slate-800">📷 {t('dashboard.scanTitle')}</h3>
        <p className="mb-3 text-sm text-slate-600">{t('dashboard.scanHint')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setScanError(null); setShowScanner(true) }}
            className="btn-primary"
          >
            {t('dashboard.openScanner')}
          </button>
          <Link to="/products" className="btn-secondary">
            {t('dashboard.typeBarcode')}
          </Link>
        </div>
        {scanError && (
          <p className="mt-3 text-sm text-red-600">{scanError}</p>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">{t('dashboard.totalProducts')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatNumber(s.productCount)}</p>
          <Link to="/products" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-blue-600 hover:underline">{t('dashboard.viewList')}</Link>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">{t('dashboard.lowStock')}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{formatNumber(s.lowStockCount)}</p>
          <Link to="/order" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-blue-600 hover:underline">{t('dashboard.orderBlockTitle')} →</Link>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">{t('dashboard.totalValue')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatCurrency(s.totalValue)}</p>
          <Link to="/reports" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-blue-600 hover:underline">{t('dashboard.valuationReport')}</Link>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">{t('dashboard.movements7d')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatNumber(s.recentMovementsCount)}</p>
        </div>
      </div>

      <div className="card border-amber-200 bg-amber-50/30 p-5">
        <h3 className="mb-2 text-base font-semibold text-slate-800">{t('dashboard.orderBlockTitle')}</h3>
        <p className="mb-4 text-sm text-slate-600">{t('dashboard.orderBlockHint')}</p>
        <Link to="/order" className="btn-primary inline-flex">
          {t('dashboard.openOrderList')}
        </Link>
      </div>

      <div className="card mt-6 border-emerald-200 bg-emerald-50/40 p-5">
        <h3 className="mb-2 text-base font-semibold text-slate-800">📱 {t('install.qrTitle')}</h3>
        <p className="mb-3 text-sm text-slate-600">{t('install.qrHint')}</p>
        {installQrDataUrl && (
          <div className="mb-3 inline-block rounded-lg border-2 border-white bg-white p-2 shadow-sm">
            <img src={installQrDataUrl} alt="QR" className="h-[180px] w-[180px]" />
          </div>
        )}
        <p className="text-xs text-slate-500">{t('install.sameNetwork')}</p>
      </div>
    </div>
  )
}
