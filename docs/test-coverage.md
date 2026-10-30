# Cobertura de pruebas

El proyecto usa dos métricas complementarias:

- `npm run test:coverage` calcula cobertura de código de las unidades puras y de integración bajo `lib/` con Vitest y V8. Genera `coverage/` en formatos texto, HTML y LCOV.
- `npm run test:e2e` valida recorridos completos en un navegador real con Playwright. Playwright no mide cobertura de líneas de React por defecto; su cobertura se reporta como cobertura de flujos.

La última ejecución cubrió `lib/` con 86.07% de líneas, 80.62% de statements, 80.48% de funciones y 70.8% de branches. Los umbrales de protección son 40%, 30%, 25% y 15% respectivamente; revisa `vitest.config.mts` para el detalle.

## Flujos cubiertos

La suite E2E tiene 15 pruebas para selección y creación de perfiles, navegación móvil y escritorio, conversación guiada, persistencia/reinicio, configuración BYOT, accesibilidad (axe/WCAG 2 AA), exportación y eliminación local, CRUD de experiencia y vistas de perfil/CV.

## Cómo aumentar el número

1. Ejecutar `npm run test:coverage` y revisar `coverage/index.html` para localizar líneas sin cubrir.
2. Agregar primero pruebas unitarias para lógica determinista (`lib/`) y luego una prueba E2E para el recorrido visible.
3. Ejecutar `npm run test:e2e` antes de subir cambios para detectar regresiones de navegación.
4. No bajar los umbrales para ocultar una regresión; si una capacidad aumenta el alcance, agregar sus casos límite.
