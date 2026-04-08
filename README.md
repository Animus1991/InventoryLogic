# InventoryLogic — Warehouse / Inventory Management

A warehouse management system (aluminium, steel, or any type of goods) built with **Java Spring Boot** (REST API), **React** (Vite), **Tailwind CSS**, and **MySQL**. Designed **mobile-first**: employees can scan barcodes on the shelves, quickly record stock changes in a few taps, and install the app as a PWA.

**To run and view in the browser:** see **[ΤΡΕΞΙΜΟ.md](ΤΡΕΞΙΜΟ.md)**.

> 🇬🇷 Ελληνική έκδοση: **[README_EL.md](README_EL.md)**

---

## What the application does

### Dashboard
- **KPIs:** total products, low-stock products, total inventory value (€), stock movements over the last 7 days.
- A quick "What to order" block with a link to the order list.

### Product management
- **Product list** with SKU, name, category, barcode, unit, current quantity, and minimum threshold.
- **Extended fields:** price, warehouse location, dimensions, RAL color, packaging info; **QR code** (optional content for labels); **supplier**; **internal notes** (internalNotes — not visible to customers).
- **New product** and **edit** (PATCH) with all fields.
- **Delete** with confirmation.

### Stock & movements
- **Quick quantity change:** buttons +1, +5, +10 and −1, −5, −10 (touch-friendly).
- **Adjustment with note/reference** (invoice/order number).
- **Movement history** and **Audit log** per product.

### Barcode / QR (key feature for mobile)
- **Camera barcode scanner:** real scanning via the device camera (html5-qrcode library). **Dashboard:** a "Scan barcode" block with an "Open scanner" button — as soon as the app opens, the user can scan and go directly to the product page. **Products page:** "Open scanner" button next to the text input field.
- **Manual barcode entry** as an alternative (when no camera is available or permission is denied).
- After scanning/searching: product is displayed with quick stock adjustment options (few taps).

### Search & filters
- Search by name, SKU, barcode, or category with accent tolerance (EL/EN).
- "Low stock only" filter and category filter (chips).

### Reports
- **Inventory valuation report:** value per product (quantity × price), total value in the **selected currency**.
- **What to order:** list of products with stock ≤ minStock and suggested reorder quantity.

### Currency (country / local currency)
- **Currency selector** in the header: EUR, USD, GBP, CHF, ALL (Albanian lek), RON, BGN, TRY, PLN, CNY. The selection is stored locally (localStorage) and prices are displayed everywhere in the selected currency.

### Bulk product import
- **CSV or Excel:** the "Bulk Import" page — upload a **CSV** (.csv, .txt) or **Excel** (.xlsx, .xls) file with headers: `sku`, `name`, `category`, `barcode`, `qrCode`, `unit`, `description`, `manufacturerTerm`, `localSlang`, `price`, `location`, `dimensions`, `colorRal`, `packagingInfo`, `supplier`, `internalNotes`, `stock`, `minStock`. **SKU** = product code (Stock Keeping Unit). If SKU exists → update fields; otherwise create. Response: `created`, `updated`, `errors[]`.
- **Import from photo (OCR):** upload an image containing text (handwritten or printed); recognized using **Tesseract.js** (client-side); process the text; "Search product from text" button to match existing products (link to product page); or "Import as CSV" for bulk import.

### Barcode and QR printing
- "Print barcode" page: product list with checkboxes; "Select all" / "Deselect all"; **Print (N)** (browser print); **Download PDF** (download PDF with barcode + QR labels); **Send by email** (download PDF + open mailto so the user can attach the file). Each label displays a barcode (CODE128) and QR (from the `qrCode` field or product URL). Useful for new products or replacing damaged labels.

### Export
- **Export CSV** and **Export PDF** of the product list (with active filters).

### Navigation, language & locale
- **Menu:** Dashboard, Products, Reports, What to Order, Print Barcode, Bulk Import, About.
- **Multilingual (i18n):** full translation in **7 languages** — **Ελληνικά**, **English**, **Shqip**, **Français**, **Deutsch**, **Italiano**, **Español**. All UI text (menus, buttons, forms, messages, About page, Products, Import, Reports, Order, Login) uses the same i18n system; switch language from the Language switcher in the header.
- **Currency and dates:** dates/numbers in local format; currency according to user selection.

### Technology & UX
- **PWA:** install as an app (vite-plugin-pwa), standalone mode, custom theme/background.
- **Responsive:** fully responsive (Tailwind, mobile-first); works on mobile, tablet, and desktop.
- **Mobile installation:** The **Dashboard** displays a **QR code** with the app's URL. Scan it with your phone → app opens in the browser → **"Add to Home Screen"** (1–2 taps). In **production** (real domain) the same QR can be shared so anyone can install the app without the Play Store. **No need** to rewrite in Java/Kotlin; the app runs as a PWA (React).
- **Local network (development):** The app always runs on **port 5174** (`http://localhost:5174`) so that **5173** remains free for another app. On mobile, "localhost" doesn't work; the app **automatically** detects the LAN IP (WebRTC) and displays a **QR with** `http://PC-IP:5174`. Vite is configured with `host: true` and `strictPort: true`. If you see **ERR_CONNECTION_TIMED_OUT**, open **port 5174** in your firewall (Inbound Rule, TCP).
- **Security note:** The addresses `http://10.0.2.2:5174` (Android emulator) and `http://<PC-IP>:5174` (physical mobile) are **normal local network addresses** — not a virus. **Android Studio emulator:** open `http://10.0.2.2:5174` in the emulator.
- **Tour / Help:** The **"?"** button in the header opens usage instructions for the current page. Full instructions and feature list on the **About** page.
- **JWT login/register:** Login (email or username), Register. Demo: **admin@inventory.local** / **admin12** (configurable in `application.properties` or env).

### When the app works — access from mobile and from others (friends, family)

- **Backend is required:** The app has a frontend (React) and a backend (Spring Boot + MySQL). All data (login, products, movements) goes through the API. **If the backend is not running, the app does not work** — not on your phone, not for anyone else. You cannot shut down the backend and expect the app to keep working somewhere.

- **If you run everything locally (on your own PC):**
  - **Your own phone:** Works only if the phone is on the **same WiFi** as the PC and both are running (backend on 8081, frontend on **5174**). The dev server is locked to port **5174** so that **5173** stays free for another app. Scan the QR → opens `http://PC-IP:5174` → API calls go to the same PC.
  - **Friend/family from a different WiFi or mobile data:** **Not possible.** `192.168.1.x` is a private address; it is not accessible from the internet. A friend cannot "connect to" your computer from another network.

- **How to let friends/family use the app from anywhere:**
  - **Correct solution (production):** Deploy **frontend + backend + database** to a **server on the internet** (VPS, cloud: e.g. Railway, Render, Fly.io, AWS, DigitalOcean, etc.). The app then has a **public URL** (e.g. `https://inventory.example.com`). You can share the link or QR **only with people you choose**; the backend runs 24/7 on the server and the PWA can be installed without running anything on your PC.
  - **Free deploy:** There are **free plans** (with limitations) on platforms such as **Railway**, **Render**, **Fly.io**; you can deploy backend + frontend and use a free database (e.g. Railway PostgreSQL, or managed MySQL offered by the platform). These are safe deployment options as long as you configure HTTPS, a strong JWT secret, and CORS only for your domain.
  - **Access only with your approval:** The app **already** requires **login**; without an account, no one can see products or data. Even if someone gets the link, they will only see the login page. You control **who has an account** (registration or creation by you). For even stricter control, you can later add "closed registration" (invite-only or admin approval).
  - **Alternative (testing only):** Temporarily expose your PC to the internet (e.g. with **ngrok** or port forwarding on your router). Downsides: PC must be on at all times, security risks, unstable IP.

- **Internet security:** For production (deployed to a server), the app has a **solid foundation**: JWT auth, passwords hashed (BCrypt), CORS restricted to allowed origins. For **best** security: (1) Use **HTTPS** everywhere. (2) Strong **jwt.secret** (env variable, not in the repo). (3) **app.cors.allowed-origins** set only to your production domain. (4) Optionally add rate limiting and keep dependencies updated.

**Summary:** For personal use at home, backend + frontend on your PC with your phone on the same WiFi is enough. For access by friends/family from anywhere, **deploying to a server** is required; access is already controlled by login (only users with accounts can see data).

---

## Requirements

- **JDK 21**
- **Maven** (or `mvnw` included in the project)
- **Node.js** (LTS, for frontend)
- **MySQL Server** (e.g. 8.x)

---

## Database (MySQL)

1. Create the database:

```sql
CREATE DATABASE IF NOT EXISTS inventory_app
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
```

2. Configure **backend/src/main/resources/application.properties**:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

All parameters (URL, port, JWT, CORS, demo admin) are described in **[REST_API_KAI_BASI.md](REST_API_KAI_BASI.md)**.

---

## Build & run

### Backend (Java)

From the **backend** folder:

```bash
cd backend
./mvnw clean package
```

**Windows (PowerShell):** `cd backend` then `.\mvnw.cmd spring-boot:run`

- The API runs at **http://localhost:8081** (`server.port=8081` in `application.properties`).
- **Swagger UI:** http://localhost:8081/swagger-ui.html
- **Important:** If the Vite terminal shows `ECONNREFUSED` for `/api/products` or `/api/dashboard/stats`, the **backend is not running**. Start the backend first (above), then the frontend.

### Frontend (React + Vite + Tailwind)

From the project root:

```bash
npm run install:frontend   # first time only
npm run dev
```

The app opens at **http://localhost:5174**. The browser communicates with the backend via proxy (`/api` → `localhost:8081`). Port 5173 remains free for another app.

- **Production build:** `npm run build` (from root or `frontend/`). Output: **frontend/dist/**.

---

## REST API — main endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List. Query: `lowStockOnly`, `q`, `page`, `size` |
| GET | `/api/products/{id}` | Single product |
| GET | `/api/products/by-barcode?code=...` | Search by barcode |
| GET | `/api/products/{id}/movements` | Movement history |
| GET | `/api/products/{id}/audit` | Audit log |
| POST | `/api/products` | Create |
| PATCH | `/api/products/{id}` | Update |
| DELETE | `/api/products/{id}` | Delete |
| POST | `/api/products/{id}/adjust` | Stock adjustment (`delta`, `note`, `reference`) |
| POST | `/api/products/import` | Bulk import (multipart `file`: CSV or Excel .xlsx/.xls) → `{ created, updated, errors[] }` |
| POST | `/api/products/seed` | Seed sample data |
| **GET** | **`/api/dashboard/stats`** | **Dashboard statistics** |
| **GET** | **`/api/reports/valuation`** | **Inventory valuation report** |
| POST | `/api/auth/login` | Login → `{ token, username, email }` |
| POST | `/api/auth/register` | Register → 201 `{ token, username, email }` |

Details and connection/database parameters: **[REST_API_KAI_BASI.md](REST_API_KAI_BASI.md)**.

---

## Configuration (parameters)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `server.port` | 8081 | Backend port |
| `spring.datasource.url` | jdbc:mysql://localhost:3306/inventory_app?... | MySQL URL |
| `app.cors.allowed-origins` | http://localhost:5174, http://192.168.1.2:5174, ... | CORS (add your production domain) |
| `jwt.secret` | (length ≥32) | Change in production |
| `admin.user` / `admin.password` | admin@inventory.local / admin12 | Demo admin (env: ADMIN_USER, ADMIN_PASSWORD) |

---

## Deploy (production)

1. **Database:** Create `inventory_app` and configure `application.properties` (URL, username, password).
2. **Backend:** `cd backend`, `.\mvnw.cmd clean package`, `java -jar target/InventoryLogic-0.0.1-SNAPSHOT.jar`. Change `jwt.secret` and demo admin credentials.
3. **Frontend:** `npm run build`. Serve **frontend/dist/** with nginx/Apache. Set `app.cors.allowed-origins` to the frontend domain.
4. **Mobile:** Users can install the app as a PWA from the frontend URL.

---

## Project structure

- **backend/** — Spring Boot (Maven)
  - `domain/`: Product, StockMovement, AuditLog, User
  - `dto/`: CreateProductRequest, DashboardStats, ValuationReport, ...
  - `repo/`, `service/`, `web/`: ProductController, DashboardController, ReportController, AuthController
- **frontend/** — React + Vite + Tailwind, PWA
  - Pages: Dashboard, Products, Reports, What to Order, About, Product Detail, Login/Register
- **docs/** — Upgrade plan (e.g. docs/ΠΛΑΝΟ_ΑΝΑΒΑΘΜΙΣΗΣ.md)
- **package.json** (root) — scripts: `build`, `dev`, `install:frontend`

---

## GitHub

Repository and instructions for creating/connecting and pushing: **[GITHUB.md](GITHUB.md)**.
