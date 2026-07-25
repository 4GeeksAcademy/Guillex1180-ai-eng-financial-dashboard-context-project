# Informe de Inspección Técnica Inicial

> **Proyecto:** `ai-eng-financial-dashboard-context-project`
> **Fecha:** 2026-07-25
> **Propósito:** Levantamiento técnico objetivo basado estrictamente en el código fuente disponible.

---

## 1. Visión General del Producto

La aplicación es un **Dashboard de Métricas Financieras** que permite visualizar indicadores clave de rendimiento (KPIs) de ingresos y gastos de una organización durante un año fiscal completo.

**Propósito principal:** Consumir datos financieros desde una API REST y presentarlos en un panel visual con:

- **4 KPI Cards:** Total Income, Total Outcome, Profit y Profit Margin (%).
- **Gráfico de líneas "Income vs. Outcome":** Evolución mensual de ingresos y egresos.
- **Gráfico de líneas "Profit Margin %":** Margen de ganancia mensual como porcentaje de los ingresos.

**Problemas financieros que aborda (según lógica de negocio):**

| Aspecto | Detalle |
|---|---|
| Segmentación | Los movimientos se clasifican por tipo de operación (`income`/`outcome`), categoría (`suppliers`, `sales`, `operational`, `administrative`, `others`) y tipo de negocio (`B2B`/`B2C`). |
| Alertas de gasto | Endpoint `/api/metrics/alerts` detecta periodos donde los gastos superan un umbral (por defecto 30%) sobre el promedio histórico. |
| Comparativa inter-período | Endpoint `/api/metrics/comparison` calcula la diferencia absoluta y porcentual del valor neto entre dos períodos. |
| Jerarquía de categorías | Endpoint `/api/metrics/categories/top` devuelve las categorías con mayor volumen por tipo de operación. |

> **⚠️ Dato importante:** Toda la información financiera es **generada aleatoriamente** mediante `random.seed(42)`. No existe conexión a una base de datos real ni integración con APIs externas de contabilidad. La aplicación es un **prototipo / demo técnica**.

---

## 2. Arquitectura y Entry Points

### 2.1 Backend

| Atributo | Valor |
|---|---|
| **Framework** | FastAPI (Python 3.13) |
| **Entry point** | `/backend/app/main.py` |
| **Servidor** | Uvicorn con hot-reload |
| **Puerto** | `8000` (además expone `5678` para debugpy) |
| **Middleware** | CORS abierto (`allow_origins=["*"]`) |

**Rutas API registradas (router en `routes.py`):**

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check simple |
| GET | `/api/metrics` | Lista completa de movimientos (con filtros opcionales por fecha, categoría, tipo) |
| GET | `/api/metrics/facets` | Facetas disponibles (tipos de operación, categorías, tipos de negocio, rango de fechas) |
| GET | `/api/metrics/summary` | Resumen agrupado (`day`, `week`, `month`) con income/outcome/net |
| GET | `/api/metrics/categories/top` | Top N categorías por tipo de operación |
| GET | `/api/metrics/comparison` | Comparativa entre dos períodos (neto actual vs anterior) |
| GET | `/api/metrics/alerts` | Alertas cuando gastos superan umbral sobre promedio histórico |
| GET | `/api/metrics/b2b` | Movimientos filtrados solo para negocio B2B |
| GET | `/api/metrics/b2c` | Movimientos filtrados solo para negocio B2C |

**Modelos Pydantic:** `FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison`, `MetricsAlert`.

**Generación de datos:** 360 movimientos simulados (30 por mes × 12 meses) con seed fija para reproducibilidad. La lógica asigna montos aleatorios entre 500 y 12,000 USD con una probabilidad de ingreso entre 45% y 70%.

**Tests:** Ubicados en `/backend/tests/` usando `pytest` y `httpx.TestClient`. Cubren endpoints principales y filtros.

### 2.2 Frontend

| Atributo | Valor |
|---|---|
| **Framework/Librería** | React 19 + TypeScript |
| **Build tool** | Vite 8 |
| **Estilos** | Tailwind CSS 4.2 |
| **Gráficos** | Recharts 3.8 |
| **Entry point** | `frontend/src/main.tsx` → renderiza `<App />` |
| **Proxy Vite** | `/api` → `http://backend:8000` (desarrollo) |
| **Enrutamiento** | No hay router — es una SPA de una sola página |
| **Tests** | Vitest 4 con cobertura (`@vitest/coverage-v8`) |

**Árbol de componentes:**

```
App.tsx
├── DashboardHeader        — Título "Financial Overview" + período
├── KPIRow                 — Grid de 4 KPIs
│   ├── KPICard (Total Income)
│   ├── KPICard (Total Outcome)
│   ├── KPICard (Profit)
│   └── KPICard (Profit Margin)
├── IncomeOutcomeChart     — Gráfico de líneas con recharts
└── ProfitPercentChart     — Gráfico de líneas + ReferenceLine en y=0
```

**Lógica de negocio (frontend):**

| Archivo | Función |
|---|---|
| `financial-types.ts` | Interfaces compartidas (`FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint`) |
| `financial-utils.ts` | `computeKPIs()`, `computeMonthlyData()`, `formatCurrency()`, `formatPercent()` |
| `mock-data.ts` | Dataset estático de 50 movimientos mock (no se usa en producción; el backend genera los datos) |

---

## 3. Servicios e Integraciones

| Servicio | Backend | Frontend | Puerto(s) |
|---|---|---|---|
| **Backend API (FastAPI)** | ✅ App principal | Se consume vía fetch | `8000` (HTTP), `5678` (debug) |
| **Frontend (Vite dev server)** | — | App principal | `5173` |
| **Base de datos** | ❌ **No existe** | — | — |
| **Redis / Caché** | ❌ No implementado | — | — |
| **API externa** | ❌ No implementado | — | — |

**Variables de entorno detectadas:**

| Variable | Uso | ¿Obligatoria? |
|---|---|---|
| `VITE_API_BASE_URL` | Override de URL base para fetch (frontend). Se lee en `App.tsx` | No (default: `""`, usa proxy de Vite) |

No se detectaron variables de entorno para el backend. La aplicación no requiere configuración de bases de datos, APIs externas ni secretos.

**Conexión frontend ↔ backend (desarrollo):**
1. **Proxy de Vite** (por defecto): `/api` → `http://backend:8000` (gracias a Docker Compose y `depends_on`).
2. **Variable de entorno `VITE_API_BASE_URL`**: Permite apuntar a un origen diferente.

---

## 4. Hallazgos Iniciales

### Discrepancias entre documentación y código real

| # | Hallazgo | Referencia | Estado |
|---|---|---|---|
| 1 | **Directorios de agente faltantes:** `AGENTS.md` instruye buscar reglas en `./.agents/rules/` y skills en `./.agents/skills/`, pero **ninguno de estos directorios existe** en el repositorio. | `AGENTS.md` | 🔴 Vacío documentado |
| 2 | **Memory Bank ausente:** `AGENTS.md` referencia `./memory-bank/` como posible ubicación de memoria del proyecto, pero **el directorio no existe**. | `AGENTS.md` | 🔴 Vacío documentado |
| 3 | **Sin base de datos real:** La documentación no aclara explícitamente que se trata de un prototipo con datos simulados (mock). No hay schema SQL, migraciones ni conexión a Postgres u otra DB. | Código (`routes.py` genera datos con `random`) | ⚠️ Omisión relevante |
| 4 | **Puerto 5678 no documentado:** El backend expone el puerto `5678` para `debugpy` en `docker-compose.yml`, pero no se menciona en ningún README. | `docker-compose.yml` vs `README.md` | ⚠️ Documentación incompleta |
| 5 | **`frontend/.env.example` no encontrado:** El README menciona copiar `frontend/.env.example` si se necesita configurar `VITE_API_BASE_URL`, pero el archivo **no existe** en el repositorio. | `README.md` vs estructura de archivos | 🔴 Archivo faltante |
| 6 | **Mock data duplicado:** El frontend contiene `mock-data.ts` con 50 movimientos estáticos, pero este archivo **no es utilizado** por `App.tsx` (que consume datos del backend). Es código muerto o sobrante. | `frontend/src/lib/mock-data.ts` | ⚠️ Código no referenciado |

### Vacíos técnicos observados

- **Sin manejo de errores robusto:** el frontend atrapa errores del fetch pero solo muestra un mensaje genérico.
- **Sin paginación:** el endpoint `/api/metrics` devuelve 360 registros en una sola respuesta.
- **Sin autenticación/autorización:** CORS abierto, sin JWT ni API keys.
- **Sin SSR/SSG:** La app es completamente client-side.
- **Sin tests en frontend para componentes visuales:** solo existen tests unitarios para `financial-utils.ts`.

---

## Resumen Ejecutivo

La aplicación es un **prototipo funcional de dashboard financiero** con una arquitectura limpia de dos capas (frontend React + backend FastAPI) orquestada con Docker Compose. Su propósito es demostrar visualización de KPIs financieros con datos simulados. Para llevarlo a producción, sería necesario:

1. Reemplazar los datos mock por una base de datos real.
2. Implementar autenticación y autorización.
3. Agregar paginación y tests de integración.
4. Crear los directorios y archivos de documentación para agentes (`./.agents/` y `./memory-bank/`).
5. Agregar el archivo `.env.example` faltante.
6. Limpiar el código muerto (`mock-data.ts`).
