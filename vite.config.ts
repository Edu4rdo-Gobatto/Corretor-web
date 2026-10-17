import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Fontes usadas acima da dobra (h1 em Libre Baskerville, corpo e navegação em Source Sans 3). Sem o preload o
// navegador só descobre os arquivos depois de baixar e interpretar o CSS.
const FONTES_CRITICAS = /\/(?:libre-baskerville-latin-400-(?:normal|italic)|source-sans-3-latin-(?:400|600)-normal)-[\w-]{8}\.woff2$/;

function precarregarFontes(): Plugin {
    return {
        name: 'precarregar-fontes',
        transformIndexHtml: {
            order: 'post',
            handler(_html, contexto): HtmlTagDescriptor[] {
                // `bundle` só existe no build do cliente; no dev os arquivos não têm hash.
                return Object.keys(contexto.bundle ?? {})
                    .filter((arquivo) => FONTES_CRITICAS.test(`/${arquivo}`))
                    .map((arquivo) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: true, href: `/${arquivo}` }, injectTo: 'head-prepend' }));
            },
        },
    };
}

export default defineConfig(() => ({
    plugins: [react(), tailwindcss(), precarregarFontes()],
    server: { allowedHosts: ['.loca.lt'] },
    test: {
        restoreMocks: true,
        exclude: ['**/node_modules/**', 'dist/**', '.worktrees/**', '.vercel/**', 'artifacts/**', 'tests/visual/**'],
    },
}));
