import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import PropertyForm from './PropertyForm';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { sampleClassifications, sampleWireProperty } from '../../seo/fixture';
import { propertyFromWire } from '../../services/portuguese';
import { propertyDraftKey, readPropertyDraft, writePropertyDraft } from './propertyDraft';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../components/MediaManager', () => ({ default: () => <div>Media editor</div> }));
const property = propertyFromWire(sampleWireProperty);
beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ agent: { ...property.agent, role: 'ADMIN', email: '', active: true, createdAt: '' }, loading: false, login: vi.fn(), logout: vi.fn(), refresh: vi.fn() });
  vi.spyOn(api, 'classifications').mockResolvedValue(sampleClassifications);
  vi.spyOn(api, 'getManagedProperty').mockResolvedValue(property);
  vi.spyOn(api, 'listAgents').mockResolvedValue({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); sessionStorage.clear(); });
function show() {
  const router = createMemoryRouter([
    { path: '/admin/imoveis/:id/editar', element: <PropertyForm/> },
    { path: '/admin/imoveis/novo', element: <PropertyForm/> },
    { path: '/admin/imoveis', element: <p>Listagem</p> },
  ], { initialEntries: ['/admin/imoveis', `/admin/imoveis/${property.id}/editar`] });
  render(<RouterProvider router={router}/>);
  return router;
}
it('duplicates into a fresh dirty form and saves without original identity or media', async () => {
  const router = show();
  await screen.findByDisplayValue(property.title);
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
  await screen.findByDisplayValue(`${property.title} — Cópia`);
  expect(screen.queryByText('Media editor')).toBeNull();
  const draft = readPropertyDraft(sessionStorage, propertyDraftKey(property.agentId));
  expect(draft).not.toHaveProperty('slug');
  expect(draft).not.toHaveProperty('media');
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('link', { name: 'Voltar' }));
  await waitFor(() => expect(confirm).toHaveBeenCalled());
  expect(router.state.location.pathname).toBe('/admin/imoveis/novo');
  const save = vi.spyOn(api, 'saveProperty').mockResolvedValue({ ...property, id: 'copy', slug: 'copy' });
  confirm.mockClear();
  fireEvent.click(screen.getByRole('button', { name: 'Salvar imóvel' }));
  await waitFor(() => expect(router.state.location.pathname).toBe('/admin/imoveis/copy/editar'));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: `${property.title} — Cópia` }), undefined, undefined);
  expect(confirm).not.toHaveBeenCalled();
});
it('cancels links and back without losing fields, then confirms programmatic navigation', async () => {
  const router = show();
  const input = await screen.findByDisplayValue(property.title);
  fireEvent.change(input, { target: { value: 'Alteração local' } });
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('link', { name: 'Voltar' }));
  await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
  await act(async () => { await router.navigate(-1); });
  expect(confirm).toHaveBeenCalledTimes(2);
  expect(input).toHaveValue('Alteração local');
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  confirm.mockReturnValue(true);
  await act(async () => { await router.navigate('/admin/imoveis'); });
  expect(await screen.findByText('Listagem')).toBeInTheDocument();
});
it('preserves a previous new draft when replacement is canceled', async () => {
  const key = propertyDraftKey(property.agentId);
  writePropertyDraft(sessionStorage, key, { title: 'Rascunho anterior' });
  show();
  await screen.findByDisplayValue(property.title);
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
  expect(readPropertyDraft(sessionStorage, key)?.title).toBe('Rascunho anterior');
});
it('resets existing fields when navigating to an empty new form', async () => {
  const router = show();
  await screen.findByDisplayValue(property.title);
  await act(async () => { await router.navigate('/admin/imoveis/novo'); });
  await waitFor(() => expect(screen.getByLabelText('Título do anúncio *')).toHaveValue(''));
  expect(screen.queryByText('Media editor')).toBeNull();
});
it.each(['types', 'purposes', 'features'] as const)('rejects inactive %s when copying', async kind => {
  vi.mocked(api.classifications).mockResolvedValue({ ...sampleClassifications, [kind]: sampleClassifications[kind].map(v => ({ ...v, ativo: false })) });
  if (kind === 'features') vi.mocked(api.getManagedProperty).mockResolvedValue({ ...property, featureValues: [{ caracteristica_id: '11111111-1111-4111-8111-111111111111', valor: 'x' }] });
  show();
  await screen.findByDisplayValue(property.title);
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
  expect(await screen.findByText(/Não é possível duplicar/)).toBeInTheDocument();
  expect(readPropertyDraft(sessionStorage, propertyDraftKey(property.agentId))).toBeNull();
});
it('hides duplication for a different owner', async () => {
  const session = vi.mocked(useAuth)();
  vi.mocked(useAuth).mockReturnValue({ ...session, agent: { ...session.agent!, id: 'other', role: 'AGENT' } });
  show();
  await screen.findByRole('heading', { name: property.title });
  expect(screen.queryByRole('button', { name: 'Duplicar' })).toBeNull();
});
