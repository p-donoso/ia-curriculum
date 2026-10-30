import { test, expect } from '@playwright/test';

test.describe('secciones profesionales', () => {
  for (const section of ['basic', 'education', 'projects']) {
    test(`muestra la sección ${section}`, async ({ page }) => {
      await page.goto(`/profiles/alex/${section}`);
      await expect(
        page.getByRole('heading', {
          name: section === 'basic' ? 'Información básica' : section === 'education' ? 'Educación' : 'Proyectos',
        }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Agregar registro' })).toBeVisible();
    });
  }

  test('genera preguntas y confirma una propuesta del asistente', async ({ page }) => {
    await page.goto('/profiles/alex/experience');
    await page.getByRole('button', { name: 'Ver preguntas para profundizar' }).click();
    await expect(page.getByText('¿Qué resultado concreto obtuviste?')).toBeVisible();
    await page.getByPlaceholder('Escribe aquí...').fill('Coordiné un equipo y mejoré el proceso.');
    await page.getByRole('button', { name: 'Preparar propuesta' }).click();
    await expect(page.getByText('Propuesta pendiente de confirmación')).toBeVisible();
    const confirm = page.getByRole('button', { name: 'Confirmar y guardar' });
    await expect(confirm).toBeDisabled();
    await page.getByLabel('Cargo').fill('Project Coordinator');
    await page.getByLabel('Logros y responsabilidades').fill('Coordiné un equipo y mejoré el proceso.');
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(page.getByLabel('Logros y responsabilidades')).toHaveValue('Coordiné un equipo y mejoré el proceso.');
  });

  test('shows the project summary and printable CV without fake enhancement controls', async ({ page }) => {
    await page.goto('/profiles/alex/linkedin');
    await expect(page.getByRole('heading', { name: 'Proyectos destacados' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enhance' })).toHaveCount(0);
    await page.goto('/profiles/alex/curriculum');
    await expect(page.getByRole('button', { name: 'Print / Save PDF' })).toBeVisible();
    await expect(page.getByText('ENGLISH CV · REVIEW DRAFT')).toBeVisible();
  });
});
