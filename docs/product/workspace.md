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

La navegación usa enlaces con rutas reales. En pantallas pequeñas, el botón de menú abre un drawer y se cierra al elegir una sección.

Los ajustes del CV permiten exportar sus respuestas, contenido y registros como JSON o eliminarlo. Eliminar un CV no borra la fuente profesional compartida.
