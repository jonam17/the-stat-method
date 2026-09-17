import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['src/engine/__tests__/**/*.test.js'], environment: 'node' },
});
