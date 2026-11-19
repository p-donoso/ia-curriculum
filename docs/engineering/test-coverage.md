# Cobertura de pruebas

El proyecto usa dos métricas complementarias:

- `npm run test:coverage` calcula cobertura de código de las unidades puras y de integración bajo `lib/` con Vitest y V8. Genera `coverage/` en formatos texto, HTML y LCOV.
- `npm run test:e2e` valida recorridos completos en un navegador real con Playwright. Playwright no mide cobertura de líneas de React por defecto; su cobertura se reporta como cobertura de flujos.

La última ejecución cubrió `lib/` con 85% de líneas, 80.24% de statements, 73.01% de funciones y 73.78% de branches. Los umbrales de protección son 40%, 30%, 25% y 15% respectivamente; revisa `vitest.config.mts` para el detalle.

## Flujos cubiertos

La suite E2E tiene 19 pruebas para selección y creación de perfiles, navegación móvil y escritorio, conversación guiada, persistencia/reinicio, configuración BYOT, accesibilidad (axe/WCAG 2 AA), exportación y eliminación local, CRUD de experiencia y vistas de perfil/CV.

## Cómo aumentar el número

1. Ejecutar `npm run test:coverage` y revisar `coverage/index.html` para localizar líneas sin cubrir.
2. Agregar primero pruebas unitarias para lógica determinista (`lib/`) y luego una prueba E2E para el recorrido visible.
3. Ejecutar `npm run test:e2e` antes de subir cambios para detectar regresiones de navegación.
4. No bajar los umbrales para ocultar una regresión; si una capacidad aumenta el alcance, agregar sus casos límite.

## Revisión del 19 de noviembre de 2026

Pasaron 41 pruebas unitarias y 19 E2E. El fixture de navegador siembra el perfil solo cuando no existe, para comprobar persistencia real tras recargas. Las pruebas de creación e idioma siguen la navegación y el encabezado actuales. Se eliminó una variable sin usar de la prueba de registros compartidos.

El build de producción y TypeScript pasaron. Next.js emitió un aviso de vulnerabilidad en la versión instalada; el primer build se detuvo y el segundo completó con el aviso. El aviso se resolvió posteriormente actualizando las dependencias del lockfile. `next-env.d.ts` volvió a sus rutas de producción al ejecutar el build.

La corrección de CI actualiza el lockfile a Next.js 16.4.6, ESLint 10.15.0, typescript-eslint 8.73.0 y minimatch 11.0.9. `npm audit fix` reportó cero vulnerabilidades y `npm run check` pasó sin desactivar controles.

## Actualización de TypeScript

TypeScript se actualiza a `~6.0.3`, compatible con `typescript-eslint@8.73.0` (`>=4.8.4 <6.1.0`). Se conserva la versión mayor de `@types/node`. TypeScript 7 sigue pendiente en el issue #12 hasta contar con soporte oficial del tooling; no se usan `--force` ni `--legacy-peer-deps`. El rango `~6.0.3` permite parches 6.0 sin saltar automáticamente a 6.1.

## Accessible language switch

axe 4.14 detects label/content mismatches. The language button includes its visible ES or EN text in its accessible name, followed by the action in the destination language. Browser tests use the complete accessible name; the accessibility rule remains enabled.
