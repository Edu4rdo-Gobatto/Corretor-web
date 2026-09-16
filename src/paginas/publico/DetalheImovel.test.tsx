import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes, StaticRouter, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import DetalheImovel from './DetalheImovel';
import { api } from '../../servicos/api';
import type { Imovel, Pagina } from '../../tipos';

const fixture = vi.hoisted(() => ({ imovel: {
  id: 42, titulo: 'Sala central', slug: 'sala-central-42', tipo_id: 1, finalidade_id: 3, tipo: { id: 1, nome: 'Sala comercial', slug: 'sala-comercial' }, finalidade: { id: 3, nome: 'Locação', slug: 'locacao' },
  valor_venda: null, valor_locacao: '2500.00', valor_condominio: null, valor_iptu: '120.00', area_util: '50.00', area_total: '60.00', cep: null, logradouro: 'Rua Um', numero: '10', complemento: null,
  bairro: 'Centro', cidade: 'Cuiabá', estado: 'MT', descricao: '', status: 'DISPONIVEL', destaque: false, ativo: true, corretor_id: 1,
  corretor: { id: 1, nome: 'Ana', whatsapp: '5565999998888', creci: null, url_foto: null }, midias: [], caracteristicas: [], criado_em: '', alterado_em: '',
} as Imovel }));
vi.mock('../../servicos/api', () => ({ api: { listarImoveis: vi.fn(), obterImovel: vi.fn() } }));
vi.mock('../../hooks/useRecurso', () => ({ useRecurso: () => ({ valor: fixture.imovel, carregando: false }) }));
vi.mock('../../seo/context', () => ({ Seo: () => null, useDadosIniciais: () => undefined }));
vi.mock('../../componentes/GaleriaMidia', () => ({ default: () => null }));
vi.mock('../../componentes/CartaoImovel', () => ({ default: ({ imovel }: { imovel: Imovel }) => <div>{imovel.titulo}</div> }));
const pagina = (itens: Imovel[]): Pagina<Imovel> => ({ itens, total: itens.length, pagina: 1, limite: 4, total_paginas: 1 });
const tela = (slug = fixture.imovel.slug) => <MemoryRouter initialEntries={[`/imoveis/${slug}`]}><Routes><Route path="/imoveis/:slug" element={<><DetalheImovel /><Localizacao /></>} /></Routes></MemoryRouter>;
function Localizacao() { const location = useLocation(); return <output data-testid="url">{location.pathname}</output>; }
beforeEach(() => {
  vi.resetAllMocks();
  fixture.imovel.logradouro = 'Rua Um';
  fixture.imovel.valor_venda = null;
  fixture.imovel.valor_locacao = '2500.00';
  vi.mocked(api.listarImoveis).mockResolvedValue(pagina([]));
});

it('carrega o mapa só após escolha e mantém link externo; SSR não inclui iframe', () => {
  expect(renderToString(<StaticRouter location="/imoveis/sala-central-42"><Routes><Route path="/imoveis/:slug" element={<DetalheImovel />} /></Routes></StaticRouter>)).not.toContain('<iframe');
  const { container } = render(tela());
  expect(container.querySelector('iframe')).toBeNull();
  expect(screen.getByRole('link', { name: 'Ver no mapa' })).toHaveAttribute('href', expect.stringContaining('google.com/maps/search'));
  fireEvent.click(screen.getByRole('button', { name: 'Carregar mapa' }));
  expect(container.querySelector('iframe')).toHaveAttribute('loading', 'lazy');
  expect(screen.getByText(/Soma dos valores informados \(parcial\)/)).toHaveTextContent('2.620');
  expect(screen.getByText('Referência: #42')).toBeInTheDocument();
});
it('mostra venda e locação juntas, ou sob consulta sem valores', () => {
  fixture.imovel.valor_venda = '150000.00';
  render(tela());
  expect(screen.getByText('Valor de venda')).toBeInTheDocument();
  expect(screen.getByText('Valor de locação')).toBeInTheDocument();
  expect(screen.getByText(/\/ m² \(venda\)/)).toBeInTheDocument();
  fixture.imovel.valor_venda = null;
  fixture.imovel.valor_locacao = null;
  render(tela());
  expect(screen.getAllByText('Sob consulta').length).toBeGreaterThan(0);
});
it('redireciona para o slug atual quando o link é antigo', async () => {
  render(tela('sala-renomeada-42'));
  await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/imoveis/sala-central-42'));
});
it('não oferece mapa embutido sem rua suficiente', () => {
  fixture.imovel.logradouro = '  ';
  const { container } = render(tela());
  expect(screen.queryByRole('button', { name: 'Carregar mapa' })).not.toBeInTheDocument();
  expect(container.querySelector('iframe')).toBeNull();
});
it('prioriza finalidade e cidade, completa por tipo e remove duplicatas', async () => {
  const vizinha = { ...fixture.imovel, id: 7, titulo: 'Loja vizinha' };
  const reserva = { ...fixture.imovel, id: 8, titulo: 'Sala distante' };
  vi.mocked(api.listarImoveis).mockResolvedValueOnce(pagina([fixture.imovel, vizinha])).mockResolvedValueOnce(pagina([vizinha, reserva]));
  render(tela());
  await screen.findByText('Sala distante');
  expect(api.listarImoveis).toHaveBeenNthCalledWith(1, { pagina: 1, limite: 4, finalidade: 'locacao', cidade: 'Cuiabá' });
  expect(api.listarImoveis).toHaveBeenNthCalledWith(2, { pagina: 1, limite: 4, tipo: 'sala-comercial' });
  expect(screen.getAllByText('Loja vizinha')).toHaveLength(1);
});
it('não inicia a busca de reserva quando a consulta termina após desmontagem', async () => {
  let resolver!: (valor: Pagina<Imovel>) => void;
  vi.mocked(api.listarImoveis).mockReturnValueOnce(new Promise((concluir) => { resolver = concluir; }));
  const { unmount } = render(tela());
  unmount();
  await act(async () => resolver(pagina([])));
  expect(api.listarImoveis).toHaveBeenCalledTimes(1);
});
