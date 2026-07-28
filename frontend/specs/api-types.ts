/**
 * API response types for the Financial Dashboard backend.
 *
 * These interfaces mirror the Pydantic models defined in
 * `backend/app/routes.py` and represent the JSON shapes returned
 * by each endpoint.
 *
 * Three core functionalities are covered:
 *  1. Facets (date range + B2B/B2C view) → FacetsResponse
 *  2. Anomalies (alerts table)           → AlertEntry, AlertsResponse
 *  3. Top categories (B2B vs B2C table)  → CategoryEntry, TopCategoriesResponse
 */

// ──────────────────────────────────────────────
// Shared enums / literals
// ──────────────────────────────────────────────

/** Income or outcome operation. */
export type OperationType = 'income' | 'outcome';

/** Financial movement category. */
export type Category =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others';

/** Business customer type. */
export type BusinessType = 'B2B' | 'B2C';

/** Aggregation granularity for summary endpoints. */
export type GroupBy = 'day' | 'week' | 'month';

// ──────────────────────────────────────────────
// 1. Facets  (GET /api/metrics/facets)
//    Used by the date-range picker reference and
//    the B2B vs B2C comparative view.
// ──────────────────────────────────────────────

/**
 * Available filter facets for the full dataset.
 *
 * @property operation_types - All operation types present in data (e.g. `["income", "outcome"]`).
 * @property business_types  - All business types present in data (e.g. `["B2B", "B2C"]`).
 * @property categories      - All categories present in data (e.g. `["administrative", "operational", "others", "sales", "suppliers"]`).
 * @property min_date        - Earliest `create_date` in the dataset, ISO 8601 format (`YYYY-MM-DD`).
 * @property max_date        - Latest `create_date` in the dataset, ISO 8601 format (`YYYY-MM-DD`).
 */
export interface FacetsResponse {
  operation_types: OperationType[];
  business_types: BusinessType[];
  categories: Category[];
  min_date: string;
  max_date: string;
}

// ──────────────────────────────────────────────
// 2. Anomalies / alerts  (GET /api/metrics/alerts)
//    Used by the anomalies table in the dashboard.
// ──────────────────────────────────────────────

/**
 * A single outcome anomaly alert.
 *
 * @property period           - Period identifier (e.g. `"2024-03"`, `"2024-W10"`, `"2024-03-15"`).
 * @property outcome_total    - Total outcome amount for the period.
 * @property baseline_average - Average outcome of all preceding periods.
 * @property increase_ratio   - Relative increase over baseline: `(outcome_total - baseline_average) / baseline_average`.
 */
export interface AlertEntry {
  period: string;
  outcome_total: number;
  baseline_average: number;
  increase_ratio: number;
}

/**
 * List of outcome anomaly alerts.
 * Returned by `GET /api/metrics/alerts`.
 */
export type AlertsResponse = AlertEntry[];

// ──────────────────────────────────────────────
// 3. Top categories  (GET /api/metrics/categories/top)
//    Used by the B2B vs B2C comparative table.
// ──────────────────────────────────────────────

/**
 * A single category breakdown entry.
 *
 * @property category       - Movement category (e.g. `"suppliers"`, `"sales"`).
 * @property operation_type - Whether this aggregates income or outcome movements.
 * @property total_amount   - Sum of amounts for this category/operation-type combination.
 */
export interface CategoryEntry {
  category: Category;
  operation_type: OperationType;
  total_amount: number;
}

/**
 * List of top category entries, ordered by `total_amount` descending.
 * Returned by `GET /api/metrics/categories/top`.
 */
export type TopCategoriesResponse = CategoryEntry[];