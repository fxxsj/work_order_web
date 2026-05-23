import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: [
        'src/components/common',
        'src/components/dispatch',
        'src/components',
      ],
      extensions: ['vue'],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
    allowedHosts: ['nuc', 'nuc.tail378827.ts.net'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 30000,
        proxyTimeout: 30000,
      },
      '/admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
      },
    },
  },
  build: {
    target: 'es2015',
    cssTarget: 'chrome80',
    productionSourceMap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          typeof warning.id === 'string' &&
          warning.id.includes('@vueuse/core')
        ) {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;`,
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
  },
})
