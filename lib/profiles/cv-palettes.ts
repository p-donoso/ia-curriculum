import catalog from './cv-palettes.json';

export type CvPalette = (typeof catalog.palettes)[number];
export type CvPaletteColors = CvPalette['colors'];
export const cvPalettes = catalog.palettes;
export const defaultCvPaletteId = cvPalettes[0].id;

export function getCvPalette(id?: string): CvPalette {
  return cvPalettes.find((palette) => palette.id === id) ?? cvPalettes[0];
}
