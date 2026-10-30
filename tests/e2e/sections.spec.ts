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
    await page.getByPlaceholder('Escribe aquí…').fill('Coordiné un equipo y mejoré el proceso.');
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
    await expect(
      page.getByText('Agrega tu resumen profesional en Información básica para ver aquí la sección «Acerca de». '),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Proyectos destacados' })).toBeVisible();
    await expect(
      page.getByText('Aún no hay proyectos. Agrega uno para completar esta sección de tu perfil.'),
    ).toBeVisible();
    await expect(page.getByText('Aún no hay habilidades. Agrega las que puedas respaldar con ejemplos.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enhance' })).toHaveCount(0);
    await page.goto('/profiles/alex/curriculum');
    await expect(page.getByRole('button', { name: 'Imprimir / Guardar PDF' })).toBeVisible();
    await expect(page.getByText('BORRADOR DE CV')).toBeVisible();
    await page.getByRole('button', { name: 'Switch language to English' }).click();
    await page.goto('/profiles/alex/curriculum');
    await expect(page.getByRole('button', { name: 'Print / Save PDF' })).toBeVisible();
    await expect(page.getByText('ENGLISH RESUME · REVIEW DRAFT')).toBeVisible();
    await expect(page.getByText('Technology Leader · Platform Engineering · Cloud Architecture')).toHaveCount(0);
  });

  test('uses the saved professional headline and a clear record title', async ({ page }) => {
    await page.goto('/profiles/alex/basic');
    const now = new Date().toISOString();
    await page.evaluate((createdAt) => {
      const key = 'ia-curriculum:records:alex:v1';
      const records = [
        {
          id: 'sample-basic',
          section: 'basic',
          values: { 'Nombre completo': 'Jordan Taylor', 'Professional Headline': 'Operations Leader' },
          createdAt,
          updatedAt: createdAt,
        },
        {
          id: 'sample-project',
          section: 'projects',
          values: { 'Nombre del proyecto': 'Service Analytics Hub', Descripción: 'Test description' },
          createdAt,
          updatedAt: createdAt,
        },
      ];
      localStorage.setItem(key, JSON.stringify(records));
    }, now);
    await page.reload();
    await expect(page.getByText('Jordan Taylor', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Titular profesional')).toBeVisible();
    await page.goto('/profiles/alex/projects');
    await expect(page.getByRole('button', { name: 'Service Analytics Hub', exact: true })).toBeVisible();
    await page.goto('/profiles/alex/curriculum');
    await expect(page.getByText('Operations Leader')).toBeVisible();
  });
});
