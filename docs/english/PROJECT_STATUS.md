# Project Status — What Is Complete and What Remains

## Recently Added (aluminum/steel warehouse)

- **Backend:** Fields `barcode`, `unit` (e.g. pieces, m²), `description`. Endpoints `GET /api/products?lowStockOnly=true`, `GET /api/products/by-barcode?code=`, `DELETE /api/products/{id}`, `POST /api/products/seed` (sample product list).
- **Frontend:** Loading/submitting states (disabled buttons), confirmation before deletion, CSV export, "Low stock only" filter, search with normalization (GR/EN), **barcode scanner with camera** (html5-qrcode) on the Dashboard and on the Products page, barcode search (via keyboard), "Sample list" button, PWA (installable on mobile), Dashboard, valuation reports, el-GR locale.
- **Sample product list:** Polyesters, frames, steel bars, glass panels, gate sheet metal, adapters, locks, hinges, anti-theft fittings, upholstery items (with barcodes and units).

## Previously Implemented

**Backend (Java Spring Boot)**
- Folder structure `backend/` with Maven (pom.xml, mvnw).
- Domain: entities `Product`, `StockMovement`.
- DTOs: `CreateProductRequest`, `UpdateProductRequest`, `AdjustStockRequest`.
- Repositories: `ProductRepo`, `StockMovementRepo` (JPA).
- Service: `ProductService` (list, create, update, adjustStock, getMovements).
- REST API: GET/POST/PATCH `/api/products`, POST `/api/products/{id}/adjust`, GET `/api/products/{id}/movements`.
- MySQL connection (`inventory_app`), configured in `application.properties`.
- REST API documentation with Swagger (springdoc), `/swagger-ui.html`.
- CORS configured for frontend (localhost:5173).

**Frontend (React + Vite + Tailwind)**
- Folder structure `frontend/` with npm, Vite, Tailwind.
- Product list with search (by name / SKU).
- New product form (SKU, name, category, quantity, minimum stock).
- Edit product (PATCH) via form.
- Quick quantity adjustment buttons: −10 / −5 / −1 and +1 / +5 / +10.
- Movement history per product (GET movements).
- Low stock indicator (badge / color).
- Vite proxy to backend (`/api` → localhost:8080).
- UI/UX improvements: header, cards, buttons, input fields, colors, spacing, form labels.

**Project Root & Tooling**
- Root `package.json` with scripts: `build`, `dev`, `install:frontend`.
- README with build & deploy instructions.
- ΤΡΕΞΙΜΟ.md with steps for running (backend + frontend) and a note about `.\mvnw.cmd` on PowerShell.
- GITHUB.md with instructions for creating a repository and pushing.
- DELIVERABLE.txt for the GitHub link.
- Git: initial commits, ready for `git remote add` and `git push`.

---

## Optional / Future Enhancements (planned or possible)

- **Form "loading" state** during data fetch or form submission (spinner or disabled buttons).
- **Confirmation before deletion** (if a DELETE product endpoint is added).
- **Export list** (e.g. CSV) for backup or printing.
- **"Low stock only" filter** (toggle or tab).
- **Authentication / login** (if required by the project specification).
- **PWA** (service worker, "Add to Home Screen") for mobile use.

The above items **are not required** for the current project specification; the project already fulfills all requirements (Java, React, REST API, Swagger, README, deliverable).
