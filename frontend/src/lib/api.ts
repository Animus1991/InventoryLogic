const API = '/api';

const TOKEN_KEY = 'inventory_token';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) };
  const r = await fetch(input, { ...init, headers });
  if (r.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return r;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(username: string, password: string): Promise<{ token: string; username: string }> {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({} as { message?: string }));
    throw new Error((data as { message?: string }).message || 'Λάθος username ή password');
  }
  return r.json();
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  barcode: string | null;
  unit: string | null;
  description: string | null;
  price: number | null;
  location: string | null;
  dimensions: string | null;
  colorRal: string | null;
  packagingInfo: string | null;
  stock: number;
  minStock: number;
}

export async function listProducts(params?: { lowStockOnly?: boolean; q?: string; page?: number; size?: number }): Promise<Product[]> {
  const sp = new URLSearchParams();
  if (params?.lowStockOnly) sp.set('lowStockOnly', 'true');
  if (params?.q) sp.set('q', params.q);
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.size != null) sp.set('size', String(params.size));
  const url = `${API}/products${sp.toString() ? '?' + sp : ''}`;
  const r = await apiFetch(url);
  if (!r.ok) throw new Error('Αποτυχία φόρτωσης προϊόντων');
  return r.json();
}

export async function getProduct(id: number): Promise<Product | null> {
  const r = await apiFetch(`${API}/products/${id}`);
  if (r.status === 404 || !r.ok) return null;
  return r.json();
}

export async function getByBarcode(code: string): Promise<Product | null> {
  const r = await apiFetch(`${API}/products/by-barcode?code=${encodeURIComponent(code)}`);
  if (r.status === 404 || !r.ok) return null;
  return r.json();
}

export async function createProduct(data: {
  sku: string;
  name: string;
  category?: string;
  barcode?: string;
  unit?: string;
  description?: string;
  price?: number | null;
  location?: string;
  dimensions?: string;
  colorRal?: string;
  packagingInfo?: string;
  stock: number;
  minStock: number;
}): Promise<Product> {
  const r = await apiFetch(`${API}/products`, {
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
  data: { sku?: string; name?: string; category?: string; barcode?: string; unit?: string; description?: string; price?: number | null; location?: string; dimensions?: string; colorRal?: string; packagingInfo?: string; minStock?: number }
): Promise<Product> {
  const r = await apiFetch(`${API}/products/${id}`, {
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

export async function deleteProduct(id: number): Promise<void> {
  const r = await apiFetch(`${API}/products/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Αποτυχία διαγραφής');
}

export async function adjustStock(
  id: number,
  delta: number,
  note?: string,
  reference?: string
): Promise<Product> {
  const r = await apiFetch(`${API}/products/${id}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta, note, reference }),
  });
  if (!r.ok) throw new Error('Αποτυχία ενημέρωσης ποσότητας');
  return r.json();
}

export interface StockMovement {
  id: number;
  delta: number;
  note: string | null;
  reference: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  productId: number;
  action: string;
  details: string | null;
  createdAt: string;
}

export async function getAuditLog(productId: number): Promise<AuditLog[]> {
  const r = await apiFetch(`${API}/products/${productId}/audit`);
  if (!r.ok) throw new Error('Αποτυχία φόρτωσης audit');
  return r.json();
}

export async function getMovements(productId: number): Promise<StockMovement[]> {
  const r = await apiFetch(`${API}/products/${productId}/movements`);
  if (!r.ok) throw new Error('Αποτυχία φόρτωσης ιστορικού');
  return r.json();
}

export async function seedSampleProducts(): Promise<number> {
  const r = await apiFetch(`${API}/products/seed`, { method: 'POST' });
  if (!r.ok) throw new Error('Αποτυχία φόρτωσης δείγματος');
  return r.json();
}
