import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages: served at https://<user>.github.io/<repo>/
  // Repo: andlie-lee/3D-  -> base must be '/3D-/'.
  // Override at build time with VITE_BASE if needed.
  base: (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_BASE ?? '/3D-/',
  plugins: [react()],
  server: { port: 5173, host: true },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          pdf: ['jspdf', 'jspdf-autotable'],
        },
      },
    },
  },
});
