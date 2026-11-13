import { test as emptyTest, expect } from '@playwright/test';
import { test } from './fixtures';

emptyTest('starts empty and allows creating the first profile', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Sample Candidate/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Crear un CV/ })).toBeVisible();
  await page.getByRole('button', { name: /Crear un CV/ }).click();
  await page.getByLabel('Nombre del perfil').fill('Mi perfil');
  await page.getByRole('button', { name: 'Crear perfil' }).click();
  await expect(page.getByRole('link', { name: /Mi perfil/ })).toBeVisible();
});

test('landing permite seleccionar un perfil y volver al switcher', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Sample Candidate/ }).click();
  await expect(page).toHaveURL(/\/profiles\/test-profile$/);
  await expect(page.getByText('Cambiar de perfil')).toBeVisible();
  await page.getByRole('link', { name: 'Cambiar de perfil' }).click();
  await expect(page).toHaveURL(/\/$/);
});
test('cambia el idioma de toda la app y conserva la preferencia', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch language to English' }).click();
  await expect(page.getByRole('heading', { name: 'Which profile would you like to work on?' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Sample Candidate/ })).toBeVisible();

  await page.getByRole('link', { name: /Sample Candidate/ }).click();
  await expect(page.getByRole('heading', { name: 'Let’s shape your next step.' })).toBeVisible();
  const createdAt = new Date().toISOString();
  await page.evaluate((createdAt) => {
    localStorage.setItem(
      'ia-curriculum:records:test-profile:v1',
      JSON.stringify([
        {
          id: 'basic-record',
          section: 'basic',
          values: { 'Sitio web': 'jordan.example.com' },
          createdAt,
          updatedAt: createdAt,
        },
      ]),
    );
  }, createdAt);
  await page.goto('/profiles/test-profile/basic');
  await expect(page.getByLabel('Website')).toBeVisible();
  await page.goto('/profiles/test-profile/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  const modelInput = page.getByRole('textbox', { name: 'Model' });
  await expect(modelInput).toBeVisible();
  expect(await modelInput.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(50);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('un segmento desconocido muestra la vista Next de not found en el idioma elegido', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ia-curriculum:locale:v1', 'en'));
  await page.goto('/profiles/test-profile/not-a-section');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByText('We could not find this page. Check the link or return home.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
});
