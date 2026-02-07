import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, getMovements, getAuditLog, adjustStock, type Product, type StockMovement, type AuditLog } from '../lib/api'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [auditLog, setAuditLog] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'info' | 'movements' | 'audit'>('info')
  const [adjustDelta, setAdjustDelta] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustRef, setAdjustRef] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const productId = id ? parseInt(id, 10) : NaN

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setLoading(false)
      return
    }
    setLoading(true)
    getProduct(productId)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    if (!Number.isFinite(productId)) return
    if (tab === 'movements') getMovements(productId).then(setMovements).catch(() => setMovements([]))
    if (tab === 'audit') getAuditLog(productId).then(setAuditLog).catch(() => setAuditLog([]))
  }, [productId, tab])

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault()
    if (!product || !adjustDelta.trim() || submitting) return
    const delta = Number(adjustDelta)
    if (Number.isNaN(delta) || delta === 0) return
    setSubmitting(true)
    adjustStock(productId, delta, adjustNote.trim() || undefined, adjustRef.trim() || undefined)
      .then((updated) => {
        setProduct(updated)
        setAdjustDelta('')
        setAdjustNote('')
        setAdjustRef('')
        if (tab === 'movements') getMovements(productId).then(setMovements)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setSubmitting(false))
  }

  if (loading || !id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-slate-500">Φόρτωση...</p>
      </div>
    )
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-red-600">Δεν βρέθηκε προϊόν.</p>
        <Link to="/" className="mt-2 inline-block text-blue-600 hover:underline">← Επιστροφή</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link to="/" className="text-sm text-blue-600 hover:underline">← Επιστροφή στη λίστα</Link>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="card mt-4 p-5">
        <h1 className="text-xl font-bold text-slate-800">{product.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
          {product.sku && <span>SKU: {product.sku}</span>}
          {product.category && <span>Κατηγορία: {product.category}</span>}
          {product.barcode && <span>Barcode: {product.barcode}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Απόθεμα: {product.stock} {(product.unit || 'τεμ.').replace('τεμάχια', 'τεμ.')}
          </span>
          {product.minStock > 0 && <span className="text-sm text-slate-500">Ελάχ. {product.minStock}</span>}
          {product.price != null && <span className="text-sm text-slate-600">{Number(product.price).toFixed(2)} €</span>}
          {product.location && <span className="text-sm text-slate-500">Θέση: {product.location}</span>}
          {product.colorRal && <span className="text-sm text-slate-500">RAL {product.colorRal}</span>}
          {product.packagingInfo && <span className="text-sm text-slate-500">Συσκ. {product.packagingInfo}</span>}
        </div>
        {product.description && <p className="mt-2 text-sm text-slate-500">{product.description}</p>}
      </div>

      <div className="mt-4 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('info')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Προσαρμογή
        </button>
        <button
          type="button"
          onClick={() => setTab('movements')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'movements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Κινήσεις
        </button>
        <button
          type="button"
          onClick={() => setTab('audit')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Audit log
        </button>
      </div>

      {tab === 'info' && (
        <form onSubmit={handleAdjust} className="card mt-4 p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">Προσαρμογή αποθέματος</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Δελτα (+ ή −)</label>
              <input type="number" value={adjustDelta} onChange={(e) => setAdjustDelta(e.target.value)} placeholder="π.χ. 10 ή -5" className="input-field w-28" required />
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">Σημείωση</label><input type="text" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} className="input-field" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">Αναφορά</label><input type="text" value={adjustRef} onChange={(e) => setAdjustRef(e.target.value)} className="input-field" /></div>
            <button type="submit" className="btn-success" disabled={submitting}>{submitting ? 'Αποθήκευση...' : 'Εφαρμογή'}</button>
          </div>
        </form>
      )}

      {tab === 'movements' && (
        <div className="card mt-4 p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">Ιστορικό κινήσεων</h2>
          {movements.length === 0 ? (
            <p className="text-sm text-slate-500">Δεν υπάρχουν κινήσεις.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {movements.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className={m.delta >= 0 ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>{m.delta >= 0 ? '+' : ''}{m.delta}</span>
                  <span className="flex-1 text-slate-500">{m.note || '—'}</span>
                  {m.reference && <span className="text-xs text-slate-500">Αναφ.: {m.reference}</span>}
                  <span className="text-slate-400">{new Date(m.createdAt).toLocaleString('el-GR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="card mt-4 p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">Audit log</h2>
          {auditLog.length === 0 ? (
            <p className="text-sm text-slate-500">Δεν υπάρχουν καταχωρήσεις.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {auditLog.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium text-slate-700">{a.action}</span>
                  {a.details && <span className="flex-1 text-slate-500">{a.details}</span>}
                  <span className="text-slate-400">{new Date(a.createdAt).toLocaleString('el-GR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
