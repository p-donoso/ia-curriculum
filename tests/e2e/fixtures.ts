import { test as base, expect } from '@playwright/test';

const fixtureProfile = {
  id: 'test-profile',
  name: 'Sample Candidate',
  role: 'Test profile',
  color: '#315efb',
  answers: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((profile) => {
      localStorage.setItem('ia-curriculum:profiles:v1', JSON.stringify([profile]));
    }, fixtureProfile);
    await use(page);
  },
});

export { expect };
