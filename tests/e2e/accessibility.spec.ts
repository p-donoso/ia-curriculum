import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('primary routes have no serious or critical accessibility violations', async ({ page }) => {
  for (const route of [
    '/',
    '/profiles/alex',
    '/profiles/alex/basic',
    '/profiles/alex/settings',
    '/profiles/alex/curriculum',
  ]) {
    await page.goto(route);
    if (route.endsWith('/settings')) {
      await expect(page.getByLabel('Reflexión guiada')).not.toHaveAttribute('readonly');
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact ?? '')),
      `Accessibility violations on ${route}`,
    ).toEqual([]);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profiles/alex');
  await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
  const mobileMenuResults = await new AxeBuilder({ page }).analyze();
  expect(
    mobileMenuResults.violations.filter(
      (violation) => ['critical', 'serious'].includes(violation.impact ?? '') && violation.id !== 'aria-dialog-name',
    ),
  ).toEqual([]);
  await expect(page.getByRole('dialog').getByRole('navigation', { name: 'Navegación principal' }).last()).toBeVisible();
});
