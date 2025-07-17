import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Listen on all network interfaces
    strictPort: true,
    open: true,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
      overlay: false
    },
    watch: {
      usePolling: true
    },
    cors: true
  },
  define: {
    'process.env': {}
  }
});