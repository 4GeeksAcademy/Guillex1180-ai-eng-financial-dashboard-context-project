# Análisis de Prácticas de Ingeniería - Fase 2

## 1. Buenas Prácticas
* **Arquitectura:** Separación de componentes y servicios en frontend.
* **Seguridad:** Manejo de variables mediante archivos de entorno `.env`.
* **DX:** Configuración clara de contenedor Docker en la raíz.
* **Validación:** Uso de esquemas de datos explícitos para respuestas del servidor.
* **Naming:** Nomenclatura clara en archivos y módulos del proyecto.

## 2. Malas Prácticas y Riesgos
* **Configuración:** URLs o variables con valores hardcoded en lugar de lectura de `.env`.
* **Manejo de Errores:** Bloques de excepción genéricos sin código HTTP adecuado.
* **Testing:** Cobertura de pruebas unitarias ausente o insuficiente.
* **Tipado:** Tipos genéricos o ambiguos en manejo de datos.
* **Componentes:** Componentes de interfaz con lógica de negocio acoplada.
