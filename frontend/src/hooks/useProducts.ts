import { useCallback, useEffect, useState } from 'react'
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getMovements,
  getAuditLog,
  seedSampleProducts,
  type Product,
} from '../lib/api'

export function useProducts(lowStockOnly: boolean) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    listProducts({ lowStockOnly })
      .then((res) => {
        const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []
        setProducts(list)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setLoading(false))
  }, [lowStockOnly])

  useEffect(() => {
    load()
  }, [load])

  const handleAdjust = useCallback((id: number, delta: number) => {
    adjustStock(id, delta)
      .then((updated) => {
        setProducts((prev) => (prev ?? []).map((p) => (p.id === updated.id ? updated : p)))
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
  }, [])

  const handleCreate = useCallback((payload: Parameters<typeof createProduct>[0]) => {
    setSubmitting(true)
    return createProduct(payload)
      .then((p) => {
        setProducts((prev) => [...(prev ?? []), p])
        setError(null)
        return p
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Σφάλμα')
        throw e
      })
      .finally(() => setSubmitting(false))
  }, [])

  const handleUpdate = useCallback((id: number, payload: Parameters<typeof updateProduct>[1]) => {
    setSubmitting(true)
    return updateProduct(id, payload)
      .then((updated) => {
        setProducts((prev) => (prev ?? []).map((p) => (p.id === updated.id ? updated : p)))
        setError(null)
        return updated
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Σφάλμα')
        throw e
      })
      .finally(() => setSubmitting(false))
  }, [])

  const handleDelete = useCallback((id: number) => {
    setSubmitting(true)
    return deleteProduct(id)
      .then(() => {
        setProducts((prev) => (prev ?? []).filter((p) => p.id !== id))
        setError(null)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Σφάλμα')
        throw e
      })
      .finally(() => setSubmitting(false))
  }, [])

  const handleAdjustWithForm = useCallback(
    (productId: number, delta: number, note?: string, reference?: string) => {
      setSubmitting(true)
      return adjustStock(productId, delta, note, reference)
        .then((updated) => {
          setProducts((prev) => (prev ?? []).map((p) => (p.id === updated.id ? updated : p)))
          setError(null)
          return updated
        })
        .catch((e) => {
          setError(e instanceof Error ? e.message : 'Σφάλμα')
          throw e
        })
        .finally(() => setSubmitting(false))
    },
    []
  )

  const handleSeed = useCallback(() => {
    setSubmitting(true)
    seedSampleProducts()
      .then((added) => {
        if (added > 0) load()
        setError(null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Σφάλμα'))
      .finally(() => setSubmitting(false))
  }, [load])

  return {
    products,
    setProducts,
    loading,
    error,
    setError,
    submitting,
    setSubmitting,
    load,
    handleAdjust,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAdjustWithForm,
    handleSeed,
    getMovements,
    getAuditLog,
  }
}

export type UseProductsReturn = ReturnType<typeof useProducts>
