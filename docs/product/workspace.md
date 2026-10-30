# Workspace y navegación

1. La persona aterriza en `/` y selecciona un perfil.
2. El perfil abre su dashboard en `/profiles/:id`.
3. El workspace ofrece Información básica, Educación, Experiencia laboral, Proyectos, LinkedIn y Curriculum.
4. Las secciones estructuradas navegan a `/profiles/:id/:section`.
5. Cada sección de datos permite crear, editar, colapsar y eliminar registros.
6. LinkedIn muestra proyectos y habilidades; Curriculum presenta una vista imprimible para guardar como PDF.
7. El switcher de la barra lateral vuelve al selector de perfiles.
8. La configuración también está dentro del perfil en `/profiles/:id/settings`; sus datos deben permanecer aislados del resto de perfiles.

La navegación usa enlaces con rutas reales. En pantallas pequeñas, el botón de menú abre un drawer y se cierra al elegir una sección.

Los ajustes del perfil permiten exportar las respuestas y registros como JSON o eliminar los datos locales de ese perfil.
