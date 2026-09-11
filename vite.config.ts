import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: { proxy: { '/api': { target: environment.API_PROXY_TARGET || 'http://localhost:3000', changeOrigin: true, rewrite: (path: string) => path.replace(/^\/api/, '') } } },
    test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], restoreMocks: true },
  };
});
