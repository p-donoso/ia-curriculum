import { test, expect } from '@playwright/test';

test.describe('navegación principal', () => {
  test('permite recorrer los destinos del workspace', async ({ page }) => {
    await page.goto('/profiles/alex');
    await expect(page.getByRole('heading', { name: 'Construyamos tu próximo paso.' })).toBeVisible();
    await page.getByRole('link', { name: 'Información básica' }).click();
    await expect(page).toHaveURL(/\/profiles\/alex\/basic$/);
    await expect(page.getByRole('heading', { name: 'Información básica' })).toBeVisible();
    await page.goto('/profiles/alex');
    await page.getByRole('link', { name: 'Educación' }).click();
    await expect(page).toHaveURL(/\/profiles\/alex\/education$/);
    await page.goto('/profiles/alex');
    await page.getByRole('link', { name: 'Configuración' }).last().click();
    await expect(page).toHaveURL(/\/profiles\/alex\/settings$/);
  });

  test('abre la configuración BYOT y avanza la conversación', async ({ page }) => {
    await page.goto('/profiles/alex');
    await page.goto('/profiles/alex/settings');
    await expect(page).toHaveURL(/\/profiles\/alex\/settings$/);
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();
  });

  test('edita, persiste y restaura las semillas de prompts por perfil', async ({ page }) => {
    await page.goto('/profiles/alex/settings');
    const reflection = page.getByLabel('Reflexión guiada');
    await expect(reflection).toHaveValue(/Eres IA Curriculum/);
    await expect(reflection).not.toHaveAttribute('readonly');
    await reflection.fill('Prompt personalizado de reflexión');
    await page.getByRole('button', { name: 'Guardar configuración' }).first().click();
    await page.reload();
    await expect(page.getByLabel('Reflexión guiada')).toHaveValue('Prompt personalizado de reflexión');
    await page.getByRole('button', { name: 'Restaurar valores predeterminados' }).click();
    await expect(page.getByLabel('Reflexión guiada')).toHaveValue(/Eres IA Curriculum/);
    await page.getByRole('button', { name: 'Guardar configuración' }).last().click();
    await page.reload();
    await expect(page.getByLabel('Reflexión guiada')).toHaveValue(/Eres IA Curriculum/);
  });

  test('avanza la pregunta después de cada respuesta', async ({ page }) => {
    await page.goto('/profiles/alex');
    await expect(page.getByText('El trabajo que buscas', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('0% completado')).toBeVisible();
    const question = page.getByRole('heading', {
      name: /¿Qué tipo de trabajo|¿Qué problema te gusta resolver|Cuéntame un momento/,
    });
    await expect(question).toContainText('¿Qué tipo de trabajo');
    await page.getByPlaceholder('Escribe aquí tu respuesta...').fill('Quiero un trabajo donde pueda crecer.');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByRole('heading', { name: 'Tu dirección' })).toBeVisible();
    await expect(page.getByText('Tu aporte', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('33% completado')).toBeVisible();
    await expect(question).toContainText('¿Qué problema te gusta resolver');
    await page.getByPlaceholder('Escribe aquí tu respuesta...').fill('Me gusta ordenar problemas.');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(question).toContainText('Cuéntame un momento');
  });

  test('finishes the reflection, restores it after reload, and resets only after confirmation', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/profiles/alex');
    const question = page.getByRole('heading', {
      name: /¿Qué tipo de trabajo|¿Qué problema te gusta resolver|Cuéntame un momento|Ya tienes una base/,
    });
    const answer = page.getByPlaceholder('Escribe aquí tu respuesta...');
    const submit = page.getByRole('button', { name: 'Continuar' });

    for (const [index, response] of [
      'Busco liderar equipos.',
      'Me gusta resolver problemas de operación.',
      'Automaticé un proceso y reduje tiempos.',
    ].entries()) {
      await expect(question).toBeVisible();
      await answer.fill(response);
      await submit.click();
      if (index < 2) await expect(answer).toBeVisible();
    }

    await expect(page.getByRole('heading', { name: 'Ya tienes una base para tu perfil.' })).toBeVisible();
    await expect(page.getByText('Reflexión completa')).toBeVisible();
    await expect(page.getByText('Completa tu perfil')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Ya tienes una base para tu perfil.' })).toBeVisible();
    await page.getByRole('button', { name: 'Nueva sesión' }).click();
    await expect(
      page.getByRole('heading', { name: '¿Qué tipo de trabajo te gustaría conseguir en los próximos meses?' }),
    ).toBeVisible();
  });

  test('opens working mobile navigation and closes after route selection', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profiles/alex');
    const menu = page.getByRole('button', { name: 'Abrir menú de navegación' });
    await menu.click();
    const drawer = page.locator('.MuiDrawer-root');
    await expect(drawer).toBeVisible();
    await drawer.getByRole('link', { name: 'Proyectos' }).click();
    await expect(page).toHaveURL(/\/profiles\/alex\/projects$/);
    await expect(page.locator('.MuiDrawer-root')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();
  });

  test('exports profile data and deletes all local data after confirmation', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/profiles/alex/settings');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar datos del perfil' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('ia-curriculum-alex.json');
    await page.getByRole('button', { name: 'Eliminar perfil y datos' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Alex Morgan')).toHaveCount(0);
  });

  test('permite crear, editar y eliminar un registro de experiencia', async ({ page }) => {
    await page.goto('/profiles/alex/experience');
    await page.getByRole('button', { name: 'Agregar registro' }).click();
    await page.getByLabel('Cargo').fill('Coordinador');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Coordinador')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Coordinador')).toHaveCount(0);
  });
});
