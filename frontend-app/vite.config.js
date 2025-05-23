// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Esto permite que tu workspace de Gitpod sea un host válido
    allowedHosts: [
      "5173-mateomendez2-sistemaacv-xrguw9cta20.ws-us118.gitpod.io"
    ],
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
    }
  }
});
