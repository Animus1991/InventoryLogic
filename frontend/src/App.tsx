import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { getByBarcode, getToken, clearToken, type Product, type StockMovement, type AuditLog } from './lib/api'
import { useProducts } from './hooks/useProducts'
import ProductTable from './components/ProductTable'
import MovementsPanel from './components/MovementsPanel'
import BarcodeScanner from './components/BarcodeScanner'
import CurrencySelector from './components/CurrencySelector'
import LanguageSwitcher from './components/LanguageSwitcher'
import { useI18n } from './contexts/I18nContext'

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
  const navigate = useNavigate()
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
  const [newManufacturerTerm, setNewManufacturerTerm] = useState('')
  const [newLocalSlang, setNewLocalSlang] = useState('')
  const [newQrCode, setNewQrCode] = useState('')
  const [newSupplier, setNewSupplier] = useState('')
  const [newInternalNotes, setNewInternalNotes] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [, setCurrencyKey] = useState(0)
  const { t } = useI18n()

  const {
    products,
    loading,
    error,
    setError,
    submitting,
    load,
    handleAdjust,
    handleCreate: createProductAction,
    handleUpdate: updateProductAction,
    handleDelete: deleteProductAction,
    handleAdjustWithForm: adjustWithFormAction,
    handleSeed,
    getMovements,
    getAuditLog,
  } = useProducts(lowStockOnly)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newSku.trim() || !newName.trim() || submitting) return
    createProductAction({
      sku: newSku.trim(),
      name: newName.trim(),
      category: newCategory.trim() || undefined,
      barcode: newBarcode.trim() || undefined,
      qrCode: newQrCode.trim() || undefined,
      unit: newUnit.trim() || undefined,
      description: newDescription.trim() || undefined,
      manufacturerTerm: newManufacturerTerm.trim() || undefined,
      localSlang: newLocalSlang.trim() || undefined,
      price: newPrice.trim() ? Number(newPrice) : null,
      location: newLocation.trim() || undefined,
      dimensions: newDimensions.trim() || undefined,
      colorRal: newColorRal.trim() || undefined,
      packagingInfo: newPackaging.trim() || undefined,
      supplier: newSupplier.trim() || undefined,
      internalNotes: newInternalNotes.trim() || undefined,
      stock: newStock,
      minStock: newMinStock,
    })
      .then(() => {
        setShowForm(false)
        setNewSku(''); setNewName(''); setNewCategory(''); setNewBarcode(''); setNewUnit('τεμάχια'); setNewDescription('')
        setNewPrice(''); setNewLocation(''); setNewDimensions(''); setNewColorRal(''); setNewPackaging('')
        setNewManufacturerTerm(''); setNewLocalSlang(''); setNewQrCode(''); setNewSupplier(''); setNewInternalNotes('')
        setNewStock(0); setNewMinStock(0)
        setSuccessMessage(t('app.productAdded'))
        setTimeout(() => setSuccessMessage(null), 3000)
      })
      .catch(() => {})
  }

  function handleShowMovements(productId: number) {
    setMovementsProductId(productId)
    setShowAuditInPanel(false)
    getMovements(productId)
      .then(setMovements)
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
  }

  function handleShowAudit(productId: number) {
    setMovementsProductId(productId)
    setShowAuditInPanel(true)
    getAuditLog(productId)
      .then(setAuditLog)
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
  }

  function handleAdjustWithForm(e: React.FormEvent) {
    e.preventDefault()
    if (adjustProductId == null || adjustDelta === '' || submitting) return
    const delta = Number(adjustDelta)
    if (Number.isNaN(delta) || delta === 0) return
    adjustWithFormAction(adjustProductId, delta, adjustNote.trim() || undefined, adjustReference.trim() || undefined)
      .then(() => {
        setAdjustProductId(null)
        setAdjustDelta('')
        setAdjustNote('')
        setAdjustReference('')
        if (movementsProductId === adjustProductId) getMovements(adjustProductId).then(setMovements)
      })
      .catch(() => {})
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editProduct || submitting) return
    const form = e.currentTarget
    const name = (form.querySelector('[name="editName"]') as HTMLInputElement)?.value?.trim()
    if (!name) return
    const editPrice = (form.querySelector('[name="editPrice"]') as HTMLInputElement)?.value?.trim()
    updateProductAction(editProduct.id, {
      sku: (form.querySelector('[name="editSku"]') as HTMLInputElement)?.value?.trim() || undefined,
      name,
      category: (form.querySelector('[name="editCategory"]') as HTMLInputElement)?.value?.trim() || undefined,
      barcode: (form.querySelector('[name="editBarcode"]') as HTMLInputElement)?.value?.trim() || undefined,
      unit: (form.querySelector('[name="editUnit"]') as HTMLInputElement)?.value?.trim() || undefined,
      description: (form.querySelector('[name="editDescription"]') as HTMLInputElement)?.value?.trim() || undefined,
      manufacturerTerm: (form.querySelector('[name="editManufacturerTerm"]') as HTMLInputElement)?.value?.trim() || undefined,
      localSlang: (form.querySelector('[name="editLocalSlang"]') as HTMLInputElement)?.value?.trim() || undefined,
      price: editPrice ? Number(editPrice) : null,
      location: (form.querySelector('[name="editLocation"]') as HTMLInputElement)?.value?.trim() || undefined,
      dimensions: (form.querySelector('[name="editDimensions"]') as HTMLInputElement)?.value?.trim() || undefined,
      colorRal: (form.querySelector('[name="editColorRal"]') as HTMLInputElement)?.value?.trim() || undefined,
      packagingInfo: (form.querySelector('[name="editPackaging"]') as HTMLInputElement)?.value?.trim() || undefined,
      minStock: (form.querySelector('[name="editMinStock"]') as HTMLInputElement)?.value !== '' ? Number((form.querySelector('[name="editMinStock"]') as HTMLInputElement)?.value) : undefined,
    })
      .then(() => {
        setEditProduct(null)
        setSuccessMessage(t('app.changesSaved'))
        setTimeout(() => setSuccessMessage(null), 3000)
      })
      .catch(() => {})
  }

  function handleDelete(id: number) {
    deleteProductAction(id)
      .then(() => setDeleteConfirmId(null))
      .catch(() => {})
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

  function handleBarcodeScan(code: string) {
    setShowBarcodeScanner(false)
    setBarcodeInput(code.trim())
    getByBarcode(code.trim())
      .then((p) => setScannedProduct(p ?? null))
      .catch(() => setScannedProduct(null))
  }

  const productList = products ?? []
  const filtered = productList.filter((p) => matchesSearch(p, search) && (categoryFilter == null || p.category === categoryFilter))
  const lowStockList = productList.filter((p) => p.minStock > 0 && p.stock <= p.minStock)
  const categories = Array.from(new Set(productList.map((p) => p.category).filter(Boolean))) as string[]
  const handleAdjustWithNote = (p: Product) => setAdjustProductId(p.id)

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-card shadow-card">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                {t('app.title')}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {t('app.subtitle')}
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-medium text-slate-600">
              <Link to="/" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.dashboard')}</Link>
              <Link to="/products" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.products')}</Link>
              <Link to="/reports" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.reports')}</Link>
              <Link to="/order" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.order')}</Link>
              <Link to="/print-barcodes" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.printBarcodes')}</Link>
              <Link to="/import" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.import')}</Link>
              <Link to="/about" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.about')}</Link>
              <LanguageSwitcher />
              <CurrencySelector onCurrencyChange={() => setCurrencyKey((k) => k + 1)} />
              {getToken() ? (
                <button type="button" onClick={() => { clearToken(); navigate('/login', { replace: true }); }} className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">
                  {t('nav.logout')}
                </button>
              ) : (
                <>
                  <Link to="/signup" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.signup')}</Link>
                  <Link to="/login" className="min-h-[44px] inline-flex items-center px-2 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-800">{t('nav.login')}</Link>
                </>
              )}
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
          ⚠️ {lowStockList.length} {t('order.banner')} — <Link to="/order" className="underline">{t('nav.order')}</Link>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6 sm:px-6">
        {/* Barcode πρώτο (κινητά): σάρωση κάμερα ή πληκτρολόγηση */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}
        <div className="mb-4 order-first rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 sm:p-3">
          <p className="mb-2 text-sm font-medium text-slate-700 sm:mb-1">📷 Barcode / QR — {t('barcode.scanOrType')}</p>
          <div className="flex flex-wrap items-stretch gap-2">
            <input
              type="text"
              inputMode="numeric"
              enterKeyHint="search"
              placeholder={t('barcode.scanOrType')}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBarcodeLookup())}
              className="input-field flex-1 min-w-0"
            />
            <button type="button" onClick={() => setShowBarcodeScanner(true)} className="btn-secondary shrink-0">
              {t('barcode.openScanner')}
            </button>
            <button type="button" onClick={handleBarcodeLookup} className="btn-primary shrink-0">
              {t('barcode.search')}
            </button>
          </div>
          {scannedProduct && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/80 p-3">
              <span className="text-sm font-medium text-slate-800">{scannedProduct.name}</span>
              <span className="text-sm text-slate-500">{t('product.stock')}: {scannedProduct.stock} {scannedProduct.unit || 'τεμ.'}</span>
              <Link to={`/product/${scannedProduct.id}`} className="btn-secondary text-sm">{t('barcode.openOrEdit')}</Link>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="font-medium text-slate-700">{t('products.total')}: {productList.length}</span>
            <span className="hidden sm:inline">|</span>
            <span>{t('products.lowStock')}: <strong className="text-amber-700">{lowStockList.length}</strong></span>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-xs flex-1"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="rounded" />
            {t('products.lowStockOnly')}
          </label>
          <button type="button" onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'} disabled={submitting}>
            {showForm ? t('common.cancel') : t('products.newProduct')}
          </button>
          <button type="button" onClick={load} className="btn-secondary" disabled={loading}>
            {t('common.refresh')}
          </button>
          <button type="button" onClick={exportCsv} className="btn-secondary">
            {t('common.exportCsv')}
          </button>
          <button type="button" onClick={exportPdf} className="btn-secondary">
            {t('common.exportPdf')}
          </button>
          <button type="button" onClick={handleSeed} className="btn-secondary" disabled={submitting}>
            {t('products.seedList')}
          </button>
        </div>
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">{t('products.categoryLabel')}:</span>
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              className={`rounded-full px-3 py-1 text-sm ${categoryFilter === null ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {t('common.all')}
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
        {lowStockList.length > 0 && !loading && (
          <div className="card mb-6 border-amber-200 bg-amber-50/30 p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-800">{t('order.title')}</h2>
            <p className="mb-3 text-sm text-slate-600">{t('order.hint')}</p>
            <ul className="space-y-2 text-sm">
              {lowStockList.map((p) => {
                const suggest = Math.max(0, p.minStock - p.stock + 5)
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 px-3 py-2">
                    <span className="font-medium text-slate-700">{p.name}</span>
                    <span className="text-slate-500">{t('product.stock')}: {p.stock} / {t('product.minShort')} {p.minStock}</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-800">{t('order.suggest')}: +{suggest} {(p.unit || 'τεμ.').replace('τεμάχια', 'τεμ.')}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t('common.error')}</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button type="button" onClick={() => setError(null)} className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-100" aria-label={t('panel.close')}>×</button>
          </div>
        )}

        {deleteConfirmId !== null && (
          <div className="card mb-6 border-amber-200 bg-amber-50/50 p-5">
            <p className="text-slate-700">{t('common.deleteConfirm')}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => handleDelete(deleteConfirmId)} className="btn-primary bg-red-600 hover:bg-red-700" disabled={submitting}>
                {t('table.delete')}
              </button>
              <button type="button" onClick={() => setDeleteConfirmId(null)} className="btn-secondary" disabled={submitting}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {movementsProductId !== null && (
          <MovementsPanel
            showAudit={showAuditInPanel}
            movements={movements}
            auditLog={auditLog}
            onTabMovements={() => {
              setShowAuditInPanel(false)
              getMovements(movementsProductId).then(setMovements).catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
            }}
            onTabAudit={() => {
              setShowAuditInPanel(true)
              getAuditLog(movementsProductId).then(setAuditLog).catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
            }}
            onClose={() => setMovementsProductId(null)}
          />
        )}

        {adjustProductId !== null && (
          <form onSubmit={handleAdjustWithForm} className="card mb-6 border-blue-200 bg-blue-50/30 p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-800">{t('product.adjustStock')}</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">{t('product.delta')}</label>
                <input type="number" value={adjustDelta} onChange={(e) => setAdjustDelta(e.target.value)} placeholder="e.g. 10 or -5" className="input-field w-28" required />
              </div>
              <div className="min-w-[180px]">
                <label className="mb-1 block text-sm font-medium text-slate-600">{t('product.note')}</label>
                <input type="text" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} className="input-field" />
              </div>
              <div className="min-w-[180px]">
                <label className="mb-1 block text-sm font-medium text-slate-600">{t('product.reference')}</label>
                <input type="text" value={adjustReference} onChange={(e) => setAdjustReference(e.target.value)} className="input-field" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-success" disabled={submitting}>{submitting ? t('product.saving') : t('product.apply')}</button>
                <button type="button" onClick={() => { setAdjustProductId(null); setAdjustDelta(''); setAdjustNote(''); setAdjustReference('') }} className="btn-secondary">{t('common.cancel')}</button>
              </div>
            </div>
          </form>
        )}

        {editProduct && (
          <form onSubmit={handleUpdate} className="card mb-6 p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-800">{t('product.editTitle')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-600">SKU</label><input name="editSku" defaultValue={editProduct.sku} placeholder="SKU" className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.name')}</label><input name="editName" defaultValue={editProduct.name} required placeholder={t('product.name')} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.category')}</label><input name="editCategory" defaultValue={editProduct.category ?? ''} placeholder={t('product.category')} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.barcodeLabel')}</label><input name="editBarcode" defaultValue={editProduct.barcode ?? ''} placeholder={t('product.barcodeLabel')} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.unit')}</label><input name="editUnit" defaultValue={editProduct.unit ?? 'τεμάχια'} placeholder={t('product.unit')} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.minStock')}</label><input name="editMinStock" type="number" min={0} defaultValue={editProduct.minStock} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.price')}</label><input name="editPrice" type="number" step="0.01" min={0} defaultValue={editProduct.price ?? ''} placeholder={t('product.price')} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.location')}</label><input name="editLocation" defaultValue={editProduct.location ?? ''} placeholder={t('product.locationShort')} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.dimensions')}</label><input name="editDimensions" defaultValue={editProduct.dimensions ?? ''} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.ralLabel')}</label><input name="editColorRal" defaultValue={editProduct.colorRal ?? ''} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.packaging')}</label><input name="editPackaging" defaultValue={editProduct.packagingInfo ?? ''} placeholder={t('product.packaging')} className="input-field" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.description')}</label><input name="editDescription" defaultValue={editProduct.description ?? ''} placeholder={t('product.description')} className="input-field" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.manufacturerTerm')}</label><input name="editManufacturerTerm" defaultValue={editProduct.manufacturerTerm ?? ''} className="input-field" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.localSlang')}</label><input name="editLocalSlang" defaultValue={editProduct.localSlang ?? ''} className="input-field" /></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-success" disabled={submitting}>{submitting ? t('product.saving') : t('common.save')}</button>
              <button type="button" onClick={() => setEditProduct(null)} className="btn-secondary">{t('common.cancel')}</button>
            </div>
          </form>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="card mb-6 p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-800">{t('products.newProduct')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-600">SKU</label><input required placeholder="SKU" value={newSku} onChange={(e) => setNewSku(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.name')}</label><input required placeholder={t('product.name')} value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.category')}</label><input placeholder={t('product.category')} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.barcodeLabel')}</label><input placeholder={t('product.barcodeLabel')} value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">QR</label><input placeholder="QR" value={newQrCode} onChange={(e) => setNewQrCode(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.unit')}</label><input placeholder={t('product.unit')} value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.description')}</label><input placeholder={t('product.description')} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.manufacturerTermLabel')}</label><input value={newManufacturerTerm} onChange={(e) => setNewManufacturerTerm(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.localSlangLabel')}</label><input value={newLocalSlang} onChange={(e) => setNewLocalSlang(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('reports.quantity')}</label><input type="number" min={0} value={newStock || ''} onChange={(e) => setNewStock(Number(e.target.value) || 0)} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.minStock')}</label><input type="number" min={0} value={newMinStock || ''} onChange={(e) => setNewMinStock(Number(e.target.value) || 0)} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.price')}</label><input type="number" step="0.01" min={0} placeholder={t('product.price')} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="input-field w-28" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.locationShort')}</label><input placeholder={t('product.location')} value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.dimensions')}</label><input value={newDimensions} onChange={(e) => setNewDimensions(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.ralLabel')}</label><input value={newColorRal} onChange={(e) => setNewColorRal(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.packaging')}</label><input placeholder={t('product.packaging')} value={newPackaging} onChange={(e) => setNewPackaging(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.supplier')}</label><input value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-600">{t('product.internalNotes')}</label><input value={newInternalNotes} onChange={(e) => setNewInternalNotes(e.target.value)} className="input-field" /></div>
            </div>
            <button type="submit" className="btn-success mt-4" disabled={submitting}>{submitting ? t('product.saving') : t('common.save')}</button>
          </form>
        )}

        <ProductTable
          products={filtered}
          loading={loading}
          onAdjust={handleAdjust}
          onEdit={setEditProduct}
          onShowMovements={handleShowMovements}
          onShowAudit={handleShowAudit}
          onAdjustWithNote={handleAdjustWithNote}
          onDelete={setDeleteConfirmId}
        />
      </main>
        </>
      )}
    </div>
  )
}

export default App
