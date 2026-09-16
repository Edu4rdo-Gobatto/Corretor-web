import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';
import { ContextoBootstrap } from './context';
import { imovelExemplo, classificacoesExemplo } from './fixture';
import { api } from '../servicos/api';

function Navegacao() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate('/imoveis/segundo-2')}>Outro anúncio</button><button onClick={() => navigate(`/imoveis/${imovelExemplo.slug}`)}>Primeiro anúncio</button></>;
}
describe('navegação pública hidratada', () => {
  it('usa os dados iniciais uma vez e busca dados novos ao voltar ao imóvel original', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const obter = vi.spyOn(api, 'obterImovel').mockImplementation(async (slug) => ({ ...imovelExemplo, slug, titulo: slug === 'segundo-2' ? 'Segundo anúncio' : 'Primeiro atualizado' }));
    vi.spyOn(api, 'listarImoveis').mockResolvedValue({ itens: [], total: 0, pagina: 1, limite: 4, total_paginas: 0 });
    const url = `/imoveis/${imovelExemplo.slug}`;
    render(<ContextoBootstrap.Provider value={{ url, data: { imovel: imovelExemplo }, config: { siteUrl: 'https://imoveis.example', indexable: true }, status: 200 }}><MemoryRouter initialEntries={[url]}><Navegacao /><AppRoutes /></MemoryRouter></ContextoBootstrap.Provider>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(imovelExemplo.titulo);
    expect(obter).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Outro anúncio'));
    await waitFor(() => expect(document.title).toContain('Segundo anúncio'));
    fireEvent.click(screen.getByText('Primeiro anúncio'));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Primeiro atualizado'));
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });
});

function NavegacaoCatalogo() {
  const navigate = useNavigate(); const location = useLocation();
  return <><output data-testid="url">{location.pathname + location.search}</output><button onClick={() => navigate(-1)}>Voltar histórico</button><button onClick={() => navigate(1)}>Avançar histórico</button></>;
}
describe('navegação por URL do catálogo', () => {
  it('substitui URLs antigas, troca filtros, limpa e restaura o histórico', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(api, 'classificacoes').mockResolvedValue(classificacoesExemplo);
    const listar = vi.spyOn(api, 'listarImoveis').mockResolvedValue({ itens: [], total: 0, total_paginas: 0, pagina: 1, limite: 9 });
    render(<MemoryRouter initialEntries={['/?purpose=LOCACAO&type=SALA&utm_source=test']}><NavegacaoCatalogo /><AppRoutes /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/imoveis/para-alugar/salas?utm_source=test'));
    await waitFor(() => expect(listar).toHaveBeenCalledWith(expect.objectContaining({ finalidade: 'locacao', tipo: 'sala-comercial' })));
    fireEvent.click(await screen.findByRole('button', { name: 'Galpões' }));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/imoveis/para-alugar/galpoes?utm_source=test'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0]);
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/?utm_source=test'));
    fireEvent.click(screen.getByRole('button', { name: 'Voltar histórico' }));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/imoveis/para-alugar/galpoes'));
    fireEvent.click(screen.getByRole('button', { name: 'Avançar histórico' }));
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/?utm_source=test'));
  });
  it('mantém o chip selecionado legível e preserva a rolagem ao filtrar', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(api, 'classificacoes').mockResolvedValue(classificacoesExemplo);
    vi.spyOn(api, 'listarImoveis').mockResolvedValue({ itens: [], total: 0, total_paginas: 2, pagina: 1, limite: 9 });
    render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>);
    const todos = await screen.findByRole('button', { name: 'Todos os imóveis' });
    const galpoes = await screen.findByRole('button', { name: 'Galpões' });
    for (const classe of [' bg-navy ', ' text-white ']) expect(todos.className).toContain(classe);
    for (const classe of ['bg-transparent', 'text-muted', 'border-line']) expect(todos.className).not.toContain(classe);
    expect(galpoes.className).toContain('bg-transparent');
    scrollTo.mockClear();
    fireEvent.click(galpoes);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Galpões' }).getAttribute('aria-pressed')).toBe('true'));
    expect(screen.getByRole('button', { name: 'Galpões' }).className).toContain(' bg-navy ');
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: 'Próxima página' }));
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: 'Política de privacidade' }));
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0));
  });
});
