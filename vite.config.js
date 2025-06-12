// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['three']
  },
  build: {
    rollupOptions: {
      external: ['mind-ar']
    }
  }
});
