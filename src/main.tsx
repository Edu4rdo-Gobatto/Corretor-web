import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LimiteErro from './componentes/LimiteErro';
import { ContextoBootstrap } from './seo/context';
import { defaultConfig, type Bootstrap } from './seo/metadata';

const elemento = document.getElementById('seo-bootstrap');
const boot: Bootstrap = elemento ? JSON.parse(elemento.textContent!) : { url: '', config: defaultConfig, data: {}, status: 200 };
const app = <React.StrictMode><ContextoBootstrap.Provider value={boot}><LimiteErro><App /></LimiteErro></ContextoBootstrap.Provider></React.StrictMode>;
const raiz = document.getElementById('root')!;
if (elemento && raiz.children.length) ReactDOM.hydrateRoot(raiz, app);
else ReactDOM.createRoot(raiz).render(app);
