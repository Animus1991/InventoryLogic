# InventoryLogic — English Documentation Index

This folder contains English translations of all Greek-language markdown documentation files from the InventoryLogic project.

---

## Documents

| File | Original (Greek) | Description |
|------|------------------|-------------|
| [RUNNING.md](RUNNING.md) | ΤΡΕΞΙΜΟ.md | Step-by-step instructions for running the backend and frontend locally, accessing the UI in the browser, and testing from a mobile device. Includes a summary table of ports and URLs. |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | ΚΑΤΑΣΤΑΣΗ.md | Overview of all implemented features (backend entities, REST endpoints, frontend components, tooling) and a list of optional future enhancements. |
| [IMPROVEMENT_IDEAS.md](IMPROVEMENT_IDEAS.md) | ΙΔΕΕΣ_ΒΕΛΤΙΩΣΕΩΝ.md | Detailed, grouped list of enhancement ideas across warehouse operations, UX/scanning, notifications, multi-user security, aluminum/steel specifics, technical improvements, and accounting/legal requirements — with difficulty ratings. |
| [REST_API_AND_DATABASE.md](REST_API_AND_DATABASE.md) | REST_API_KAI_BASI.md | Complete reference for the REST API (all endpoints, request/response formats, authentication), MySQL database configuration, table schemas, application properties, error response formats, and the default admin user. |
| [GITHUB_SETUP.md](GITHUB_SETUP.md) | GITHUB.md | Instructions for creating a GitHub repository, connecting the local project, making the initial commit, and pushing to GitHub. Includes a PowerShell reminder for running the backend with `.\mvnw.cmd`. |
| [UPGRADE_PLAN.md](UPGRADE_PLAN.md) | docs/ΠΛΑΝΟ_ΑΝΑΒΑΘΜΙΣΗΣ.md | Market-ready upgrade roadmap organized into three phases: complete dashboard & reports (✅), mobile-first/barcode-centric features (✅), and upcoming next steps (user roles, suppliers, order requests, label printing, notifications, movement reports). |

---

## Project Overview

**InventoryLogic** is a full-stack inventory management system built with:

- **Backend:** Java 21, Spring Boot, Maven, MySQL 8.x, JPA/Hibernate, JWT authentication, Swagger/OpenAPI documentation
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, PWA support, html5-qrcode barcode/QR scanning
- **API:** RESTful, 14+ endpoints, runs on port 8081 by default
- **Frontend dev server:** Vite, runs on port 5173 by default

For running instructions, see [RUNNING.md](RUNNING.md).  
For the full API reference, see [REST_API_AND_DATABASE.md](REST_API_AND_DATABASE.md).
