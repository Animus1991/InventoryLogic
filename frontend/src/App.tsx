import { useEffect, useState } from 'react'
import { listProducts, createProduct, updateProduct, adjustStock, getMovements, type Product, type StockMovement } from './lib/api'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [movementsProductId, setMovementsProductId] = useState<number | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [newSku, setNewSku] = useState('')
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newStock, setNewStock] = useState(0)
  const [newMinStock, setNewMinStock] = useState(0)

  function load() {
    setLoading(true)
    setError(null)
    listProducts()
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

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
    if (!newSku.trim() || !newName.trim()) return
    createProduct({
      sku: newSku.trim(),
      name: newName.trim(),
      category: newCategory.trim() || undefined,
      stock: newStock,
      minStock: newMinStock,
    })
      .then((p) => {
        setProducts((prev) => [...prev, p])
        setShowForm(false)
        setNewSku('')
        setNewName('')
        setNewCategory('')
        setNewStock(0)
        setNewMinStock(0)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
  }

  function handleShowMovements(productId: number) {
    setMovementsProductId(productId)
    getMovements(productId)
      .then(setMovements)
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editProduct) return
    const sku = (e.currentTarget.querySelector('[name="editSku"]') as HTMLInputElement)?.value?.trim()
    const name = (e.currentTarget.querySelector('[name="editName"]') as HTMLInputElement)?.value?.trim()
    const category = (e.currentTarget.querySelector('[name="editCategory"]') as HTMLInputElement)?.value?.trim()
    const minStockStr = (e.currentTarget.querySelector('[name="editMinStock"]') as HTMLInputElement)?.value
    if (!name) return
    updateProduct(editProduct.id, {
      sku: sku || undefined,
      name,
      category: category || undefined,
      minStock: minStockStr !== '' ? Number(minStockStr) : undefined,
    })
      .then((updated) => {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setEditProduct(null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Αποθήκη / Εμπόρευμα
        </h1>

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Αναζήτηση (όνομα ή SKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {showForm ? 'Ακύρωση' : 'Νέο προϊόν'}
          </button>
          <button
            type="button"
            onClick={load}
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Ανανέωση
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-2 text-red-700">
            {error}
          </div>
        )}

        {movementsProductId !== null && (
          <div className="mb-6 rounded border border-gray-300 bg-white p-4 shadow">
            <div className="flex justify-between">
              <h2 className="font-semibold">Ιστορικό κινήσεων</h2>
              <button type="button" onClick={() => setMovementsProductId(null)} className="text-gray-600 hover:underline">Κλείσιμο</button>
            </div>
            {movements.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">Δεν υπάρχουν κινήσεις.</p>
            ) : (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
                {movements.map((m) => (
                  <li key={m.id} className="flex justify-between gap-4">
                    <span>{m.delta >= 0 ? '+' : ''}{m.delta}</span>
                    <span className="text-gray-500">{m.note || '—'}</span>
                    <span className="text-gray-400">{new Date(m.createdAt).toLocaleString('el-GR')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {editProduct && (
          <form
            onSubmit={handleUpdate}
            className="mb-6 rounded border border-gray-300 bg-white p-4 shadow"
          >
            <h2 className="mb-3 font-semibold">Επεξεργασία προϊόντος</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <input name="editSku" defaultValue={editProduct.sku} placeholder="SKU" className="rounded border px-2 py-1" />
              <input name="editName" defaultValue={editProduct.name} required placeholder="Όνομα" className="rounded border px-2 py-1" />
              <input name="editCategory" defaultValue={editProduct.category ?? ''} placeholder="Κατηγορία" className="rounded border px-2 py-1" />
              <input name="editMinStock" type="number" min={0} defaultValue={editProduct.minStock} placeholder="Ελάχ. απόθεμα" className="w-24 rounded border px-2 py-1" />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Αποθήκευση</button>
              <button type="button" onClick={() => setEditProduct(null)} className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500">Ακύρωση</button>
            </div>
          </form>
        )}

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 rounded border border-gray-300 bg-white p-4 shadow"
          >
            <h2 className="mb-3 font-semibold">Νέο προϊόν</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                required
                placeholder="SKU"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                className="rounded border px-2 py-1"
              />
              <input
                required
                placeholder="Όνομα"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="rounded border px-2 py-1"
              />
              <input
                placeholder="Κατηγορία"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="rounded border px-2 py-1"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Ποσότητα"
                  value={newStock || ''}
                  onChange={(e) => setNewStock(Number(e.target.value) || 0)}
                  className="w-24 rounded border px-2 py-1"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Ελάχ. απόθεμα"
                  value={newMinStock || ''}
                  onChange={(e) => setNewMinStock(Number(e.target.value) || 0)}
                  className="w-24 rounded border px-2 py-1"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-3 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Αποθήκευση
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-600">Φόρτωση...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">
            Δεν βρέθηκαν προϊόντα. Προσθέστε ένα ή αλλάξτε το φίλτρο.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((p) => (
              <li
                key={p.id}
                className={`rounded border bg-white p-4 shadow-sm ${
                  p.stock <= p.minStock ? 'border-amber-400 bg-amber-50' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <button
                        type="button"
                        onClick={() => setEditProduct(p)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Επεξεργασία
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShowMovements(p.id)}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Ιστορικό
                      </button>
                    </div>
                    {p.sku && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({p.sku})
                      </span>
                    )}
                    {p.category && (
                      <span className="ml-2 text-sm text-gray-500">
                        {p.category}
                      </span>
                    )}
                    <div className="mt-1">
                      Απόθεμα: <strong>{p.stock}</strong>
                      {p.minStock > 0 && (
                        <span className="text-gray-500">
                          {' '}
                          (ελάχ. {p.minStock})
                        </span>
                      )}
                      {p.stock <= p.minStock && p.minStock > 0 && (
                        <span className="ml-2 text-amber-700">
                          — Χαμηλό απόθεμα
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, -10)}
                      className="rounded bg-red-200 px-2 py-1 text-sm hover:bg-red-300"
                    >
                      −10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, -5)}
                      className="rounded bg-red-100 px-2 py-1 text-sm hover:bg-red-200"
                    >
                      −5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, -1)}
                      className="rounded bg-red-50 px-2 py-1 text-sm hover:bg-red-100"
                    >
                      −1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, 1)}
                      className="rounded bg-green-50 px-2 py-1 text-sm hover:bg-green-100"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, 5)}
                      className="rounded bg-green-100 px-2 py-1 text-sm hover:bg-green-200"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(p.id, 10)}
                      className="rounded bg-green-200 px-2 py-1 text-sm hover:bg-green-300"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
