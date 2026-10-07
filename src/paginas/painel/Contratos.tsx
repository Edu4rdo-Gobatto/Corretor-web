import { useFiltrosAutomaticos } from '../../hooks/useFiltrosAutomaticos';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import type { Contrato, StatusContrato } from '../../servicos/locacoes';
import type { Referencia } from '../../tipos';
import { dataCivil, dinheiroExato, mensagemErro } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Dialogo from '../../componentes/Dialogo';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import SeletorRegistro from '../../componentes/SeletorRegistro';
import Tabela from '../../componentes/Tabela';
import SeletorFiltro from '../../componentes/SeletorFiltro';
import AcaoIcone from '../../componentes/AcaoIcone';
import { IconeBuscar, IconeSalvar } from '../../componentes/Icones';
import CampoNumero, { numeroDoCampo } from '../../componentes/CampoNumero';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import Campo from '../../componentes/Campo';
import Aviso from '../../componentes/Aviso';
import { estilos } from '../../componentes/estilosPainel';
import { esquemaContrato, type ValoresContrato } from './esquemaLocacao';

export const buscarImoveis = async (termo: string): Promise<Referencia[]> => (await api.listarFichas({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.titulo }));
export const buscarPessoas = async (termo: string): Promise<Referencia[]> => (await api.listarPessoas({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.nome }));
const buscarCorretores = async (termo: string): Promise<Referencia[]> => (await api.listarCorretores(1, 10, termo || undefined)).itens.filter((item) => item.ativo).map((item) => ({ id: item.id, nome: item.nome }));

export function EditorContrato({ contrato, aoFechar, aoSalvar }: { contrato?: Contrato; aoFechar: () => void; aoSalvar: (contrato: Contrato) => void }) {
  const { corretor } = useSessao();
  const [erro, setErro] = useState('');
  const referencia = (id: number | undefined, nome: string | null | undefined): Referencia | null => id ? { id, nome: nome ?? `#${id}` } : null;
  const [imovel, setImovel] = useState(referencia(contrato?.imovel_id, contrato?.imovel_titulo));
  const [locador, setLocador] = useState(referencia(contrato?.locador_id, contrato?.locador_nome));
  const [locatario, setLocatario] = useState(referencia(contrato?.locatario_id, contrato?.locatario_nome));
  const [intermediador, setIntermediador] = useState<Referencia | null>(contrato ? { id: contrato.corretor_id, nome: contrato.corretor_id === corretor?.id ? corretor.nome : `Corretor #${contrato.corretor_id}` } : corretor ? { id: corretor.id, nome: corretor.nome } : null);
  const { register, setValue, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<ValoresContrato>({
    resolver: zodResolver(esquemaContrato),
    defaultValues: {
      numero_contrato: contrato?.numero_contrato ?? '', imovel_id: contrato?.imovel_id ?? 0, locador_id: contrato?.locador_id ?? 0, locatario_id: contrato?.locatario_id ?? 0, corretor_id: contrato?.corretor_id ?? corretor?.id ?? 0,
      data_inicio: contrato?.data_inicio ?? '', data_fim: contrato?.data_fim ?? '', valor_aluguel: contrato?.valor_aluguel ?? '', dia_vencimento: contrato?.dia_vencimento ?? 5, taxa_administracao: contrato?.taxa_administracao ?? '',
      garantia_locaticia: contrato?.garantia_locaticia ?? '', indice_reajuste: contrato?.indice_reajuste ?? '', cobranca_iptu_condominio: contrato?.cobranca_iptu_condominio ?? '', status: contrato?.status ?? 'ATIVO', ativo: contrato?.ativo ?? true, observacoes: contrato?.observacoes ?? '',
    },
  });
  const escolher = (campo: 'imovel_id' | 'locador_id' | 'locatario_id' | 'corretor_id', definir: (valor: Referencia | null) => void) => (valor: Referencia | null) => { definir(valor); setValue(campo, valor?.id ?? 0, { shouldValidate: true, shouldDirty: true }); };
  async function salvar(valores: ValoresContrato) {
    setErro('');
    try { const salvo = await api.salvarContrato(valores, contrato?.id); aoSalvar(salvo); aoFechar(); }
    catch (falha) { setErro(mensagemErro(falha)); }
  }
  const campos: [keyof ValoresContrato, string, string][] = [['numero_contrato', 'Número do contrato', 'text'], ['data_inicio', 'Início', 'date'], ['data_fim', 'Fim', 'date'], ['valor_aluguel', 'Aluguel', 'text'], ['taxa_administracao', 'Taxa de administração', 'text'], ['garantia_locaticia', 'Garantia locatícia', 'text'], ['indice_reajuste', 'Índice de reajuste', 'text'], ['cobranca_iptu_condominio', 'Pagamento de IPTU e condomínio', 'text']];
  return (
    <Dialogo titulo={contrato ? 'Editar contrato' : 'Novo contrato'} tamanho="largo" alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate data-atalho-salvar={contrato ? true : undefined}>
        <fieldset disabled={isSubmitting} className="m-0 grid gap-4 border-0 p-0">
          <SeletorRegistro rotulo="Imóvel" valor={imovel} buscar={buscarImoveis} aoEscolher={escolher('imovel_id', setImovel)} erro={errors.imovel_id?.message} />
          <SeletorRegistro rotulo="Proprietário (locador)" valor={locador} buscar={buscarPessoas} aoEscolher={escolher('locador_id', setLocador)} erro={errors.locador_id?.message} dica="Qualquer pessoa ativa do cadastro." />
          <SeletorRegistro rotulo="Inquilino (locatário)" valor={locatario} buscar={buscarPessoas} aoEscolher={escolher('locatario_id', setLocatario)} erro={errors.locatario_id?.message} />
          {corretor?.cargo === 'ADMIN' ? <SeletorRegistro rotulo="Intermediador" valor={intermediador} buscar={buscarCorretores} aoEscolher={escolher('corretor_id', setIntermediador)} erro={errors.corretor_id?.message} /> : <p className="m-0">Intermediador: {corretor?.nome}.</p>}
          <div className={estilos.grade}>
            {campos.map(([nome, rotulo, tipo]) => <Campo key={nome} rotulo={rotulo} erro={errors[nome]?.message as string | undefined}>{nome === 'valor_aluguel' || nome === 'taxa_administracao' ? <CampoNumero unidade={nome === 'valor_aluguel' ? 'R$' : '%'} {...register(nome)} /> : <input type={tipo} {...register(nome)} />}</Campo>)}
            <Campo rotulo="Dia de vencimento" erro={errors.dia_vencimento?.message}><CampoNumero casasDecimais={0} min={1} max={31} {...register('dia_vencimento', { setValueAs: numeroDoCampo })} /></Campo>
            <Campo rotulo="Situação" erro={errors.status?.message}><select {...register('status')}><option value="ATIVO">Ativo</option><option value="INATIVO">Encerrado</option></select></Campo>
            <Campo classe="col-span-full" rotulo="Observações" erro={errors.observacoes?.message}><textarea {...register('observacoes')} /></Campo>
            {contrato && <label className="col-span-full flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('ativo')} />Manter no cadastro de contratos</label>}
          </div>
        </fieldset>
        <p className={estilos.dica}>A receita de intermediação é registrada separadamente em Comissões. O contrato vencido é encerrado automaticamente.</p>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar size={20} aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Salvar contrato'}</button><button className="buttonGhost" type="button" disabled={isSubmitting} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

interface Filtros { busca: string; status: '' | StatusContrato; ativo: 'true' | 'false' }
const filtrosIniciais: Filtros = { busca: '', status: '', ativo: 'true' };

export default function Contratos() {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const { rascunho, definir: setRascunho, aplicarAgora } = useFiltrosAutomaticos({
    iniciais: filtrosIniciais, normalizar: (valor) => ({ ...valor, busca: valor.busca.trim() }),
    aoAplicar: (valor) => { setPagina(1); setFiltros(valor); },
  });
  const [criando, setCriando] = useState(false);
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarContratos({ pagina, limite: 15, busca: filtros.busca || undefined, status: filtros.status || undefined, ativo: filtros.ativo === 'true' }), [pagina, filtros]));
  useAcoesPainel(useMemo(() => [{ id: 'novo-contrato', rotulo: 'Novo contrato', executar: () => setCriando(true), palavrasChave: 'locação aluguel' }], []));
  function aplicar(evento: FormEvent) { evento.preventDefault(); aplicarAgora(); }
  return <>
    <CabecalhoPagina titulo="Contratos de locação" descricao="Contratos intermediados e suas pastas de documentos." acoes={<button className="button" onClick={() => setCriando(true)}>Novo contrato</button>} />
    <form className={estilos.barraFiltros} onSubmit={aplicar}>
      <label>Buscar<input data-busca-painel value={rascunho.busca} onChange={(evento) => setRascunho({ ...rascunho, busca: evento.target.value })} placeholder="Número, imóvel ou inquilino" /></label>
      <SeletorFiltro rotulo="Situação" valor={rascunho.status} opcoes={[{ valor: '' as const, rotulo: 'Todas' }, { valor: 'ATIVO' as const, rotulo: 'Ativos' }, { valor: 'INATIVO' as const, rotulo: 'Encerrados' }]} aoMudar={(valor) => setRascunho({ ...rascunho, status: valor }, true)} />
      <SeletorFiltro rotulo="Cadastro" valor={rascunho.ativo} opcoes={[{ valor: 'true' as const, rotulo: 'Em cadastro' }, { valor: 'false' as const, rotulo: 'Arquivados' }]} aoMudar={(valor) => setRascunho({ ...rascunho, ativo: valor }, true)} />
      <div className={estilos.acoesFiltros}><AcaoIcone icone={IconeBuscar} rotulo="Buscar" tipo="submit" /></div>
    </form>
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && (
      <section>
        <Tabela<Contrato> itens={dados.itens} chave={(contrato) => contrato.id} vazio="Nenhum contrato encontrado." rotulo="Contratos" linkLinha={(contrato) => `/admin/contratos/${contrato.id}`} colunas={[
          { titulo: 'Contrato', celula: (contrato) => <><Link to={`/admin/contratos/${contrato.id}`}><strong>{contrato.numero_contrato}</strong></Link><small className="mt-1 block text-muted">{contrato.imovel_titulo ?? `Imóvel #${contrato.imovel_id}`}</small></> },
          { titulo: 'Partes', celula: (contrato) => <>{contrato.locador_nome ?? `#${contrato.locador_id}`}<small className="mt-1 block text-muted">Inquilino: {contrato.locatario_nome ?? `#${contrato.locatario_id}`}</small></> },
          { titulo: 'Período', celula: (contrato) => `${dataCivil(contrato.data_inicio)} a ${dataCivil(contrato.data_fim)}` },
          { titulo: 'Aluguel', celula: (contrato) => dinheiroExato(contrato.valor_aluguel) },
          { titulo: 'Situação', celula: (contrato) => <Etiqueta tom={contrato.status === 'ATIVO' ? 'neutro' : 'alerta'}>{contrato.status === 'ATIVO' ? 'Ativo' : 'Encerrado'}</Etiqueta> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {criando && <EditorContrato aoFechar={() => setCriando(false)} aoSalvar={(salvo) => navigate(`/admin/contratos/${salvo.id}`)} />}
  </>;
}
