import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@tomsoftware/logger': `${root}/packages/logger/index.ts`,
      '@tomsoftware/virtual-fs': `${root}/packages/virtual-fs/index.ts`,
      '@tomsoftware/vi-lib': `${root}/packages/vi-lib/index.ts`,
      '@tomsoftware/hex-view-control': `${root}/packages/hex-view-control/index.ts`,
    },
  },
  test: {
    environment: 'node',
    include: ['packages/**/*.test.ts'],
    exclude: ['**/dist/**', '**/node_modules/**'],
  },
});
