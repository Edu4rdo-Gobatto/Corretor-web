import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { estilos } from '../../componentes/estilosPainel';
import { prepararEnvio } from '../../componentes/prepararMidia';
import FichaImovel from './FichaImovel';
import { dadosParaApi, esquemaImovel, estados, imovelVazio, valoresDaFicha, type ValoresImovel } from './esquemaImovel';
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
    try { setClassificacoes(await api.classificacoes(true)); } catch (causa) { setErroCarga(mensagemErro(causa)); setCarregando(false); return; }
    if (!id) {
      setImovel(undefined);
      reset({ ...imovelVazio, ...rascunho });
      setCarregando(false);
      rascunhoAtivo.current = true;
      return;
    }
    setCarregando(true);
    try {
      const ficha = await api.obterFicha(Number(id));
      setImovel(ficha);
      reset({ ...valoresDaFicha(ficha), ...rascunho });
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

  function duplicar() {
    if (!imovel || !podeEditar) return;
    const valores = getValues();
    if (!classificacoesAtivas(valores)) { setErro('Não é possível duplicar um imóvel com classificações inativas ou indisponíveis. Atualize o imóvel antes de duplicar.'); return; }
    if (alterado && !window.confirm('Usar os dados salvos e sair desta edição?')) return;
    const chaveNovo = chaveRascunho(corretor?.id ?? 'anonimo');
    if (lerRascunho(sessionStorage, chaveNovo) && !window.confirm('Substituir o rascunho de novo imóvel desta aba?')) return;
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
    <label>{rotulo}<input {...register(nome)} aria-invalid={!!errors[nome]} />{extra && <span className={estilos.dica}>{extra}</span>}{errors[nome] && <span className={estilos.erro}>{errors[nome]?.message}</span>}</label>
  );
  const campoNumero = (nome: CampoNumero, rotulo: string, opcional = false) => (
    <label>{rotulo}<input type="number" min={nome.includes('area') ? '0.01' : '0'} step="0.01" {...register(nome, { setValueAs: (valor: string | number | null) => (valor === '' || valor === null || valor === undefined ? (opcional ? null : NaN) : Number(valor)) })} aria-invalid={!!errors[nome]} />{errors[nome] && <span className={estilos.erro}>{errors[nome]?.message}</span>}</label>
  );
  const campoData = (nome: 'exclusividade_ate' | 'data_captacao', rotulo: string) => (
    <label>{rotulo}<input type="date" {...register(nome)} aria-invalid={!!errors[nome]} />{errors[nome] && <span className={estilos.erro}>{errors[nome]?.message}</span>}</label>
  );
  const secao = (numero: string, titulo: string, conteudo: React.ReactNode, descricao?: string) => (
    <section className={estilos.painel}><h2 className={estilos.tituloPainel}>{numero}. {titulo}</h2>{descricao && <p className="muted">{descricao}</p>}{conteudo}</section>
  );
  const avisoNavegacao = (typeof window !== 'undefined' ? (window.history.state as { usr?: { aviso?: string } } | null)?.usr?.aviso : undefined) ?? '';

  return <>
    <GuardaFormulario alterado={alterado} liberado={navegacaoLiberada} />
    <CabecalhoPagina
      voltar={<Link to="/admin/imoveis" className="inline-flex min-h-11 items-center">← Imóveis</Link>}
      titulo={imovel ? `Editar imóvel ${codigoImovel(imovel.id)}` : 'Um novo espaço.'}
      descricao="Conte o que torna este imóvel uma boa oportunidade."
      acoes={imovel && <>
        <Link to={urlImovel(imovel.slug)} target="_blank" rel="noopener noreferrer" className="buttonSecondary">Pré-visualizar público ↗</Link>
        {podeEditar && <button type="button" className="buttonSecondary" disabled={duplicando || isSubmitting} onClick={duplicar}>Duplicar</button>}
      </>}
    />
    <EstadoCarregamento carregando={carregando} erro={erroCarga} tentarNovamente={() => void carregar()} />
    {imovel && !podeEditar ? <FichaImovel imovel={imovel} /> : !carregando && !erroCarga && <>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        {avisoNavegacao && !sucesso && <p className={estilos.sucesso} role="status">{avisoNavegacao}</p>}
        {rascunhoRestaurado && <p className={estilos.sucesso} role="status">Seu rascunho foi restaurado nesta aba. Revise os dados antes de salvar.</p>}
        {avisoRascunho && <p className="error" role="alert">{avisoRascunho}</p>}
        {secao('01', 'Apresentação', <div className={estilos.grade}>
          <div className="col-span-full">{campoTexto('titulo', 'Título do anúncio *')}</div>
          <label>Tipo de imóvel *<select {...register('tipo_id')} aria-invalid={!!errors.tipo_id}><option value="">Selecione</option>{classificacoes.tipos.filter((item) => item.ativo || item.id === imovel?.tipo_id).map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? '' : ' (inativo)'}</option>)}</select>{errors.tipo_id && <span className={estilos.erro}>{errors.tipo_id.message}</span>}</label>
          <label>Finalidade *<select {...register('finalidade_id')} aria-invalid={!!errors.finalidade_id}><option value="">Selecione</option>{classificacoes.finalidades.filter((item) => item.ativo || item.id === imovel?.finalidade_id).map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? '' : ' (inativo)'}</option>)}</select>{errors.finalidade_id && <span className={estilos.erro}>{errors.finalidade_id.message}</span>}</label>
          <label>Situação *<select {...register('status')}>{Object.entries(rotulosStatusImovel).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></label>
          {corretor?.cargo === 'ADMIN' && <label>Corretor responsável<select {...register('corretor_id')}><option value="">Minha conta</option>{corretores.filter((item) => item.ativo || item.id === imovel?.corretor_id).map((item) => <option key={item.id} value={item.id}>{item.nome}{item.ativo ? '' : ' (inativo)'}</option>)}</select></label>}
          <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('destaque')} />Destacar na vitrine do site</label>
          <label className="col-span-full">Descrição *<textarea rows={6} {...register('descricao')} aria-invalid={!!errors.descricao} />{errors.descricao && <span className={estilos.erro}>{errors.descricao.message}</span>}</label>
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
          <label>Estado *<select {...register('estado')}>{estados.map((estado) => <option key={estado}>{estado}</option>)}</select></label>
        </div>)}
        {secao('04', 'Características', <>
          {caracteristicas.map((campo, indice) => (
            <div key={campo.id} className="my-3 grid gap-3 md:grid-cols-3">
              <label>Característica<select {...register(`caracteristicas.${indice}.caracteristica_id`)}><option value="">Selecione</option>{classificacoes.caracteristicas.filter((item) => item.ativo).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
              <label>Valor<input {...register(`caracteristicas.${indice}.valor`)} maxLength={500} placeholder="Opcional, ex.: 4 vagas" /></label>
              <button type="button" className="buttonGhost" onClick={() => removerCaracteristica(indice)}>Remover característica</button>
            </div>
          ))}
          {errors.caracteristicas && <p className="error">Revise as características: selecione cada uma apenas uma vez e use até 500 caracteres no valor.</p>}
          <button type="button" className="buttonSecondary" disabled={caracteristicas.length >= 100} onClick={() => adicionarCaracteristica({ caracteristica_id: '', valor: '' })}>Adicionar característica</button>
        </>, 'Selecione as características cadastradas e informe seus valores.')}
        {imovel ? null : <SelecaoMidia arquivos={arquivosPendentes} videos={videosPendentes} desabilitado={isSubmitting} aoAlterar={(arquivos, videos) => { setArquivosPendentes(arquivos); setVideosPendentes(videos); }} />}
        {secao(imovel ? '06' : '06', 'Ficha interna', <div className={estilos.grade}>
          <div className="col-span-full"><SeletorRegistro rotulo="Proprietário" valor={proprietario} buscar={buscarPessoas} aoEscolher={(valor) => setValue('proprietario', valor, { shouldDirty: true })} dica="Pessoa cadastrada em Pessoas. Fica só no painel." /></div>
          <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('exclusividade')} />Exclusividade de venda ou locação</label>
          {campoData('exclusividade_ate', 'Exclusividade válida até')}
          {campoData('data_captacao', 'Data de captação')}
          {campoTexto('chaves', 'Onde estão as chaves', 'Ex.: com o zelador, no escritório.')}
          {campoTexto('matricula', 'Matrícula do imóvel')}
          {campoTexto('inscricao_municipal', 'Inscrição municipal / IPTU')}
          <label className="col-span-full">Observações internas<textarea rows={4} {...register('observacoes_internas')} />{errors.observacoes_internas && <span className={estilos.erro}>{errors.observacoes_internas.message}</span>}</label>
          {['VENDIDO', 'ALUGADO', 'RETIRADO'].includes(status) && <label className="col-span-full">Motivo da baixa<textarea rows={2} {...register('motivo_baixa')} placeholder="Ex.: vendido para cliente do site; retirado a pedido do proprietário." /></label>}
        </div>, 'Nada desta seção aparece no site.')}
        {erro && <p className="error" role="alert">{erro}</p>}
        {progresso && <p role="status">{progresso}</p>}
        {sucesso && <p className={estilos.sucesso} role="status">{sucesso}</p>}
        <div className={estilos.rodape}>
          <button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : imovel ? 'Salvar imóvel' : arquivosPendentes.length || videosPendentes.length ? 'Salvar imóvel e enviar mídias' : 'Salvar imóvel'}</button>
          <Link to="/admin/imoveis" className="buttonGhost">Voltar</Link>
        </div>
      </form>
      {imovel && <GerenciadorMidia imovel={imovel} aoAlterar={async () => { setImovel(await api.obterFicha(imovel.id)); }} />}
    </>}
  </>;
}
