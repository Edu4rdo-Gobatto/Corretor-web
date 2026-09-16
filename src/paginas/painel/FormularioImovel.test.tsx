import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import FormularioImovel from './FormularioImovel';
import { api } from '../../servicos/api';
import { classificacoesExemplo, imovelExemplo } from '../../seo/fixture';
import { chaveRascunho, gravarRascunho, lerRascunho } from './rascunhoImovel';
import { simularSessao } from './sessaoTeste';
import { prepararEnvio } from '../../componentes/prepararMidia';
import type { FichaImovel } from '../../tipos';

vi.mock('../../hooks/useSessao', () => ({ useSessao: vi.fn() }));
vi.mock('../../componentes/GerenciadorMidia', () => ({ default: () => <div>Editor de mídia</div> }));
vi.mock('../../componentes/prepararMidia', async (importar) => ({ ...(await importar<typeof import('../../componentes/prepararMidia')>()), prepararEnvio: vi.fn() }));
const ficha: FichaImovel = { ...imovelExemplo, proprietario_id: null, proprietario: null, exclusividade: false, exclusividade_ate: null, data_captacao: null, chaves: null, matricula: null, inscricao_municipal: null, observacoes_internas: null, motivo_baixa: null };

beforeEach(() => {
  simularSessao();
  vi.spyOn(api, 'classificacoes').mockResolvedValue(classificacoesExemplo);
  vi.spyOn(api, 'obterFicha').mockResolvedValue(ficha);
  vi.spyOn(api, 'listarCorretores').mockResolvedValue({ itens: [], total: 0, pagina: 1, limite: 100, total_paginas: 0 });
  vi.spyOn(api, 'listarPessoas').mockResolvedValue({ itens: [], total: 0, pagina: 1, limite: 10, total_paginas: 0 });
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:previa'), revokeObjectURL: vi.fn() }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); sessionStorage.clear(); });
function mostrar(entradas = ['/admin/imoveis', `/admin/imoveis/${ficha.id}/editar`]) {
  const roteador = createMemoryRouter([
    { path: '/admin/imoveis/:id/editar', element: <FormularioImovel /> },
    { path: '/admin/imoveis/novo', element: <FormularioImovel /> },
    { path: '/admin/imoveis', element: <p>Listagem</p> },
  ], { initialEntries: entradas });
  render(<RouterProvider router={roteador} />);
  return roteador;
}
function preencherNovo() {
  fireEvent.change(screen.getByLabelText('Título do anúncio *'), { target: { value: 'Galpão novo' } });
  fireEvent.change(screen.getByLabelText('Tipo de imóvel *'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Finalidade *'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Descrição *'), { target: { value: 'Galpão amplo.' } });
  fireEvent.change(screen.getByLabelText('Valor de locação mensal (R$)'), { target: { value: '3500' } });
  fireEvent.change(screen.getByLabelText('Área útil (m²) *'), { target: { value: '300' } });
  fireEvent.change(screen.getByLabelText('Área total (m²) *'), { target: { value: '400' } });
  fireEvent.change(screen.getByLabelText('Rua / avenida *'), { target: { value: 'BR-163' } });
  fireEvent.change(screen.getByLabelText('Número *'), { target: { value: 'km 10' } });
  fireEvent.change(screen.getByLabelText('Bairro *'), { target: { value: 'Industrial' } });
  fireEvent.change(screen.getByLabelText('Cidade *'), { target: { value: 'Juara' } });
}

it('cria o imóvel com as fotos escolhidas, envia depois do POST e abre a edição', async () => {
  const roteador = mostrar(['/admin/imoveis/novo']);
  await screen.findByLabelText('Título do anúncio *');
  preencherNovo();
  const foto = new File(['bytes'], 'fachada.jpg', { type: 'image/jpeg' });
  const entrada = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(entrada, 'files', { value: [foto], configurable: true });
  fireEvent.change(entrada);
  expect(await screen.findByAltText('Prévia 1: fachada.jpg')).toBeInTheDocument();
  const salvar = vi.spyOn(api, 'salvarImovel').mockResolvedValue({ ...ficha, id: 99, slug: 'galpao-novo-99' });
  vi.mocked(prepararEnvio).mockResolvedValue({ prontos: [foto], ilegiveis: [] });
  const enviar = vi.spyOn(api, 'enviarMidias').mockResolvedValue([]);
  fireEvent.click(screen.getByRole('button', { name: 'Salvar imóvel e enviar mídias' }));
  await waitFor(() => expect(roteador.state.location.pathname).toBe('/admin/imoveis/99/editar'));
  expect(salvar).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Galpão novo', tipo_id: 2, finalidade_id: 3, valor_locacao: '3500.00', valor_venda: null, corretor_id: 1 }), undefined, undefined);
  expect(enviar).toHaveBeenCalledWith(99, [foto]);
  expect(salvar.mock.invocationCallOrder[0]).toBeLessThan(enviar.mock.invocationCallOrder[0]);
});
it('duplica para um formulário novo sem identidade nem mídia e confirma antes de sair', async () => {
  const roteador = mostrar();
  await screen.findByDisplayValue(ficha.titulo);
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
  await screen.findByDisplayValue(`${ficha.titulo} — Cópia`);
  expect(screen.queryByText('Editor de mídia')).toBeNull();
  expect(roteador.state.location.pathname).toBe('/admin/imoveis/novo');
  const rascunho = lerRascunho(sessionStorage, chaveRascunho(1));
  expect(rascunho).not.toHaveProperty('slug');
  const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('link', { name: 'Voltar' }));
  await waitFor(() => expect(confirmar).toHaveBeenCalled());
  expect(roteador.state.location.pathname).toBe('/admin/imoveis/novo');
});
it('cancela links e histórico sem perder campos e avisa antes de recarregar', async () => {
  const roteador = mostrar();
  const campo = await screen.findByDisplayValue(ficha.titulo);
  fireEvent.change(campo, { target: { value: 'Alteração local' } });
  const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('link', { name: 'Voltar' }));
  await waitFor(() => expect(confirmar).toHaveBeenCalledTimes(1));
  await act(async () => { await roteador.navigate(-1); });
  expect(confirmar).toHaveBeenCalledTimes(2);
  expect(campo).toHaveValue('Alteração local');
  const evento = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(evento);
  expect(evento.defaultPrevented).toBe(true);
  confirmar.mockReturnValue(true);
  await act(async () => { await roteador.navigate('/admin/imoveis'); });
  expect(await screen.findByText('Listagem')).toBeInTheDocument();
});
it('preserva um rascunho anterior quando a substituição é cancelada', async () => {
  const chave = chaveRascunho(1);
  gravarRascunho(sessionStorage, chave, { titulo: 'Rascunho anterior' });
  mostrar();
  await screen.findByDisplayValue(ficha.titulo);
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
  expect(lerRascunho(sessionStorage, chave)?.titulo).toBe('Rascunho anterior');
});
it('recusa duplicar com classificação inativa e esconde a duplicação para outro dono', async () => {
  vi.mocked(api.classificacoes).mockResolvedValue({ ...classificacoesExemplo, tipos: classificacoesExemplo.tipos.map((item) => ({ ...item, ativo: false })) });
  mostrar();
  await screen.findByDisplayValue(ficha.titulo);
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
  expect(await screen.findByText(/Não é possível duplicar/)).toBeInTheDocument();
  cleanup();
  simularSessao({ id: 2, nome: 'Outro', email: 'o@example.test', whatsapp: '5565999999999', creci: null, cargo: 'CORRETOR', url_foto: null, ativo: true, criado_em: '' });
  mostrar();
  await screen.findByRole('heading', { name: /Sala comercial no Centro/ });
  expect(screen.queryByRole('button', { name: 'Duplicar' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Salvar imóvel' })).toBeNull();
});
it('mostra a ficha interna com proprietário e motivo da baixa só para status final', async () => {
  mostrar();
  await screen.findByDisplayValue(ficha.titulo);
  expect(screen.getByRole('combobox', { name: 'Proprietário' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Motivo da baixa')).toBeNull();
  fireEvent.change(screen.getByLabelText('Situação *'), { target: { value: 'VENDIDO' } });
  expect(await screen.findByLabelText('Motivo da baixa')).toBeInTheDocument();
});
