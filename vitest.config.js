import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['src/engine/__tests__/**/*.test.js', 'src/components/__tests__/**/*.test.jsx'], environment: 'node' },
});
