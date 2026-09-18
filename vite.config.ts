import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
    plugins: [react(), tailwindcss()],
    test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], restoreMocks: true, exclude: ['node_modules', 'dist', '.worktrees', '.vercel', 'tests/e2e/**', 'tests/visual/**'] },
}));
