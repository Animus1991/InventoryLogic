import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, getMovements, getAuditLog, adjustStock, updateProduct, type Product, type StockMovement, type AuditLog } from '../lib/api'
import { formatCurrency, formatDateTime, formatUnit } from '../lib/locale'
import { SKU_TERMINOLOGY } from '../lib/skuTerminology'
import { useI18n } from '../contexts/I18nContext'

export default function ProductDetailPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [auditLog, setAuditLog] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'info' | 'edit' | 'movements' | 'audit'>('info')
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
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
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
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
      .finally(() => setSubmitting(false))
  }

  function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    if (!product || submitting) return
    const form = e.currentTarget
    const get = (name: string) => (form.querySelector(`[name="${name}"]`) as HTMLInputElement)?.value?.trim() || ''
    const getNum = (name: string) => { const v = (form.querySelector(`[name="${name}"]`) as HTMLInputElement)?.value?.trim(); return v === '' ? undefined : Number(v) }
    setSubmitting(true)
    setError(null)
    updateProduct(productId, {
      sku: get('editSku') || undefined,
      name: get('editName') || undefined,
      category: get('editCategory') || undefined,
      barcode: get('editBarcode') || undefined,
      qrCode: get('editQrCode') || undefined,
      unit: get('editUnit') || undefined,
      description: get('editDescription') || undefined,
      manufacturerTerm: get('editManufacturerTerm') || undefined,
      localSlang: get('editLocalSlang') || undefined,
      price: getNum('editPrice') ?? undefined,
      location: get('editLocation') || undefined,
      dimensions: get('editDimensions') || undefined,
      colorRal: get('editColorRal') || undefined,
      packagingInfo: get('editPackaging') || undefined,
      supplier: get('editSupplier') || undefined,
      internalNotes: get('editInternalNotes') || undefined,
      minStock: getNum('editMinStock') ?? undefined,
    })
      .then((updated) => {
        setProduct(updated)
        setTab('info')
      })
      .catch((e) => setError(e instanceof Error ? e.message : t('product.saveToDb')))
      .finally(() => setSubmitting(false))
  }

  if (loading || !id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-red-600">{t('product.notFound')}</p>
        <Link to="/products" className="mt-2 inline-block text-blue-600 hover:underline">← {t('common.back')}</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link to="/products" className="text-sm text-blue-600 hover:underline">← {t('product.backToList')}</Link>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="card mt-4 p-5">
        <h1 className="text-xl font-bold text-slate-800">{product.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
          {product.sku && <span>SKU: {product.sku}</span>}
          {product.category && <span>{t('product.category')}: {product.category}</span>}
          {product.barcode && <span>{t('product.barcodeLabel')}: {product.barcode}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {t('product.stock')}: {product.stock} {formatUnit(product.unit, t)}
          </span>
          {product.minStock > 0 && <span className="text-sm text-slate-500">{t('product.minShort')} {product.minStock}</span>}
          {product.price != null && <span className="text-sm text-slate-600">{formatCurrency(Number(product.price))}</span>}
          {product.location && <span className="text-sm text-slate-500">{t('product.locationShort')}: {product.location}</span>}
          {product.colorRal && <span className="text-sm text-slate-500">{t('product.ralLabel')} {product.colorRal}</span>}
          {product.packagingInfo && <span className="text-sm text-slate-500">{t('product.packagingShort')} {product.packagingInfo}</span>}
        </div>
        {product.description && <p className="mt-2 text-sm text-slate-500">{product.description}</p>}
        {(product.manufacturerTerm || product.localSlang || product.supplier) && (
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
            {product.manufacturerTerm && <span>{t('product.manufacturerTermLabel')}: {product.manufacturerTerm}</span>}
            {product.localSlang && <span>{t('product.localSlangLabel')}: {product.localSlang}</span>}
            {product.supplier && <span>{t('product.supplierLabel')}: {product.supplier}</span>}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('info')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {t('product.tabAdjust')}
        </button>
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`min-h-[44px] border-b-2 px-3 py-2 text-sm font-medium ${tab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {t('product.tabEdit')}
        </button>
        <button
          type="button"
          onClick={() => setTab('movements')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'movements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {t('product.tabMovements')}
        </button>
        <button
          type="button"
          onClick={() => setTab('audit')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {t('product.tabAudit')}
        </button>
      </div>

      {tab === 'info' && (
        <form onSubmit={handleAdjust} className="card mt-4 p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">{t('product.adjustStock')}</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">{t('product.delta')}</label>
              <input type="number" value={adjustDelta} onChange={(e) => setAdjustDelta(e.target.value)} placeholder="e.g. 10 or -5" className="input-field w-28" required />
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.note')}</label><input type="text" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} className="input-field" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.reference')}</label><input type="text" value={adjustRef} onChange={(e) => setAdjustRef(e.target.value)} className="input-field" /></div>
            <button type="submit" className="btn-success" disabled={submitting}>{submitting ? t('product.saving') : t('product.apply')}</button>
          </div>
        </form>
      )}

      {tab === 'edit' && (
        <form onSubmit={handleSaveDetails} className="card mt-4 p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">{t('product.editTitle')}</h2>
          <p className="mb-4 text-sm text-slate-600">{t('product.editHint')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-600" title={SKU_TERMINOLOGY}>SKU</label><input name="editSku" defaultValue={product.sku ?? ''} className="input-field" placeholder={t('product.name')} title={SKU_TERMINOLOGY} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.name')}</label><input name="editName" defaultValue={product.name} required className="input-field" placeholder={t('product.name')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.barcodeLabel')}</label><input name="editBarcode" defaultValue={product.barcode ?? ''} className="input-field" placeholder={t('product.barcodeLabel')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">QR</label><input name="editQrCode" defaultValue={product.qrCode ?? ''} className="input-field" placeholder="QR" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.category')}</label><input name="editCategory" defaultValue={product.category ?? ''} className="input-field" placeholder={t('product.category')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.unit')}</label><input name="editUnit" defaultValue={product.unit ?? 'τεμάχια'} className="input-field" placeholder={t('product.unit')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.minStock')}</label><input name="editMinStock" type="number" min={0} defaultValue={product.minStock} className="input-field w-28" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.price')}</label><input name="editPrice" type="number" step="0.01" min={0} defaultValue={product.price ?? ''} className="input-field w-28" placeholder={t('product.price')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.location')}</label><input name="editLocation" defaultValue={product.location ?? ''} className="input-field" placeholder={t('product.locationShort')} /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.description')}</label><input name="editDescription" defaultValue={product.description ?? ''} className="input-field" placeholder={t('product.description')} /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.manufacturerTerm')}</label><input name="editManufacturerTerm" defaultValue={product.manufacturerTerm ?? ''} className="input-field" /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.localSlang')}</label><input name="editLocalSlang" defaultValue={product.localSlang ?? ''} className="input-field" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.dimensions')}</label><input name="editDimensions" defaultValue={product.dimensions ?? ''} className="input-field" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.ralLabel')}</label><input name="editColorRal" defaultValue={product.colorRal ?? ''} className="input-field" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.packaging')}</label><input name="editPackaging" defaultValue={product.packagingInfo ?? ''} className="input-field" placeholder={t('product.packaging')} /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.supplier')}</label><input name="editSupplier" defaultValue={product.supplier ?? ''} className="input-field" /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.internalNotes')}</label><input name="editInternalNotes" defaultValue={product.internalNotes ?? ''} className="input-field" /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="btn-success" disabled={submitting}>{submitting ? t('product.saving') : t('product.saveToDb')}</button>
            <button type="button" onClick={() => setTab('info')} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {tab === 'movements' && (
        <div className="card mt-4 p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">{t('product.movementsHistory')}</h2>
          {movements.length === 0 ? (
            <p className="text-sm text-slate-500">{t('product.noMovements')}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {movements.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className={m.delta >= 0 ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>{m.delta >= 0 ? '+' : ''}{m.delta}</span>
                  <span className="flex-1 text-slate-500">{m.note || '—'}</span>
                  {m.reference && <span className="text-xs text-slate-500">{t('product.refShort')}: {m.reference}</span>}
                  <span className="text-slate-400">{formatDateTime(m.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="card mt-4 p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">{t('product.tabAudit')}</h2>
          {auditLog.length === 0 ? (
            <p className="text-sm text-slate-500">{t('product.noAudit')}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {auditLog.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium text-slate-700">{a.action}</span>
                  {a.details && <span className="flex-1 text-slate-500">{a.details}</span>}
                  <span className="text-slate-400">{formatDateTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
