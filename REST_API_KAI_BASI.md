# REST API και Βάση Δεδομένων — InventoryLogic

## Διεύθυνση REST API

Όταν το backend τρέχει τοπικά:

| Περιγραφή        | URL |
|------------------|-----|
| **Βασική διεύθυνση API** | **http://localhost:8081/api** |
| **Swagger UI (τεκμηρίωση)** | http://localhost:8081/swagger-ui.html |
| **OpenAPI JSON** | http://localhost:8081/v3/api-docs |

Όλα τα endpoints ξεκινάνε με το prefix **`/api`**.

---

## Βάση δεδομένων (MySQL)

### Παράμετροι σύνδεσης

| Παράμετρος | Τιμή (default) | Σχόλιο |
|------------|----------------|--------|
| **Host** | localhost | |
| **Port** | 3306 | |
| **Όνομα βάσης** | **inventory_app** | Πρέπει να υπάρχει πριν το πρώτο run |
| **Username** | root | Ρυθμίζεται στο `application.properties` |
| **Password** | (κενό ή δικό σας) | Ρυθμίζεται στο `application.properties` |

### Δημιουργία βάσης (μία φορά)

```sql
CREATE DATABASE IF NOT EXISTS inventory_app
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
```

### Ρύθμιση στο project

Αρχείο: **`backend/src/main/resources/application.properties`**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_app?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=ΤΟ_ΚΩΔΙΚΟ_ΣΟΥ
```

### Πίνακες (δημιουργούνται αυτόματα με `spring.jpa.hibernate.ddl-auto=update`)

| Πίνακας | Περιγραφή |
|---------|-----------|
| **products** | Προϊόντα (id, sku, name, category, barcode, qr_code, unit, description, manufacturer_term, local_slang, price, location, dimensions, color_ral, packaging_info, supplier, internal_notes, stock, min_stock) |
| **stock_movements** | Κινήσεις αποθέματος (id, product_id, delta, note, reference, created_at) |
| **audit_log** | Ιστορικό αλλαγών (id, product_id, action, details, created_at) |
| **app_user** | Χρήστες (id, email, username, password_hash) |

---

## REST API — Endpoints

Βάση: **http://localhost:8081/api**

### Αυθεντικοποίηση (χωρίς JWT στα αιτήματα)

| Method | Endpoint | Περιγραφή | Σώμα (JSON) |
|--------|----------|-----------|--------------|
| POST | **/api/auth/login** | Σύνδεση | `{ "emailOrUsername": "...", "password": "..." }` → `{ "token", "username", "email" }` |
| POST | **/api/auth/register** | Εγγραφή | `{ "email", "username", "password" }` → 201 `{ "token", "username", "email" }` |

### Προϊόντα (απαιτείται header: `Authorization: Bearer <token>`)

| Method | Endpoint | Περιγραφή | Query / Σώμα |
|--------|----------|-----------|----------------|
| GET | **/api/products** | Λίστα προϊόντων | Query: `lowStockOnly`, `q`, `page`, `size` |
| GET | **/api/products/{id}** | Ένα προϊόν | — |
| GET | **/api/products/by-barcode** | Αναζήτηση με barcode | Query: `code` |
| POST | **/api/products** | Δημιουργία | Σώμα: CreateProductRequest |
| PATCH | **/api/products/{id}** | Ενημέρωση | Σώμα: πεδία προς αλλαγή |
| DELETE | **/api/products/{id}** | Διαγραφή | — |
| POST | **/api/products/{id}/adjust** | Προσαρμογή αποθέματος | Σώμα: `{ "delta", "note", "reference" }` |
| GET | **/api/products/{id}/movements** | Ιστορικό κινήσεων | — |
| GET | **/api/products/{id}/audit** | Audit log προϊόντος | — |
| POST | **/api/products/import** | Μαζική εισαγωγή | Multipart: `file` = CSV ή Excel (.xlsx, .xls). Απάντηση: `{ "created", "updated", "errors": [] }` |
| POST | **/api/products/seed** | Δειγματική λίστα | — |

**Μαζική εισαγωγή (POST /api/products/import):** Επικεφαλίδα CSV/Excel: `sku`, `name`, `category`, `barcode`, `qrCode`, `unit`, `description`, `manufacturerTerm`, `localSlang`, `price`, `location`, `dimensions`, `colorRal`, `packagingInfo`, `supplier`, `internalNotes`, `stock`, `minStock`. **SKU** = κωδικός προϊόντος (Stock Keeping Unit). Αν SKU υπάρχει → ενημέρωση· αλλιώς δημιουργία.

### Κεντρική οθόνη & Αναφορές (απαιτείται JWT)

| Method | Endpoint | Περιγραφή | Απάντηση |
|--------|----------|-----------|----------|
| GET | **/api/dashboard/stats** | Στατιστικά dashboard | `{ "productCount", "lowStockCount", "totalValue", "recentMovementsCount" }` |
| GET | **/api/reports/valuation** | Αναφορά αποτίμησης αποθέματος | `{ "items": [ { "productId", "sku", "name", "stock", "unit", "unitPrice", "value" }, ... ], "totalValue" }` |

---

## Παράμετροι εφαρμογής (application.properties)

| Παράμετρος | Default | Σχόλιο |
|------------|---------|--------|
| **server.port** | 8081 | Port REST API |
| **spring.datasource.url** | jdbc:mysql://localhost:3306/inventory_app?... | URL MySQL |
| **spring.datasource.username** | root | |
| **spring.datasource.password** | — | Ορίζεται από εσάς |
| **spring.jpa.hibernate.ddl-auto** | update | Schema ενημερώνεται αυτόματα |
| **jwt.secret** | (μήκος ≥32) | Αλλάξτε σε production |
| **jwt.validity-ms** | 86400000 | 24 ώρες |
| **app.cors.allowed-origins** | http://localhost:5173, http://127.0.0.1:5173, ... | Για production προσθήκη domain frontend |
| **admin.user** | admin@inventory.local | Demo admin (env: ADMIN_USER) |
| **admin.username** | admin | (env: ADMIN_USERNAME) |
| **admin.password** | admin12 | Demo (env: ADMIN_PASSWORD) |

---

## Απαντήσεις σφάλματος

Όλα τα σφάλματα επιστρέφουν JSON με πεδίο **`message`** (στα ελληνικά όπου έχει ρυθμιστεί):

- **400** — Επικύρωση ή λογικό σφάλμα (π.χ. διπλότυπο email, SKU υπάρχει ήδη).
- **401** — Λάθος credentials ή token έληξε.
- **404** — Δεν βρέθηκε ο πόρος.
- **500** — Σφάλμα διακομιστή.

---

## Default χρήστης (μετά το πρώτο run)

Αν έχει τρέξει ο `DefaultUserLoader`:

- **Email:** admin@inventory.local  
- **Username:** admin  
- **Κωδικός:** admin12  

Σύνδεση με email ή username.

---

## Τρέξιμο

1. MySQL τρέχει, βάση **inventory_app** δημιουργημένη.
2. Σωστά `username` και `password` στο `application.properties`.
3. `cd backend` → `.\mvnw.cmd spring-boot:run`
4. API διαθέσιμο στο **http://localhost:8081**.

**Port 8081 κατειλημμένο:** αλλάξτε `server.port=8082` (ή άλλο) στο `application.properties`.

---

## Σύνοψη

| Στοιχείο | Τιμή |
|----------|------|
| **REST API** | **http://localhost:8081/api** |
| **Βάση** | MySQL, **inventory_app**, port 3306 |
| **Swagger** | http://localhost:8081/swagger-ui.html |
