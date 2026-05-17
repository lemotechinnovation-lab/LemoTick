import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
