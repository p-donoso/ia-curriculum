import { test, expect } from '@playwright/test';
test('landing permite seleccionar un perfil y volver al switcher', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Alex Morgan/ }).click();
  await expect(page).toHaveURL(/\/profiles\/alex$/);
  await expect(page.getByText('Cambiar de perfil')).toBeVisible();
  await page.getByRole('link', { name: 'Cambiar de perfil' }).click();
  await expect(page).toHaveURL(/\/$/);
});
test('landing permite crear un perfil nuevo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Nuevo perfil/ }).click();
  await page.getByLabel('Nombre del perfil').fill('Mi nuevo camino');
  await page.getByRole('button', { name: 'Crear perfil' }).click();
  await expect(page.getByRole('link', { name: /Mi nuevo camino/ })).toBeVisible();
});

test('cambia el idioma de toda la app y conserva la preferencia', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch language to English' }).click();
  await expect(page.getByRole('heading', { name: 'Which profile would you like to work on?' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Career change Draft/ })).toBeVisible();

  await page.getByRole('link', { name: /Alex Morgan/ }).click();
  await expect(page.getByRole('heading', { name: 'Let’s shape your next step.' })).toBeVisible();
  const createdAt = new Date().toISOString();
  await page.evaluate((createdAt) => {
    localStorage.setItem(
      'ia-curriculum:records:alex:v1',
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
  await page.goto('/profiles/alex/basic');
  await expect(page.getByLabel('Website')).toBeVisible();
  await page.goto('/profiles/alex/settings');
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
  await page.goto('/profiles/alex/not-a-section');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByText('We could not find this page. Check the link or return home.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
});
