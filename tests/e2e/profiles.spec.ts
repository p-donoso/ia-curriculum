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
  await page.goto('/profiles/alex/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
