/* global process, URL, localStorage, document, HTMLElement, console */
/** Refresh documentation images using synthetic data in an isolated browser. */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base = process.env.SHOWCASE_URL ?? 'http://localhost:3012';
const output = new URL('../docs/showcase/screenshots/', import.meta.url).pathname;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const now = '2026-01-01T00:00:00.000Z';
const profile = {
  id: 'showcase',
  name: 'Jordan Taylor',
  role: 'Platform engineering',
  color: '#315efb',
  answers: [],
  createdAt: now,
  updatedAt: now,
  cvShowSectionIcons: true,
};
const record = (id, section, values) => ({ id, section, values, createdAt: now, updatedAt: now });
await page.goto(base);
await page.evaluate(
  ({ profile }) => {
    localStorage.clear();
    localStorage.setItem('ia-curriculum:locale:v1', 'en');
    localStorage.setItem(
      'ia-curriculum:profiles:v1',
      JSON.stringify([
        profile,
        { ...profile, id: 'product', role: 'Product engineering', name: 'Product-focused resume' },
      ]),
    );
  },
  { profile, now },
);
const basic = record('basic', 'basic', {
  'Nombre completo': 'Jordan Taylor',
  'Professional Headline': 'Platform Engineer · Cloud Architecture',
  'Professional Summary':
    'Engineer building reliable platforms and automated delivery workflows. Connects product needs with practical architecture and clear operating practices.',
  Email: 'jordan@example.com',
  'Ciudad y país': 'Example City',
  'Sitio web': 'https://example.com',
});
const source = [
  record('experience', 'experience', {
    Organización: 'Example Systems',
    Cargo: 'Platform Engineer',
    'Fecha de inicio': '2021',
    'Fecha de término': 'Present',
    'Logros y responsabilidades':
      'Designed shared services for a B2B planning product.\nAutomated environment setup and deployment workflows.\nWorked with product teams to improve release reliability.',
  }),
  record('education', 'education', {
    Institución: 'Example University',
    'Título o programa': 'Bachelor of Engineering',
    'Fecha de inicio': '2014',
    'Fecha de término': '2018',
    Descripción: 'Software systems and operations.',
  }),
  record('project', 'projects', {
    'Nombre del proyecto': 'Delivery Toolkit',
    Rol: 'Maintainer',
    Fecha: '2025',
    Descripción: 'A shared toolkit for reproducible environments and deployment checks.',
    'Resultado o enlace': 'https://example.com/toolkit',
  }),
  ...['Cloud architecture', 'CI/CD and automated delivery', 'Product collaboration'].map((s, i) =>
    record('skill-' + i, 'skills', {
      Skill: s,
      Category: 'Engineering',
      Evidence: 'Applied in platform delivery projects.',
    }),
  ),
];
await page.evaluate(
  ({ basic, source }) => {
    localStorage.setItem('ia-curriculum:records:showcase:v1', JSON.stringify([basic]));
    localStorage.setItem('ia-curriculum:records:source:v1', JSON.stringify(source));
  },
  { basic, source },
);
async function visit(path) {
  await page.goto(base + path);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}
async function shot(name) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: output + name + '.png', fullPage: true, animations: 'disabled' });
}
await visit('/');
await shot('profiles');
await visit('/profiles/showcase');
await shot('reflection-start');
await page.getByRole('textbox').fill('I want to build reliable platforms and help teams deliver confidently.');
await page.getByRole('button', { name: 'Continue', exact: true }).click();
await page.getByRole('textbox').waitFor();
await shot('reflection-progress');
for (const answer of [
  'I help product teams make releases predictable.',
  'I automated a repeated delivery task and documented the workflow.',
]) {
  await page.getByRole('textbox').fill(answer);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
await page.getByRole('heading', { name: 'You have a foundation for your profile.' }).waitFor();
await shot('reflection-complete');
for (const [route, name] of [
  ['basic', 'basic-information'],
  ['experience', 'experience'],
  ['education', 'education'],
  ['projects', 'projects'],
  ['skills', 'skills'],
  ['linkedin', 'linkedin-draft'],
  ['settings', 'settings'],
]) {
  await visit('/profiles/showcase/' + route);
  await shot(name);
}
await visit('/profiles/showcase/curriculum');
await shot('cv-template-palette-picker');
await shot('cv-preview');
await page.getByRole('radio', { name: /Sidebar/ }).click();
const color = page.locator('input[type=color]').first();
await color.fill('#265c73');
await shot('cv-custom-palette');
await page.getByRole('radio', { name: /Editorial/ }).click();
await page.getByRole('radio', { name: 'Violet', exact: true }).click();
await shot('cv-editorial-palette');
await page.emulateMedia({ media: 'print' });
await page.locator('.cv-document').screenshot({ path: output + 'cv-print.png', animations: 'disabled' });
await page.emulateMedia({ media: 'screen' });
await page.setViewportSize({ width: 390, height: 844 });
await visit('/profiles/showcase');
await page
  .getByRole('button', { name: /menu|navigation/i })
  .first()
  .click();
await page.screenshot({ path: output + 'mobile-navigation.png', fullPage: false, animations: 'disabled' });
await browser.close();
console.log('Showcase screenshots refreshed.');
