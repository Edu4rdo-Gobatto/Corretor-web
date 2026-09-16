import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Catalogo from './Catalogo';
import { ContextoBootstrap } from '../../seo/context';
import { classificacoesExemplo, imovelExemplo } from '../../seo/fixture';
import { api } from '../../servicos/api';
import { lerUrlCatalogo } from '../../servicos/urls';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function Localizacao() { const location = useLocation(); return <output data-testid="url">{location.pathname + location.search}</output>; }

describe('sugestões de cidade e filtros', () => {
  it('deduplica cidades e mantém finalidade, preços, área e ordem ao pesquisar e paginar', async () => {
    const url = '/imoveis/para-alugar?cidade=Cuiab%C3%A1&preco-minimo=100&preco-maximo=5000&ordenar=valor_asc';
    const pagina = { itens: [imovelExemplo, { ...imovelExemplo, id: 2, cidade: ' cuiabá ' }], total: 18, pagina: 1, limite: 9, total_paginas: 2 };
    vi.spyOn(api, 'listarImoveis').mockResolvedValue(pagina);
    vi.spyOn(api, 'classificacoes').mockResolvedValue(classificacoesExemplo);
    render(<MemoryRouter initialEntries={[url]}><ContextoBootstrap.Provider value={{ url, config: { siteUrl: '', indexable: false }, status: 200, data: { catalogo: pagina, classificacoes: classificacoesExemplo } }}><Catalogo /><Localizacao /></ContextoBootstrap.Provider></MemoryRouter>);
    const cidade = screen.getByRole('combobox', { name: 'Onde?' });
    document.getElementById('catalogo')!.scrollIntoView = vi.fn();
    expect(cidade).toHaveAttribute('list', 'catalogo-cidades');
    expect(document.querySelectorAll('#catalogo-cidades option')).toHaveLength(1);
    fireEvent.change(cidade, { target: { value: 'Juara' } });
    fireEvent.change(screen.getByLabelText('Bairro'), { target: { value: 'Centro' } });
    fireEvent.change(screen.getByLabelText('Área mínima (m²)'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await waitFor(() => expect(lerUrlCatalogo(screen.getByTestId('url').textContent!)).toMatchObject({ cidade: 'Juara', bairro: 'Centro', finalidade: 'locacao', valor_min: 100, valor_max: 5000, area_min: 50, ordenar: 'valor_asc', pagina: 1 }));
    const proxima = screen.getAllByRole('link').find((link) => link.getAttribute('href')?.includes('pagina=2'));
    expect(proxima).toBeDefined();
    expect(lerUrlCatalogo(proxima!.getAttribute('href')!)).toMatchObject({ cidade: 'Juara', finalidade: 'locacao', ordenar: 'valor_asc', pagina: 2 });
  });
});
