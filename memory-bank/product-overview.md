# Product Overview — Financial Metrics Dashboard

> **Last updated:** 2026-07-25
> **Evidence:** Verified against `README.md`, `backend/app/routes.py`, `frontend/src/App.tsx`, `frontend/src/components/dashboard/`

## Purpose

The Financial Metrics Dashboard is a web application that displays simulated financial KPIs (income, outcome, profit, and profit margin) through interactive charts and cards. It is designed as an educational/internal tool for analyzing mock financial data.

## Core Features

| Feature | Description | Source Evidence |
|---|---|---|
| **KPI Cards** | Total Income, Total Outcome, Profit, Profit Margin — each with a badge icon, formatted value, and helper text | `frontend/src/components/dashboard/kpi-row.tsx` (4 KPICard instances) |
| **Income vs Outcome Chart** | Monthly line chart comparing income and outcome trends | `frontend/src/components/dashboard/income-outcome-chart.tsx` (Recharts `LineChart` with two `Line` series) |
| **Profit Margin Chart** | Monthly profit percentage line chart with a zero reference line | `frontend/src/components/dashboard/profit-percent-chart.tsx` (Recharts `LineChart` with `ReferenceLine`) |
| **Dashboard Header** | Title "Financial Overview" with a period badge ("2024 — Full Year") | `frontend/src/components/dashboard/dashboard-header.tsx` |
| **REST API** | 9 endpoints serving mock financial data with filters (date, category, operation type, business type) | `backend/app/routes.py` — `GET /health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b`, `/api/metrics/b2c` |
| **Mock Data Generation** | Deterministic seed-based generation of 360 financial movements per year | `backend/app/routes.py` — `generate_mock_movements(seed=42)` |
| **Dark/Light Theme** | CSS custom properties for both themes, toggled via `.dark` class | `frontend/src/index.css` — `:root` (light) and `.dark` (dark) blocks |

## User Interface

The UI is a single-page application (SPA) with:

- A **header** with the title "Financial Overview" and a period badge
- An **error banner** shown when the API call fails (red border, destructive styling)
- A **KPI row** with 4 cards in a responsive grid (1 col → 2 cols → 4 cols)
- A **charts section** with 2 charts side-by-side on large screens (xl:grid-cols-2)

All components handle **loading** (skeleton placeholders), **error** (red banner), and **empty** (informational message) states.

## Data Flow

```
Frontend (React)             Backend (FastAPI)
    │                              │
    │  fetch("/api/metrics")       │
    ├─────────────────────────────►│
    │                              │
    │  ◄──────────────────────────┤
    │  JSON: FinancialMovement[]   │
    │                              │
    │  computeKPIs() → KPIMetrics  │
    │  computeMonthlyData() →      │
    │    MonthlyDataPoint[]        │
    │                              │
    │  Render KPIRow + Charts      │
```

The frontend fetches data from the backend via a Vite proxy (`/api` → `http://backend:8000`), computes KPIs and monthly aggregates client-side, and renders the dashboard.

## Constraints

- **Mock data only:** All data is generated server-side with a fixed seed (`42`). No database or real financial data is used.
- **Single page:** No routing or multi-page navigation.
- **English-only UI:** Labels, tooltips, and helper text are in English.
- **Single period:** The dashboard shows a fixed "2024 — Full Year" period.