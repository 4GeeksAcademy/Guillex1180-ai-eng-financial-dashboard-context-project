# Resumen Inicial del Handover — Dashboard Financiero

> **Repositorio:** `4GeeksAcademy/ai-eng-financial-dashboard-context-project`
> **Fecha del análisis:** 2026-07-25
> **Propósito:** Documentar el estado técnico del repositorio para facilitar la incorporación al proyecto.

---

## 1. Resumen General del Producto

**Dashboard Financiero** es una aplicación web de una sola página (SPA) que visualiza métricas financieras clave de una organización a lo largo de un año fiscal completo. Su objetivo es presentar indicadores de rendimiento (KPIs) de ingresos y egresos mediante gráficos y tarjetas informativas.

### Funcionalidades principales

| Funcionalidad | Descripción |
|---|---|
| **KPIs globales** | Total de ingresos, total de egresos, ganancia neta y margen de ganancia (%) |
| **Gráfico Income vs. Outcome** | Evolución mensual comparando ingresos y egresos (gráfico de líneas con Recharts) |
| **Gráfico Profit Margin %** | Margen de ganancia mensual como porcentaje de los ingresos |
| **Filtros por tipo de negocio** | Endpoints diferenciados para B2B y B2C |
| **Alertas de gasto** | Detección de períodos donde los gastos superan un umbral sobre el promedio histórico |
| **Comparativa inter-períodos** | Diferencia absoluta y porcentual del valor neto entre dos rangos de fechas |
| **Top categorías** | Categorías con mayor volumen de operaciones por tipo (ingreso/gasto) |

> **⚠️ Dato crítico:** Todos los datos financieros son **simulados** mediante `random.seed(42)`. No existe conexión a base de datos real ni integración con APIs de contabilidad. El proyecto es un **prototipo/demo técnica**.

---

## 2. Arquitectura y Estructura del Repositorio

### Estructura general de carpetas

```
ai-eng-financial-dashboard-context-project/
├── README.md                          # Documentación principal (inglés)
├── README.es.md                       # Documentación en español
├── AGENTS.md                          # Guía para agentes de IA
├── docker-compose.yml                 # Orquestación de servicios
│
├── backend/                           # ── BACKEND ─────────────────
│   ├── Dockerfile                     #   Imagen Python 3.13-slim
│   ├── requirements.txt               #   Dependencias Python
│   ├── app/
│   │   ├── __init__.py                #   Package marker
│   │   ├── main.py                    #   Entry point de FastAPI
│   │   └── routes.py                  #   Rutas y lógica de negocio
│   └── tests/
│       ├── conftest.py                #   Configuración de pytest
│       └── test_routes.py             #   Tests de endpoints
│
└── frontend/                          # ── FRONTEND ────────────────
    ├── Dockerfile                     #   Imagen Node para build
    ├── package.json                   #   Dependencias y scripts
    ├── vite.config.ts                 #   Configuración de Vite
    ├── tsconfig*.json                 #   Configuración TypeScript
    ├── eslint.config.js               #   Configuración de ESLint
    ├── index.html                     #   HTML principal
    ├── components.json                #   Configuración shadcn/ui
    └── src/
        ├── main.tsx                   #   Entry point React
        ├── App.tsx                    #   Componente raíz
        ├── index.css                  #   Estilos globales (Tailwind)
        ├── assets/                    #   Recursos estáticos
        │
        ├── components/
        │   ├── dashboard/             #   Componentes del dashboard
        │   │   ├── dashboard-header.tsx
        │   │   ├── kpi-row.tsx
        │   │   ├── kpi-card.tsx
        │   │   ├── income-outcome-chart.tsx
        │   │   └── profit-percent-chart.tsx
        │   └── ui/                    #   Componentes base (shadcn/ui)
        │       ├── card.tsx
        │       └── skeleton.tsx
        │
        └── lib/                       #   Lógica compartida
            ├── financial-types.ts     #   Interfaces TypeScript
            ├── financial-utils.ts     #   Funciones de cálculo
            ├── financial-utils.test.ts#   Tests unitarios (Vitest)
            ├── mock-data.ts           #   Datos mock (no utilizado)
            └── utils.ts              #   Utilidad `cn()` (clsx+twMerge)
```

### Backend — Stack técnico

| Componente | Tecnología |
|---|---|
| Framework | FastAPI (Python 3.13) |
| Servidor ASGI | Uvicorn con `--reload` |
| Debugger | debugpy (puerto 5678) |
| Testing | pytest + pytest-cov + httpx.TestClient |
| Dependencias | 6 paquetes (sin BD, sin ORM, sin cache) |

### Frontend — Stack técnico

| Componente | Tecnología |
|---|---|
| UI Framework | React 19 + TypeScript 6.0 |
| Build tool | Vite 8 |
| Estilos | Tailwind CSS 4.2 |
| Gráficos | Recharts 3.8 |
| Íconos | Lucide React |
| Testing | Vitest 4 + @vitest/coverage-v8 |
| Componentes base | shadcn/ui (Card, Skeleton) |
| Utilidades | clsx + tailwind-merge (función `cn()`) |

---

## 3. Entry Points Clave

### Backend: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(title="Financial Metrics API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
app.include_router(router)
```

- Arranca con `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Incluye el router con **9 endpoints REST** (ver sección 4)
- CORS abierto (`allow_origins=["*"]`)

### Frontend: `frontend/src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
)
```

- No hay enrutador (react-router) — es SPA de una sola página
- `App.tsx` consume la API y renderiza todo el dashboard
- Vite sirve en puerto 5173 con proxy para `/api`

### Infraestructura: `docker-compose.yml`

```yaml
services:
  frontend:  # → build: ./frontend → puerto 5173
  backend:   # → build: ./backend  → puertos 8000 y 5678
```

---

## 4. Flujo de Datos y Conexión de Servicios

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                               │
│                                                                  │
│  ┌──────────────┐    Proxy Vite     ┌──────────────┐            │
│  │  Frontend    │  /api → backend   │  Backend     │            │
│  │  React + Vite│ ◄──────────────►  │  FastAPI     │            │
│  │  localhost:  │                   │  localhost:  │            │
│  │  5173        │                   │  8000        │            │
│  └──────┬───────┘                   └──────┬───────┘            │
│         │                                  │                    │
│         │ fetch('/api/metrics')            │                    │
│         │                                  ▼                    │
│         │                        ┌──────────────────┐           │
│         │                        │  generate_mock_  │           │
│         │                        │  movements(seed= │           │
│         │                        │  42)             │           │
│         │                        │                  │           │
│         │                        │  NO HAY BD REAL  │           │
│         │                        └──────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Endpoints de la API REST

| Método | Ruta | Parámetros clave |
|---|---|---|
| GET | `/health` | — |
| GET | `/api/metrics` | `start_date`, `end_date`, `category`, `operation_type` |
| GET | `/api/metrics/facets` | — (devuelve metadatos disponibles) |
| GET | `/api/metrics/summary` | `group_by`, `start_date`, `end_date`, `category`, `operation_type`, `business_type` |
| GET | `/api/metrics/categories/top` | `operation_type`, `limit`, `start_date`, `end_date`, `business_type` |
| GET | `/api/metrics/comparison` | `start_date` (req), `end_date` (req), `business_type` |
| GET | `/api/metrics/alerts` | `threshold`, `group_by`, `start_date`, `end_date`, `business_type` |
| GET | `/api/metrics/b2b` | `start_date`, `end_date`, `category`, `operation_type` |
| GET | `/api/metrics/b2c` | `start_date`, `end_date`, `category`, `operation_type` |

> **Total: 9 endpoints** registrados en el router (`backend/app/routes.py`).

### Variables de entorno

| Variable | Ámbito | Propósito | ¿Requerida? |
|---|---|---|---|
| `VITE_API_BASE_URL` | Frontend | Override de URL base para fetch | No (usa proxy) |
| *(ninguna)* | Backend | Zero configuración de entorno | — |

---

## 5. Validación del Resumen vs Código Real

### Metodología

Se verificó cada afirmación del resumen contra el código fuente del repositorio. Se revisaron los siguientes archivos como evidencia directa:

- `backend/app/main.py` — entry point y middleware
- `backend/app/routes.py` — 9 endpoints, modelos Pydantic, generación de datos mock
- `backend/tests/test_routes.py` — 9 tests funcionales
- `frontend/src/App.tsx` — componente raíz, fetch de datos, renderizado
- `frontend/src/lib/financial-utils.ts` — funciones `computeKPIs`, `computeMonthlyData`, formateo
- `frontend/src/lib/financial-types.ts` — interfaces TypeScript
- `frontend/src/lib/mock-data.ts` — 50 movimientos estáticos (no usado)
- `frontend/src/index.css` — variables CSS, tema dark/light, colores
- `frontend/vite.config.ts` — proxy, alias, plugins
- `frontend/package.json` — dependencias y scripts
- `frontend/Dockerfile` — `node:24-alpine`
- `frontend/components.json` — configuración shadcn/ui
- `docker-compose.yml` — 2 servicios, puertos, volúmenes
- `README.md` y `README.es.md` — documentación
- `AGENTS.md` — guía de agentes

### Resultado de la validación

| Afirmación del resumen | Verificación | Evidencia |
|---|---|---|
| **9 endpoints REST** (corregido de 8) | ✅ Corregido | `routes.py` líneas 280-400: 9 decoradores `@router.get` |
| Frontend: React 19 + TypeScript | ✅ Correcto | `package.json`: `"react": "^19.2.4"`, `"typescript": "~6.0.2"` |
| Build tool: Vite 8 | ✅ Correcto | `package.json`: `"vite": "^8.0.4"` |
| Gráficos: Recharts 3.8 | ✅ Correcto | `package.json`: `"recharts": "^3.8.1"` |
| Backend: FastAPI + Python 3.13 | ✅ Correcto | `Dockerfile`: `FROM python:3.13-slim` |
| Puerto debug 5678 | ✅ Correcto | `docker-compose.yml`: `"5678:5678"` |
| Datos mock con seed=42 | ✅ Correcto | `routes.py` línea 295: `generate_mock_movements(seed=42)` |
| 360 movimientos (30/mes × 12) | ✅ Correcto | `routes.py` línea 103: `for _ in range(30)` por cada mes |
| Sin BD, sin Redis, sin APIs externas | ✅ Correcto | `requirements.txt` no contiene drivers de BD ni clientes Redis |
| `mock-data.ts` no usado | ✅ Correcto | `App.tsx` no lo importa; solo existe como archivo |
| Sin enrutador (SPA single page) | ✅ Correcto | `App.tsx` no usa react-router ni hay dependencia en `package.json` |
| `VITE_API_BASE_URL` como variable de entorno | ✅ Correcto | `App.tsx` línea 9: `import.meta.env.VITE_API_BASE_URL` |
| shadcn/ui con estilo New York | ✅ Correcto | `components.json`: `"style": "new-york"` |
| `assets/` como carpeta de recursos | ⚠️ Matizado | Existe pero está vacía — no contiene archivos |
| `index.html` título "frontend" | ⚠️ Matizado | El título es placeholder, no descriptivo |

### Correcciones aplicadas

| Corrección | Detalle |
|---|---|
| **Endpoint count** | Se corrigió de "8 endpoints" a **"9 endpoints"** en secciones 1 y 3 |
| **Tabla de endpoints** | Se agregó nota al pie: *"Total: 9 endpoints registrados en el router"* |

### Notas menores (no requirieron corrección)

- El `index.html` tiene `<title>frontend</title>` (placeholder, no impacta funcionalidad)
- `assets/` está vacío; no hay recursos estáticos
- `Dockerfile` del frontend usa `node:24-alpine` (no `node:24` directamente)
- `eslint.config.js` usa el nuevo formato plano (`eslint.config` → `defineConfig`)

---

## 6. Puntos de Atención / Hallazgos Clave

### 🔴 Discrepancias documentación vs. código real

1. **Directorios de agente faltantes**: `AGENTS.md` indica buscar reglas en `./.agents/rules/` y skills en `./.agents/skills/`, pero **ninguno existe**.
2. **Memory Bank ausente**: `AGENTS.md` referencia `./memory-bank/` que **no existe**.
3. **`.env.example` faltante**: README menciona `frontend/.env.example` pero el archivo **no está presente**.
4. **Puerto debug no documentado**: El puerto `5678` (debugpy) se expone en Docker pero no se menciona en READMEs.

### ⚠️ Observaciones técnicas

5. **Datos 100% simulados**: El backend genera 360 movimientos aleatorios (30 por mes × 12 meses). No hay persistencia ni schema de BD.
6. **Código muerto**: `frontend/src/lib/mock-data.ts` contiene 50 movimientos estáticos pero **no es usado** por `App.tsx`. Es código sobrante.
7. **Sin autenticación**: CORS abierto, sin JWT, sin API keys — no apto para producción.
8. **Sin paginación**: El endpoint principal devuelve todos los 360 registros en una sola respuesta.
9. **Tests solo unitarios**: Los tests del frontend solo cubren `financial-utils.ts`; no hay tests de componentes visuales.
10. **Sin enrutamiento**: La app no tiene react-router ni múltiples páginas.

### Archivos que requieren inspección prioritaria

| Archivo | Razón |
|---|---|
| `AGENTS.md` | Define las reglas de trabajo para agentes de IA — hay que crear los directorios que referencia |
| `backend/app/routes.py` | Contiene toda la lógica de negocio y generación de datos |
| `frontend/src/App.tsx` | Orquestador principal del frontend |
| `frontend/src/lib/financial-utils.ts` | Cálculos de KPIs y formateo |
| `frontend/src/lib/mock-data.ts` | Candidato a limpieza o refactorización |
| `docker-compose.yml` | Define la orquestación de servicios |
| `frontend/vite.config.ts` | Configuración del proxy y aliases |
| `backend/tests/test_routes.py` | Suite de tests del backend |

---

*Documento generado como parte de la Fase 1 — Comprensión del Handover. Validado contra el código fuente del repositorio el 2026-07-25.*
