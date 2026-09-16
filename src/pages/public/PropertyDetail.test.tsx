import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import PropertyDetail from './PropertyDetail';
import { api } from '../../services/api';
import type { Page, Property } from '../../types';

const fixture = vi.hoisted(() => ({ property: {
  id: 'current', title: 'Sala central', type: 'SALA', purpose: 'LOCACAO', price: 2500,
  slug: 'sala-central', status: 'DISPONIVEL', agentId: 'ana', createdAt: '', updatedAt: '',
  condoFee: null, iptuFee: 120, usableArea: 50, totalArea: 60,
  addressStreet: 'Rua Um', addressNumber: '10', addressCity: 'Cuiabá', addressState: 'MT',
  neighborhood: 'Centro', description: '', features: {}, media: [],
  agent: { id: 'ana', name: 'Ana', whatsappNumber: '5565999998888', creci: null, avatarUrl: null },
} as Property }));
vi.mock('../../services/api', () => ({ api: { listProperties: vi.fn(), getProperty: vi.fn() } }));
vi.mock('../../hooks/useResource', () => ({ useResource: () => ({ value: fixture.property, loading: false }) }));
vi.mock('../../seo/context', () => ({ Seo: () => null, useInitialData: () => undefined }));
vi.mock('../../components/MediaGallery', () => ({ default: () => null }));
vi.mock('../../components/PropertyCard', () => ({ default: ({ property }: { property: Property }) => <div>{property.title}</div> }));
const page = (items: Property[]): Page<Property> => ({ items, total: items.length, page: 1, limit: 4, totalPages: 1 });
const view = () => <MemoryRouter><PropertyDetail /></MemoryRouter>;
beforeEach(() => {
  vi.resetAllMocks();
  fixture.property.addressStreet = 'Rua Um';
  vi.mocked(api.listProperties).mockResolvedValue(page([]));
});
it('carrega mapa somente após escolha e mantém link externo; SSR não inclui iframe', () => {
  expect(renderToString(<StaticRouter location="/"><PropertyDetail /></StaticRouter>)).not.toContain('<iframe');
  const { container } = render(view());
  expect(container.querySelector('iframe')).toBeNull();
  expect(screen.getByRole('link', { name: 'Ver no mapa' })).toHaveAttribute('href', expect.stringContaining('google.com/maps/search'));
  fireEvent.click(screen.getByRole('button', { name: 'Carregar mapa' }));
  expect(container.querySelector('iframe')).toHaveAttribute('loading', 'lazy');
  expect(screen.getByText(/Soma dos valores informados \(parcial\)/)).toHaveTextContent('2.620');
  expect(screen.getByText(/Confirme os encargos/)).toHaveTextContent('periodicidade do IPTU');
  expect(screen.queryByText(/Total mensal estimado/)).not.toBeInTheDocument();
});
it('não oferece embed sem rua suficiente', () => {
  fixture.property.addressStreet = '  ';
  const { container } = render(view());
  expect(screen.queryByRole('button', { name: 'Carregar mapa' })).not.toBeInTheDocument();
  expect(container.querySelector('iframe')).toBeNull();
  expect(screen.getByRole('link', { name: 'Ver no mapa' })).toBeInTheDocument();
});
it('prioriza finalidade e cidade, completa por tipo e remove duplicatas', async () => {
  const matching = { ...fixture.property, id: 'match', title: 'Loja vizinha', type: 'LOJA' };
  const fallback = { ...fixture.property, id: 'fallback', title: 'Sala distante' };
  vi.mocked(api.listProperties).mockResolvedValueOnce(page([fixture.property, matching])).mockResolvedValueOnce(page([matching, fallback]));
  render(view());
  await screen.findByText('Sala distante');
  expect(api.listProperties).toHaveBeenNthCalledWith(1, { page: 1, limit: 4, purpose: 'LOCACAO', city: 'Cuiabá' });
  expect(api.listProperties).toHaveBeenNthCalledWith(2, { page: 1, limit: 4, type: 'SALA' });
  expect(screen.getAllByText('Loja vizinha')).toHaveLength(1);
});
it('mantém resultados prioritários se fallback falhar', async () => {
  vi.mocked(api.listProperties).mockResolvedValueOnce(page([{ ...fixture.property, id: 'match', title: 'Loja vizinha' }])).mockRejectedValueOnce(new Error('offline'));
  render(view());
  expect(await screen.findByText('Loja vizinha')).toBeInTheDocument();
});
it('não inicia fallback quando a consulta termina após desmontagem', async () => {
  let resolve!: (value: Page<Property>) => void;
  vi.mocked(api.listProperties).mockReturnValueOnce(new Promise(done => { resolve = done; }));
  const { unmount } = render(view());
  unmount();
  await act(async () => resolve(page([])));
  expect(api.listProperties).toHaveBeenCalledTimes(1);
});
it('trata rejeição tardia de fallback após desmontagem', async () => {
  let reject!: (reason: Error) => void;
  vi.mocked(api.listProperties).mockResolvedValueOnce(page([])).mockReturnValueOnce(new Promise((_done, fail) => { reject = fail; }));
  const { unmount } = render(view());
  await waitFor(() => expect(api.listProperties).toHaveBeenCalledTimes(2));
  unmount();
  await act(async () => reject(new Error('offline')));
  expect(screen.queryByText('Você também pode gostar')).not.toBeInTheDocument();
});
