# Fase 2 — Análisis de Calidad de Código y Prácticas de Ingeniería

> **Proyecto:** Dashboard Financiero  
> **Fecha:** 2026-07-25  
> **Propósito:** Identificar buenas y malas prácticas de ingeniería en el repositorio, con evidencia directa del código fuente y propuestas de mejora.

---

## 1. Buenas Prácticas Encontradas

### BP1. Tipado estricto con TypeScript y Literals en backend

**Archivo:** `backend/app/routes.py` (líneas 10–14)  
**Evidencia:**
```python
OperationType = Literal["income", "outcome"]
Category = Literal["suppliers", "sales", "operational", "administrative", "others"]
BusinessType = Literal["B2B", "B2C"]
GroupBy = Literal["day", "week", "month"]
```

**Beneficio:** Usar `Literal` de Python restringe los valores posibles a un conjunto cerrado, evitando errores por strings mal escritos. Esto es equivalente a un `enum` pero con la sintaxis más ligera de `typing`. Además, FastAPI genera automáticamente documentación OpenAPI precisa con los valores permitidos, mejorando la DX de quien consume la API.

---

### BP2. Modelos Pydantic con validación explícita en endpoints

**Archivo:** `backend/app/routes.py` (líneas 18–55) y cada endpoint usa `response_model`  
**Evidencia:**
```python
class FinancialMovement(BaseModel):
    create_date: date
    amount: float
    operation_type: OperationType
    category: Category
    business_type: BusinessType

@router.get("/api/metrics", response_model=list[FinancialMovement])
```

**Beneficio:** Todos los endpoints declaran explícitamente `response_model`, lo que garantiza que FastAPI serialice y valide la respuesta contra el schema. Esto previene fugas de datos, asegura tipos consistentes y genera documentación OpenAPI completa automáticamente.

---

### BP3. Estados de carga, error y vacío en componentes del frontend

**Archivos:** `frontend/src/App.tsx` (líneas 30–56), `frontend/src/components/dashboard/income-outcome-chart.tsx` (líneas 60–97), `frontend/src/components/dashboard/kpi-card.tsx` (líneas 38–80)  
**Evidencia:**
```tsx
// App.tsx — manejo de error
{error ? (
  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 ...">
    {error}
  </div>
) : null}

// IncomeOutcomeChart — estado loading
if (loading) { return <Card><Skeleton ... /></Card> }
// ... y estado vacío
if (!hasData) { return <div>No data available to display</div> }
```

**Beneficio:** Cada componente cubre tres estados: **loading** (skeleton con animación), **error** (banner con borde rojo), y **empty** (mensaje informativo). Esto mejora la experiencia de usuario (UX) y evita renderizados rotos o pantallas en blanco.

---

### BP4. TypeScript estricto con `noUnusedLocals` y `noUnusedParameters`

**Archivo:** `frontend/tsconfig.app.json` (líneas 22–25)  
**Evidencia:**
```json
"noUnusedLocals": true,
"noUnusedParameters": true,
"erasableSyntaxOnly": true,
"noFallthroughCasesInSwitch": true
```

**Beneficio:** Estas reglas de linting en tiempo de compilación fuerzan que no haya variables, parámetros o imports sin usar. Esto reduce el código muerto, mejora la mantenibilidad y previene bugs silenciosos. Junto con `erasableSyntaxOnly` (TypeScript 6), asegura que el código transpilado sea limpio.

---

### BP5. Pruebas con seed determinista y cobertura de casos edge

**Archivos:** `backend/tests/test_routes.py` (líneas 1–150), `frontend/src/lib/financial-utils.test.ts` (1–50)  
**Evidencia:**
```python
# Backend — seed fijo para reproducibilidad
movements = generate_mock_movements(seed=42)
assert len(movements) == 360
assert movements == sorted(movements, key=lambda item: item.create_date)
```
```typescript
// Frontend — caso edge: sin ingresos
it("returns 0 profitPercent when there is no income", () => {
  const onlyOutcomes: FinancialMovement[] = [{ ... }];
  const metrics = computeKPIs(onlyOutcomes);
  expect(metrics.profitPercent).toBe(0);
});
```

**Beneficio:** El backend usa `seed=42` garantizando tests deterministas y reproducibles. El frontend prueba el caso edge de "solo gastos, sin ingresos" donde `profitPercent` debe ser 0 (evitando división por cero). Además, `test_routes.py` cubre 9 endpoints con 15 tests que verifican filtros, tipos y orden cronológico.

---

## 2. Malas Prácticas / Riesgos Encontrados

### MP1. Duplicación de lógica de filtrado B2B/B2C en endpoints

**Archivo:** `backend/app/routes.py` (líneas 295–400)  
**Evidencia:**
```python
# Endpoint /api/metrics/b2b
@router.get("/api/metrics/b2b")
def get_b2b_metrics(...):
    movements = [
        movement for movement in generate_mock_movements(seed=42)
        if movement.business_type == "B2B"
    ]

# Endpoint /api/metrics/b2c
@router.get("/api/metrics/b2c")
def get_b2c_metrics(...):
    movements = [
        movement for movement in generate_mock_movements(seed=42)
        if movement.business_type == "B2C"
    ]
```

**Impacto:** Los endpoints `/api/metrics/b2b` y `/api/metrics/b2c` son prácticamente idénticos, cambiando solo el string `"B2B"` por `"B2C"`. El endpoint `/api/metrics/summary` ya acepta `business_type` como parámetro opcional, por lo que estos dos endpoints son **redundantes**. Duplican ~30 líneas de código y aumentan la superficie de mantenimiento.

**Propuesta de regla:**  
> **Regla:** *"No duplicar endpoints cuando un parámetro opcional puede cubrir el mismo caso de uso."*  
> **Solución:** Eliminar `/api/metrics/b2b` y `/api/metrics/b2c` y usar el parámetro `business_type` en `/api/metrics` (actualmente no lo acepta) y en `/api/metrics/summary` (ya lo acepta). Alternativamente, crear una función auxiliar `_filter_by_business_type(movements, business_type)`.

---

### MP2. Generación de datos mock directamente en cada handler (acoplamiento)

**Archivo:** `backend/app/routes.py` (líneas 230–400)  
**Evidencia:**
```python
@router.get("/api/metrics")
def get_metrics(...):
    movements = generate_mock_movements(seed=42)  # ← en cada handler
    ...

@router.get("/api/metrics/facets")
def get_metrics_facets():
    movements = generate_mock_movements(seed=42)  # ← repetido
    ...

@router.get("/api/metrics/summary")
def get_metrics_summary(...):
    movements = generate_mock_movements(seed=42)  # ← repetido
    ...
```

**Impacto:** `generate_mock_movements(seed=42)` se invoca **9 veces** (una por cada endpoint). Aunque el seed es fijo y los datos son deterministas, esto es ineficiente: cada llamada genera 360 objetos `FinancialMovement` desde cero. Además, si en el futuro se reemplaza por una consulta a BD, habría que modificar 9 lugares. Es un **acoplamiento fuerte** a la implementación mock.

**Propuesta de regla:**  
> **Regla:** *"Usar dependencia inyectada o caché para la fuente de datos, no generar datos mock en cada handler."*  
> **Solución:** Extraer la fuente de datos a un módulo separado (`backend/app/data.py` con función `get_movements()`) y usar `lru_cache` o un singleton para que `generate_mock_movements(seed=42)` se ejecute una sola vez. Al migrar a BD real, solo se cambia la implementación en `data.py`.

---

### MP3. CORS completamente abierto sin restricción de orígenes

**Archivo:** `backend/app/main.py` (líneas 6–11)  
**Evidencia:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # ← cualquier origen
    allow_credentials=True,
    allow_methods=["*"],          # ← cualquier método
    allow_headers=["*"],          # ← cualquier header
)
```

**Impacto:** `allow_origins=["*"]` combinado con `allow_credentials=True` es una mala práctica de seguridad. Aunque el proyecto es un prototipo, en un despliegue real esto permitiría que cualquier sitio web externo haga peticiones autenticadas desde el navegador del usuario, exponiendo datos financieros. Además, la combinación `*` + `credentials=True` es técnicamente inválida según la especificación CORS y algunos navegadores pueden ignorar `allow_credentials`.

**Propuesta de regla:**  
> **Regla:** *"No usar CORS con `allow_origins=['*']` en producción. Restringir a orígenes conocidos o usar variable de entorno."*  
> **Solución:** Reemplazar `["*"]` por una lista configurable vía variable de entorno (`CORS_ORIGINS`), con fallback seguro a `["http://localhost:5173"]` en desarrollo.

---

### MP4. Efecto `useEffect` sin dependencias explícitas ni `AbortController`

**Archivo:** `frontend/src/App.tsx` (líneas 30–45)  
**Evidencia:**
```tsx
useEffect(() => {
  fetchFinancialData()
    .then((movements) => {
      setMetrics(computeKPIs(movements));
      setMonthlyData(computeMonthlyData(movements));
    })
    .catch(() => {
      setError("No se pudo cargar la informacion financiera...");
    })
    .finally(() => {
      setLoading(false);
    });
}, []);  // ← array vacío (efecto solo al montar, OK)
// pero sin AbortController ni manejo de race conditions
```

**Impacto:** Aunque el `[]` es correcto para un fetch al montar el componente, no hay `AbortController` para cancelar la petición si el componente se desmonta antes de que la respuesta llegue. Esto puede causar **memory leaks** y el error de React *"Can't perform a React state update on an unmounted component"*. En React 19 el comportamiento mejora, pero sigue siendo una buena práctica incluirlo.

**Propuesta de regla:**  
> **Regla:** *"Todo `useEffect` con fetch debe incluir un `AbortController` para cancelar la petición al desmontar."*  
> **Solución:** Agregar `AbortController` con `signal` y llamar `abort()` en el cleanup del `useEffect`.

---

### MP5. Título HTML placeholder y sin etiquetas meta descriptivas

**Archivo:** `frontend/index.html` (línea 5)  
**Evidencia:**
```html
<title>frontend</title>
```

**Impacto:** El título de la página es `"frontend"`, un placeholder genérico que no describe la aplicación. Esto afecta negativamente al SEO, a la accesibilidad (lectores de pantalla usan el título) y a la experiencia del usuario al ver la pestaña del navegador. Tampoco hay meta tags como `description` u `og:title`.

**Propuesta de regla:**  
> **Regla:** *"El `<title>` del HTML debe describir el propósito de la aplicación, no el nombre del proyecto interno."*  
> **Solución:** Cambiar a `<title>Financial Dashboard</title>` y agregar `<meta name="description" content="Financial metrics dashboard showing KPIs, income vs outcome, and profit margins">` y etiquetas Open Graph básicas.

---

## 3. Resumen de Categorías

| Categoría | Buenas Prácticas | Malas Prácticas |
|---|---|---|
| **Arquitectura** | BP2 — Modelos Pydantic con `response_model` | MP1 — Endpoints duplicados B2B/B2C |
| **Naming / Organización** | BP1 — Tipos Literal con valores restringidos | MP2 — Lógica mock acoplada en handlers |
| **Manejo de Errores** | BP3 — Estados loading/error/empty en UI | MP4 — Sin AbortController en fetch |
| **Testing** | BP5 — Seed determinista y casos edge | — |
| **Seguridad** | — | MP3 — CORS abierto con `allow_origins=["*"]` |
| **DX / Documentación** | BP4 — TypeScript estricto con `noUnusedLocals` | MP5 — Título HTML placeholder |

---

## 4. Reglas Propuestas para el Proyecto

| # | Regla | Archivo(s) afectados | Prioridad |
|---|---|---|---|
| R1 | *"No duplicar endpoints cuando un parámetro opcional puede cubrir el mismo caso de uso."* | `backend/app/routes.py` | 🔴 Alta |
| R2 | *"Usar dependencia inyectada o caché para la fuente de datos, no generar datos mock en cada handler."* | `backend/app/routes.py` | 🟡 Media |
| R3 | *"No usar CORS con `allow_origins=['*']` en producción. Restringir a orígenes conocidos o usar variable de entorno."* | `backend/app/main.py` | 🔴 Alta |
| R4 | *"Todo `useEffect` con fetch debe incluir un `AbortController` para cancelar la petición al desmontar."* | `frontend/src/App.tsx` | 🟡 Media |
| R5 | *"El `<title>` del HTML debe describir el propósito de la aplicación, no el nombre del proyecto interno."* | `frontend/index.html` | 🟢 Baja |

---

*Documento generado como parte de la Fase 2 — Análisis de Calidad de Código. Validado contra el código fuente del repositorio el 2026-07-25.*