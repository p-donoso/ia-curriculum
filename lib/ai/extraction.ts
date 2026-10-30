import { chat, ChatMessage } from './client';
import type { ProviderConfig } from './config';
import { getSystemPrompt, type PromptLocale } from './prompts';
export type StructuredProposal = {
  values: Record<string, string>;
  missing: string[];
  confidence: 'low' | 'medium' | 'high';
};
/** Validate model output and constrain proposed values to the requested field schema. */
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
/** Ask the configured provider to extract a reviewable profile draft from user-supplied text. */
export async function extractRecord(
  config: ProviderConfig,
  section: string,
  fields: string[],
  text: string,
  locale: PromptLocale = 'es',
): Promise<StructuredProposal> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: getSystemPrompt(config.systemPrompts, locale, 'recordExtraction'),
    },
    {
      role: 'user',
      content: `${locale === 'es' ? 'Sección' : 'Section'}: ${section}\n${locale === 'es' ? 'Campos' : 'Fields'}: ${fields.join(', ')}\n${locale === 'es' ? 'Texto' : 'Text'}: ${text}`,
    },
  ];
  const result = await chat(config, messages);
  return parseProposal(result.content, fields);
}
