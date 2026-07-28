# Especificación Técnica (Spec): Filtro por Rango de Fechas para Dashboard de Finanzas

| Metadata | Detalle |
| :--- | :--- |
| **Módulo** | Dashboard de Finanzas |
| **Funcionalidad** | Filtro por Rango de Fechas en Tiempo Real |
| **Estado** | Propuesta / Listo para Desarrollo |
| **Fecha** | 27 de Julio de 2026 |

---

## 1. Goal (Objetivo)

Permitir al equipo de finanzas consultar métricas y reportes dentro de periodos temporales específicos mediante dos selecciones de fecha (*Fecha de Inicio* y *Fecha de Fin*), evitando la saturación de datos históricos innecesarios y optimizando el análisis operativo.

---

## 2. Scope (Alcance)

### In Scope (Dentro del alcance)
* **Controles UI:** Adición de dos inputs tipo *DatePicker* en el header del dashboard (*Fecha Inicio* / *Fecha Fin*).
* **Integración API de Datos:** Enviar los parámetros de fecha formateados a la API de métricas existente al realizar un cambio o aplicar el filtro.
* **Consulta de Facetas:** Llamada al endpoint de facetas para obtener la fecha mínima y máxima del dataset completo.
* **Indicador Visual de Rango Válido:** Mapeo y despliegue del rango histórico disponible cerca de los controles de fecha como referencia de usuario.
* **Comportamiento por Defecto:** Mantener los campos como opcionales. Si ambos están vacíos, la aplicación solicitará y desplegará el conjunto de datos completo (comportamiento actual).

### Out of Scope (Fuera del alcance)
* Añadir selecciones rápidas prediseñadas (p. ej., *"Últimos 7 días"*, *"Este trimestre"*, *"Año en curso"*).
* Modificaciones estructurales o recalculo de agregaciones en la base de datos de métricas.

---

## 3. Constraints (Restricciones y Reglas de Negocio)

1. **Formato de Envíos:** Todas las fechas enviadas como query parameters a la API deben cumplir de manera estricta con el formato `YYYY-MM-DD` (ISO 8601 fecha corta).
2. **Opcionalidad e Independencia:**
   * Ambos inputs son **opcionales**.
   * Es válido enviar únicamente `start_date`, únicamente `end_date`, ambos o ninguno.
3. **Validaciones de Negocio:**
   * La fecha inicial (`start_date`) no puede ser posterior a la fecha final (`end_date`).
   * No debe permitirse la selección de fechas anteriores a la fecha mínima o posteriores a la fecha máxima devueltas por el endpoint de facetas.
4. **Optimización de Peticiones:** La consulta de métricas debe implementar *debounce* o ejecutarse tras la confirmación explícita para prevenir múltiples peticiones mientras el usuario interactúa con el calendario.

---

## 4. Specifics (Especificaciones Detalladas)

### 4.1 UI & UX (Interfaz y Experiencia de Usuario)

* **Ubicación:** Barra superior fija (*Top Header*) del dashboard de finanzas.
* **Inputs:**
  * **Fecha Inicio:** Componente selector de fecha con placeholder `YYYY-MM-DD`.
  * **Fecha Fin:** Componente selector de fecha con placeholder `YYYY-MM-DD`.
* **Texto Informativo:** 
  > *Rango disponible con datos: `[MIN_DATE]` — `[MAX_DATE]`*
* **Acción Limpiar (Reset):** Botón para reiniciar los inputs a estado nulo y solicitar de nuevo la vista global.

### 4.2 Integración de API y Contratos de Datos

#### A. Obtención de Rango de Fechas Disponible
Al inicializar la vista, el frontend realiza una petición para descubrir el rango histórico con datos.

* **Método:** `GET`
* **Endpoint:** `/api/metrics/facets`
* **Response Body (200 OK):**
```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2023-01-01",
  "max_date": "2026-07-27"
}
```

> **Nota:** El endpoint también devuelve `operation_types`, `business_types` y `categories`, que pueden aprovecharse en el futuro para añadir filtros adicionales (tipo de operación, categoría, tipo de negocio) sin llamadas extra.

#### B. Consulta de Métricas Filtradas
El endpoint de consumo del dashboard aceptará parámetros condicionales según la selección del usuario.

* **Método:** `GET`
* **Endpoint:** `/api/metrics`
* **Query Parameters:**
  * `start_date` *(optional, string)*: `YYYY-MM-DD`
  * `end_date` *(optional, string)*: `YYYY-MM-DD`
  * `category` *(optional, string)*: Uno de `suppliers`, `sales`, `operational`, `administrative`, `others`
  * `operation_type` *(optional, string)*: `income` | `outcome`

**Ejemplos de Consulta:**

1. **Filtro completo:**
   `GET /api/metrics?start_date=2026-01-01&end_date=2026-06-30`
2. **Filtro desde fecha inicio:**
   `GET /api/metrics?start_date=2026-01-01`
3. **Filtro por tipo de operación y fecha:**
   `GET /api/metrics?operation_type=income&start_date=2026-01-01&end_date=2026-06-30`
4. **Sin filtros (Histórico completo):**
   `GET /api/metrics`

---

## 5. Context (Contexto)

El equipo de finanzas utiliza este dashboard diariamente para tomar decisiones presupuestarias y evaluar el desempeño operativo. Actualmente, la interfaz carga el histórico completo desde el origen de los datos, lo que ocasiona:
* **Dificultad de lectura:** Sobrecarga visual al analizar cierres mensuales o trimestrales específicos.
* **Ineficiencia:** Rendimiento degradado por la renderización masiva de puntos de datos que no corresponden al periodo bajo análisis.

Con esta implementación, los analistas contarán con la flexibilidad de focalizar su análisis en ventanas temporales definidas sin perder la capacidad de retornar a la visión histórica global en cualquier momento.
