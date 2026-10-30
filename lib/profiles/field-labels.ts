type Locale = 'es' | 'en';

const fieldLabels: Record<string, Record<Locale, string>> = {
  'Nombre completo': { es: 'Nombre completo', en: 'Full name' },
  'Professional Headline': { es: 'Titular profesional', en: 'Professional headline' },
  'Professional Summary': { es: 'Resumen profesional', en: 'Professional summary' },
  Email: { es: 'Correo electrónico', en: 'Email' },
  Teléfono: { es: 'Teléfono', en: 'Phone' },
  'Ciudad y país': { es: 'Ciudad y país', en: 'City and country' },
  'Estado civil': { es: 'Estado civil', en: 'Marital status' },
  'Sitio web': { es: 'Sitio web', en: 'Website' },
  Institución: { es: 'Institución', en: 'Institution' },
  'Título o programa': { es: 'Título o programa', en: 'Degree or program' },
  'Fecha de inicio': { es: 'Fecha de inicio', en: 'Start date' },
  'Fecha de término': { es: 'Fecha de término', en: 'End date' },
  Descripción: { es: 'Descripción', en: 'Description' },
  Organización: { es: 'Organización', en: 'Organization' },
  Cargo: { es: 'Cargo', en: 'Role' },
  'Logros y responsabilidades': { es: 'Logros y responsabilidades', en: 'Achievements and responsibilities' },
  'Nombre del proyecto': { es: 'Nombre del proyecto', en: 'Project name' },
  Rol: { es: 'Rol', en: 'Role' },
  Fecha: { es: 'Fecha', en: 'Date' },
  'Resultado o enlace': { es: 'Resultado o enlace', en: 'Outcome or link' },
  Skill: { es: 'Habilidad', en: 'Skill' },
  Category: { es: 'Categoría', en: 'Category' },
  Evidence: { es: 'Evidencia', en: 'Evidence' },
};

/** Translate a stored field key for the active locale; unknown keys pass through unchanged. */
export function getFieldLabel(field: string, locale: Locale): string {
  return fieldLabels[field]?.[locale] ?? field;
}
