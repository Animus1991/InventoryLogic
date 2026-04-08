# How to Run the Application and View It in the Browser (UI/UX)

## Prerequisites (one-time setup)

1. **MySQL**: The `inventory_app` database must be created. Open `backend/src/main/resources/application.properties` and set your MySQL password.
2. **Frontend dependencies**: From the project root:
   ```bash
   npm run install:frontend
   ```

---

## Running the Application (to view the UI)

### Step 1 — Backend (first terminal)

**Important:** Use `.\mvnw.cmd` (with a leading dot and backslash) on Windows.

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Wait until you see `Started InventoryLogicApplication`. The API will be running at **http://localhost:8081**.

If a **404 on /api/auth/login** appears, stop the backend (Ctrl+C) and run it again so that the login/register endpoints load correctly.

### Step 2 — Frontend (second terminal)

From the project root:

```bash
npm run dev
```

The Vite development server will start. The terminal will display something like:

```
  ➜  Local:   http://localhost:5173/
```

### Step 3 — Browser or mobile device

Open in your browser:

**http://localhost:5173**

To test from a **mobile device** on the same network: use the Network URL displayed by Vite (e.g. http://192.168.x.x:5173) and make sure the backend CORS configuration allows that address (`app.cors.allowed-origins` in `application.properties`).

You will see: Dashboard (main screen), Products, Reports, What to Order, barcode scanning/typing, and login/register.

---

## Summary

| Service      | Port     | URL                                               |
|--------------|----------|---------------------------------------------------|
| Backend API  | **8081** | http://localhost:8081                             |
| Swagger      | 8081     | http://localhost:8081/swagger-ui.html             |
| Frontend UI  | 5173     | **http://localhost:5173** ← open this for the UI |

**When it is ready:** As soon as both the backend and `npm run dev` are running and you open **http://localhost:5173** in the browser.

**PWA:** After building (`npm run build`) and if the frontend is served over HTTPS, users can install the application (Add to Home Screen) for use on mobile devices.
