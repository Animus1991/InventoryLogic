const API = '/api';

const TOKEN_KEY = 'inventory_token';

/** Μετάφραση συνηθισμένων HTTP status/error στα ελληνικά. */
function translateStatus(status: number): string {
  const map: Record<number, string> = {
    400: 'Λάθος αίτημα. Ελέγξτε τα δεδομένα.',
    401: 'Μη εξουσιοδοτημένη πρόσβαση. Συνδεθείτε ξανά.',
    403: 'Απαγορεύεται η πρόσβαση.',
    404: 'Δεν βρέθηκε ο πόρος.',
    409: 'Η ενέργεια έρχεται σε conflict με την τρέχουσα κατάσταση.',
    500: 'Σφάλμα διακομιστή. Δοκιμάστε ξανά αργότερα.',
  };
  return map[status] || '';
}

function translateError(error: string): string {
  const map: Record<string, string> = {
    'Bad Request': 'Λάθος αίτημα',
    'Unauthorized': 'Μη εξουσιοδοτημένη πρόσβαση',
    'Forbidden': 'Απαγορεύεται η πρόσβαση',
    'Not Found': 'Δεν βρέθηκε',
    'Method Not Allowed': 'Μη επιτρεπτή μέθοδος',
    'Conflict': 'Διένεξη δεδομένων',
    'Internal Server Error': 'Σφάλμα διακομιστή',
  };
  return map[error] || error;
}

/** Εξάγει σαφές μήνυμα σφάλματος από απάντηση API (JSON message ή errors array ή κείμενο). */
export async function parseApiError(r: Response, requestUrl?: string): Promise<string> {
  const text = await r.text();
  const url = requestUrl || (typeof r.url === 'string' ? r.url : '');
  if (r.status === 404 && /\/api\/auth\//.test(url || '')) {
    return 'Το backend δεν φαίνεται να υποστηρίζει σύνδεση (404). Σταματήστε το backend και ξεκινήστε ξανά με: cd backend και μετά .\\mvnw.cmd spring-boot:run';
  }
  if (!text) return translateStatus(r.status) || `Σφάλμα ${r.status}`;
  try {
    const data = JSON.parse(text) as { message?: string; error?: string; path?: string; errors?: Array<{ defaultMessage?: string; field?: string }> };
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.error && r.status === 404 && data.path && /\/api\/auth\//.test(String(data.path))) {
      return 'Το backend δεν φαίνεται να υποστηρίζει σύνδεση (404). Σταματήστε το backend και ξεκινήστε ξανά με: cd backend και μετά .\\mvnw.cmd spring-boot:run';
    }
    if (data.error && typeof data.error === 'string') return translateError(data.error) + (data.path ? ` (${data.path})` : '');
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e) => e.defaultMessage || e.field || '').filter(Boolean).join('. ') || text;
    }
  } catch {
    /* not JSON */
  }
  return text.length > 200 ? text.slice(0, 200) + '…' : text;
}

/** Δημιουργεί Error με μήνυμα από το API ή από δικτυακό σφάλμα. */
export async function apiError(r: Response): Promise<never> {
  const message = await parseApiError(r);
  throw new Error(message);
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

/** Event dispatched on 401 so the app can navigate to login without full page reload. */
export const AUTH_REQUIRED_EVENT = 'inventory:auth-required';

async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) };
  let r: Response;
  try {
    r = await fetch(input, { ...init, headers });
  } catch {
    throw new Error('Δεν υπάρχει σύνδεση με τον server. Ελέγξτε το δίκτυο και ότι το backend τρέχει στο http://localhost:8081');
  }
  if (r.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT));
    throw new Error('Η σύνδεση έληξε. Συνδεθείτε ξανά.');
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

export async function login(emailOrUsername: string, password: string): Promise<{ token: string; username: string; email: string }> {
  const loginUrl = `${API}/auth/login`;
  let r: Response;
  try {
    r = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: emailOrUsername.trim(), password }),
    });
  } catch {
    throw new Error('Δεν υπάρχει σύνδεση με τον server. Ελέγξτε ότι το backend τρέχει στο http://localhost:8081');
  }
  if (!r.ok) throw new Error(await parseApiError(r, `${API}/auth/login`));
  return r.json();
}

export async function register(email: string, username: string, password: string): Promise<{ token: string; username: string; email: string }> {
  let r: Response;
  try {
    r = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), username: username.trim(), password }),
    });
  } catch {
    throw new Error('Δεν υπάρχει σύνδεση με τον server. Ελέγξτε ότι το backend τρέχει στο http://localhost:8081');
  }
  if (!r.ok) throw new Error(await parseApiError(r, `${API}/auth/register`));
  return r.json();
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  barcode: string | null;
  qrCode: string | null;
  unit: string | null;
  description: string | null;
  manufacturerTerm: string | null;
  localSlang: string | null;
  price: number | null;
  location: string | null;
  dimensions: string | null;
  colorRal: string | null;
  packagingInfo: string | null;
  supplier: string | null;
  internalNotes: string | null;
  stock: number;
  minStock: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  size: number;
}

export async function listProducts(params?: { lowStockOnly?: boolean; q?: string; page?: number; size?: number }): Promise<ProductPage> {
  const sp = new URLSearchParams();
  if (params?.lowStockOnly) sp.set('lowStockOnly', 'true');
  if (params?.q) sp.set('q', params.q);
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.size != null) sp.set('size', String(params.size));
  const url = `${API}/products${sp.toString() ? '?' + sp : ''}`;
  const r = await apiFetch(url);
  if (!r.ok) await apiError(r);
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
  qrCode?: string;
  unit?: string;
  description?: string;
  manufacturerTerm?: string;
  localSlang?: string;
  price?: number | null;
  location?: string;
  dimensions?: string;
  colorRal?: string;
  packagingInfo?: string;
  supplier?: string;
  internalNotes?: string;
  stock: number;
  minStock: number;
}): Promise<Product> {
  const r = await apiFetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) await apiError(r);
  return r.json();
}

export async function updateProduct(
  id: number,
  data: { sku?: string; name?: string; category?: string; barcode?: string; qrCode?: string; unit?: string; description?: string; manufacturerTerm?: string; localSlang?: string; price?: number | null; location?: string; dimensions?: string; colorRal?: string; packagingInfo?: string; supplier?: string; internalNotes?: string; minStock?: number }
): Promise<Product> {
  const r = await apiFetch(`${API}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) await apiError(r);
  return r.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const r = await apiFetch(`${API}/products/${id}`, { method: 'DELETE' });
  if (!r.ok) await apiError(r);
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
  if (!r.ok) await apiError(r);
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
  if (!r.ok) await apiError(r);
  return r.json();
}

export async function getMovements(productId: number): Promise<StockMovement[]> {
  const r = await apiFetch(`${API}/products/${productId}/movements`);
  if (!r.ok) await apiError(r);
  return r.json();
}


export async function seedSampleProducts(): Promise<number> {
  const r = await apiFetch(`${API}/products/seed`, { method: 'POST' });
  if (!r.ok) await apiError(r);
  return r.json();
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

export async function importProductsCsv(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append('file', file);
  const token = localStorage.getItem('inventory_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}/products/import`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (r.status === 401) {
    localStorage.removeItem('inventory_token');
    window.dispatchEvent(new CustomEvent('inventory:auth-required'));
    throw new Error('Η σύνδεση έληξε. Συνδεθείτε ξανά.');
  }
  if (!r.ok) throw new Error(await parseApiError(r));
  return r.json();
}

// --- Dashboard & Reports ---

export interface DashboardStats {
  productCount: number;
  lowStockCount: number;
  totalValue: number;
  recentMovementsCount: number;
}

export interface ValuationItem {
  productId: number;
  sku: string;
  name: string;
  stock: number;
  unit: string;
  unitPrice: number;
  value: number;
}

export interface ValuationReport {
  items: ValuationItem[];
  totalValue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const r = await apiFetch(`${API}/dashboard/stats`);
  if (!r.ok) await apiError(r);
  const data = await r.json();
  return {
    productCount: data.productCount ?? 0,
    lowStockCount: data.lowStockCount ?? 0,
    totalValue: data.totalValue != null ? Number(data.totalValue) : 0,
    recentMovementsCount: data.recentMovementsCount ?? 0,
  };
}

export async function getValuationReport(): Promise<ValuationReport> {
  const r = await apiFetch(`${API}/reports/valuation`);
  if (!r.ok) await apiError(r);
  const data = await r.json();
  const items = (data.items ?? []).map((i: ValuationItem) => ({
    ...i,
    unitPrice: Number(i.unitPrice ?? 0),
    value: Number(i.value ?? 0),
  }));
  return {
    items,
    totalValue: data.totalValue != null ? Number(data.totalValue) : 0,
  };
}
