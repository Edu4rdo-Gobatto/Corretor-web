import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { buildSeo, defaultConfig, renderHead, type Bootstrap, type DadosPublicos } from './metadata';

export const ContextoBootstrap = createContext<Bootstrap>({ url: '', config: defaultConfig, data: {}, status: 200 });

/** Dados que o SSR já buscou para esta URL; vazio depois da primeira navegação no cliente. */
export function useDadosIniciais() {
  const bootstrap = useContext(ContextoBootstrap);
  const location = useLocation();
  return bootstrap.url === location.pathname + location.search ? bootstrap : undefined;
}

export function Seo({ dados = {}, status = 200 }: { dados?: DadosPublicos; status?: number }) {
  const { config } = useContext(ContextoBootstrap);
  const location = useLocation();
  const html = renderHead(buildSeo(location.pathname + location.search, config, dados, status));
  useEffect(() => {
    document.head.querySelectorAll('[data-seo], title, meta[name="description"]').forEach((node) => node.remove());
    const template = document.createElement('template');
    template.innerHTML = html;
    document.head.append(template.content);
  }, [html]);
  return null;
}
