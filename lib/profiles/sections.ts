export type SectionInfo = { title: string; description: string; fields: string[] };

export const sections: Record<string, SectionInfo> = {
  basic: {
    title: 'Información básica',
    description: 'Los datos esenciales que identifican tu perfil profesional.',
    fields: [
      'Nombre completo',
      'Professional Headline',
      'Professional Summary',
      'Email',
      'Teléfono',
      'Ciudad y país',
      'Estado civil',
      'Sitio web',
    ],
  },
  education: {
    title: 'Educación',
    description: 'Tu formación académica, cursos y aprendizajes relevantes.',
    fields: ['Institución', 'Título o programa', 'Fecha de inicio', 'Fecha de término', 'Descripción'],
  },
  experience: {
    title: 'Experiencia laboral',
    description: 'Los roles, responsabilidades y logros que cuentan tu trayectoria.',
    fields: ['Organización', 'Cargo', 'Fecha de inicio', 'Fecha de término', 'Logros y responsabilidades'],
  },
  projects: {
    title: 'Proyectos',
    description: 'Trabajo relevante que demuestra cómo conviertes capacidades en resultados.',
    fields: ['Nombre del proyecto', 'Rol', 'Fecha', 'Descripción', 'Resultado o enlace'],
  },
  skills: {
    title: 'Habilidades',
    description: 'Capacidades respaldadas por tu experiencia, proyectos y resultados.',
    fields: ['Skill', 'Category', 'Evidence'],
  },
  linkedin: {
    title: 'LinkedIn',
    description: 'Una versión lista para revisar y llevar a tu perfil público.',
    fields: [],
  },
  curriculum: { title: 'Curriculum', description: 'Tu información organizada en un documento exportable.', fields: [] },
  settings: { title: 'Configuración', description: 'Administra tu proveedor de IA y tus preferencias.', fields: [] },
};
