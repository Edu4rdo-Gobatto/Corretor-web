import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../servicos/api';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import type { Comissao, Contrato, ParcelaComissao, TipoOperacao } from '../../servicos/locacoes';
import type { Referencia } from '../../tipos';
import { dataCivil, dinheiroExato, mensagemErro, plural } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Dialogo from '../../componentes/Dialogo';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Paginacao from '../../componentes/Paginacao';
import SeletorRegistro from '../../componentes/SeletorRegistro';
import Tabela from '../../componentes/Tabela';
import { estilos } from '../../componentes/estilosPainel';
import { buscarImoveis, buscarPessoas } from './Contratos';
import { esquemaComissao, esquemaEdicaoComissao, esquemaPagamento, previaParcelas, type ValoresComissao } from './esquemaLocacao';

const buscarContratos = async (termo: string): Promise<(Referencia & { imovel_id: number; imovel_titulo: string | null })[]> =>
  (await api.listarContratos({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.numero_contrato, imovel_id: item.imovel_id, imovel_titulo: item.imovel_titulo }));

function EditorComissao({ contrato, aoFechar, aoSalvar }: { contrato?: Contrato; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const [imovel, setImovel] = useState<Referencia | null>(contrato ? { id: contrato.imovel_id, nome: contrato.imovel_titulo ?? `#${contrato.imovel_id}` } : null);
  const [pessoa, setPessoa] = useState<Referencia | null>(null);
  const [contratoEscolhido, setContratoEscolhido] = useState<Referencia | null>(contrato ? { id: contrato.id, nome: contrato.numero_contrato } : null);
  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<ValoresComissao>({
    resolver: zodResolver(esquemaComissao),
    defaultValues: { tipo_operacao: contrato ? 'LOCACAO' : 'VENDA', contrato_id: contrato?.id ?? null, imovel_id: contrato?.imovel_id ?? 0, pessoa_id: 0, valor_total: '', quantidade_parcelas: 1, primeiro_vencimento: '', observacoes: '' },
  });
  const operacao = watch('tipo_operacao');
  const previa = previaParcelas(watch('valor_total'), watch('quantidade_parcelas'), watch('primeiro_vencimento'));
  const escolherContrato = async (valor: Referencia | null) => {
    setContratoEscolhido(valor);
    setValue('contrato_id', valor?.id ?? null, { shouldValidate: true });
    setImovel(null);
    setValue('imovel_id', 0);
    if (!valor) return;
    const encontrado = (await buscarContratos('')).find((item) => item.id === valor.id) ?? (await buscarContratos(valor.nome)).find((item) => item.id === valor.id);
    if (encontrado) { setImovel({ id: encontrado.imovel_id, nome: encontrado.imovel_titulo ?? `#${encontrado.imovel_id}` }); setValue('imovel_id', encontrado.imovel_id, { shouldValidate: true }); }
  };
  async function salvar(valores: ValoresComissao) {
    setErro('');
    try { await api.criarComissao(valores); aoSalvar(); aoFechar(); }
    catch (falha) { setErro(mensagemErro(falha)); }
  }
  return (
    <Dialogo titulo="Registrar comissão" tamanho="largo" aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        <fieldset disabled={isSubmitting} className="m-0 grid gap-4 border-0 p-0">
          <p className="m-0">Informe a receita devida pela intermediação do negócio.</p>
          {!contrato && <label>Operação<select {...register('tipo_operacao', { onChange: () => { setValue('contrato_id', null); setValue('imovel_id', 0); setValue('pessoa_id', 0); setContratoEscolhido(null); setImovel(null); setPessoa(null); } })}><option value="VENDA">Venda</option><option value="LOCACAO">Locação</option></select></label>}
          {contrato ? <p className="m-0">Contrato: {contrato.numero_contrato} · {contrato.imovel_titulo}</p>
            : operacao === 'LOCACAO' ? <SeletorRegistro rotulo="Contrato de locação" valor={contratoEscolhido} buscar={buscarContratos} aoEscolher={(valor) => void escolherContrato(valor)} erro={errors.contrato_id?.message} dica={imovel ? `Imóvel: ${imovel.nome}` : undefined} />
              : <SeletorRegistro rotulo="Imóvel" valor={imovel} buscar={buscarImoveis} aoEscolher={(valor) => { setImovel(valor); setValue('imovel_id', valor?.id ?? 0, { shouldValidate: true }); }} erro={errors.imovel_id?.message} />}
          <SeletorRegistro rotulo="Pessoa (cliente do negócio)" valor={pessoa} buscar={buscarPessoas} aoEscolher={(valor) => { setPessoa(valor); setValue('pessoa_id', valor?.id ?? 0, { shouldValidate: true }); }} erro={errors.pessoa_id?.message} dica="A pessoa precisa estar ativa e sob o mesmo responsável pelo imóvel." />
          <div className={estilos.grade}>
            <label className="col-span-full">Receita total (R$)<input inputMode="decimal" placeholder="Ex.: 1.500,00" {...register('valor_total')} aria-invalid={!!errors.valor_total} /><span className={estilos.erro}>{errors.valor_total?.message}</span></label>
            <label>Quantidade de parcelas<input type="number" min={1} max={600} {...register('quantidade_parcelas', { valueAsNumber: true })} aria-invalid={!!errors.quantidade_parcelas} /><span className={estilos.erro}>{errors.quantidade_parcelas?.message}</span></label>
            <label>Primeiro vencimento<input type="date" {...register('primeiro_vencimento')} aria-invalid={!!errors.primeiro_vencimento} /><span className={estilos.erro}>{errors.primeiro_vencimento?.message}</span></label>
            <label className="col-span-full">Observações<textarea {...register('observacoes')} /><span className={estilos.erro}>{errors.observacoes?.message}</span></label>
          </div>
          {previa.length > 0 && <section className="rounded border border-line p-4" aria-label="Prévia das parcelas"><h3 className="mt-0">Prévia do parcelamento</h3><ul>{previa.slice(0, 4).map((item, indice) => <li key={indice}>Parcela {indice + 1}: {dinheiroExato(item.valor)} em {dataCivil(item.data)}</li>)}</ul>{previa.length > 4 && <p>Mais {previa.length - 4} parcelas. Último vencimento: {dataCivil(previa.at(-1)!.data)}.</p>}<p className={estilos.dica}>Os centavos são distribuídos entre as parcelas. Dias 29–31 são ajustados ao fim do mês.</p></section>}
        </fieldset>
        {erro && <p role="alert" className="error">{erro}</p>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Registrando…' : 'Registrar comissão'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} onClick={aoFechar}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

function DialogoPagamento({ parcela, aoFechar, aoSalvar }: { parcela: ParcelaComissao; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ confirmar_pagamento: boolean; observacao_pagamento: string }>({ resolver: zodResolver(esquemaPagamento), defaultValues: { confirmar_pagamento: false, observacao_pagamento: '' } });
  async function salvar(valores: { confirmar_pagamento: boolean; observacao_pagamento: string }) {
    setErro('');
    try { await api.pagarParcela(parcela.id, { confirmar_pagamento: true, observacao_pagamento: valores.observacao_pagamento }); aoSalvar(); aoFechar(); }
    catch (falha) { setErro(mensagemErro(falha)); }
  }
  return (
    <Dialogo titulo={`Receber parcela ${parcela.numero_parcela}`} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        <p>{dinheiroExato(parcela.valor)} · Vencimento {dataCivil(parcela.data_vencimento)}</p>
        <fieldset disabled={isSubmitting} className="m-0 border-0 p-0">
          <label>Referência do comprovante<textarea placeholder="Ex.: PIX recebido em 14/09, comprovante nº…" {...register('observacao_pagamento')} aria-invalid={!!errors.observacao_pagamento} /><span className={estilos.erro}>{errors.observacao_pagamento?.message}</span></label>
          <label className="mt-4 flex! items-start gap-2.5!"><input className="w-auto!" type="checkbox" {...register('confirmar_pagamento')} />Confirmo que a imobiliária recebeu este pagamento.</label>
          <p className={estilos.erro}>{errors.confirmar_pagamento?.message}</p>
        </fieldset>
        {erro && <p role="alert" className="error">{erro}</p>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Confirmando…' : 'Confirmar recebimento'}</button><button className="buttonGhost" type="button" disabled={isSubmitting} onClick={aoFechar}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

function EdicaoComissao({ comissao, aoFechar, aoSalvar }: { comissao: Comissao; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ ativo: boolean; observacoes: string }>({ resolver: zodResolver(esquemaEdicaoComissao), defaultValues: { ativo: comissao.ativo, observacoes: comissao.observacoes ?? '' } });
  async function salvar(valores: { ativo: boolean; observacoes: string }) {
    setErro('');
    try { await api.atualizarComissao(comissao.id, valores); aoSalvar(); aoFechar(); }
    catch (falha) { setErro(mensagemErro(falha)); }
  }
  return (
    <Dialogo titulo="Editar comissão" aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        <p>O valor total e as parcelas preservam o registro original. Ao desativar, novas baixas ficam bloqueadas e o histórico é mantido.</p>
        <fieldset disabled={isSubmitting} className="m-0 border-0 p-0">
          <label>Observações<textarea {...register('observacoes')} /><span className={estilos.erro}>{errors.observacoes?.message}</span></label>
          <label className="mt-4 flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('ativo')} />Comissão ativa</label>
        </fieldset>
        {erro && <p role="alert" className="error">{erro}</p>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar alterações'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} onClick={aoFechar}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

function DetalheComissao({ id, aoAlterar }: { id: number; aoAlterar: () => void }) {
  const [pagando, setPagando] = useState<ParcelaComissao>();
  const [editando, setEditando] = useState(false);
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(async () => {
    const comissao = await api.obterComissao(id);
    const [imovel, pessoa] = await Promise.all([api.obterFicha(comissao.imovel_id).catch(() => null), api.obterPessoa(comissao.pessoa_id).catch(() => null)]);
    return { comissao, imovel, pessoa };
  }, [id]));
  const alterado = () => { recarregar(); aoAlterar(); };
  return (
    <section className={estilos.painel}>
      <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
      {dados && !erro && <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-5"><div><h3 className={estilos.tituloPainel}>{dados.imovel?.titulo ?? `Imóvel #${dados.comissao.imovel_id}`}</h3><p>Pessoa: {dados.pessoa?.nome ?? `#${dados.comissao.pessoa_id}`} · {dados.comissao.ativo ? 'Comissão ativa' : 'Comissão arquivada'}</p></div><button className="buttonGhost" onClick={() => setEditando(true)}>Editar comissão</button></div>
        {dados.comissao.observacoes && <p className="whitespace-pre-wrap">{dados.comissao.observacoes}</p>}
        <Tabela<ParcelaComissao> itens={dados.comissao.parcelas} chave={(parcela) => parcela.id} vazio="Sem parcelas." colunas={[
          { titulo: 'Parcela', celula: (parcela) => parcela.numero_parcela },
          { titulo: 'Vencimento', celula: (parcela) => dataCivil(parcela.data_vencimento) },
          { titulo: 'Valor', celula: (parcela) => dinheiroExato(parcela.valor) },
          { titulo: 'Recebimento', celula: (parcela) => parcela.status === 'PAGO'
            ? <><strong>Pago</strong><p className={estilos.dica}>{parcela.pago_em ? new Date(parcela.pago_em).toLocaleString('pt-BR') : ''}</p><p className="whitespace-pre-wrap">{parcela.observacao_pagamento}</p></>
            : <><span>{parcela.status === 'ATRASADO' ? 'Atrasado' : 'Pendente'}</span>{dados.comissao.ativo && parcela.ativo && <button className="buttonGhost ml-3" onClick={() => setPagando(parcela)}>Registrar recebimento</button>}</> },
        ]} />
        {editando && <EdicaoComissao comissao={dados.comissao} aoFechar={() => setEditando(false)} aoSalvar={alterado} />}
        {pagando && <DialogoPagamento parcela={pagando} aoFechar={() => setPagando(undefined)} aoSalvar={alterado} />}
      </>}
    </section>
  );
}

export default function Comissoes({ contrato }: { contrato?: Contrato }) {
  const [pagina, setPagina] = useState(1);
  const [ativas, setAtivas] = useState(true);
  const [operacao, setOperacao] = useState<'' | TipoOperacao>('');
  const [criando, setCriando] = useState(false);
  const [aberta, setAberta] = useState(0);
  const contratoId = contrato?.id;
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => api.listarComissoes({ pagina, limite: 15, ativo: ativas, tipo_operacao: operacao || undefined, contrato_id: contratoId }), [pagina, ativas, operacao, contratoId]));
  return <>
    {contrato
      ? <div className="mb-6 flex flex-wrap items-center justify-between gap-5"><div><h2 className={estilos.tituloPainel}>Comissões deste contrato</h2><p>Receita de intermediação da imobiliária.</p></div>{contrato.ativo && <button className="button" onClick={() => setCriando(true)}>+ Registrar comissão</button>}</div>
      : <CabecalhoPagina titulo="Comissões" descricao="Receita de intermediação da imobiliária." acoes={<button className="button" onClick={() => setCriando(true)}>+ Registrar comissão</button>} />}
    <div className={estilos.barraFiltros}>
      {!contrato && <label>Operação<select value={operacao} onChange={(evento) => { setOperacao(evento.target.value as typeof operacao); setPagina(1); setAberta(0); }}><option value="">Todas</option><option value="LOCACAO">Locação</option><option value="VENDA">Venda</option></select></label>}
      <label>Situação<select value={String(ativas)} onChange={(evento) => { setAtivas(evento.target.value === 'true'); setPagina(1); setAberta(0); }}><option value="true">Ativas</option><option value="false">Arquivadas</option></select></label>
    </div>
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && (
      <section className={estilos.painel}>
        <Tabela<Comissao> itens={dados.itens} chave={(comissao) => comissao.id} vazio="Nenhuma comissão registrada." rotulo="Comissões" colunas={[
          { titulo: 'Operação', celula: (comissao) => <>{comissao.tipo_operacao === 'VENDA' ? 'Venda' : 'Locação'}{comissao.observacoes && <small className="mt-1 block max-w-[200px] truncate text-muted">{comissao.observacoes}</small>}</> },
          { titulo: 'Receita total', celula: (comissao) => dinheiroExato(comissao.valor_total) },
          { titulo: 'Recebido', celula: (comissao) => dinheiroExato(comissao.valor_pago ?? '0.00') },
          { titulo: 'Saldo', celula: (comissao) => dinheiroExato(comissao.saldo_pendente ?? comissao.valor_total) },
          { titulo: 'Parcelas', celula: (comissao) => <button className="buttonGhost" aria-expanded={aberta === comissao.id} onClick={() => setAberta(aberta === comissao.id ? 0 : comissao.id)}>{aberta === comissao.id ? 'Ocultar' : `Ver ${plural(comissao.quantidade_parcelas, 'parcela', 'parcelas')}`}</button> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={(valor) => { setPagina(valor); setAberta(0); }} />
      </section>
    )}
    {aberta > 0 && dados?.itens.some((comissao) => comissao.id === aberta) && <DetalheComissao id={aberta} aoAlterar={recarregar} />}
    {criando && <EditorComissao contrato={contrato} aoFechar={() => setCriando(false)} aoSalvar={recarregar} />}
  </>;
}
