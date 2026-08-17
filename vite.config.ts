import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'hex-view'
      }
    }
  })],
  resolve: {
    alias: {
      '@tomsoftware/logger': path.resolve(__dirname, 'packages/logger/index.ts'),
      '@tomsoftware/virtual-fs': path.resolve(__dirname, 'packages/virtual-fs/index.ts'),
      '@tomsoftware/hex-view-control': path.resolve(__dirname, 'packages/hex-view-control/index.ts'),
      '@tomsoftware/vi-lib': path.resolve(__dirname, 'packages/storm-lib/index.ts')
    }
  },
  optimizeDeps: {
    exclude: [
      '@tomsoftware/logger',
      '@tomsoftware/virtual-fs',
      '@tomsoftware/hex-view-control',
      '@tomsoftware/vi-lib'
    ]
  }
})
