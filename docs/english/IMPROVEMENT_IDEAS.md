# Ideas for Enrichment and Full Improvement of the Project

The project is an aluminum/steel warehouse (doors, windows, gates, fittings). The ideas below are grouped by topic so you can choose what best fits the available time and project requirements.

---

## 1. Warehouse & Accounting Operations

| Idea | Description | Difficulty |
|------|-------------|------------|
| **Units of measurement** | Support for multiple units per product (pieces, m², kg, pairs) with conversions where needed (e.g. 1 frame = 2.4 m²). | Medium |
| **Price entry** | Purchase/sale price field per product; stock value calculation (stock × price). | Easy |
| **Physical locations** | Zone/shelf/bin (e.g. "A-12-3") so you know where a product is stored. | Easy |
| **Lots / batches** | Record incoming stock per date/invoice (lot) for history and possible expiry tracking. | Hard |
| **Label printing** | Print a label with barcode/SKU/name to attach to shelves or products. | Medium |
| **"Product card" report** | One page/PDF per product: all details + movement history + current stock (suitable for audit/accounting). | Easy |

---

## 2. Search, Scanning & UX

| Idea | Description | Difficulty |
|------|-------------|------------|
| **Barcode/QR scanning with camera** | ~~Use a library (e.g. html5-qrcode)~~ **IMPLEMENTED:** html5-qrcode, scanner on the Dashboard and on the Products page; after scan → find product → navigate to product card and quick quantity adjustment. | ✅ |
| **Voice search** | "Say the product name" using the Web Speech API and search with the result. | Medium |
| **Autocomplete suggestions while typing** | Autocomplete on the search field (backend typeahead endpoint or frontend filter with debounce). | Easy |
| **Multiple category filters** | Dropdown or chips for category (aluminum / steel / glass etc.) combined with the current search. | Easy |
| **Search history** | The last 5–10 searches displayed below the search box. | Easy |

---

## 3. Notifications & Reports

| Idea | Description | Difficulty |
|------|-------------|------------|
| **Low stock alert** | Badge or message at the top of the page when products fall below the minimum; optionally use the browser Notification API. | Easy |
| **"What to order" report** | List of products with stock < minStock and suggested reorder quantity (e.g. minStock − stock). | Easy |
| **Charts** | Simple charts (e.g. Chart.js): movements per day, top products by movements, category distribution. | Medium |
| **PDF export** | Print the product list or a product card as a PDF (jsPDF library or server-side). | Medium |

---

## 4. Multi-User & Security

| Idea | Description | Difficulty |
|------|-------------|------------|
| **Login / Authentication** | Sign in with username/password; JWT or session; protect endpoints on the backend. | Medium |
| **Roles** | Separate permissions (e.g. admin: everything, user: view and adjust stock only, no deletion). | Hard |
| **Audit log** | Record "who did what and when" (i.e. who changed stock or deleted a product). | Medium |

---

## 5. Specific to Aluminum & Steel

| Idea | Description | Difficulty |
|------|-------------|------------|
| **Profiles / dimensions** | For aluminum profiles: length (bar length), cross-section (e.g. mm²); for sheet metal: width × height. | Easy |
| **Color / RAL** | Color field (e.g. RAL 9010) for polyesters and painted fittings. | Easy |
| **Packaging** | E.g. "box × 50 pieces" so that the display shows both boxes and individual pieces. | Medium |
| **Related products** | "Frequently bought together" or "Replaces X" for better sales/assembly suggestions. | Medium |

---

## 6. Technical Improvements

| Idea | Description | Difficulty |
|------|-------------|------------|
| **Global search on the backend** | Endpoint `GET /api/products/search?q=...` with LIKE or full-text search in MySQL so that search is available to other clients. | Easy |
| **Pagination** | Pages of 20–50 products instead of loading all at once (better performance for large lists). | Easy |
| **Offline-first (PWA)** | Application works without a connection using cache (Workbox); synchronizes when the network is restored. | Hard |
| **Tests** | Unit tests (JUnit) in the backend for ProductService; integration tests for REST. | Medium |
| **API versioning** | Prefix `/api/v1/` so that future changes do not break existing clients. | Easy |

---

## 7. Legislation & Accounting Records

| Idea | Description | Difficulty |
|------|-------------|------------|
| **Date of last movement** | Each product "knows" when the last stock-in/stock-out occurred (from the movement history). | Easy |
| **Movement notes** | Mandatory or enhanced note per movement (e.g. "receipt", "sale", "inventory count") for accounting traceability. | Already partially implemented (note on adjust) |
| **Order / invoice number** | Optional field on a movement (reference) for linking to invoices. | Medium |

---

## Priority for Academic Project

- **Quick wins:** Low stock alert, "What to order" report, PDF export, camera scanning, profiles/dimensions or RAL color.
- **Mid-phase:** Login/JWT, backend search endpoint, pagination, product card (printable).
- **If time allows:** Roles, audit log, charts, offline-first PWA.

You can select 2–4 of the above ideas depending on how much you want to extend the project and implement them incrementally.
