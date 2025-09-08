/* eslint-env node */
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

const gitpodHost = process.env.GITPOD_WORKSPACE_URL
  ? new URL(process.env.GITPOD_WORKSPACE_URL).hostname
  : null;
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite el acceso desde el workspace actual de Gitpod
    allowedHosts: gitpodHost ? [`5173-${gitpodHost}`] : true,
    proxy: {
      // Redirige TODO lo que empiece por /auth al backend en el mismo contenedor
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/pacientes': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/citas': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/historias': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/prediccion': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
});
