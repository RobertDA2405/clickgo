import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';
// vite.config.ts


export default defineConfig({
  plugins: (() => {
  const base: Plugin[] = [react() as unknown as Plugin];
  if (process.env.ANALYZE === 'true') base.push(visualizer({ filename: 'dist/stats.html', open: false }) as unknown as Plugin);
  return base;
  })(),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase/firestore/lite')) return 'vendor-firebase-firestore-lite';
            if (id.includes('firebase/firestore')) return 'vendor-firebase-firestore';
            if (id.includes('firebase/auth')) return 'vendor-firebase-auth';
            if (id.includes('firebase/functions')) return 'vendor-firebase-functions';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('react-dom') || id.includes('react')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@tanstack')) return 'vendor-query';
            return 'vendor';
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});