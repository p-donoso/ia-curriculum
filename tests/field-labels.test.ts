import { describe, expect, it } from 'vitest';
import { getFieldLabel } from '../lib/profiles/field-labels';

describe('localized field labels', () => {
  it('translates stored field keys for Spanish and English', () => {
    expect(getFieldLabel('Nombre completo', 'es')).toBe('Nombre completo');
    expect(getFieldLabel('Nombre completo', 'en')).toBe('Full name');
    expect(getFieldLabel('Cargo', 'en')).toBe('Role');
  });

  it('preserves custom field names without a translation', () => {
    expect(getFieldLabel('Custom portfolio field', 'en')).toBe('Custom portfolio field');
  });
});
