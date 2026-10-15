import { defineConfig } from 'vitest/config';

// Components import from 'react' and run on preact/compat (astro.config.mjs). Tests
// resolve the same way, so they exercise the renderer visitors actually get.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^react-dom\/server$/, replacement: 'preact/compat/server' },
      { find: /^react-dom$/, replacement: 'preact/compat' },
      { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
      { find: /^react$/, replacement: 'preact/compat' },
    ],
  },
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  test: { include: ['src/engine/__tests__/**/*.test.js', 'src/components/__tests__/**/*.test.jsx'], environment: 'node' },
});
