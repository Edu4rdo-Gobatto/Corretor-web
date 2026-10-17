import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LimiteErro from './componentes/LimiteErro';
import { ContextoBootstrap } from './seo/context';
import { defaultConfig, type Bootstrap } from './seo/metadata';

// HTML em cache no CDN pode apontar para chunks de um deploy anterior: recarrega uma vez para buscar o HTML atual.
// Sem preventDefault (ou sem sessionStorage para travar o laço) o erro segue para o LimiteErro, que oferece "Tentar novamente".
const MARCA_RECARGA = 'chunk-recarregado';
window.addEventListener('vite:preloadError', (evento) => {
  try {
    if (sessionStorage.getItem(MARCA_RECARGA)) return;
    sessionStorage.setItem(MARCA_RECARGA, '1');
  } catch { return; }
  evento.preventDefault();
  window.location.reload();
});
// Depois de uma carga saudável a marca sai, para um próximo deploy poder recarregar de novo na mesma aba.
window.setTimeout(() => { try { sessionStorage.removeItem(MARCA_RECARGA); } catch { /* ignora */ } }, 10_000);

const elemento = document.getElementById('seo-bootstrap');
const boot: Bootstrap = elemento ? JSON.parse(elemento.textContent!) : { url: '', config: defaultConfig, data: {}, status: 200 };
const app = <React.StrictMode><ContextoBootstrap.Provider value={boot}><LimiteErro><App /></LimiteErro></ContextoBootstrap.Provider></React.StrictMode>;
const raiz = document.getElementById('root')!;
if (elemento && raiz.children.length) ReactDOM.hydrateRoot(raiz, app);
else ReactDOM.createRoot(raiz).render(app);
