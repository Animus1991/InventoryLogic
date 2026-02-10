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
- **Επεκτεταμένα πεδία:** τιμή, θέση αποθήκης (location), διαστάσεις, χρώμα RAL, συσκευασία· **QR code** (προαιρετικό περιεχόμενο για ετικέτες)· **προμηθευτής** (supplier)· **εσωτερικές σημειώσεις** (internalNotes, όχι για πελάτες).
- **Νέο προϊόν** και **επεξεργασία** (PATCH) με όλα τα πεδία.
- **Διαγραφή** με επιβεβαίωση.

### Αποθέματα & κινήσεις
- **Γρήγορη αλλαγή ποσότητας:** κουμπιά +1, +5, +10 και −1, −5, −10 (touch-friendly).
- **Προσαρμογή με σημείωση/αναφορά** (τιμολόγιο/παραγγελία).
- **Ιστορικό κινήσεων** και **Audit log** ανά προϊόν.

### Barcode / QR (κεντρικό για κινητά)
- **Σκάνερ barcode με κάμερα:** πραγματική σάρωση μέσω κάμερας συσκευής (βιβλιοθήκη html5-qrcode). **Κεντρική οθόνη:** μπλοκ «Σάρωση barcode» με κουμπί «Άνοιγμα σκανάρα» — μόλις ανοίγει η εφαρμογή ο χρήστης μπορεί να σκανάρει και να πάει απευθείας στην καρτέλα προϊόντος. **Σελίδα Προϊόντα:** κουμπί «Άνοιγμα σκανάρα» δίπλα στο πεδίο πληκτρολόγησης.
- **Πληκτρολόγηση** barcode ως εναλλακτική (όταν δεν υπάρχει κάμερα ή η άδεια απορριφθεί).
- Μετά σάρωση/αναζήτηση: εμφάνιση προϊόντος και γρήγορη προσαρμογή αποθέματος (λιγά κλικ).

### Αναζήτηση & φίλτρα
- Αναζήτηση (όνομα, SKU, barcode, κατηγορία) με ανοχή τόνων (EL/EN).
- Φίλτρο «Μόνο χαμηλό απόθεμα» και φίλτρο κατηγορίας (chips).

### Αναφορές
- **Αναφορά αποτίμησης αποθέματος:** αξία ανά προϊόν (ποσότητα × τιμή), συνολική αξία στο **επιλεγμένο νόμισμα**.
- **Τι να παραγγείλω:** λίστα προϊόντων με stock ≤ minStock και προτεινόμενη ποσότητα.

### Νόμισμα (χώρα / τοπικό νόμισμα)
- **Επιλογή νομίσματος** στο header: EUR, USD, GBP, CHF, ALL (λεκ), RON, BGN, TRY, PLN, CNY. Η επιλογή αποθηκεύεται τοπικά (localStorage) και οι τιμές εμφανίζονται παντού στο επιλεγμένο νόμισμα.

### Μαζική εισαγωγή προϊόντων
- **CSV ή Excel:** σελίδα «Μαζική εισαγωγή» — ανέβασμα αρχείου **CSV** (.csv, .txt) ή **Excel** (.xlsx, .xls) με επικεφαλίδα: `sku`, `name`, `category`, `barcode`, `qrCode`, `unit`, `description`, `manufacturerTerm`, `localSlang`, `price`, `location`, `dimensions`, `colorRal`, `packagingInfo`, `supplier`, `internalNotes`, `stock`, `minStock`. **SKU** = κωδικός προϊόντος (Stock Keeping Unit). Αν το SKU υπάρχει → ενημέρωση πεδίων· αλλιώς δημιουργία. Απάντηση: `created`, `updated`, `errors[]`.
- **Εισαγωγή από φωτογραφία (OCR):** ανέβασμα εικόνας με κείμενο (χειρόγραφο ή τυπωμένο)· αναγνώριση με **Tesseract.js** (client-side)· επεξεργασία κειμένου· κουμπί «Αναζήτηση προϊόντος από κείμενο» για αντιστοίχιση με υπάρχοντα προϊόντα (σύνδεσμος προς καρτέλα προϊόντος)· ή «Εισαγωγή ως CSV» για μαζική εισαγωγή.

### Εκτύπωση barcode και QR
- Σελίδα «Εκτύπωση barcode»: λίστα προϊόντων με checkboxes· «Επιλογή όλων» / «Αφαίρεση επιλογής»· **Εκτύπωση (N)** (print)· **Λήψη PDF** (κατέβασμα PDF με ετικέτες barcode + QR)· **Αποστολή με email** (κατέβασμα PDF + άνοιγμα mailto ώστε ο χρήστης να επισυνάψει το αρχείο). Κάθε ετικέτα εμφανίζει barcode (CODE128) και QR (από πεδίο `qrCode` ή URL προϊόντος). Χρήσιμο για νέα προϊόντα ή αντικατάσταση φθαρμένων ετικετών.

### Export
- **Export CSV** και **Export PDF** λίστας προϊόντων (με φίλτρα).

### Πλοήγηση, γλώσσα & locale
- **Μενού:** Κεντρική οθόνη, Προϊόντα, Αναφορές, Τι να παραγγείλω, Εκτύπωση barcode, Μαζική εισαγωγή, Σχετικά.
- **Πολυγλωσσικότητα (i18n):** πλήρης μετάφραση σε **7 γλώσσες** — **Ελληνικά**, **English**, **Shqip**, **Français**, **Deutsch**, **Italiano**, **Español**. Όλα τα κείμενα διεπαφής (μενού, κουμπιά, φόρμες, μηνύματα, σελίδες Σχετικά, Προϊόντα, Εισαγωγή, Αναφορές, Παραγγελία, Σύνδεση) χρησιμοποιούν το ίδιο σύστημα i18n· αλλαγή γλώσσας από το Language switcher στο header.
- **Νόμισμα και ημερομηνίες:** ημερομηνίες/αριθμοί σε τοπική μορφή· νόμισμα σύμφωνα με την επιλογή του χρήστη.

### Τεχνολογία & UX
- **PWA:** εγκατάσταση ως εφαρμογή (vite-plugin-pwa), standalone, theme/background.
- **Responsive:** πλήρως responsive (Tailwind, mobile-first)· λειτουργία σε κινητά, tablet και desktop.
- **Εγκατάσταση σε κινητό (testing):** Άνοιγμα του URL της εφαρμογής στο browser του κινητού → **«Πρόσθεσε στην αρχική οθόνη»** / **«Add to Home Screen»** (1–2 κλικ). Δεν απαιτείται ξαναγράψιμο σε Java/Kotlin· η εφαρμογή τρέχει ως PWA (React).
- **Android Studio emulator:** Τρέξιμο `npm run dev` στο host· στο emulator άνοιγμα `http://10.0.2.2:5173`· από εκεί μπορεί να γίνει και εγκατάσταση PWA. **Φυσικό κινητό:** κινητό και PC στο ίδιο δίκτυο· άνοιγμα στο browser του κινητού του URL όπου τρέχει το frontend (π.χ. `http://<IP-PC>:5173`).
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
| POST | `/api/products/import` | Μαζική εισαγωγή (multipart `file`: CSV ή Excel .xlsx/.xls) → `{ created, updated, errors[] }` |
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
