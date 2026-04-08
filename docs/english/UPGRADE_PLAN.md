# Upgrade Plan — InventoryLogic (market-ready level)

## Goal

A warehouse application ready to be adopted by a company (aluminum, steel, or any warehouse), with maximum feature completeness, clear usability, and market-facing tools. **Focus: mobile-first** — barcode scanning by warehouse staff on the shelves, fast entry with minimal taps.

---

## Phase 1 — Complete Dashboard & Reports ✅

| # | Feature | Status |
|---|---------|--------|
| 1 | Dashboard (main screen) — KPIs, "What to order" | ✅ |
| 2 | Stock valuation report | ✅ |
| 3 | Navigation (Dashboard, Products, Reports, What to Order, About) | ✅ |
| 4 | el-GR localization (dates, numbers, currency €) | ✅ |

---

## Phase 2 — Mobile-first / Barcode-centric ✅

| # | Feature | Status |
|---|---------|--------|
| 1 | **Fully responsive** | ✅ Mobile-first CSS, breakpoints, menus/buttons optimized for small screens. |
| 2 | **Touch-friendly** | ✅ Minimum button/link height ~44px. |
| 3 | **Barcode scanner (camera)** | ✅ html5-qrcode library: camera-based scanning. **Dashboard:** "Scan barcode" block + "Open scanner" button on app launch. **Products:** "Open scanner" button. After scan → product lookup → navigate to product card or display result. |
| 4 | **PWA & meta tags** | ✅ Viewport, theme-color, apple-mobile-web-app, manifest. |
| 5 | **Fewer taps** | ✅ Barcode first, quick ± buttons, delta field + Apply button. |

---

## Phase 3 — Next Steps (priority)

| # | Feature | Description |
|---|---------|-------------|
| 5 | User roles | Administrator vs. Operator (deletion permissions, seed, user management). |
| 6 | Suppliers | Supplier entity, association with products. |
| 7 | Purchase order request | "What to order" list with submission/export for supplier. |
| 8 | Barcode label printing | Label template for printing. |
| 9 | Low stock notifications | PWA push or in-app notification when stock ≤ minStock. |
| 10 | Movement report by date range | From–to filter for accounting/audit. |

---

## Technical Principles

- No bugs, inconsistencies, or regressions.
- Backend: new endpoints using ResponseEntity, DTOs, and validation.
- Frontend: mobile-first, touch targets ≥44px, el-GR locale throughout, minimal taps for main flows (barcode → adjust).
