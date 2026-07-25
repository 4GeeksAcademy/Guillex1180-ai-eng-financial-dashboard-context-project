# Current Status — Financial Metrics Dashboard

> **Last updated:** 2026-07-25
> **Evidence:** Verified against `backend/app/routes.py`, `frontend/src/App.tsx`, `frontend/src/lib/`, `backend/tests/test_routes.py`, `frontend/src/lib/financial-utils.test.ts`

---

## ✅ Implemented Features

### Backend — REST API (9 endpoints)

| Endpoint | Method | Description | Status |
|---|---|---|---|
| `/health` | GET | Returns `{"status": "ok"}` | ✅ Done |
| `/api/metrics` | GET | List of financial movements with optional filters (date, category, operation_type) | ✅ Done |
| `/api/metrics/facets` | GET | Available filter options (operation types, categories, business types, date range) | ✅ Done |
| `/api/metrics/summary` | GET | Aggregated metrics grouped by day/week/month, with filters (business_type included) | ✅ Done |
| `/api/metrics/categories/top` | GET | Top categories by amount for a given operation type | ✅ Done |
| `/api/metrics/comparison` | GET | Period-over-period comparison with delta and percentage change | ✅ Done |
| `/api/metrics/alerts` | GET | Outcome anomaly detection based on threshold vs historical average | ✅ Done |
| `/api/metrics/b2b` | GET | Filtered B2B movements | ✅ Done |
| `/api/metrics/b2c` | GET | Filtered B2C movements | ✅ Done |

### Backend — Core Logic

- ✅ Deterministic mock data generation (`seed=42`, 360 movements/year)
- ✅ Date range filtering
- ✅ Category and operation type filtering
- ✅ Business type filtering (B2B/B2C)
- ✅ Chronological order enforcement
- ✅ Metrics aggregation (summarize by day/week/month)
- ✅ Period-over-period comparison
- ✅ Outcome anomaly detection (alerts)
- ✅ Top categories computation
- ✅ **9 passing tests** (via `pytest`)

### Frontend — Dashboard UI

- ✅ Responsive KPI row (4 cards: Total Income, Total Outcome, Profit, Profit Margin)
- ✅ Income vs Outcome line chart (monthly)
- ✅ Profit Margin percentage line chart with zero reference line
- ✅ Loading state (skeleton placeholders with animation)
- ✅ Error state (red destructive banner)
- ✅ Empty state (informational "No data" message)
- ✅ Dark theme (via `.dark` class)
- ✅ Custom tooltip components for both charts
- ✅ Currency formatting (`Intl.NumberFormat`, USD)
- ✅ Percentage formatting
- ✅ **3 passing tests** (via Vitest)

### DevOps

- ✅ Docker Compose orchestration (frontend + backend)
- ✅ Hot-reload development setup
- ✅ Vite proxy for `/api` requests
- ✅ Remote debugging (debugpy on port 5678)

---

## 🟡 Known Gaps & Issues

### Gap 1: Mock data regenerated on every request
**Severity:** 🟡 Medium
**Location:** `backend/app/routes.py` — `generate_mock_movements(seed=42)` called in **9 handlers**
**Impact:** Each request regenerates 360 `FinancialMovement` objects. Inefficient, and tightly couples all handlers to the mock implementation. If migrating to a real database, 9 handlers would need changes.
**Suggested fix:** Extract data source to a module (`app/data.py`) with `@lru_cache` or singleton.

### Gap 2: Duplicate B2B/B2C endpoints
**Severity:** 🟡 Medium
**Location:** `backend/app/routes.py` — `/api/metrics/b2b` and `/api/metrics/b2c` (lines 295–400)
**Impact:** These two endpoints are nearly identical, differing only by the `business_type` filter string. The `/api/metrics/summary` endpoint already supports `business_type` as a query parameter, making these endpoints redundant.
**Suggested fix:** Add `business_type` filter to `/api/metrics` and deprecate/remove `/api/metrics/b2b` and `/api/metrics/b2c`.

### Gap 3: CORS wide open
**Severity:** 🔴 High
**Location:** `backend/app/main.py` — `allow_origins=["*"]` + `allow_credentials=True`
**Impact:** In production, this allows any website to make authenticated requests to the API. The combination of `*` + `credentials=True` is also technically invalid per CORS spec.
**Suggested fix:** Use environment variable `CORS_ORIGINS` with fallback to `["http://localhost:5173"]`.

### Gap 4: Fetch without AbortController
**Severity:** 🟢 Low
**Location:** `frontend/src/App.tsx` — `useEffect` with `fetchFinancialData()`
**Impact:** If the component unmounts before the fetch completes, React will try to `setState` on an unmounted component, causing a warning.
**Suggested fix:** Add `AbortController` to the fetch call and clean up in the `useEffect` return.

### Gap 5: Generic HTML title
**Severity:** 🟢 Low
**Location:** `frontend/index.html` — `<title>frontend</title>`
**Impact:** The browser tab shows "frontend" instead of a meaningful dashboard name.
**Suggested fix:** Change to `<title>Financial Dashboard</title>`.

### Gap 6: No backend integration tests for comparison, alerts, summary endpoints
**Severity:** 🟢 Low
**Location:** `backend/tests/test_routes.py`
**Impact:** While 9 tests exist, endpoints like `/api/metrics/comparison`, `/api/metrics/alerts`, and `/api/metrics/summary` are not directly tested (only indirectly through the test client).
**Suggested fix:** Add dedicated tests for comparison delta calculations and alert detection logic.

---

## 🚀 Next Priorities

| Priority | Task | Rationale |
|---|---|---|
| **P1** | 🔴 Fix CORS configuration | Security risk — use env variable for allowed origins |
| **P2** | 🟡 Extract data source to singleton/cache | Reduce code duplication, prepare for DB migration |
| **P3** | 🟡 Remove duplicate B2B/B2C endpoints | Clean up API surface, reduce maintenance burden |
| **P4** | 🟢 Add AbortController to fetch | Prevent React warnings on unmount |
| **P5** | 🟢 Fix `<title>` tag | Improve UX in browser tabs |
| **P6** | 🟢 Add more backend tests | Increase coverage for comparison and alerts endpoints |

---

## Test Coverage Summary

### Backend (pytest)
```
9 passed in 0.83s
```
| Test | Status |
|---|---|
| `test_generate_mock_movements_returns_full_year_sorted_data` | ✅ |
| `test_filter_movements_by_date_includes_range_edges` | ✅ |
| `test_health_endpoint_returns_ok` | ✅ |
| `test_metrics_endpoint_respects_date_filters` | ✅ |
| `test_b2b_endpoint_only_returns_b2b_records` | ✅ |
| `test_b2c_endpoint_only_returns_b2c_records` | ✅ |
| `test_metrics_endpoint_filters_by_category` | ✅ |
| `test_metrics_endpoint_filters_by_operation_type` | ✅ |
| `test_b2b_endpoint_combines_new_filters` | ✅ |
| `test_metrics_facets_returns_filter_options_and_date_range` | ✅ |
| `test_metrics_summary_by_month_returns_balances` | ✅ |
| `test_metrics_summary_by_week_honors_business_type_filter` | ✅ |
| `test_top_categories_returns_limited_sorted_categories` | ✅ |
| `test_metrics_comparison_returns_delta_fields` | ✅ |
| `test_metrics_alerts_returns_anomaly_candidates` | ✅ |

### Frontend (Vitest)
```
Tests  3 passed (3)
```
| Test | Status |
|---|---|
| `computeKPIs` — calculates totals and profit values | ✅ |
| `computeKPIs` — returns 0 profitPercent when no income | ✅ |
| `computeMonthlyData` — returns chronological points with aggregated totals | ✅ |