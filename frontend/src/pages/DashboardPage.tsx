import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, type DashboardStats as Stats } from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/locale'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="card flex items-center justify-center py-16">
          <p className="text-slate-500">Φόρτωση κεντρικής οθόνης...</p>
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">Κεντρική οθόνη</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Σύνολο προϊόντων</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatNumber(s.productCount)}</p>
          <Link to="/products" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-blue-600 hover:underline">Προβολή λίστας →</Link>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Χαμηλό απόθεμα</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{formatNumber(s.lowStockCount)}</p>
          <Link to="/order" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-blue-600 hover:underline">Τι να παραγγείλω →</Link>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Συνολική αξία αποθέματος</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatCurrency(s.totalValue)}</p>
          <Link to="/reports" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-blue-600 hover:underline">Αναφορά αποτίμησης →</Link>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Κινήσεις (τελευταίες 7 ημέρες)</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatNumber(s.recentMovementsCount)}</p>
        </div>
      </div>

      <div className="card border-amber-200 bg-amber-50/30 p-5">
        <h3 className="mb-2 text-base font-semibold text-slate-800">Τι να παραγγείλω</h3>
        <p className="mb-4 text-sm text-slate-600">
          Προϊόντα με απόθεμα ≤ ελάχιστη ποσότητα — δείτε την πλήρη λίστα και τις προτεινόμενες ποσότητες.
        </p>
        <Link to="/order" className="btn-primary inline-flex">
          Άνοιγμα λίστας παραγγελίας
        </Link>
      </div>
    </div>
  )
}
