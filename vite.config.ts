import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
    plugins: [react(), tailwindcss()],
    server: { allowedHosts: ['.loca.lt'] },
    test: { restoreMocks: true, exclude: ['node_modules', 'dist', '.worktrees', '.vercel'] },
}));
