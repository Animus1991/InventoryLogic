import { Link } from 'react-router-dom'
import type { Product } from '../lib/api'
import { formatCurrency } from '../lib/locale'

type Props = {
  products: Product[]
  loading: boolean
  onAdjust: (id: number, delta: number) => void
  onEdit: (p: Product) => void
  onShowMovements: (id: number) => void
  onShowAudit: (id: number) => void
  onAdjustWithNote: (p: Product) => void
  onDelete: (id: number) => void
}

export default function ProductTable({
  products,
  loading,
  onAdjust,
  onEdit,
  onShowMovements,
  onShowAudit,
  onAdjustWithNote,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <p className="text-slate-500">Φόρτωση...</p>
      </div>
    )
  }
  if (products.length === 0) {
    return (
      <div className="card py-12 text-center">
        <p className="text-slate-500">Δεν βρέθηκαν προϊόντα.</p>
        <p className="mt-1 text-sm text-slate-400">Προσθέστε νέο προϊόν ή αλλάξτε το φίλτρο αναζήτησης.</p>
      </div>
    )
  }
  return (
    <ul className="space-y-4">
      {products.map((p) => (
        <li
          key={p.id}
          className={`card p-5 transition-shadow hover:shadow-cardHover ${
            p.stock <= p.minStock && p.minStock > 0 ? 'border-amber-300 bg-amber-50/50' : ''
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/product/${p.id}`}
                  className="font-semibold text-slate-800 hover:text-blue-600 hover:underline"
                >
                  {p.name}
                </Link>
                {p.sku && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{p.sku}</span>
                )}
                {p.category && <span className="text-sm text-slate-500">{p.category}</span>}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  Απόθεμα: {p.stock} {(p.unit || 'τεμ.').replace('τεμάχια', 'τεμ.')}
                </span>
                {p.price != null && (
                  <span className="text-sm text-slate-600">{formatCurrency(Number(p.price))}</span>
                )}
                {p.location && <span className="text-xs text-slate-500">Θέση: {p.location}</span>}
                {p.colorRal && <span className="text-xs text-slate-500">RAL {p.colorRal}</span>}
                {p.packagingInfo && <span className="text-xs text-slate-500">Συσκ. {p.packagingInfo}</span>}
                {p.barcode && <span className="text-xs text-slate-400">Barcode: {p.barcode}</span>}
                {p.minStock > 0 && <span className="text-sm text-slate-500">ελάχ. {p.minStock}</span>}
                {p.stock <= p.minStock && p.minStock > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Χαμηλό απόθεμα
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => onEdit(p)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                  Επεξεργασία
                </button>
                <button type="button" onClick={() => onShowMovements(p.id)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  Ιστορικό
                </button>
                <button type="button" onClick={() => onShowAudit(p.id)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  Audit
                </button>
                <button type="button" onClick={() => onAdjustWithNote(p)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  Προσαρμογή με σημείωση
                </button>
                <button type="button" onClick={() => onDelete(p.id)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                  Διαγραφή
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[-10, -5, -1, 1, 5, 10].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onAdjust(p.id, d)}
                  className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-sm font-medium ${
                    d < 0
                      ? d === -10
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-2'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-2'
                      : d === 10
                        ? 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300 px-2.5 py-2'
                        : d === 5
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2.5 py-2'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-2'
                  }`}
                >
                  {d >= 0 ? '+' : ''}{d}
                </button>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
