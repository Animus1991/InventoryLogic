import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { importProductsCsv, listProducts, type ImportResult, type Product } from '../lib/api'
import { SKU_TERMINOLOGY } from '../lib/skuTerminology'
import { useI18n } from '../contexts/I18nContext'

const CSV_HEADER = 'sku,name,category,barcode,qrCode,unit,description,manufacturerTerm,localSlang,price,location,dimensions,colorRal,packagingInfo,supplier,internalNotes,stock,minStock'
const CSV_EXAMPLE = `${CSV_HEADER}
NEW-001,Νέο προϊόν,Κατηγορία,5900000000001,,τεμάχια,Περιγραφή,Ορολογία παραγωγού,Τοπική ορολογία,10.50,A-1,,,κουτί,Προμηθευτής Α,,0,5`

export default function ImportPage() {
  const { t } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [ocrText, setOcrText] = useState('')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [matchResults, setMatchResults] = useState<Product[]>([])
  const [matchLoading, setMatchLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    setFile(f || null)
    setResult(null)
    setError(null)
  }

  const runOcr = useCallback(async () => {
    if (!photoFile) return
    setOcrLoading(true)
    setOcrError(null)
    setOcrText('')
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('ell+eng', 1, { logger: () => {} })
      const { data } = await worker.recognize(photoFile)
      await worker.terminate()
      const text = data.text?.trim() || ''
      if (!text) setOcrText(CSV_HEADER + '\n')
      else setOcrText(text.includes('sku') ? text : CSV_HEADER + '\n' + text)
    } catch (e) {
      setOcrError(e instanceof Error ? e.message : t('common.error'))
    } finally {
      setOcrLoading(false)
    }
  }, [photoFile])

  function searchProductsFromOcr() {
    const firstLine = ocrText.trim().split(/\r?\n/)[0]?.replace(/^[\s,;]+|[\s,;]+$/g, '') || ''
    const query = firstLine.includes('sku') ? ocrText.trim().split(/\r?\n/)[1]?.split(/[,;\t]/)[0]?.trim() || firstLine : firstLine.split(/[,;\t]/)[0]?.trim() || firstLine
    if (!query || query.length < 2) return
    setMatchLoading(true)
    listProducts({ q: query, size: 20 })
      .then((page) => setMatchResults(page.items))
      .catch(() => setMatchResults([]))
      .finally(() => setMatchLoading(false))
  }

  function handleImportFromOcr(e: React.FormEvent) {
    e.preventDefault()
    if (!ocrText.trim() || loading) return
    const lines = ocrText.trim().split(/\r?\n/)
    const hasHeader = lines[0]?.toLowerCase().includes('sku')
    const body = hasHeader ? lines.join('\n') : CSV_HEADER + '\n' + lines.join('\n')
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8' })
    const csvFile = new File([blob], 'import-from-photo.csv', { type: 'text/csv' })
    setLoading(true)
    setError(null)
    setResult(null)
    importProductsCsv(csvFile)
      .then((r) => {
        setResult(r)
        setOcrText('')
        setPhotoFile(null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
      .finally(() => setLoading(false))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    importProductsCsv(file)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : t('common.error')))
      .finally(() => setLoading(false))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link to="/products" className="text-sm text-blue-600 hover:underline">← {t('common.back')}</Link>
      <h2 className="mt-4 text-xl font-semibold text-slate-800">{t('import.title')}</h2>
      <p className="mt-2 text-sm text-slate-600" title={SKU_TERMINOLOGY}>
        {t('import.description')}
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-600">{t('import.fileLabel')}</label>
            <input
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileChange}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={!file || loading}>
            {loading ? t('import.importing') : t('import.import')}
          </button>
        </div>
      </form>

      <div className="card mt-6 p-5">
        <h3 className="text-base font-semibold text-slate-800">{t('import.photoSection')}</h3>
        <p className="mt-1 text-sm text-slate-600">{t('import.photoHint')}</p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t('import.image')}</label>
            <input type="file" accept="image/*" onChange={(e) => { setPhotoFile(e.target.files?.[0] ?? null); setOcrText(''); setOcrError(null); }} className="input-field" />
          </div>
          <button type="button" onClick={runOcr} className="btn-secondary" disabled={!photoFile || ocrLoading}>{ocrLoading ? t('import.recognizing') : t('import.recognize')}</button>
        </div>
        {ocrError && <p className="mt-2 text-sm text-red-600">{ocrError}</p>}
        {ocrText && (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-600">{t('import.textEditHint')}</label>
            <textarea value={ocrText} onChange={(e) => setOcrText(e.target.value)} rows={8} className="input-field w-full font-mono text-sm" placeholder={CSV_HEADER} />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={searchProductsFromOcr} disabled={matchLoading} className="btn-secondary">
                {matchLoading ? t('import.searching') : t('import.searchFromText')}
              </button>
              <form onSubmit={handleImportFromOcr} className="inline">
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('import.importing') : t('import.importAsCsv')}</button>
              </form>
            </div>
            {matchResults.length > 0 && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-sm font-medium text-slate-700">{t('import.suggestedProducts')}</p>
                <ul className="space-y-1 text-sm">
                  {matchResults.map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.id}`} className="text-blue-600 hover:underline">
                        {p.sku} — {p.name}
                      </Link>
                      {p.barcode && <span className="ml-2 text-slate-500">{p.barcode}</span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-500">{t('import.pickProductHint')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="card mt-4 p-5">
          <h3 className="text-base font-semibold text-slate-800">{t('import.result')}</h3>
          <p className="mt-2 text-sm text-slate-600">
            {t('import.created')}: <strong>{result.created}</strong>, {t('import.updated')}: <strong>{result.updated}</strong>
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-3 list-inside list-disc text-sm text-amber-700">
              {result.errors.slice(0, 20).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {result.errors.length > 20 && <li>{t('import.andMore').replace('{n}', String(result.errors.length - 20))}</li>}
            </ul>
          )}
        </div>
      )}

      <div className="card mt-6 p-5">
        <h3 className="text-base font-semibold text-slate-800">{t('import.exampleCsv')}</h3>
        <p className="mt-1 text-sm text-slate-600">{t('import.exampleHint')}</p>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-100 p-3 text-xs text-slate-700">{CSV_EXAMPLE}</pre>
      </div>
    </div>
  )
}
