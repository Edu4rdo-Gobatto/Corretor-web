import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
    plugins: [react()],
    test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], restoreMocks: true, exclude: ['node_modules', 'dist', '.worktrees', '.vercel'] },
}));
