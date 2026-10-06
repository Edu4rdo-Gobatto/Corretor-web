import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconeCopiar, IconeExcluir, IconeSalvar, IconeAbrirFora } from '../../componentes/Icones';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { GuardaFormulario, useGuardaFormulario } from '../../hooks/useGuardaFormulario';
import type { Classificacoes, Corretor, FichaImovel as Ficha, Referencia } from '../../tipos';
import { codigoImovel, mensagemErro, rotulosStatusImovel } from '../../servicos/formato';
import { urlImovel } from '../../servicos/urls';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import GerenciadorMidia from '../../componentes/GerenciadorMidia';
import SelecaoMidia from '../../componentes/SelecaoMidia';
import SeletorRegistro from '../../componentes/SeletorRegistro';
import Campo from '../../componentes/Campo';
import EntradaNumero, { numeroDoCampo } from '../../componentes/CampoNumero';
import Aviso from '../../componentes/Aviso';
import AcaoIcone from '../../componentes/AcaoIcone';
import ConfirmarAcao from '../../componentes/ConfirmarAcao';
import { estilos } from '../../componentes/estilosPainel';
import { prepararEnvio } from '../../componentes/prepararMidia';
import FichaImovel from './FichaImovel';
import { comClassificacoesDaFicha, dadosParaApi, esquemaImovel, estados, imovelVazio, valoresDaFicha, type ValoresImovel } from './esquemaImovel';
import { chaveRascunho, gravarRascunho, lerRascunho, limparRascunho } from './rascunhoImovel';

const AVISOS_RASCUNHO = {
  cota: 'Não foi possível salvar o rascunho: o armazenamento desta aba está cheio. Salve o imóvel para não perder as alterações.',
  grande_demais: 'Não foi possível salvar o rascunho: use no máximo 100 características com 500 caracteres por valor.',
  indisponivel: 'O rascunho não pôde ser salvo nesta aba. Continue editando e salve o imóvel.',
  salvo: '',
};
type CampoTexto = 'titulo' | 'logradouro' | 'numero' | 'cidade' | 'bairro' | 'cep' | 'complemento' | 'chaves' | 'matricula' | 'inscricao_municipal';
type CampoNumero = 'valor_venda' | 'valor_locacao' | 'valor_condominio' | 'valor_iptu' | 'area_util' | 'area_total';

export default function FormularioImovel() {
  const { id } = useParams();
  const { corretor } = useSessao();
  return <InstanciaFormulario key={`${corretor?.id ?? 'anonimo'}:${id ?? 'novo'}`} />;
}

function InstanciaFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { corretor } = useSessao();
  const chave = chaveRascunho(corretor?.id ?? 'anonimo', id);
  const rascunhoAtivo = useRef(false);
  const [rascunhoRestaurado, setRascunhoRestaurado] = useState(false);
  const [avisoRascunho, setAvisoRascunho] = useState('');
  const [imovel, setImovel] = useState<Ficha>();
  const [classificacoes, setClassificacoes] = useState<Classificacoes>({ tipos: [], finalidades: [], caracteristicas: [] });
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [carregando, setCarregando] = useState(!!id);
  const [erroCarga, setErroCarga] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [duplicando, setDuplicando] = useState(false);
  const [confirmacaoCopia, setConfirmacaoCopia] = useState<'alteracoes' | 'rascunho' | null>(null);
  const [arquivosPendentes, setArquivosPendentes] = useState<File[]>([]);
  const [videosPendentes, setVideosPendentes] = useState<string[]>([]);
  const [progresso, setProgresso] = useState('');
  const { register, control, handleSubmit, reset, getValues, setValue, watch, formState: { errors, isSubmitting, isDirty } } = useForm<ValoresImovel>({ resolver: zodResolver(esquemaImovel), defaultValues: imovelVazio });
  const { fields: caracteristicas, append: adicionarCaracteristica, remove: removerCaracteristica } = useFieldArray({ control, name: 'caracteristicas' });
  const proprietario = watch('proprietario');
  const status = watch('status');
  const podeEditar = !imovel || corretor?.cargo === 'ADMIN' || corretor?.id === imovel.corretor_id;
  const alterado = podeEditar && (isDirty || rascunhoRestaurado || arquivosPendentes.length > 0 || videosPendentes.length > 0);
  const navegacaoLiberada = useGuardaFormulario(alterado);

  const carregar = useCallback(async () => {
    rascunhoAtivo.current = false;
    setErroCarga('');
    const rascunho = lerRascunho(sessionStorage, chave);
    setRascunhoRestaurado(!!rascunho);
    setAvisoRascunho('');
    setCarregando(true);
    try {
      // Classificações públicas (qualquer cargo) e ficha em paralelo; ver comClassificacoesDaFicha.
      const [lista, ficha] = await Promise.all([api.classificacoes(), id ? api.obterFicha(Number(id)) : Promise.resolve(undefined)]);
      setClassificacoes(ficha ? comClassificacoesDaFicha(lista, ficha) : lista);
      setImovel(ficha);
      reset({ ...(ficha ? valoresDaFicha(ficha) : imovelVazio), ...rascunho });
      rascunhoAtivo.current = true;
    } catch (causa) {
      setErroCarga(mensagemErro(causa));
    } finally {
      setCarregando(false);
    }
  }, [id, reset, chave]);
  useEffect(() => { void carregar(); }, [carregar]);

  useEffect(() => {
    const assinatura = watch(() => {
      if (!rascunhoAtivo.current) return;
      setAvisoRascunho(AVISOS_RASCUNHO[gravarRascunho(sessionStorage, chave, getValues())]);
    });
    return () => assinatura.unsubscribe();
  }, [watch, chave, getValues]);

  useEffect(() => {
    if (corretor?.cargo !== 'ADMIN') return;
    let ativo = true;
    void (async () => {
      try {
        const lista: Corretor[] = [];
        let pagina = 1;
        let totalPaginas = 1;
        do {
          const resultado = await api.listarCorretores(pagina, 100);
          lista.push(...resultado.itens);
          totalPaginas = resultado.total_paginas;
          pagina++;
        } while (pagina <= totalPaginas);
        if (ativo) setCorretores(lista);
      } catch (causa) {
        if (ativo) setErro(`Não foi possível carregar os corretores. ${mensagemErro(causa)}`);
      }
    })();
    return () => { ativo = false; };
  }, [corretor?.cargo]);

  const buscarPessoas = useCallback(async (termo: string): Promise<Referencia[]> => (await api.listarPessoas({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((pessoa) => ({ id: pessoa.id, nome: pessoa.nome })), []);
  const classificacoesAtivas = (valores: ValoresImovel) =>
    classificacoes.tipos.some((item) => item.ativo && String(item.id) === valores.tipo_id)
    && classificacoes.finalidades.some((item) => item.ativo && String(item.id) === valores.finalidade_id)
    && valores.caracteristicas.every((item) => classificacoes.caracteristicas.some((registro) => registro.ativo && String(registro.id) === item.caracteristica_id));

  function duplicar(confirmouAlteracoes = false, confirmouRascunho = false) {
    if (!imovel || !podeEditar) return;
    const valores = getValues();
    if (!classificacoesAtivas(valores)) { setErro('Não é possível duplicar um imóvel com classificações inativas ou indisponíveis. Atualize o imóvel antes de duplicar.'); return; }
    if (alterado && !confirmouAlteracoes) { setConfirmacaoCopia('alteracoes'); return; }
    const chaveNovo = chaveRascunho(corretor?.id ?? 'anonimo');
    if (lerRascunho(sessionStorage, chaveNovo) && !confirmouRascunho) { setConfirmacaoCopia('rascunho'); return; }
    const copia = esquemaImovel.safeParse({ ...valoresDaFicha(imovel), titulo: `${imovel.titulo.slice(0, 190)} — Cópia`, status: 'DISPONIVEL', corretor_id: String(corretor?.id ?? '') });
    if (!copia.success) { setErro('Revise os dados do imóvel antes de duplicar.'); return; }
    if (gravarRascunho(sessionStorage, chaveNovo, copia.data) !== 'salvo') { setErro('Não foi possível preparar a cópia nesta aba. Verifique o armazenamento do navegador.'); return; }
    setDuplicando(true);
    navegacaoLiberada.current = true;
    navigate('/admin/imoveis/novo');
  }

  /** Fotos escolhidas antes de salvar sobem logo depois da criação; falhas não perdem o imóvel. */
  async function enviarPendentes(imovelId: number): Promise<string[]> {
    const problemas: string[] = [];
    if (arquivosPendentes.length) {
      try {
        const { prontos, ilegiveis } = await prepararEnvio(arquivosPendentes, (concluidos, total) => setProgresso(`Enviando fotos: ${concluidos} de ${total}…`));
        await api.enviarMidias(imovelId, prontos);
        if (ilegiveis.length) problemas.push(`não foi possível ler ${ilegiveis.join(', ')}`);
      } catch (causa) { problemas.push(mensagemErro(causa)); }
    }
    for (const video of videosPendentes) {
      try { await api.adicionarVideo(imovelId, video); } catch (causa) { problemas.push(`vídeo ${video}: ${mensagemErro(causa)}`); }
    }
    setProgresso('');
    return problemas;
  }

  async function salvar(valores: ValoresImovel) {
    setErro('');
    setSucesso('');
    if (!id && !classificacoesAtivas(valores)) { setErro('Selecione classificações ativas antes de salvar o novo imóvel.'); return; }
    try {
      const corretorId = corretor?.cargo === 'ADMIN' ? Number(valores.corretor_id) || corretor.id : undefined;
      const salvo = await api.salvarImovel(dadosParaApi(valores, corretorId), id ? Number(id) : undefined, imovel);
      rascunhoAtivo.current = false;
      limparRascunho(sessionStorage, chave);
      setRascunhoRestaurado(false);
      setAvisoRascunho('');
      if (!id) {
        const problemas = await enviarPendentes(salvo.id);
        setArquivosPendentes([]);
        setVideosPendentes([]);
        navegacaoLiberada.current = true;
        navigate(`/admin/imoveis/${salvo.id}/editar`, { replace: true, state: { aviso: problemas.length ? `Imóvel salvo, mas parte das mídias falhou: ${problemas.join('; ')}.` : 'Imóvel salvo com as fotos e os vídeos.' } });
        return;
      }
      reset(valoresDaFicha(salvo));
      rascunhoAtivo.current = true;
      setImovel(salvo);
      setSucesso('Imóvel salvo.');
    } catch (causa) {
      setErro(mensagemErro(causa));
    }
  }

  const campoTexto = (nome: CampoTexto, rotulo: string, extra?: string) => (
    <Campo rotulo={rotulo.replace(' *', '')} obrigatorio={rotulo.endsWith(' *')} dica={extra} erro={errors[nome]?.message}><input {...register(nome)} /></Campo>
  );
  const campoNumero = (nome: CampoNumero, rotulo: string, opcional = false) => (
    <Campo rotulo={rotulo.replace(' *', '').replace(/ \((?:R\$|m²)\)$/, '')} obrigatorio={!opcional} erro={errors[nome]?.message}><EntradaNumero unidade={nome.includes('area') ? 'm²' : 'R$'} min={nome.includes('area') ? '0.01' : '0'} {...register(nome, { setValueAs: (valor: string | number | null) => (valor === '' || valor === null || valor === undefined ? (opcional ? null : NaN) : numeroDoCampo(valor)) })} /></Campo>
  );
  const campoData = (nome: 'exclusividade_ate' | 'data_captacao', rotulo: string) => (
    <Campo rotulo={rotulo} erro={errors[nome]?.message}><input type="date" {...register(nome)} /></Campo>
  );
  const secao = (numero: string, titulo: string, conteudo: React.ReactNode, descricao?: string) => (
    <section id={`imovel-secao-${numero}`} aria-labelledby={`imovel-titulo-${numero}`} className={`${estilos.painel} scroll-mt-28`}><h2 id={`imovel-titulo-${numero}`} className={estilos.tituloPainel}><span className="mr-2 text-sm font-sans font-semibold text-muted">{numero}</span>{titulo}</h2>{descricao && <p className="muted">{descricao}</p>}{conteudo}</section>
  );
  const avisoNavegacao = (typeof window !== 'undefined' ? (window.history.state as { usr?: { aviso?: string } } | null)?.usr?.aviso : undefined) ?? '';

  return <>
    <GuardaFormulario alterado={alterado} liberado={navegacaoLiberada} />
    <CabecalhoPagina
      voltar={<Link to={imovel ? `/admin/imoveis/${imovel.id}` : '/admin/imoveis'} className="inline-flex min-h-11 items-center">{imovel ? 'Ficha do imóvel' : 'Imóveis'}</Link>}
      titulo={imovel ? `Editar imóvel ${codigoImovel(imovel.id)}` : 'Novo imóvel'}
      descricao="Conte o que torna este imóvel uma boa oportunidade."
      acoes={imovel && <>
        <Link to={urlImovel(imovel.slug)} target="_blank" rel="noopener noreferrer" className="buttonSecondary">Ver anúncio <IconeAbrirFora aria-hidden="true" /></Link>
        {podeEditar && <AcaoIcone icone={IconeCopiar} rotulo="Duplicar" contexto={imovel.titulo} desabilitado={duplicando || isSubmitting} aoClicar={() => duplicar()} />}
      </>}
    />
    <EstadoCarregamento carregando={carregando} erro={erroCarga} tentarNovamente={() => void carregar()} />
    {imovel && !podeEditar ? <FichaImovel imovel={imovel} /> : !carregando && !erroCarga && <>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        {avisoNavegacao && !sucesso && <Aviso tom={avisoNavegacao.includes('falhou') ? 'atencao' : 'sucesso'} classe="mb-5">{avisoNavegacao}</Aviso>}
        {rascunhoRestaurado && <Aviso classe="mb-5">Seu rascunho foi restaurado nesta aba. Revise os dados antes de salvar.</Aviso>}
        {avisoRascunho && <Aviso tom="atencao" classe="mb-5">{avisoRascunho}</Aviso>}
        <nav aria-label="Seções do imóvel" className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">{['Apresentação', 'Valores e dimensões', 'Localização', 'Características', 'Fotos e vídeos', 'Ficha interna'].map((titulo, indice) => <a key={titulo} href={`#imovel-secao-${String(indice + 1).padStart(2, '0')}`} className="inline-flex min-h-11 items-center gap-2 rounded px-3 text-sm no-underline hover:bg-soft"><span className="text-xs text-muted">{String(indice + 1).padStart(2, '0')}</span>{titulo}</a>)}</nav>
        <fieldset disabled={isSubmitting} className="m-0 min-w-0 border-0 p-0">
        {secao('01', 'Apresentação', <div className={estilos.grade}>
          <div className="col-span-full">{campoTexto('titulo', 'Título do anúncio *')}</div>
          <Campo rotulo="Tipo de imóvel" obrigatorio erro={errors.tipo_id?.message}><select {...register('tipo_id')}><option value="">Selecione</option>{classificacoes.tipos.filter((item) => item.ativo || item.id === imovel?.tipo_id).map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? '' : ' (inativo)'}</option>)}</select></Campo>
          <Campo rotulo="Finalidade" obrigatorio erro={errors.finalidade_id?.message}><select {...register('finalidade_id')}><option value="">Selecione</option>{classificacoes.finalidades.filter((item) => item.ativo || item.id === imovel?.finalidade_id).map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? '' : ' (inativo)'}</option>)}</select></Campo>
          <Campo rotulo="Situação" obrigatorio erro={errors.status?.message}><select {...register('status')}>{Object.entries(rotulosStatusImovel).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></Campo>
          {corretor?.cargo === 'ADMIN' && <Campo rotulo="Corretor responsável" erro={errors.corretor_id?.message}><select {...register('corretor_id')}><option value="">Minha conta</option>{corretores.filter((item) => item.ativo || item.id === imovel?.corretor_id).map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? '' : ' (inativo)'}</option>)}</select></Campo>}
          <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('destaque')} />Destacar na vitrine do site</label>
          <Campo classe="col-span-full" rotulo="Descrição" obrigatorio erro={errors.descricao?.message}><textarea rows={6} {...register('descricao')} /></Campo>
        </div>)}
        {secao('02', 'Valores e dimensões', <div className={estilos.grade}>
          {campoNumero('valor_venda', 'Valor de venda (R$)', true)}
          {campoNumero('valor_locacao', 'Valor de locação mensal (R$)', true)}
          {campoNumero('valor_condominio', 'Condomínio mensal (R$)', true)}
          {campoNumero('valor_iptu', 'IPTU (R$)', true)}
          {campoNumero('area_util', 'Área útil (m²) *')}
          {campoNumero('area_total', 'Área total (m²) *')}
        </div>, 'Sem valor de venda nem de locação, o site mostra "sob consulta".')}
        {secao('03', 'Localização', <div className={estilos.grade}>
          {campoTexto('cep', 'CEP')}{campoTexto('complemento', 'Complemento')}{campoTexto('logradouro', 'Rua / avenida *')}{campoTexto('numero', 'Número *')}{campoTexto('bairro', 'Bairro *')}{campoTexto('cidade', 'Cidade *')}
          <Campo rotulo="Estado" obrigatorio erro={errors.estado?.message}><select {...register('estado')}>{estados.map((estado) => <option key={estado}>{estado}</option>)}</select></Campo>
        </div>)}
        {secao('04', 'Características', <>
          {caracteristicas.map((campo, indice) => (
            <div key={campo.id} className="my-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3 @min-[38rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Campo classe="col-span-full @min-[38rem]:col-span-1" rotulo="Característica" erro={errors.caracteristicas?.[indice]?.caracteristica_id?.message}><select {...register(`caracteristicas.${indice}.caracteristica_id`)}><option value="">Selecione</option>{classificacoes.caracteristicas.filter((item) => item.ativo || imovel?.caracteristicas.some((atual) => atual.caracteristica_id === item.id)).map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? '' : ' (inativo)'}</option>)}</select></Campo>
              <Campo rotulo="Valor" erro={errors.caracteristicas?.[indice]?.valor?.message}><input {...register(`caracteristicas.${indice}.valor`)} maxLength={500} placeholder="Opcional, ex.: 4 vagas" /></Campo>
              <div className="flex items-end pb-1"><AcaoIcone icone={IconeExcluir} rotulo="Remover" contexto={`característica ${indice + 1}`} tom="perigo" aoClicar={() => removerCaracteristica(indice)} /></div>
            </div>
          ))}
          {errors.caracteristicas && <p className="error">Revise as características: selecione cada uma apenas uma vez e use até 500 caracteres no valor.</p>}
          <button type="button" className="buttonSecondary" disabled={caracteristicas.length >= 100} onClick={() => adicionarCaracteristica({ caracteristica_id: '', valor: '' })}>Adicionar característica</button>
        </>, 'Selecione as características cadastradas e informe seus valores.')}
        {secao('05', 'Fotos e vídeos', imovel
          ? <GerenciadorMidia imovel={imovel} aoAlterar={async () => { setImovel(await api.obterFicha(imovel.id)); }} />
          : <SelecaoMidia arquivos={arquivosPendentes} videos={videosPendentes} desabilitado={isSubmitting} aoAlterar={(arquivos, videos) => { setArquivosPendentes(arquivos); setVideosPendentes(videos); }} />)}
        {secao('06', 'Ficha interna', <div className={estilos.grade}>
          <div className="col-span-full"><SeletorRegistro rotulo="Proprietário" valor={proprietario} buscar={buscarPessoas} aoEscolher={(valor) => setValue('proprietario', valor, { shouldDirty: true })} dica="Pessoa cadastrada em Pessoas. Fica só no painel." /></div>
          <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('exclusividade')} />Exclusividade de venda ou locação</label>
          {campoData('exclusividade_ate', 'Exclusividade válida até')}
          {campoData('data_captacao', 'Data de captação')}
          {campoTexto('chaves', 'Onde estão as chaves', 'Ex.: com o zelador, no escritório.')}
          {campoTexto('matricula', 'Matrícula do imóvel')}
          {campoTexto('inscricao_municipal', 'Inscrição municipal / IPTU')}
          <Campo classe="col-span-full" rotulo="Observações internas" erro={errors.observacoes_internas?.message}><textarea rows={4} {...register('observacoes_internas')} /></Campo>
          {['VENDIDO', 'ALUGADO', 'RETIRADO'].includes(status) && <Campo classe="col-span-full" rotulo="Motivo da baixa" erro={errors.motivo_baixa?.message}><textarea rows={2} {...register('motivo_baixa')} placeholder="Ex.: vendido para cliente do site; retirado a pedido do proprietário." /></Campo>}
        </div>, 'Nada desta seção aparece no site.')}
        </fieldset>
        {erro && <Aviso tom="erro" classe="mb-5">{erro}</Aviso>}
        <div className="sticky bottom-0 z-10 mt-7 flex flex-wrap items-center justify-between gap-4 rounded border border-line bg-paper px-5 py-4 shadow-lg">
          <p role="status" className="m-0 min-w-0 flex-1 text-sm text-muted">{isSubmitting ? progresso || 'Salvando imóvel…' : alterado ? 'Há alterações pendentes de salvar.' : sucesso || 'Nenhuma alteração pendente.'}</p>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3"><button className="button" disabled={isSubmitting}><IconeSalvar aria-hidden="true" />{isSubmitting ? 'Salvando…' : imovel ? 'Salvar imóvel' : arquivosPendentes.length || videosPendentes.length ? 'Salvar imóvel e enviar mídias' : 'Salvar imóvel'}</button>
          <Link to="/admin/imoveis" className="buttonGhost">Voltar</Link></div>
        </div>
      </form>
    </>}
    {confirmacaoCopia && <ConfirmarAcao titulo={confirmacaoCopia === 'alteracoes' ? 'Duplicar os dados salvos?' : 'Substituir o rascunho de novo imóvel?'} descricao={confirmacaoCopia === 'alteracoes' ? 'A cópia usará os dados salvos do imóvel. As alterações desta edição não serão incluídas.' : 'Já existe um rascunho de novo imóvel nesta aba. A cópia substituirá esse rascunho; fotos e vídeos do imóvel original não serão copiados.'} confirmar={confirmacaoCopia === 'alteracoes' ? 'Usar dados salvos' : 'Substituir rascunho'} aoFechar={() => setConfirmacaoCopia(null)} aoConfirmar={() => { const etapa = confirmacaoCopia; setConfirmacaoCopia(null); duplicar(true, etapa === 'rascunho'); }} />}
  </>;
}
