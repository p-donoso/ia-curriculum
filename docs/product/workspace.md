# Workspace y navegación

1. La persona aterriza en `/` y selecciona un CV según su objetivo.
2. El perfil abre su dashboard en `/profiles/:id`.
3. El workspace ofrece Información básica, Educación, Experiencia laboral, Proyectos, LinkedIn y Curriculum.
4. Las secciones estructuradas navegan a `/profiles/:id/:section`.
5. Educación, experiencia, proyectos y habilidades forman una fuente compartida entre todos los CV. Información básica (incluidos titular y resumen) permanece asociada al CV seleccionado.
6. Cada sección de datos permite crear, editar, colapsar y eliminar registros.
7. LinkedIn muestra proyectos y habilidades; Curriculum presenta una vista imprimible para guardar como PDF.
8. El switcher de la barra lateral vuelve al selector de CVs.
9. La configuración y el objetivo permanecen asociados al CV seleccionado.

Al crear un CV se puede elegir otro como base y pegar la descripción de un proyecto o cargo. El sistema copia los datos básicos editables, guarda el objetivo y reutiliza la trayectoria compartida. En el dashboard, la persona puede pedir un borrador de titular y resumen con el proveedor de IA configurado en el CV base. Antes de enviarlo, la app muestra el proveedor y las categorías de datos que compartirá; el resultado requiere revisión y confirmación.

La vista de Currículum permite elegir entre las plantillas Franja coral, Panel lateral y Editorial; seleccionar cinco paletas prediseñadas; y crear una paleta ajustando los colores principal, secundario, texto, texto suave y fondo. Plantillas y paletas tienen catálogos JSON separados (`cv-templates.json` y `cv-palettes.json`). La plantilla, paleta personalizada o predefinida y preferencia de iconos se guardan por CV y forman parte de sus metadatos exportables.

La vista permite activar iconos Material en los títulos de sección; la preferencia se guarda por CV y los controles no aparecen al imprimir. Canada 1500 (CC0-1.0) y Material Icons (Apache-2.0) se sirven localmente. Sus licencias están en `public/fonts/`.

La navegación usa enlaces con rutas reales. En pantallas pequeñas, el botón de menú abre un drawer y se cierra al elegir una sección.

Los ajustes del CV permiten exportar sus respuestas, contenido y registros como JSON o eliminarlo. Eliminar un CV no borra la fuente profesional compartida.
