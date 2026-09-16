import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Catalog from './Catalog';
import { BootstrapContext } from '../../seo/context';
import { sampleClassifications, sampleProperty } from '../../seo/fixture';
import { api } from '../../services/api';
import { readCatalogUrl } from '../../services/urls';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function Location() { const location = useLocation(); return <output data-testid="url">{location.pathname + location.search}</output>; }
describe('sugestões de cidade e filtros', () => {
  it('deduplica cidades e mantém finalidade e preços ao pesquisar e paginar', async () => {
    const url = '/imoveis/para-alugar?cidade=Cuiab%C3%A1&preco-minimo=100&preco-maximo=5000';
    const page = { items: [sampleProperty, {...sampleProperty, id:'two', addressCity:' cuiabá '}], total:18, page:1, limit:9, totalPages:2 };
    vi.spyOn(api, 'listProperties').mockResolvedValue(page);
    vi.spyOn(api, 'classifications').mockResolvedValue(sampleClassifications);
    render(<MemoryRouter initialEntries={[url]}><BootstrapContext.Provider value={{url, config:{siteUrl:'', indexable:false}, status:200, data:{catalog:page,classifications:sampleClassifications}}}><Catalog/><Location/></BootstrapContext.Provider></MemoryRouter>);
    const input = screen.getByRole('combobox', {name:'Onde?'});
    document.getElementById('catalogo')!.scrollIntoView = vi.fn();
    expect(input).toHaveAttribute('list', 'catalog-cities');
    expect(document.querySelectorAll('#catalog-cities option')).toHaveLength(1);
    fireEvent.change(input, {target:{value:'Juara'}});
    fireEvent.click(screen.getByRole('button', {name:'Buscar'}));
    await waitFor(() => expect(readCatalogUrl(screen.getByTestId('url').textContent!)).toMatchObject({city:'Juara',purpose:'LOCACAO',minPrice:100,maxPrice:5000,page:1}));
    const next = screen.getAllByRole('link').find(link => link.getAttribute('href')?.includes('pagina=2'));
    expect(next).toBeDefined();
    expect(readCatalogUrl(next!.getAttribute('href')!)).toMatchObject({city:'Juara',purpose:'LOCACAO',minPrice:100,maxPrice:5000,page:2});
  });
});
