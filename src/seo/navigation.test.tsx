import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';
import { BootstrapContext } from './context';
import { sampleProperty } from './fixture';
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
