import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { buildSeo, defaultConfig, renderHead, type Bootstrap, type PublicData } from './metadata';

export const BootstrapContext = createContext<Bootstrap>({ url: '', config: defaultConfig, data: {}, status: 200 });
export function useInitialData() {
  const bootstrap = useContext(BootstrapContext);
  const location = useLocation();
  return bootstrap.url === location.pathname + location.search ? bootstrap : undefined;
}
export function Seo({ data = {}, status = 200 }: { data?: PublicData; status?: number }) {
  const { config } = useContext(BootstrapContext);
  const location = useLocation();
  const html = renderHead(buildSeo(location.pathname + location.search, config, data, status));
  useEffect(() => {
    document.head.querySelectorAll('[data-seo], title, meta[name="description"]').forEach(node => node.remove());
    const template = document.createElement('template');
    template.innerHTML = html;
    document.head.append(template.content);
  }, [html]);
  return null;
}
