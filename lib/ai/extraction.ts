import { chat, ChatMessage } from './client';
import type { ProviderConfig } from './config';
export type StructuredProposal = {
  values: Record<string, string>;
  missing: string[];
  confidence: 'low' | 'medium' | 'high';
};
export function parseProposal(text: string, fields: string[]): StructuredProposal {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected an object.');
    const candidate = parsed as Partial<StructuredProposal>;
    const candidateValues =
      candidate.values && typeof candidate.values === 'object' && !Array.isArray(candidate.values)
        ? candidate.values
        : {};
    const values = Object.fromEntries(
      fields.map((field) => [field, typeof candidateValues[field] === 'string' ? candidateValues[field] : '']),
    );
    return {
      values,
      missing: fields.filter((field) => !values[field]),
      confidence:
        candidate.confidence === 'high' || candidate.confidence === 'medium' || candidate.confidence === 'low'
          ? candidate.confidence
          : 'low',
    };
  } catch {
    return { values: Object.fromEntries(fields.map((field) => [field, ''])), missing: fields, confidence: 'low' };
  }
}
export async function extractRecord(
  config: ProviderConfig,
  section: string,
  fields: string[],
  text: string,
): Promise<StructuredProposal> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Extrae información para la sección ${section}. Devuelve únicamente JSON válido con {"values": {campo: "valor"}, "missing": [], "confidence": "low|medium|high"}. No inventes datos.`,
    },
    { role: 'user', content: `Campos: ${fields.join(', ')}\nTexto: ${text}` },
  ];
  const result = await chat(config, messages);
  return parseProposal(result.content, fields);
}
