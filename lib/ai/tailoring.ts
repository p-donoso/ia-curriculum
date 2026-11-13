import { chat } from './client';
import type { ProviderConfig } from './config';
import { parseProposal, type StructuredProposal } from './extraction';
import type { PromptLocale } from './prompts';
import type { RecordItem } from '../profiles/records';

const fields = ['Professional Headline', 'Professional Summary'];

/** Build candidate evidence without including contact details or treating target requirements as qualifications. */
export function buildTailoringContext(
  basic: RecordItem[],
  shared: RecordItem[],
  focus: string,
  targetDescription: string,
): string {
  const privateFields = new Set(['Email', 'Teléfono', 'Ciudad y país', 'LinkedIn', 'Sitio web']);
  const candidate = [...basic, ...shared].map((record) => ({
    section: record.section,
    values: Object.fromEntries(Object.entries(record.values).filter(([key]) => !privateFields.has(key))),
  }));
  return `Objetivo del CV:\n${focus}\n\nDescripción del proyecto o cargo (solo contexto para priorizar; no es evidencia sobre la persona):\n${targetDescription}\n\nInformación profesional de la persona:\n${JSON.stringify(candidate, null, 2)}`;
}

/** Draft a CV headline and summary from confirmed career evidence for user review. */
export async function tailorBasic(
  config: ProviderConfig,
  context: string,
  locale: PromptLocale = 'es',
): Promise<StructuredProposal> {
  const system =
    locale === 'es'
      ? 'Eres un editor de currículums. Redacta un titular profesional y un resumen enfocados al objetivo usando solo evidencia de la información profesional. La descripción del cargo/proyecto es contexto: nunca conviertas requisitos deseados en experiencia, habilidades, títulos o logros de la persona. No inventes ni exageres. Si la evidencia no alcanza para una afirmación, omítela. Devuelve solo JSON válido con la forma {"values":{"Professional Headline":"...","Professional Summary":"..."},"missing":[],"confidence":"low|medium|high"}. Escribe en español.'
      : 'You are a resume editor. Draft a professional headline and summary focused on the goal using only evidence in the career information. The job/project description is context: never turn desired requirements into the person’s experience, skills, credentials, or achievements. Do not invent or exaggerate. Omit unsupported claims. Return only valid JSON with this shape: {"values":{"Professional Headline":"...","Professional Summary":"..."},"missing":[],"confidence":"low|medium|high"}. Write in English.';
  const result = await chat(config, [
    { role: 'system', content: system },
    { role: 'user', content: `${locale === 'es' ? 'Contexto' : 'Context'}:\n${context}` },
  ]);
  return parseProposal(result.content, fields);
}
