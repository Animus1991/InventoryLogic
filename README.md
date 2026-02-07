# InventoryLogic — Αποθήκη / Εμπόρευμα

Φοιτητική εργασία: απλό σύστημα διαχείρισης αποθήκης με Java Spring Boot (REST API), React (Vite), Tailwind CSS και MySQL.

**Για να τρέξεις και να δεις το UI στο browser:** δες το αρχείο **[ΤΡΕΞΙΜΟ.md](ΤΡΕΞΙΜΟ.md)**.

## Τι κάνει η εφαρμογή

- **Προϊόντα**: λίστα με SKU, όνομα, κατηγορία, τρέχουσα ποσότητα, ελάχιστο όριο.
- **Γρήγορη αλλαγή ποσότητας**: κουμπιά +1, +5, +10 και −1, −5, −10.
- **Νέο προϊόν** και **επεξεργασία** (PATCH) υπαρχόντων.
- **Ιστορικό κινήσεων** ανά προϊόν.
- **Αναζήτηση** και ένδειξη χαμηλού αποθέματος.

## Απαιτήσεις

- **JDK 21**
- **Maven** (ή χρήση του `mvnw` που περιλαμβάνεται)
- **Node.js** (LTS, για το frontend)
- **MySQL Server** (π.χ. 8.x) — η βάση διαχειρίζεται με MySQL Workbench ή κονσόλα

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

## Build & τρέξιμο

Η δομή είναι δύο φάκελοι: **backend** (Java/Maven) και **frontend** (React/Vite).

### Backend (Java)

Όλες οι εντολές από τον φάκελο **backend**:

```bash
cd backend
./mvnw clean package
```

Windows (PowerShell): `cd backend` μετά `.\mvnw.cmd clean package`

- **Run**:

```bash
cd backend
./mvnw spring-boot:run
```

Windows (PowerShell): `cd backend` μετά `.\mvnw.cmd spring-boot:run`

Ή τρέξε από το IntelliJ την κλάση `gr.aueb.sev.inventorylogic.InventoryLogicApplication` (με working directory το **backend**).

Το API τρέχει στο **http://localhost:8080**.

- **Swagger UI** (τεκμηρίωση REST API): **http://localhost:8080/swagger-ui.html**

### Frontend (React + Vite + Tailwind)

**Από ρίζα project** (`InventoryLogic`): μπορείς να τρέξεις `npm run build` ή `npm run dev` (το root `package.json` καλεί το frontend). **Πρώτη φορά** χρειάζεται εγκατάσταση dependencies στο frontend:

```bash
npm run install:frontend
```

ή χειροκίνητα:

```bash
cd frontend
npm install
```

- **Production build** (από ρίζα ή από `frontend/`):

```bash
npm run build
```

Αν είσαι μέσα στο `frontend/`: `npm run build`. Τα αρχεία βγαίνουν στο `frontend/dist/`.

- **Τρέξιμο σε λειτουργία ανάπτυξης**:

```bash
npm run dev
```

Η εφαρμογή ανοίγει στο **http://localhost:5173**. Ο browser μιλάει με το backend μέσω proxy (κλήσεις στο `/api` → `localhost:8080`).

## Deploy (build & τρέξιμο production)

1. **Βάση**: Δημιούργησε `inventory_app` στο MySQL και ρύθμισε `backend/src/main/resources/application.properties` (username/password).
2. **Backend**: `cd backend`, `.\mvnw.cmd clean package`, μετά `java -jar target/InventoryLogic-0.0.1-SNAPSHOT.jar`. Το API τρέχει στο port 8080. Το MySQL πρέπει να είναι προσπελάσιμο.
3. **Frontend**: από ρίζα `npm run build` (ή `cd frontend` και `npm run build`). Τα αρχεία στο `frontend/dist/` σερβίρονται με web server (π.χ. nginx) ή static hosting. Ο browser πρέπει να έχει πρόσβαση στο ίδιο backend (ίδιο domain ή CORS/base URL).

## Δομή project

- **backend/** — Java Spring Boot (Maven)
  - `src/main/java/gr/aueb/sev/inventorylogic/`: `domain/`, `dto/`, `repo/`, `service/`, `web/`
  - REST: GET/POST/PATCH /api/products, POST /adjust, GET /movements
- **frontend/** — React + Vite + Tailwind, κλήσεις στο `/api/products`
- **package.json** (ρίζα) — scripts `build`, `dev`, `install:frontend` που καλούν το frontend

## GitHub

Το παραδοτέο είναι ένα **txt αρχείο** που περιέχει το **GitHub link** του repository, σύμφωνα με τις οδηγίες της εργασίας.
