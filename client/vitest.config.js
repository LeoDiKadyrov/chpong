import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Tests live in dialogue_pong/tests/ (per CLAUDE.md file structure)
    include: ['../tests/**/*.test.js'],
    environment: 'node',  // pure logic — no DOM/Canvas needed
    globals: true,
  },
  resolve: {
    alias: {
      // Mirror the @shared alias from vite.config.js
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});
