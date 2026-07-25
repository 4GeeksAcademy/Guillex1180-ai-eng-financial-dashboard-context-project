# Tech Stack — Financial Metrics Dashboard

> **Last updated:** 2026-07-25
> **Evidence:** Verified against `package.json`, `requirements.txt`, `Dockerfile` (backend & frontend), `vite.config.ts`, `tsconfig.app.json`, `docker-compose.yml`

---

## Frontend

| Technology | Version | Purpose | Evidence |
|---|---|---|---|
| **React** | ^19.2.4 | UI library for building the dashboard components | `frontend/package.json` → `dependencies` |
| **TypeScript** | ~6.0.2 | Type-safe JavaScript with strict linting options | `frontend/package.json` → `devDependencies`; `tsconfig.app.json` has `noUnusedLocals`, `noUnusedParameters` |
| **Vite** | ^8.0.4 | Build tool and dev server with HMR | `frontend/package.json` → `devDependencies`; `vite.config.ts` |
| **Tailwind CSS** | ^4.2.2 | Utility-first CSS framework via Vite plugin | `frontend/package.json` → `devDependencies`; `@tailwindcss/vite` plugin in `vite.config.ts` |
| **Recharts** | ^3.8.1 | Charting library for line charts (Income/Outcome & Profit Margin) | `frontend/package.json` → `dependencies`; `income-outcome-chart.tsx`, `profit-percent-chart.tsx` |
| **Lucide React** | ^1.8.0 | Icon library for KPI card badges | `frontend/package.json` → `dependencies`; `kpi-row.tsx` imports `TrendingUp`, `TrendingDown`, `DollarSign`, `BarChart2` |
| **Vitest** | ^4.1.4 | Unit test runner | `frontend/package.json` → `devDependencies`; `financial-utils.test.ts` |

### Key Frontend Dependencies

| Package | Purpose |
|---|---|
| `class-variance-authority` (^0.7.1) | Utility for managing component variants |
| `clsx` (^2.1.1) | Conditional class name construction |
| `tailwind-merge` (^3.5.0) | Intelligent Tailwind class merging |
| `@vitejs/plugin-react` (^6.0.1) | Vite plugin for React Fast Refresh |
| `@tailwindcss/vite` (^4.2.2) | Vite plugin for Tailwind CSS v4 |
| `eslint` + `typescript-eslint` | TypeScript linting |
| `@vitest/coverage-v8` (^4.1.4) | Test coverage reporting |

---

## Backend

| Technology | Version | Purpose | Evidence |
|---|---|---|---|
| **Python** | 3.13-slim | Runtime | `backend/Dockerfile` → `FROM python:3.13-slim` |
| **FastAPI** | Latest | Web framework for REST API | `backend/requirements.txt` → `fastapi`; `app/main.py` uses `FastAPI()` |
| **Uvicorn** | Latest | ASGI server with `--reload` | `backend/requirements.txt` → `uvicorn[standard]`; `Dockerfile` CMD |
| **Pydantic** | (bundled with FastAPI) | Data validation via `BaseModel` | `backend/app/routes.py` → `FinancialMovement(BaseModel)`, `MetricsFacets`, etc. |
| **debugpy** | Latest | Debugger (port 5678) | `backend/requirements.txt` → `debugpy`; `Dockerfile` CMD with `--listen 0.0.0.0:5678` |

### Python Dependencies

| Package | Purpose |
|---|---|
| `fastapi` | Web framework |
| `uvicorn[standard]` | ASGI server |
| `debugpy` | Remote debugging |
| `pytest` | Test framework |
| `pytest-cov` | Test coverage |
| `httpx` | HTTP client (for FastAPI TestClient) |

---

## Infrastructure & Tooling

| Tool | Purpose | Evidence |
|---|---|---|
| **Docker** | Containerization of both services | `backend/Dockerfile`, `frontend/Dockerfile` |
| **Docker Compose** | Multi-service orchestration | `docker-compose.yml` — defines `frontend` and `backend` services |
| **Vite Proxy** | `/api` requests proxied to backend in development | `vite.config.ts` → `server.proxy: { "/api": { target: "http://backend:8000" } }` |
| **ESLint** | Code linting for frontend | `frontend/eslint.config.js` |
| **Git** | Version control | Repository root |

### Docker Compose Configuration

```yaml
# From docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    volumes: ["./frontend:/app", "/app/node_modules"]
    depends_on: [backend]

  backend:
    build: ./backend
    ports: ["8000:8000", "5678:5678"]
    volumes: ["./backend:/app"]
```

### Ports

| Port | Service | Purpose |
|---|---|---|
| 5173 | Frontend (Vite dev server) | Dashboard UI |
| 8000 | Backend (FastAPI + Uvicorn) | REST API |
| 5678 | Backend (debugpy) | Remote debugging |
| 8000/docs | Swagger UI | Interactive API documentation |

---

## Environment Variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Frontend (`.env`) | `""` (empty → uses Vite proxy) | Override backend origin |
| `CORS_ORIGINS` | Backend (not implemented) | `["*"]` (hardcoded) | ⚠️ Currently hardcoded, should be configurable |

---

## Scripts

### Frontend (`package.json`)

| Script | Command |
|---|---|
| `npm run dev` | `vite` (starts dev server) |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | `vitest run` |
| `npm run test:watch` | `vitest` |
| `npm run test:coverage` | `vitest run --coverage` |

### Backend (`Dockerfile` CMD)

| Command | Purpose |
|---|---|
| `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` | Start API with debugger and hot reload |