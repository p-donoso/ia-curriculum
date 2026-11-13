import catalog from './cv-templates.json';

export type CvTemplate = (typeof catalog.templates)[number];
export const cvTemplates = catalog.templates;
export const defaultCvTemplateId = cvTemplates[0].id;

export function getCvTemplate(id?: string): CvTemplate {
  return cvTemplates.find((template) => template.id === id) ?? cvTemplates[0];
}
