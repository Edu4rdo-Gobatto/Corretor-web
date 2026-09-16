import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LeadsList, { leadFiltersSchema } from './LeadsList';
import { api } from '../../services/api';
import type { Lead } from '../../types';

const id = '123e4567-e89b-42d3-a456-426614174000';
const lead: Lead = { id, agentId: id, propertyId: id, leadName: 'Maria', leadPhone: '65999999999', leadEmail: null, message: 'Mensagem completa', origin: 'SITE', consentGiven: true, consentTimestamp: '', consentIp: '', termsVersion: '1', createdAt: '2026-09-16T12:00:00Z' };
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function setup() {
  vi.spyOn(api, 'rentalPropertyOptions').mockResolvedValue({ itens: [{ id, nome: 'Sala comercial' }], total: 1, pagina: 1, limite: 15 });
  const list = vi.spyOn(api, 'listLeads').mockResolvedValue({ items: [lead], total: 30, page: 1, limit: 15, totalPages: 2 });
  render(<LeadsList />);
  return list;
}
it('applies draft filters together, resets pagination and clears all filters', async () => {
  const list = setup();
  await screen.findByText('Maria');
  fireEvent.click(screen.getByLabelText('Próxima página'));
  await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  await screen.findByText('Maria');
  const calls = list.mock.calls.length;
  fireEvent.change(screen.getByRole('combobox', { name: 'Imóvel' }), { target: { value: id } });
  fireEvent.change(screen.getByLabelText('De', { exact: true }), { target: { value: '2026-09-01' } });
  fireEvent.change(screen.getByLabelText('Até', { exact: true }), { target: { value: '2026-09-16' } });
  fireEvent.change(screen.getByLabelText('Situação'), { target: { value: 'false' } });
  expect(list).toHaveBeenCalledTimes(calls);
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, propertyId: id, active: false, createdFrom: '2026-09-01T00:00:00.000-04:00', createdTo: '2026-09-16T23:59:59.999-04:00' })));
  fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));
  await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, propertyId: undefined, active: true, createdFrom: undefined, createdTo: undefined })));
});
it('rejects reversed dates without requesting leads and validates UUID/calendar dates', async () => {
  const list = setup();
  await screen.findByText('Maria');
  fireEvent.change(screen.getByLabelText('De', { exact: true }), { target: { value: '2026-09-16' } });
  fireEvent.change(screen.getByLabelText('Até', { exact: true }), { target: { value: '2026-09-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('A data final');
  expect(list).toHaveBeenCalledTimes(1);
  expect(leadFiltersSchema.safeParse({ search: '', imovel_id: 'invalid', createdFrom: '', createdTo: '', active: 'true' }).success).toBe(false);
  expect(leadFiltersSchema.safeParse({ search: '', imovel_id: '', createdFrom: '2026-02-30', createdTo: '', active: 'true' }).success).toBe(false);
});
it('disables export during loading and after failure; shows origin and expandable message', async () => {
  const list = setup();
  const button = screen.getByRole('button', { name: 'Exportar CSV da página atual' });
  expect(button).toBeDisabled();
  await screen.findByText('Maria');
  expect(button).toBeEnabled();
  expect(screen.getByText('Origem: SITE')).toBeInTheDocument();
  expect(screen.getByText('Mensagem completa').closest('details')).not.toHaveAttribute('open');
  let rejectRequest: (reason: Error) => void = () => {};
  list.mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectRequest = reject; }));
  fireEvent.click(screen.getByLabelText('Próxima página'));
  await waitFor(() => expect(button).toBeDisabled());
  rejectRequest(new Error('Falha de teste'));
  await screen.findByText('Falha de teste');
  expect(button).toBeDisabled();
});
