# InventoryLogic — Αποθήκη / Εμπόρευμα

Φοιτητική εργασία: σύστημα διαχείρισης αποθήκης (αλουμίνιο/σιδήρας) με **Java Spring Boot** (REST API), **React** (Vite), **Tailwind CSS** και **MySQL**.

**Για να τρέξεις και να δεις το UI στο browser:** δες το αρχείο **[ΤΡΕΞΙΜΟ.md](ΤΡΕΞΙΜΟ.md)**.

---

## Τι κάνει η εφαρμογή

### Διαχείριση προϊόντων
- **Λίστα προϊόντων** με SKU, όνομα, κατηγορία, barcode, μονάδα, τρέχουσα ποσότητα, ελάχιστο όριο.
- **Επεκτεταμένα πεδία:** τιμή, θέση αποθήκης (location), διαστάσεις, χρώμα RAL, συσκευασία.
- **Νέο προϊόν** και **επεξεργασία** (PATCH) υπαρχόντων με όλα τα πεδία.
- **Διαγραφή** με επιβεβαίωση.

### Αποθέματα & κινήσεις
- **Γρήγορη αλλαγή ποσότητας:** κουμπιά +1, +5, +10 και −1, −5, −10.
- **Ιστορικό κινήσεων** ανά προϊόν (με σημείωση και προαιρετική αναφορά τιμολογίου/παραγγελίας).
- **Audit log:** καταγραφή δημιουργίας, ενημέρωσης, διαγραφής και προσαρμογής αποθέματος ανά προϊόν.

### Αναζήτηση & φίλτρα
- **Αναζήτηση** (όνομα, SKU, barcode, κατηγορία) με ανοχή σε τόνους (EL/EN).
- **Φίλτρο «Μόνο χαμηλό απόθεμα».**
- **Φίλτρο κατηγορίας:** chips (Όλες + μία κατηγορία για κάθε τιμή).

### Barcode / QR
- **Πληκτρολόγηση ή σάρωση** barcode — αναζήτηση προϊόντος με εμφάνιση αποτελέσματος.

### Ειδοποιήσεις & αναφορές
- **Badge χαμηλού αποθέματος** στην κορυφή όταν υπάρχουν προϊόντα κάτω από το ελάχιστο.
- **«Τι να παραγγείλω»:** λίστα προϊόντων με stock ≤ minStock και προτεινόμενη ποσότητα παραγγελίας.

### Export
- **Export CSV** της τρέχουσας λίστας (με φίλτρα).
- **Export PDF** λίστας προϊόντων (landscape A4, jsPDF).

### Άλλα
- **Δειγματική λίστα:** seed δοκιμαστικών προϊόντων με τιμή, θέση, διαστάσεις, RAL, συσκευασία.
- **PWA:** υποστήριξη εγκατάστασης ως εφαρμογή (vite-plugin-pwa).

---

## Απαιτήσεις

- **JDK 21**
- **Maven** (ή χρήση του `mvnw` που περιλαμβάνεται)
- **Node.js** (LTS, για το frontend)
- **MySQL Server** (π.χ. 8.x)

---

## Βάση δεδομένων (MySQL)

1. Συνδέσου στο MySQL (Workbench ή κονσόλα).
2. Δημιούργησε τη βάση:

```sql
CREATE DATABASE IF NOT EXISTS inventory_app
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
```

3. Στο project, άνοιξε `backend/src/main/resources/application.properties` και βάλε το **username** και **password** του MySQL:

```properties
spring.datasource.username=root
spring.datasource.password=ΤΟ_ΚΩΔΙΚΟ_ΣΟΥ
```

---

## Build & τρέξιμο

Η δομή είναι δύο φάκελοι: **backend** (Java/Maven) και **frontend** (React/Vite).

### Backend (Java)

Όλες οι εντολές από τον φάκελο **backend**:

```bash
cd backend
./mvnw clean package
```

**Windows (PowerShell):** `cd backend` μετά `.\mvnw.cmd clean package`

- **Run:**

```bash
cd backend
./mvnw spring-boot:run
```

**Windows (PowerShell):** `cd backend` μετά `.\mvnw.cmd spring-boot:run`

Ή τρέξε από το IntelliJ την κλάση `gr.aueb.sev.inventorylogic.InventoryLogicApplication` (με working directory το **backend**).

- Το API τρέχει στο **http://localhost:8080**
- **Swagger UI:** **http://localhost:8080/swagger-ui.html**

### Frontend (React + Vite + Tailwind)

**Από ρίζα project** (`InventoryLogic`):

- **Πρώτη φορά** — εγκατάσταση dependencies:

```bash
npm run install:frontend
```

ή χειροκίνητα: `cd frontend` και `npm install`.

- **Τρέξιμο σε λειτουργία ανάπτυξης:**

```bash
npm run dev
```

Η εφαρμογή ανοίγει στο **http://localhost:5173**. Ο browser μιλάει με το backend μέσω proxy (κλήσεις στο `/api` → `localhost:8080`).

- **Production build** (από ρίζα ή από `frontend/`):

```bash
npm run build
```

Αν είσαι μέσα στο `frontend/`: `npm run build`. Τα αρχεία βγαίνουν στο `frontend/dist/`.

---

## REST API — κύρια endpoints

| Method | Endpoint | Περιγραφή |
|--------|----------|-----------|
| GET | `/api/products` | Λίστα προϊόντων. Query: `lowStockOnly`, `q`, `page`, `size` |
| GET | `/api/products/{id}` | Ένα προϊόν |
| GET | `/api/products/by-barcode?code=...` | Αναζήτηση με barcode |
| GET | `/api/products/{id}/movements` | Ιστορικό κινήσεων |
| GET | `/api/products/{id}/audit` | Audit log προϊόντος |
| POST | `/api/products` | Δημιουργία προϊόντος |
| PATCH | `/api/products/{id}` | Ενημέρωση προϊόντος |
| DELETE | `/api/products/{id}` | Διαγραφή προϊόντος |
| POST | `/api/products/{id}/adjust` | Προσαρμογή αποθέματος (body: `delta`, `note`, `reference`) |
| POST | `/api/products/seed` | Δειγματική λίστα προϊόντων |

---

## Deploy (production)

1. **Βάση:** Δημιούργησε `inventory_app` στο MySQL και ρύθμισε `backend/.../application.properties`.
2. **Backend:** `cd backend`, `.\mvnw.cmd clean package`, μετά `java -jar target/InventoryLogic-0.0.1-SNAPSHOT.jar`. Το API τρέχει στο port 8080.
3. **Frontend:** από ρίζα `npm run build`. Τα αρχεία στο `frontend/dist/` σερβίρονται με web server (π.χ. nginx) ή static hosting. Ο browser πρέπει να έχει πρόσβαση στο ίδιο backend (ίδιο domain ή CORS/base URL).

---

## Δομή project

- **backend/** — Java Spring Boot (Maven)
  - `src/main/java/gr/aueb/sev/inventorylogic/`: `domain/`, `dto/`, `repo/`, `service/`, `web/`
  - Entities: Product, StockMovement, AuditLog
  - REST: `/api/products`, `/adjust`, `/movements`, `/audit`, `/by-barcode`, `/seed`
- **frontend/** — React + Vite + Tailwind, κλήσεις στο `/api`
- **package.json** (ρίζα) — scripts `build`, `dev`, `install:frontend` που καλούν το frontend

---

## GitHub

Το παραδοτέο περιλαμβάνει το **GitHub link** του repository, σύμφωνα με τις οδηγίες της εργασίας.
