# InventoryLogic — Αποθήκη / Εμπόρευμα

Σύστημα διαχείρισης αποθήκης (αλουμίνιο, σίδηρας ή οποιαδήποτε εμπόρευμα) με **Java Spring Boot** (REST API), **React** (Vite), **Tailwind CSS** και **MySQL**. Σχεδιασμένο για **κινητά πρώτα** (mobile-first): σάρωση barcode από υπαλλήλους στα ράφια, γρήγορη καταχώρηση με λίγα κλικ, PWA εγκατάσταση.

**Για τρέξιμο και προβολή στο browser:** δες **[ΤΡΕΞΙΜΟ.md](ΤΡΕΞΙΜΟ.md)**.

---

## Τι κάνει η εφαρμογή

### Κεντρική οθόνη (Dashboard)
- **KPI:** σύνολο προϊόντων, προϊόντα χαμηλού αποθέματος, συνολική αξία αποθέματος (€), κινήσεις τελευταίων 7 ημερών.
- Σύντομο μπλοκ «Τι να παραγγείλω» με link στη λίστα παραγγελίας.

### Διαχείριση προϊόντων
- **Λίστα προϊόντων** με SKU, όνομα, κατηγορία, barcode, μονάδα, τρέχουσα ποσότητα, ελάχιστο όριο.
- **Επεκτεταμένα πεδία:** τιμή, θέση αποθήκης (location), διαστάσεις, χρώμα RAL, συσκευασία.
- **Νέο προϊόν** και **επεξεργασία** (PATCH) με όλα τα πεδία.
- **Διαγραφή** με επιβεβαίωση.

### Αποθέματα & κινήσεις
- **Γρήγορη αλλαγή ποσότητας:** κουμπιά +1, +5, +10 και −1, −5, −10 (touch-friendly).
- **Προσαρμογή με σημείωση/αναφορά** (τιμολόγιο/παραγγελία).
- **Ιστορικό κινήσεων** και **Audit log** ανά προϊόν.

### Barcode / QR (κεντρικό για κινητά)
- **Πληκτρολόγηση ή σάρωση** barcode — άμεση αναζήτηση και εμφάνιση προϊόντος με γρήγορη προσαρμογή αποθέματος.
- Βελτιστοποίηση για χρήση από κινητό (μικρά κλικ, μεγάλα κουμπιά).

### Αναζήτηση & φίλτρα
- Αναζήτηση (όνομα, SKU, barcode, κατηγορία) με ανοχή τόνων (EL/EN).
- Φίλτρο «Μόνο χαμηλό απόθεμα» και φίλτρο κατηγορίας (chips).

### Αναφορές
- **Αναφορά αποτίμησης αποθέματος:** αξία ανά προϊόν (ποσότητα × τιμή), συνολική αξία (el-GR €).
- **Τι να παραγγείλω:** λίστα προϊόντων με stock ≤ minStock και προτεινόμενη ποσότητα.

### Export
- **Export CSV** και **Export PDF** λίστας προϊόντων (με φίλτρα).

### Πλοήγηση & locale
- **Μενού:** Κεντρική οθόνη, Προϊόντα, Αναφορές, Τι να παραγγείλω, Σχετικά.
- **Ελληνική μορφή:** ημερομηνίες, αριθμοί και νόμισμα (€) παντού (el-GR).

### Τεχνολογία & UX
- **PWA:** εγκατάσταση ως εφαρμογή (vite-plugin-pwa), standalone, theme/background.
- **Responsive:** mobile-first, λειτουργία σε κινητά και desktop.
- **JWT σύνδεση/εγγραφή:** Σύνδεση (email ή username), Εγγραφή. Demo: **admin@inventory.local** / **admin12** (ρύθμιση στο `application.properties` ή env).

---

## Απαιτήσεις

- **JDK 21**
- **Maven** (ή `mvnw` στο project)
- **Node.js** (LTS, για frontend)
- **MySQL Server** (π.χ. 8.x)

---

## Βάση δεδομένων (MySQL)

1. Δημιούργησε τη βάση:

```sql
CREATE DATABASE IF NOT EXISTS inventory_app
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
```

2. Ρύθμισε **backend/src/main/resources/application.properties**:

```properties
spring.datasource.username=root
spring.datasource.password=ΤΟ_ΚΩΔΙΚΟ_ΣΟΥ
```

Όλες οι παράμετροι (URL, port, JWT, CORS, demo admin) περιγράφονται στο **[REST_API_KAI_BASI.md](REST_API_KAI_BASI.md)**.

---

## Build & τρέξιμο

### Backend (Java)

Από τον φάκελο **backend**:

```bash
cd backend
./mvnw clean package
```

**Windows (PowerShell):** `cd backend` μετά `.\mvnw.cmd spring-boot:run`

- Το API τρέχει στο **http://localhost:8081** (`server.port=8081` στο `application.properties`).
- **Swagger UI:** http://localhost:8081/swagger-ui.html

### Frontend (React + Vite + Tailwind)

Από ρίζα project:

```bash
npm run install:frontend   # πρώτη φορά
npm run dev
```

Η εφαρμογή ανοίγει στο **http://localhost:5173**. Ο browser μιλάει με το backend μέσω proxy (`/api` → `localhost:8081`).

- **Production build:** `npm run build` (από ρίζα ή `frontend/`). Έξοδος: **frontend/dist/**.

---

## REST API — κύρια endpoints

| Method | Endpoint | Περιγραφή |
|--------|----------|-----------|
| GET | `/api/products` | Λίστα. Query: `lowStockOnly`, `q`, `page`, `size` |
| GET | `/api/products/{id}` | Ένα προϊόν |
| GET | `/api/products/by-barcode?code=...` | Αναζήτηση με barcode |
| GET | `/api/products/{id}/movements` | Ιστορικό κινήσεων |
| GET | `/api/products/{id}/audit` | Audit log |
| POST | `/api/products` | Δημιουργία |
| PATCH | `/api/products/{id}` | Ενημέρωση |
| DELETE | `/api/products/{id}` | Διαγραφή |
| POST | `/api/products/{id}/adjust` | Προσαρμογή αποθέματος (`delta`, `note`, `reference`) |
| POST | `/api/products/seed` | Δειγματική λίστα |
| **GET** | **`/api/dashboard/stats`** | **Στατιστικά κεντρικής οθόνης** |
| **GET** | **`/api/reports/valuation`** | **Αναφορά αποτίμησης αποθέματος** |
| POST | `/api/auth/login` | Σύνδεση → `{ token, username, email }` |
| POST | `/api/auth/register` | Εγγραφή → 201 `{ token, username, email }` |

Λεπτομέρειες και παράμετροι σύνδεσης/βάσης: **[REST_API_KAI_BASI.md](REST_API_KAI_BASI.md)**.

---

## Ρυθμίσεις (παράμετροι)

| Παράμετρος | Default | Περιγραφή |
|------------|---------|-----------|
| `server.port` | 8081 | Port backend |
| `spring.datasource.url` | jdbc:mysql://localhost:3306/inventory_app?... | URL MySQL |
| `app.cors.allowed-origins` | http://localhost:5173, ... | CORS (πρόσθεσε production domain) |
| `jwt.secret` | (μήκος ≥32) | Αλλάξτε σε production |
| `admin.user` / `admin.password` | admin@inventory.local / admin12 | Demo admin (env: ADMIN_USER, ADMIN_PASSWORD) |

---

## Deploy (production)

1. **Βάση:** Δημιούργησε `inventory_app` και ρύθμισε `application.properties` (URL, username, password).
2. **Backend:** `cd backend`, `.\mvnw.cmd clean package`, `java -jar target/InventoryLogic-0.0.1-SNAPSHOT.jar`. Αλλάξτε `jwt.secret` και demo admin.
3. **Frontend:** `npm run build`. Σερβίρετε το **frontend/dist/** με nginx/Apache. Ρύθμισε `app.cors.allowed-origins` για το domain του frontend.
4. **Κινητά:** Χρηστές μπορούν να εγκαταστήσουν την εφαρμογή ως PWA από το URL του frontend.

---

## Δομή project

- **backend/** — Spring Boot (Maven)
  - `domain/`: Product, StockMovement, AuditLog, User
  - `dto/`: CreateProductRequest, DashboardStats, ValuationReport, ...
  - `repo/`, `service/`, `web/`: ProductController, DashboardController, ReportController, AuthController
- **frontend/** — React + Vite + Tailwind, PWA
  - Σελίδες: Dashboard, Προϊόντα, Αναφορές, Τι να παραγγείλω, Σχετικά, Λεπτομέρεια προϊόντος, Σύνδεση/Εγγραφή
- **docs/** — Πλάνο αναβάθμισης (π.χ. docs/ΠΛΑΝΟ_ΑΝΑΒΑΘΜΙΣΗΣ.md)
- **package.json** (ρίζα) — scripts: `build`, `dev`, `install:frontend`

---

## GitHub

Το repository και οι οδηγίες για δημιουργία/σύνδεση και push: **[GITHUB.md](GITHUB.md)**.
