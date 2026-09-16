import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';
import { BootstrapContext } from './context';
import { sampleProperty, sampleClassifications } from './fixture';
import { api } from '../services/api';

function Navigation() { const navigate = useNavigate(); return <><button onClick={() => navigate('/imoveis/second')}>Outro anúncio</button><button onClick={() => navigate(`/imoveis/${sampleProperty.slug}`)}>Primeiro anúncio</button></>; }
describe('hydrated public navigation', () => {
  it('reuses initial data once, then fetches fresh data when returning to the original property', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const get = vi.spyOn(api, 'getProperty').mockImplementation(async slug => ({ ...sampleProperty, slug, title: slug === 'second' ? 'Segundo anúncio' : 'Primeiro atualizado' }));
    const url = `/imoveis/${sampleProperty.slug}`;
    render(<BootstrapContext.Provider value={{ url, data: { property: sampleProperty }, config: { siteUrl: 'https://imoveis.example', indexable: true }, status: 200 }}><MemoryRouter initialEntries={[url]}><Navigation/><AppRoutes/></MemoryRouter></BootstrapContext.Provider>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(sampleProperty.title);
    expect(get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Outro anúncio'));
    await waitFor(() => expect(document.title).toContain('Segundo anúncio'));
    fireEvent.click(screen.getByText('Primeiro anúncio'));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Primeiro atualizado'));
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });
});

function CatalogNavigation() {
  const navigate = useNavigate(); const location = useLocation();
  return <><output data-testid="url">{location.pathname + location.search}</output><button onClick={() => navigate(-1)}>Voltar histórico</button><button onClick={() => navigate(1)}>Avançar histórico</button></>;
}
describe('catalog URL navigation', () => {
  it('replaces legacy URLs, changes filters, clears and restores history', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(api,'classifications').mockResolvedValue(sampleClassifications);
    const list = vi.spyOn(api, 'listProperties').mockResolvedValue({items:[],total:0,totalPages:0,page:1,limit:9});
    render(<MemoryRouter initialEntries={['/?purpose=LOCACAO&type=SALA&utm_source=test']}><CatalogNavigation/><AppRoutes/></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/imoveis/para-alugar/salas?utm_source=test'));
    await waitFor(() => expect(list).toHaveBeenCalledWith(expect.objectContaining({purpose:'LOCACAO',type:'SALA'})));
    fireEvent.click(screen.getByRole('button', {name:'Galpões'}));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/imoveis/para-alugar/galpoes?utm_source=test'));
    fireEvent.click(screen.getAllByRole('button', {name:'Limpar filtros'})[0]);
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/?utm_source=test'));
    fireEvent.click(screen.getByRole('button', {name:'Voltar histórico'}));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/imoveis/para-alugar/galpoes'));
    fireEvent.click(screen.getByRole('button', {name:'Avançar histórico'}));
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/?utm_source=test'));
  });
  it('keeps the selected chip readable and preserves scroll on catalog filter changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(api,'classifications').mockResolvedValue(sampleClassifications);
    vi.spyOn(api, 'listProperties').mockResolvedValue({items:[],total:0,totalPages:2,page:1,limit:9});
    render(<MemoryRouter initialEntries={['/']}><AppRoutes/></MemoryRouter>);
    const all = await screen.findByRole('button', {name:'Todos os imóveis'});
    const sheds = await screen.findByRole('button', {name:'Galpões'});
    // Selecionado nunca mistura utilities conflitantes (branco sobre branco = texto invisível).
    for (const cls of [' bg-navy ', ' text-white ']) expect(all.className).toContain(cls);
    for (const cls of ['bg-transparent', 'text-muted', 'border-line']) expect(all.className).not.toContain(cls);
    expect(sheds.className).toContain('bg-transparent');
    expect(sheds.className).not.toContain(' bg-navy ');
    expect(sheds.className).not.toContain(' text-white ');
    // Filtro por tipo troca o pathname mas não joga a página ao topo.
    scrollTo.mockClear();
    fireEvent.click(sheds);
    await waitFor(() => expect(screen.getByRole('button', {name:'Galpões'}).getAttribute('aria-pressed')).toBe('true'));
    expect(screen.getByRole('button', {name:'Galpões'}).className).toContain(' bg-navy ');
    expect(screen.getByRole('button', {name:'Todos os imóveis'}).className).toContain('bg-transparent');
    expect(scrollTo).not.toHaveBeenCalled();
    // Paginação rola até os resultados, sem ir ao topo da página.
    fireEvent.click(screen.getByRole('link', {name:'Próxima página'}));
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());
    expect(scrollTo).not.toHaveBeenCalled();
    // Sair do catálogo continua rolando ao topo.
    fireEvent.click(screen.getByRole('link', {name:'Política de privacidade'}));
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0));
  });
});
