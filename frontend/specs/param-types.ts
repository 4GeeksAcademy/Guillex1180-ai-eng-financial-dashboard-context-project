/**
 * Query parameter types for the Financial Dashboard API.
 *
 * These interfaces define the typed objects used to build query strings
 * for each endpoint. All date strings follow the ISO 8601 short format
 * (`YYYY-MM-DD`).
 *
 * Three functionalities are covered:
 *  1. DateRangeFilter   — shared by all date-filtered endpoints
 *  2. AlertsParams      — threshold + date range for anomaly detection
 *  3. TopCategoriesParams — operation type + limit + date range for
 *                           top-category breakdowns
 */

// ──────────────────────────────────────────────
// Shared enums / literals (re-exported for convenience)
// ──────────────────────────────────────────────

import type { BusinessType, GroupBy, OperationType } from './api-types';

// ──────────────────────────────────────────────
// 1. DateRangeFilter  (shared across functionalities)
// ──────────────────────────────────────────────

/**
 * Optional date-range filter shared by most dashboard endpoints.
 *
 * @property start_date - Inclusive start of the range, ISO 8601 (`YYYY-MM-DD`).
 *                        When omitted the API returns data from the earliest record.
 * @property end_date   - Inclusive end of the range, ISO 8601 (`YYYY-MM-DD`).
 *                        When omitted the API returns data up to the latest record.
 *
 * @example
 * ```ts
 * const filter: DateRangeFilter = {
 *   start_date: '2024-01-01',
 *   end_date: '2024-06-30',
 * };
 * ```
 */
export interface DateRangeFilter {
  /** Inclusive start of the range, ISO 8601 (`YYYY-MM-DD`). */
  start_date?: string;
  /** Inclusive end of the range, ISO 8601 (`YYYY-MM-DD`). */
  end_date?: string;
}

// ──────────────────────────────────────────────
// 2. AlertsParams  (GET /api/metrics/alerts)
// ──────────────────────────────────────────────

/**
 * Query parameters for the outcome anomaly alerts endpoint.
 *
 * @property threshold   - Minimum relative increase over baseline to trigger an alert.
 *                         Default: `0.3` (30 %). Must be ≥ 0.
 * @property group_by    - Aggregation granularity: `"day"`, `"week"`, or `"month"`.
 *                         Default: `"month"`.
 * @property business_type - Optional filter by business customer type.
 * @property start_date  - Inclusive start of the range, ISO 8601 (`YYYY-MM-DD`).
 * @property end_date    - Inclusive end of the range, ISO 8601 (`YYYY-MM-DD`).
 *
 * @example
 * ```ts
 * const params: AlertsParams = {
 *   threshold: 0.5,
 *   group_by: 'month',
 *   start_date: '2024-01-01',
 *   end_date: '2024-12-31',
 * };
 * ```
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum relative increase over baseline to trigger an alert.
   * Default: `0.3` (30 %). Must be ≥ 0.
   */
  threshold?: number;
  /**
   * Aggregation granularity: `"day"`, `"week"`, or `"month"`.
   * Default: `"month"`.
   */
  group_by?: GroupBy;
  /** Optional filter by business customer type (`"B2B"` | `"B2C"`). */
  business_type?: BusinessType;
}

// ──────────────────────────────────────────────
// 3. TopCategoriesParams  (GET /api/metrics/categories/top)
// ──────────────────────────────────────────────

/**
 * Query parameters for the top categories endpoint.
 *
 * @property operation_type - Operation type to aggregate (`"income"` | `"outcome"`).
 *                            Default: `"outcome"`.
 * @property limit          - Maximum number of categories to return (1–20).
 *                            Default: `5`.
 * @property business_type  - Optional filter by business customer type.
 * @property start_date     - Inclusive start of the range, ISO 8601 (`YYYY-MM-DD`).
 * @property end_date       - Inclusive end of the range, ISO 8601 (`YYYY-MM-DD`).
 *
 * @example
 * ```ts
 * const params: TopCategoriesParams = {
 *   operation_type: 'income',
 *   limit: 10,
 *   business_type: 'B2B',
 *   start_date: '2024-01-01',
 *   end_date: '2024-06-30',
 * };
 * ```
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation type to aggregate (`"income"` | `"outcome"`).
   * Default: `"outcome"`.
   */
  operation_type?: OperationType;
  /**
   * Maximum number of categories to return. Must be between 1 and 20.
   * Default: `5`.
   */
  limit?: number;
  /** Optional filter by business customer type (`"B2B"` | `"B2C"`). */
  business_type?: BusinessType;
}