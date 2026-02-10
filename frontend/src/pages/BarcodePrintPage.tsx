import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import { listProducts, type Product } from '../lib/api'
import BarcodeImage from '../components/BarcodeImage'
import QRImage from '../components/QRImage'
import { useI18n } from '../contexts/I18nContext'

function getQRPayload(p: Product): string {
  return p.qrCode || (typeof window !== 'undefined' ? `${window.location.origin}/product/${p.id}` : p.sku)
}

export default function BarcodePrintPage() {
  const { t } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [printView, setPrintView] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    listProducts({ size: 500 })
      .then((page) => setProducts(page.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  function toggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(products.map((p) => p.id)))
  }

  function selectNone() {
    setSelectedIds(new Set())
  }

  function handlePrint() {
    const list = products.filter((p) => selectedIds.has(p.id))
    if (list.length === 0) return
    setPrintView(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print()
        setPrintView(false)
      })
    })
  }

  async function downloadLabelsPdf() {
    const list = products.filter((p) => selectedIds.has(p.id))
    if (list.length === 0) return
    setPdfLoading(true)
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const cols = 3
      const rows = 2
      const cardW = pageW / cols
      let index = 0
      for (const p of list) {
        const col = index % cols
        const row = Math.floor(index / cols) % rows
        const x = col * cardW + 4
        const y = row * 50 + 8
        pdf.setFontSize(8)
        pdf.text(p.name.substring(0, 32) || p.sku, x, y)
        pdf.text(p.sku, x, y + 5)
        const barcodeVal = p.barcode || p.sku || String(p.id)
        const canvas = document.createElement('canvas')
        JsBarcode(canvas, barcodeVal, { format: 'CODE128', width: 1.2, height: 28 })
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y + 6, 45, 12)
        const qrVal = getQRPayload(p)
        const qrDataUrl = await QRCode.toDataURL(qrVal, { width: 80, margin: 1 })
        pdf.addImage(qrDataUrl, 'PNG', x + 46, y + 6, 18, 18)
        index++
        if (index % (cols * rows) === 0 && index < list.length) pdf.addPage()
      }
      pdf.save('barcode-labels.pdf')
    } finally {
      setPdfLoading(false)
    }
  }

  function handleEmail() {
    downloadLabelsPdf().then(() => {
      const subject = encodeURIComponent('Barcode labels - InventoryLogic')
      const body = encodeURIComponent('Please find the barcode labels in the attached PDF.')
      window.open(`mailto:?subject=${subject}&body=${body}`)
    })
  }

  const toPrint = products.filter((p) => selectedIds.has(p.id))

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link to="/products" className="text-sm text-blue-600 hover:underline">← {t('common.back')}</Link>
      <h2 className="mt-4 text-xl font-semibold text-slate-800">{t('print.title')}</h2>
      <p className="mt-2 text-sm text-slate-600">
        {t('print.description')}
      </p>

      {!printView && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={selectAll} className="btn-secondary">{t('print.selectAll')}</button>
          <button type="button" onClick={selectNone} className="btn-secondary">{t('print.selectNone')}</button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={toPrint.length === 0}
            className="btn-primary"
          >
            {t('print.printBtn')} {toPrint.length > 0 ? `(${toPrint.length})` : ''}
          </button>
          <button
            type="button"
            onClick={downloadLabelsPdf}
            disabled={toPrint.length === 0 || pdfLoading}
            className="btn-secondary"
          >
            {pdfLoading ? t('common.loading') : t('print.downloadPdf')}
          </button>
          <button
            type="button"
            onClick={handleEmail}
            disabled={toPrint.length === 0 || pdfLoading}
            className="btn-secondary"
          >
            {t('print.email')}
          </button>
        </div>
      )}

      {!printView && (
        <ul className="mt-4 space-y-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex cursor-pointer flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50"
              onClick={() => toggle(p.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggle(p.id)}
                className="h-5 w-5 rounded"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="font-medium text-slate-800">{p.name}</span>
              <span className="text-sm text-slate-500">{p.sku}</span>
              <span className="text-sm text-slate-400">{p.barcode || '—'}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Print-only area */}
      {printView && toPrint.length > 0 && (
        <div className="print-only mt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {toPrint.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center justify-center rounded border border-slate-300 bg-white p-4"
                style={{ minHeight: '140px' }}
              >
                <p className="mb-1 w-full truncate text-center text-sm font-medium text-slate-800">{p.name}</p>
                <p className="mb-2 w-full truncate text-center text-xs text-slate-500">{p.sku}</p>
                <div className="flex items-center gap-2">
                  <BarcodeImage value={p.barcode || p.sku || String(p.id)} height={50} width={1.5} />
                  <QRImage value={getQRPayload(p)} size={64} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; }
          nav, header, a, button { display: none !important; }
        }
      `}</style>
    </div>
  )
}
