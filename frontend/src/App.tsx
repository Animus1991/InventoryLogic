import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { listProducts, createProduct, updateProduct, deleteProduct, adjustStock, getMovements, getAuditLog, getByBarcode, seedSampleProducts, type Product, type StockMovement, type AuditLog } from './lib/api'

function normalizeForSearch(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchesSearch(product: Product, query: string): boolean {
  if (!query.trim()) return true
  const n = normalizeForSearch(query)
  const fields = [product.name, product.sku, product.category, product.barcode, product.description].filter(Boolean) as string[]
  return fields.some((f) => normalizeForSearch(f).includes(n))
}

function App({ children }: { children?: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [movementsProductId, setMovementsProductId] = useState<number | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [auditLog, setAuditLog] = useState<AuditLog[]>([])
  const [showAuditInPanel, setShowAuditInPanel] = useState(false)
  const [adjustProductId, setAdjustProductId] = useState<number | null>(null)
  const [adjustDelta, setAdjustDelta] = useState<string>('')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustReference, setAdjustReference] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [newSku, setNewSku] = useState('')
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newBarcode, setNewBarcode] = useState('')
  const [newUnit, setNewUnit] = useState('τεμάχια')
  const [newDescription, setNewDescription] = useState('')
  const [newStock, setNewStock] = useState(0)
  const [newMinStock, setNewMinStock] = useState(0)
  const [newPrice, setNewPrice] = useState<string>('')
  const [newLocation, setNewLocation] = useState('')
  const [newDimensions, setNewDimensions] = useState('')
  const [newColorRal, setNewColorRal] = useState('')
  const [newPackaging, setNewPackaging] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    listProducts({ lowStockOnly })
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [lowStockOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAdjust(id: number, delta: number) {
    adjustStock(id, delta)
      .then((updated) => {
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        )
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newSku.trim() || !newName.trim() || submitting) return
    setSubmitting(true)
    createProduct({
      sku: newSku.trim(),
      name: newName.trim(),
      category: newCategory.trim() || undefined,
      barcode: newBarcode.trim() || undefined,
      unit: newUnit.trim() || undefined,
      description: newDescription.trim() || undefined,
      price: newPrice.trim() ? Number(newPrice) : null,
      location: newLocation.trim() || undefined,
      dimensions: newDimensions.trim() || undefined,
      colorRal: newColorRal.trim() || undefined,
      packagingInfo: newPackaging.trim() || undefined,
      stock: newStock,
      minStock: newMinStock,
    })
      .then((p) => {
        setProducts((prev) => [...prev, p])
        setShowForm(false)
        setNewSku(''); setNewName(''); setNewCategory(''); setNewBarcode(''); setNewUnit('τεμάχια'); setNewDescription('')
        setNewPrice(''); setNewLocation(''); setNewDimensions(''); setNewColorRal(''); setNewPackaging('')
        setNewStock(0); setNewMinStock(0)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setSubmitting(false))
  }

  function handleShowMovements(productId: number) {
    setMovementsProductId(productId)
    setShowAuditInPanel(false)
    getMovements(productId)
      .then(setMovements)
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
  }

  function handleShowAudit(productId: number) {
    setMovementsProductId(productId)
    setShowAuditInPanel(true)
    getAuditLog(productId)
      .then(setAuditLog)
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
  }

  function handleAdjustWithForm(e: React.FormEvent) {
    e.preventDefault()
    if (adjustProductId == null || adjustDelta === '' || submitting) return
    const delta = Number(adjustDelta)
    if (Number.isNaN(delta) || delta === 0) return
    setSubmitting(true)
    adjustStock(adjustProductId, delta, adjustNote.trim() || undefined, adjustReference.trim() || undefined)
      .then((updated) => {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setAdjustProductId(null)
        setAdjustDelta('')
        setAdjustNote('')
        setAdjustReference('')
        if (movementsProductId === adjustProductId) getMovements(adjustProductId).then(setMovements)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setSubmitting(false))
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editProduct || submitting) return
    const form = e.currentTarget
    const name = (form.querySelector('[name="editName"]') as HTMLInputElement)?.value?.trim()
    if (!name) return
    setSubmitting(true)
    const editPrice = (form.querySelector('[name="editPrice"]') as HTMLInputElement)?.value?.trim()
    updateProduct(editProduct.id, {
      sku: (form.querySelector('[name="editSku"]') as HTMLInputElement)?.value?.trim() || undefined,
      name,
      category: (form.querySelector('[name="editCategory"]') as HTMLInputElement)?.value?.trim() || undefined,
      barcode: (form.querySelector('[name="editBarcode"]') as HTMLInputElement)?.value?.trim() || undefined,
      unit: (form.querySelector('[name="editUnit"]') as HTMLInputElement)?.value?.trim() || undefined,
      description: (form.querySelector('[name="editDescription"]') as HTMLInputElement)?.value?.trim() || undefined,
      price: editPrice ? Number(editPrice) : null,
      location: (form.querySelector('[name="editLocation"]') as HTMLInputElement)?.value?.trim() || undefined,
      dimensions: (form.querySelector('[name="editDimensions"]') as HTMLInputElement)?.value?.trim() || undefined,
      colorRal: (form.querySelector('[name="editColorRal"]') as HTMLInputElement)?.value?.trim() || undefined,
      packagingInfo: (form.querySelector('[name="editPackaging"]') as HTMLInputElement)?.value?.trim() || undefined,
      minStock: (form.querySelector('[name="editMinStock"]') as HTMLInputElement)?.value !== '' ? Number((form.querySelector('[name="editMinStock"]') as HTMLInputElement)?.value) : undefined,
    })
      .then((updated) => {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setEditProduct(null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setSubmitting(false))
  }

  function handleDelete(id: number) {
    setSubmitting(true)
    deleteProduct(id)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setDeleteConfirmId(null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setSubmitting(false))
  }

  function exportCsv() {
    const headers = ['SKU', 'Barcode', 'Όνομα', 'Κατηγορία', 'Μονάδα', 'Απόθεμα', 'Ελάχ. απόθεμα', 'Περιγραφή']
    const rows = filtered.map((p) =>
      [p.sku, p.barcode ?? '', p.name, p.category ?? '', p.unit ?? 'τεμάχια', p.stock, p.minStock, (p.description ?? '').replace(/"/g, '""')].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `apotheke_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function exportPdf() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFontSize(14)
    doc.text('Λίστα προϊόντων — Αποθήκη', 14, 12)
    doc.setFontSize(10)
    doc.text(new Date().toLocaleDateString('el-GR'), doc.internal.pageSize.getWidth() - 30, 12)
    const colWidths = [25, 45, 30, 25, 18, 22, 22, 25]
    const headers = ['SKU', 'Όνομα', 'Κατηγορία', 'Barcode', 'Μονάδα', 'Απόθεμα', 'Ελάχ.', 'Τιμή']
    let y = 20
    doc.setFont(undefined as unknown as string, 'bold')
    headers.forEach((h, i) => doc.text(h, 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y))
    doc.setFont(undefined as unknown as string, 'normal')
    y += 6
    filtered.slice(0, 25).forEach((p) => {
      if (y > 180) { doc.addPage(); y = 20 }
      const row = [p.sku ?? '', p.name, p.category ?? '', p.barcode ?? '', (p.unit ?? 'τεμ.').slice(0, 4), String(p.stock), String(p.minStock), p.price != null ? `${Number(p.price).toFixed(2)}` : '—']
      row.forEach((cell, i) => doc.text(String(cell).slice(0, 12), 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y))
      y += 6
    })
    doc.save(`apotheke_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  function handleBarcodeLookup() {
    const code = barcodeInput.trim()
    if (!code) return
    getByBarcode(code)
      .then((p) => setScannedProduct(p ?? null))
      .catch(() => setScannedProduct(null))
  }

  function handleSeed() {
    setSubmitting(true)
    seedSampleProducts()
      .then((added) => {
        if (added > 0) load()
        setError(null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setSubmitting(false))
  }

  const filtered = products.filter((p) => matchesSearch(p, search) && (categoryFilter == null || p.category === categoryFilter))
  const lowStockList = products.filter((p) => p.minStock > 0 && p.stock <= p.minStock)
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-card shadow-card">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                Αποθήκη / Εμπόρευμα
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Διαχείριση προϊόντων και ποσοτήτων
              </p>
            </div>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-slate-800">Αρχική</Link>
              <Link to="/order" className="hover:text-slate-800">Τι να παραγγείλω</Link>
              <Link to="/about" className="hover:text-slate-800">Σχετικά</Link>
            </nav>
          </div>
        </div>
      </header>

      {children !== undefined ? (
        children
      ) : (
        <>
      {lowStockList.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800">
          ⚠️ {lowStockList.length} προϊόντα με χαμηλό απόθεμα — δείτε «Τι να παραγγείλω» παρακάτω.
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Αναζήτηση (όνομα, SKU, barcode, EL/EN)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-xs flex-1"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="rounded" />
            Μόνο χαμηλό απόθεμα
          </label>
          <button type="button" onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'} disabled={submitting}>
            {showForm ? 'Ακύρωση' : 'Νέο προϊόν'}
          </button>
          <button type="button" onClick={load} className="btn-secondary" disabled={loading}>
            Ανανέωση
          </button>
          <button type="button" onClick={exportCsv} className="btn-secondary">
            Export CSV
          </button>
          <button type="button" onClick={exportPdf} className="btn-secondary">
            Export PDF
          </button>
          <button type="button" onClick={handleSeed} className="btn-secondary" disabled={submitting}>
            Δειγματική λίστα
          </button>
        </div>
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">Κατηγορία:</span>
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              className={`rounded-full px-3 py-1 text-sm ${categoryFilter === null ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Όλες
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className={`rounded-full px-3 py-1 text-sm ${categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Barcode / QR (πληκτρολόγηση ή σάρωση)"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBarcodeLookup())}
            className="input-field max-w-xs"
          />
          <button type="button" onClick={handleBarcodeLookup} className="btn-secondary">
            Αναζήτηση
          </button>
          {scannedProduct && (
            <span className="text-sm text-slate-500">
              Βρέθηκε: {scannedProduct.name} (απόθεμα: {scannedProduct.stock} {scannedProduct.unit || 'τεμ.'})
            </span>
          )}
        </div>

        {lowStockList.length > 0 && !loading && (
          <div className="card mb-6 border-amber-200 bg-amber-50/30 p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-800">Τι να παραγγείλω</h2>
            <p className="mb-3 text-sm text-slate-600">Προϊόντα με απόθεμα ≤ ελάχιστη ποσότητα — προτεινόμενη παραγγελία:</p>
            <ul className="space-y-2 text-sm">
              {lowStockList.map((p) => {
                const suggest = Math.max(0, p.minStock - p.stock + 5)
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 px-3 py-2">
                    <span className="font-medium text-slate-700">{p.name}</span>
                    <span className="text-slate-500">απόθεμα: {p.stock} / ελάχ. {p.minStock}</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-800">Προτείνω: +{suggest} {(p.unit || 'τεμ.').replace('τεμάχια', 'τεμ.')}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {deleteConfirmId !== null && (
          <div className="card mb-6 border-amber-200 bg-amber-50/50 p-5">
            <p className="text-slate-700">Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => handleDelete(deleteConfirmId)} className="btn-primary bg-red-600 hover:bg-red-700" disabled={submitting}>
                Διαγραφή
              </button>
              <button type="button" onClick={() => setDeleteConfirmId(null)} className="btn-secondary" disabled={submitting}>
                Ακύρωση
              </button>
            </div>
          </div>
        )}

        {movementsProductId !== null && (
          <div className="card mb-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-800">
                {showAuditInPanel ? 'Audit log προϊόντος' : 'Ιστορικό κινήσεων'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAuditInPanel(false); getMovements(movementsProductId).then(setMovements) }}
                  className={`text-sm ${!showAuditInPanel ? 'font-medium text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Κινήσεις
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAuditInPanel(true); getAuditLog(movementsProductId).then(setAuditLog) }}
                  className={`text-sm ${showAuditInPanel ? 'font-medium text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Audit log
                </button>
                <button type="button" onClick={() => setMovementsProductId(null)} className="text-sm text-slate-500 hover:text-slate-700">
                  Κλείσιμο
                </button>
              </div>
            </div>
            {showAuditInPanel ? (
              auditLog.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Δεν υπάρχουν καταχωρήσεις audit.</p>
              ) : (
                <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto text-sm">
                  {auditLog.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="font-medium text-slate-700">{a.action}</span>
                      {a.details && <span className="flex-1 text-slate-500">{a.details}</span>}
                      <span className="text-slate-400">{new Date(a.createdAt).toLocaleString('el-GR')}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : movements.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Δεν υπάρχουν κινήσεις.</p>
            ) : (
              <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto text-sm">
                {movements.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <span className={m.delta >= 0 ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
                      {m.delta >= 0 ? '+' : ''}{m.delta}
                    </span>
                    <span className="flex-1 text-slate-500">{m.note || '—'}</span>
                    {m.reference && <span className="text-xs text-slate-500">Αναφ.: {m.reference}</span>}
                    <span className="text-slate-400">{new Date(m.createdAt).toLocaleString('el-GR')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {adjustProductId !== null && (
          <form onSubmit={handleAdjustWithForm} className="card mb-6 border-blue-200 bg-blue-50/30 p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-800">Προσαρμογή αποθέματος (με σημείωση / αναφορά)</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Δελτα (+ ή −)</label>
                <input type="number" value={adjustDelta} onChange={(e) => setAdjustDelta(e.target.value)} placeholder="π.χ. 10 ή -5" className="input-field w-28" required />
              </div>
              <div className="min-w-[180px]">
                <label className="mb-1 block text-sm font-medium text-slate-600">Σημείωση</label>
                <input type="text" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder="π.χ. παραλαβή" className="input-field" />
              </div>
              <div className="min-w-[180px]">
                <label className="mb-1 block text-sm font-medium text-slate-600">Αναφορά (τιμολόγιο/παραγγελία)</label>
                <input type="text" value={adjustReference} onChange={(e) => setAdjustReference(e.target.value)} placeholder="π.χ. ΤΙΜ-001" className="input-field" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-success" disabled={submitting}>{submitting ? 'Αποθήκευση...' : 'Εφαρμογή'}</button>
                <button type="button" onClick={() => { setAdjustProductId(null); setAdjustDelta(''); setAdjustNote(''); setAdjustReference('') }} className="btn-secondary">Ακύρωση</button>
              </div>
            </div>
          </form>
        )}

        {editProduct && (
          <form onSubmit={handleUpdate} className="card mb-6 p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-800">Επεξεργασία προϊόντος</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-600">SKU</label><input name="editSku" defaultValue={editProduct.sku} placeholder="SKU" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Όνομα</label><input name="editName" defaultValue={editProduct.name} required placeholder="Όνομα" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Κατηγορία</label><input name="editCategory" defaultValue={editProduct.category ?? ''} placeholder="Κατηγορία" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Barcode</label><input name="editBarcode" defaultValue={editProduct.barcode ?? ''} placeholder="Barcode" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Μονάδα</label><input name="editUnit" defaultValue={editProduct.unit ?? 'τεμάχια'} placeholder="τεμάχια, τ.μ., κιλά" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Ελάχ. απόθεμα</label><input name="editMinStock" type="number" min={0} defaultValue={editProduct.minStock} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Τιμή</label><input name="editPrice" type="number" step="0.01" min={0} defaultValue={editProduct.price ?? ''} placeholder="Τιμή" className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Θέση</label><input name="editLocation" defaultValue={editProduct.location ?? ''} placeholder="Θέση αποθήκης" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Διαστάσεις</label><input name="editDimensions" defaultValue={editProduct.dimensions ?? ''} placeholder="π.χ. 2x3m" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">RAL</label><input name="editColorRal" defaultValue={editProduct.colorRal ?? ''} placeholder="RAL χρώμα" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Συσκευασία</label><input name="editPackaging" defaultValue={editProduct.packagingInfo ?? ''} placeholder="Συσκευασία" className="input-field" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">Περιγραφή</label><input name="editDescription" defaultValue={editProduct.description ?? ''} placeholder="Περιγραφή" className="input-field" /></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-success" disabled={submitting}>{submitting ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
              <button type="button" onClick={() => setEditProduct(null)} className="btn-secondary">Ακύρωση</button>
            </div>
          </form>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="card mb-6 p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-800">Νέο προϊόν</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-600">SKU</label><input required placeholder="SKU" value={newSku} onChange={(e) => setNewSku(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Όνομα</label><input required placeholder="Όνομα" value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Κατηγορία</label><input placeholder="Κατηγορία" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Barcode</label><input placeholder="Barcode" value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Μονάδα</label><input placeholder="τεμάχια, τ.μ., κιλά" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Περιγραφή</label><input placeholder="Περιγραφή" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Ποσότητα</label><input type="number" min={0} value={newStock || ''} onChange={(e) => setNewStock(Number(e.target.value) || 0)} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Ελάχ. απόθεμα</label><input type="number" min={0} value={newMinStock || ''} onChange={(e) => setNewMinStock(Number(e.target.value) || 0)} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Τιμή</label><input type="number" step="0.01" min={0} placeholder="Τιμή" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Θέση</label><input placeholder="Θέση αποθήκης" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Διαστάσεις</label><input placeholder="π.χ. 2x3m" value={newDimensions} onChange={(e) => setNewDimensions(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">RAL</label><input placeholder="RAL χρώμα" value={newColorRal} onChange={(e) => setNewColorRal(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">Συσκευασία</label><input placeholder="Συσκευασία" value={newPackaging} onChange={(e) => setNewPackaging(e.target.value)} className="input-field" /></div>
            </div>
            <button type="submit" className="btn-success mt-4" disabled={submitting}>{submitting ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
          </form>
        )}

        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <p className="text-slate-500">Φόρτωση...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="text-slate-500">Δεν βρέθηκαν προϊόντα.</p>
            <p className="mt-1 text-sm text-slate-400">Προσθέστε νέο προϊόν ή αλλάξτε το φίλτρο αναζήτησης.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((p) => (
              <li
                key={p.id}
                className={`card p-5 transition-shadow hover:shadow-cardHover ${
                  p.stock <= p.minStock && p.minStock > 0
                    ? 'border-amber-300 bg-amber-50/50'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/product/${p.id}`} className="font-semibold text-slate-800 hover:text-blue-600 hover:underline">{p.name}</Link>
                      {p.sku && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {p.sku}
                        </span>
                      )}
                      {p.category && (
                        <span className="text-sm text-slate-500">{p.category}</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        Απόθεμα: {p.stock} {(p.unit || 'τεμ.').replace('τεμάχια', 'τεμ.')}
                      </span>
                      {p.price != null && <span className="text-sm text-slate-600">{Number(p.price).toFixed(2)} €</span>}
                      {p.location && <span className="text-xs text-slate-500">Θέση: {p.location}</span>}
                      {p.colorRal && <span className="text-xs text-slate-500">RAL {p.colorRal}</span>}
                      {p.packagingInfo && <span className="text-xs text-slate-500">Συσκ. {p.packagingInfo}</span>}
                      {p.barcode && <span className="text-xs text-slate-400">Barcode: {p.barcode}</span>}
                      {p.minStock > 0 && <span className="text-sm text-slate-500">ελάχ. {p.minStock}</span>}
                      {p.stock <= p.minStock && p.minStock > 0 && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Χαμηλό απόθεμα</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <button type="button" onClick={() => setEditProduct(p)} className="text-sm font-medium text-blue-600 hover:text-blue-700">Επεξεργασία</button>
                      <button type="button" onClick={() => handleShowMovements(p.id)} className="text-sm text-slate-500 hover:text-slate-700">Ιστορικό</button>
                      <button type="button" onClick={() => handleShowAudit(p.id)} className="text-sm text-slate-500 hover:text-slate-700">Audit</button>
                      <button type="button" onClick={() => setAdjustProductId(p.id)} className="text-sm text-slate-500 hover:text-slate-700">Προσαρμογή με σημείωση</button>
                      <button type="button" onClick={() => setDeleteConfirmId(p.id)} className="text-sm text-red-600 hover:text-red-700">Διαγραφή</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, -10)}
                      className="rounded-lg bg-red-100 px-2.5 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      −10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, -5)}
                      className="rounded-lg bg-red-50 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      −5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, -1)}
                      className="rounded-lg bg-red-50/80 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      −1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, 1)}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, 5)}
                      className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, 10)}
                      className="rounded-lg bg-emerald-200 px-2.5 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-300"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
        </>
      )}
    </div>
  )
}

export default App
