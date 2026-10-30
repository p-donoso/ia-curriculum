import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.d.ts'],
      thresholds: { lines: 40, functions: 30, branches: 15, statements: 25 },
    },
  },
});
