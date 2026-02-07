// Κλήσεις στο REST API (backend τρέχει στο 8080, proxy από Vite)
const API = '/api';

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  stock: number;
  minStock: number;
}

export async function listProducts(): Promise<Product[]> {
  const r = await fetch(`${API}/products`);
  if (!r.ok) throw new Error('Αποτυχία φόρτωσης προϊόντων');
  return r.json();
}

export async function createProduct(data: {
  sku: string;
  name: string;
  category?: string;
  stock: number;
  minStock: number;
}): Promise<Product> {
  const r = await fetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(msg || 'Αποτυχία δημιουργίας');
  }
  return r.json();
}

export async function updateProduct(
  id: number,
  data: { sku?: string; name?: string; category?: string; minStock?: number }
): Promise<Product> {
  const r = await fetch(`${API}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(msg || 'Αποτυχία ενημέρωσης');
  }
  return r.json();
}

export async function adjustStock(
  id: number,
  delta: number,
  note?: string
): Promise<Product> {
  const r = await fetch(`${API}/products/${id}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta, note }),
  });
  if (!r.ok) throw new Error('Αποτυχία ενημέρωσης ποσότητας');
  return r.json();
}

export interface StockMovement {
  id: number;
  delta: number;
  note: string | null;
  createdAt: string;
}

export async function getMovements(productId: number): Promise<StockMovement[]> {
  const r = await fetch(`${API}/products/${productId}/movements`);
  if (!r.ok) throw new Error('Αποτυχία φόρτωσης ιστορικού');
  return r.json();
}
