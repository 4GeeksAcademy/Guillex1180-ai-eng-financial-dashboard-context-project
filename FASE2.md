# Análisis de Prácticas de Ingeniería - Fase 2

Este documento contiene la auditoría técnica realizada sobre el repositorio del Dashboard Financiero, identificando buenas prácticas a preservar y malas prácticas/riesgos a mitigar.

---

## 1. Buenas Prácticas Identificadas (5)

### 1.1 [Categoría: Arquitectura]
* **Hallazgo / Evidencia:** [Ej: Separación clara de rutas en el backend utilizando APIRouter de FastAPI o modularización de componentes en el frontend].
* **Ubicación:** `backend/app/api/...` (o la ruta real de tu archivo).
* **Impacto positivo:** Facilita el mantenimiento, desacopla responsabilidades y permite escalar el proyecto sin colisiones de código.

### 1.2 [Categoría: Validaciones / Seguridad]
* **Hallazgo / Evidencia:** [Ej: Uso de esquemas de Pydantic / TypeScript para validar tipos de datos en payloads de entrada].
* **Ubicación:** `backend/app/schemas/...` / `frontend/src/types/...`
* **Impacto positivo:** Previene inyecciones de datos malformados y asegura tipado estricto en el flujo de trabajo.

### 1.3 [Categoría: DX / Tooling]
* **Hallazgo / Evidencia:** [Ej: Configuración de Docker Compose para levantar frontend y backend de forma orquestada].
* **Ubicación:** `docker-compose.yml`
* **Impacto positivo:** Permite un entorno de desarrollo reproducible para cualquier colaborador sin importar su sistema operativo.

### 1.4 [Categoría: Naming / Legibilidad]
* **Hallazgo / Evidencia:** [Ej: Convenciones de nomenclatura claras y consistentes en componentes React o controladores].
* **Ubicación:** `frontend/src/components/...`
* **Impacto positivo:** Reduce la carga cognitiva al leer el código y facilita la navegación por la estructura de carpetas.

### 1.5 [Categoría: Manejo de Entorno]
* **Hallazgo / Evidencia:** [Ej: Uso de archivos `.env.example` para documentar las variables de entorno necesarias].
* **Ubicación:** `.env.example`
* **Impacto positivo:** Evita la fuga de credenciales sensibles y sirve como documentación viva para el setup local.

---

## 2. Malas Prácticas o Riesgos Identificados (5)

### 2.1 [Categoría: Seguridad / Configuración]
* **Hallazgo / Evidencia:** [Ej: Valores o URLs de API escritas directamente en duro (hardcoded) en lugar de usar variables de entorno].
* **Ubicación:** `frontend/src/services/...`
* **Riesgo:** Dificulta el despliegue en entornos de staging/producción y puede exponer URLs o credenciales privadas.
* **Regla Propuesta:** "Toda variable de configuración, URL de API o secreto debe ser consumido exclusivamente desde variables de entorno (`process.env` / `import.meta.env`)."

### 2.2 [Categoría: Manejo de Errores]
* **Hallazgo / Evidencia:** [Ej: Captura de excepciones genéricas con bloques `try/catch` vacíos o retornos de error en formato HTTP 200].
* **Ubicación:** `backend/app/routes/...`
* **Riesgo:** Dificulta la depuración en tiempo de ejecución y confunde al cliente frontend sobre el estado real de la petición.
* **Regla Propuesta:** "Los errores en API deben responder con códigos HTTP de estado adecuados (4xx / 5xx) y con estructuras de respuesta JSON estandarizadas."

### 2.3 [Categoría: Testing]
* **Hallazgo / Evidencia:** [Ej: Ausencia de pruebas unitarias o de integración para endpoints o utilidades críticas de cálculo financiero].
* **Ubicación:** Raíz / subcarpetas de backend y frontend.
* **Riesgo:** Alto riesgo de regresiones al refactorizar o agregar nuevas funcionalidades financieras.
* **Regla Propuesta:** "Cualquier endpoint o lógica de cálculo financiero debe incluir al menos una prueba unitaria o de integración que valide su comportamiento esperado."

### 2.4 [Categoría: Naming y Tipado]
* **Hallazgo / Evidencia:** [Ej: Uso excesivo del tipo `any` en TypeScript o variables con nombres ambiguos como `data`, `res`, `temp`].
* **Ubicación:** `frontend/src/utils/...`
* **Riesgo:** Anula los beneficios del autocompletado y tipado estricto, incrementando la probabilidad de errores `null`/`undefined`.
* **Regla Propuesta:** "Queda prohibido el uso explícito del tipo `any`; todos los objetos y respuestas de API deben contar con una interfaz o tipo explícito."

### 2.5 [Categoría: Arquitectura / Monolitos en UI]
* **Hallazgo / Evidencia:** [Ej: Componentes de React que concentran más de 200 líneas de código mezclando lógica de fetch, estado y UI visual].
* **Ubicación:** `frontend/src/pages/...`
* **Riesgo:** Dificulta la reutilización, complica la lectura y aumenta la fragilidad ante cambios.
* **Regla Propuesta:** "Los componentes de vista (UI) deben delegar la lógica de negocio y peticiones de datos a hooks personalizados o servicios dedicados."