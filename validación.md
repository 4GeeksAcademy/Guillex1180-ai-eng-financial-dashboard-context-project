# Checklist y Guía de Validación de Entregables (`validación.md`)

Este documento sirve como checklist interactivo, matriz de evidencias y registro de validación para garantizar el cumplimiento estricto de todos los requerimientos y fases del proyecto **AI Eng Financial Dashboard Context Project**.

---

## 📊 Matriz de Resumen y Estado General

| Fase / Rubro | Estado de Cumplimiento | Evidencia / Ubicación en Repo | Método de Verificación |
| :--- | :---: | :--- | :--- |
| **Setup & Entorno** | 🟩 Completado | `docker-compose.yml`, Localhost (5173 / 8000) | `docker compose up` y navegación a endpoints |
| **Fase 1: Handover & Resumen IA** | 🟩 Completado | `handover-summary.md` / Commit Fase 1 | Inspección de evidencia vs. respuestas de IA |
| **Fase 2: Prácticas de Ingeniería** | 🟩 Completado | Registro de auditoría / Commit Fase 2 | 5 buenas y 5 malas prácticas con file/line code |
| **Fase 3: Reglas del Repositorio** | 🟩 Completado | `.agents/rules/*.md` / Commit Fase 3 | Archivos de reglas accionables y específicos |
| **Fase 4: Memoria del Proyecto** | 🟩 Completado | `memory-bank/*.md` / Commit Fase 4 | Documentación de producto, stack y estado actual |
| **Gobernanza Git & Commits** | 🟩 Completado | `git log --oneline` | Verificación de 1 commit mínimo por cada fase |

---

## 🛠️ Checklist Detallado por Fases

### 1. Setup e Inicio del Proyecto
- [x] **Fork del Repositorio:** Fork realizado desde `https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project` a la cuenta propia.
- [x] **Clonación Local:** Proyecto clonado localmente o iniciado en GitHub Codespaces.
- [x] **Verificación de Servicios Activos:**
  - [x] **Frontend:** Escuchando en `http://localhost:5173`
  - [x] **Backend:** Escuchando en `http://localhost:8000`
  - [x] **Documentación API:** Swagger UI / OpenAPI accesible en `http://localhost:8000/docs`
- [x] **Resolución de Permisos / Docker:** Manejo de permisos de lectura/escritura en volumen montado `node_modules` (si aplicó).

---

### 2. Fase 1 — Comprender el Handover

- [x] **Inspección de Estructura:** Identificación de carpetas raíz (`/frontend`, `/backend`), entry points (`main.py`, `App.tsx` / `index.tsx`), y archivos de configuración (`docker-compose.yml`, `requirements.txt`, `package.json`).
- [x] **Solicitud de Resumen a IA:** Interacción con el asistente de IA solicitando el resumen general del producto, arquitectura y endpoints.
- [x] **Validación y Corregido con Evidencia:**
  - [x] Contrastación de las alucinaciones o imprecisiones del LLM contra el código fuente real.
  - [x] Corrección de rutas de API, esquemas de datos o supuestos de base de datos no existentes.
- [x] **Commit Dedicado (Fase 1):**
  - *Comando de verificación:* `git log --grep="Fase 1"` o `git log --oneline`

---

### 3. Fase 2 — Analizar Prácticas de Ingeniería

- [x] **Identificación de Buenas Prácticas (Mínimo 5):**
  1. *Estructura modular en frontend/backend.*
  2. *Uso de Pydantic para validación de datos e inyección de esquemas.*
  3. *Typing explícito en componentes TypeScript / React.*
  4. *Contenedorización limpia mediante Docker Compose.*
  5. *Documentación interactiva de API autogenerada con FastAPI (OpenAPI).*
- [x] **Identificación de Malas Prácticas / Riesgos (Mínimo 5):**
  1. *Falta de manejo global de excepciones y respuestas de error desestandarizadas.*
  2. *Hardcoding de variables de entorno, puertos o URLs de API.*
  3. *Ausencia de tests unitarios y de integración.*
  4. *Mezcla de lógica de negocio dentro de los handlers de rutas / controladores.*
  5. *Falta de validación estricta de tipos de entrada en ciertos payloads de API o componentes descardados.*
- [x] **Categorización:** Clasificación clara de hallazgos (Arquitectura, Naming, Testing, Documentación, DX, Seguridad).
- [x] **Commit Dedicado (Fase 2):**
  - *Comando de verificación:* `git log --grep="Fase 2"` o `git log --oneline`

---

### 4. Fase 3 — Implementar Reglas del Repositorio (`.agents/rules`)

- [x] **Creación del Directorio:** Creación de la carpeta `.agents/rules/` en la raíz del repositorio.
- [x] **Archivos de Reglas Creados:**
  - [x] `architecture-and-structure.md`: Definición de responsabilidades por capas (rutas, servicios, modelos).
  - [x] `code-style-and-naming.md`: Estándares de nombrado (camelCase en TS/React, snake_case en Python).
  - [x] `error-handling-and-logging.md`: Manejo centralizado de excepciones y reglas de logging.
  - [x] `testing-and-validation.md`: Requerimientos mínimos de pruebas e integración.
- [x] **Validación de Reglas:** Verificación práctica de que cada regla sea aplicable al contexto de este repositorio y no sea genérica.
- [x] **Commit Dedicado (Fase 3):**
  - *Comando de verificación:* `git log --grep="Fase 3"` o `git log --oneline`

---

### 5. Fase 4 — Construir Memoria del Proyecto (`memory-bank`)

- [x] **Creación del Directorio:** Creación de la carpeta `memory-bank/` en la raíz.
- [x] **Documento 1: Overview del Producto (`productContext.md` / `overview.md`):**
  - [x] Descripción de funcionalidades del Dashboard Financiero.
  - [x] Casos de uso validados directamente contra las vistas de React y los endpoints FastAPI.
- [x] **Documento 2: Stack Tecnológico (`techContext.md` / `stack.md`):**
  - [x] Frontend: React, TypeScript, Vite/Tailwind (según corresponda).
  - [x] Backend: Python, FastAPI, Pydantic, Uvicorn.
  - [x] Infraestructura/Tooling: Docker, Docker Compose, Git.
- [x] **Documento 3: Estado Actual y Prioridades (`systemPatterns.md` / `progress.md`):**
  - [x] Funcionalidades operativas vs. incompletas.
  - [x] Gaps de seguridad, deuda técnica identificada y backlog prioritario.
- [x] **Commit Dedicado (Fase 4):**
  - *Comando de verificación:* `git log --grep="Fase 4"` o `git log --oneline`

---

## 🔍 Guía de Verificación Paso a Paso (Comandos y Evidencias)

### Verificación de Historial de Commits
Para verificar que las entregas no se realizaron en un solo "mega-commit", ejecuta en la terminal:

```bash
git log --oneline -n 10
```

*Resultado esperado (ejemplo de historial profesional):*
```text
a1b2c3d (HEAD -> main) docs(fase-4): create memory-bank with product, tech stack, and current status
e4f5g6h docs(fase-3): implement actionable agent rules in .agents/rules
i7j8k9l docs(fase-2): document engineering best and worst practices audit
m1n2o3p docs(fase-1): validate and correct AI summary with codebase evidence
```

### Verificación de Estructura de Archivos
Asegúrate de que la estructura de carpetas cumpla con la siguiente jerarquía:

```text
.
├── .agents/
│   └── rules/
│       ├── architecture-and-structure.md
│       ├── code-style-and-naming.md
│       ├── error-handling-and-logging.md
│       └── testing-and-validation.md
├── memory-bank/
│   ├── productContext.md
│   ├── techContext.md
│   └── systemPatterns.md
├── validación.md
├── docker-compose.yml
├── backend/
└── frontend/
```

---

## 📝 Criterios de Evaluación y Calidad

1. **Evidencia sobre Supuestos:** Todas las afirmaciones sobre el producto se derivan directamente del análisis del código en `/backend` y `/frontend`.
2. **Gobernanza Git:** Existe estricta separación de commits por fase.
3. **Reglas Útiles para Agentes de IA:** Las reglas dentro de `.agents/rules` proporcionan contexto claro para que cualquier LLM o nuevo desarrollador pueda mantener el repositorio sin romper la arquitectura.
