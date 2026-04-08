# REST API and Database — InventoryLogic

## REST API Base Address

When the backend is running locally:

| Description              | URL |
|--------------------------|-----|
| **API base address**     | **http://localhost:8081/api** |
| **Swagger UI (documentation)** | http://localhost:8081/swagger-ui.html |
| **OpenAPI JSON**         | http://localhost:8081/v3/api-docs |

All endpoints are prefixed with **`/api`**.

---

## Database (MySQL)

### Connection Parameters

| Parameter         | Value (default)       | Notes |
|-------------------|-----------------------|-------|
| **Host**          | localhost             | |
| **Port**          | 3306                  | |
| **Database name** | **inventory_app**     | Must exist before the first run |
| **Username**      | root                  | Configured in `application.properties` |
| **Password**      | (empty or your own)   | Configured in `application.properties` |

### Create the Database (one-time)

```sql
CREATE DATABASE IF NOT EXISTS inventory_app
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
```

### Configuration in the Project

File: **`backend/src/main/resources/application.properties`**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_app?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### Tables (created automatically with `spring.jpa.hibernate.ddl-auto=update`)

| Table               | Description |
|---------------------|-------------|
| **products**        | Products (id, sku, name, category, barcode, qr_code, unit, description, manufacturer_term, local_slang, price, location, dimensions, color_ral, packaging_info, supplier, internal_notes, stock, min_stock) |
| **stock_movements** | Stock movements (id, product_id, delta, note, reference, created_at) |
| **audit_log**       | Change history (id, product_id, action, details, created_at) |
| **app_user**        | Users (id, email, username, password_hash) |

---

## REST API — Endpoints

Base: **http://localhost:8081/api**

### Authentication (no JWT required in requests)

| Method | Endpoint             | Description | Request Body (JSON) |
|--------|----------------------|-------------|---------------------|
| POST   | **/api/auth/login**    | Login       | `{ "emailOrUsername": "...", "password": "..." }` → `{ "token", "username", "email" }` |
| POST   | **/api/auth/register** | Register    | `{ "email", "username", "password" }` → 201 `{ "token", "username", "email" }` |

### Products (requires header: `Authorization: Bearer <token>`)

| Method | Endpoint                          | Description              | Query / Body |
|--------|-----------------------------------|--------------------------|--------------|
| GET    | **/api/products**                 | List products            | Query: `lowStockOnly`, `q`, `page`, `size` |
| GET    | **/api/products/{id}**            | Get a single product     | — |
| GET    | **/api/products/by-barcode**      | Search by barcode        | Query: `code` |
| POST   | **/api/products**                 | Create product           | Body: CreateProductRequest |
| PATCH  | **/api/products/{id}**            | Update product           | Body: fields to update |
| DELETE | **/api/products/{id}**            | Delete product           | — |
| POST   | **/api/products/{id}/adjust**     | Adjust stock             | Body: `{ "delta", "note", "reference" }` |
| GET    | **/api/products/{id}/movements**  | Movement history         | — |
| GET    | **/api/products/{id}/audit**      | Product audit log        | — |
| POST   | **/api/products/import**          | Bulk import              | Multipart: `file` = CSV or Excel (.xlsx, .xls). Response: `{ "created", "updated", "errors": [] }` |
| POST   | **/api/products/seed**            | Load sample product list | — |

**Bulk import (POST /api/products/import):** CSV/Excel header columns: `sku`, `name`, `category`, `barcode`, `qrCode`, `unit`, `description`, `manufacturerTerm`, `localSlang`, `price`, `location`, `dimensions`, `colorRal`, `packagingInfo`, `supplier`, `internalNotes`, `stock`, `minStock`. **SKU** = product code (Stock Keeping Unit). If SKU already exists → update; otherwise → create.

### Dashboard & Reports (JWT required)

| Method | Endpoint                    | Description                    | Response |
|--------|-----------------------------|--------------------------------|----------|
| GET    | **/api/dashboard/stats**    | Dashboard statistics           | `{ "productCount", "lowStockCount", "totalValue", "recentMovementsCount" }` |
| GET    | **/api/reports/valuation**  | Stock valuation report         | `{ "items": [ { "productId", "sku", "name", "stock", "unit", "unitPrice", "value" }, ... ], "totalValue" }` |

---

## Application Parameters (application.properties)

| Parameter                        | Default                                              | Notes |
|----------------------------------|------------------------------------------------------|-------|
| **server.port**                  | 8081                                                 | REST API port |
| **spring.datasource.url**        | jdbc:mysql://localhost:3306/inventory_app?...        | MySQL URL |
| **spring.datasource.username**   | root                                                 | |
| **spring.datasource.password**   | —                                                    | Set by you |
| **spring.jpa.hibernate.ddl-auto**| update                                               | Schema updated automatically |
| **jwt.secret**                   | (length ≥32)                                         | Change in production |
| **jwt.validity-ms**              | 86400000                                             | 24 hours |
| **app.cors.allowed-origins**     | http://localhost:5173, http://127.0.0.1:5173, ...    | Add frontend domain in production |
| **admin.user**                   | admin@inventory.local                                | Demo admin (env: ADMIN_USER) |
| **admin.username**               | admin                                                | (env: ADMIN_USERNAME) |
| **admin.password**               | admin12                                              | Demo (env: ADMIN_PASSWORD) |

---

## Error Responses

All errors return JSON with a **`message`** field (in Greek where configured):

- **400** — Validation or logic error (e.g. duplicate email, SKU already exists).
- **401** — Invalid credentials or expired token.
- **404** — Resource not found.
- **500** — Server error.

---

## Default User (after first run)

If `DefaultUserLoader` has run:

- **Email:** admin@inventory.local
- **Username:** admin
- **Password:** admin12

Sign in using either email or username.

---

## Running

1. MySQL is running and the **inventory_app** database has been created.
2. Correct `username` and `password` are set in `application.properties`.
3. `cd backend` → `.\mvnw.cmd spring-boot:run`
4. API available at **http://localhost:8081**.

**Port 8081 in use:** change `server.port=8082` (or another port) in `application.properties`.

---

## Summary

| Item        | Value |
|-------------|-------|
| **REST API** | **http://localhost:8081/api** |
| **Database** | MySQL, **inventory_app**, port 3306 |
| **Swagger**  | http://localhost:8081/swagger-ui.html |
