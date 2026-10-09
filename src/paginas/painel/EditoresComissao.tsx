import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Aviso from '../../componentes/Aviso';
import Campo from '../../componentes/Campo';
import CampoNumero, { numeroDoCampo } from '../../componentes/CampoNumero';
import Dialogo from '../../componentes/Dialogo';
import { estilos } from '../../componentes/estilosPainel';
import { IconeComissoes, IconeSalvar } from '../../componentes/Icones';
import { SecaoPainel } from '../../componentes/BlocosPainel';
import SeletorRegistro from '../../componentes/SeletorRegistro';
import { api } from '../../servicos/api';
import { dataCivil, dinheiroExato, mensagemErro } from '../../servicos/formato';
import type { Comissao, Contrato, ParcelaComissao } from '../../servicos/locacoes';
import type { Referencia } from '../../tipos';
import { ErroApi } from '../../servicos/http';
import { buscarImoveis } from './Contratos';
import { esquemaComissao, esquemaEdicaoComissao, esquemaPagamento, previaParcelas, type ValoresComissao } from './esquemaLocacao';

const buscarContratos = async (termo: string): Promise<(Referencia & { imovel_id: number; imovel_titulo: string | null })[]> =>
  (await api.listarContratos({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.numero_contrato, imovel_id: item.imovel_id, imovel_titulo: item.imovel_titulo }));

const PESSOA_INCOMPATIVEL = 'Esta pessoa não pode mais receber a comissão deste imóvel. Escolha outro cliente.';

/** Nomes já carregados pela ficha, para o formulário de edição não exibir só ids. */
export interface NomesComissao { imovel?: string; pessoa?: string; contrato?: string }

/** Edição aberta com versão antiga: o servidor recusa e a ficha precisa ser recarregada. */
function AvisoConflito({ mensagem, aoRecarregar }: { mensagem: string; aoRecarregar: () => void }) {
  return <Aviso tom="erro">{mensagem} <button type="button" className="buttonGhost mt-2" onClick={aoRecarregar}>Recarregar ficha</button></Aviso>;
}

/** Registro (sem `comissao`) ou edição completa de comissão ainda sem recebimento. */
export function EditorComissao({ contrato, comissao, nomes, aoFechar, aoSalvar }: { contrato?: Contrato; comissao?: Comissao; nomes?: NomesComissao; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const [conflito, setConflito] = useState('');
  const [imovel, setImovel] = useState<Referencia | null>(contrato ? { id: contrato.imovel_id, nome: contrato.imovel_titulo ?? `#${contrato.imovel_id}` }
    : comissao ? { id: comissao.imovel_id, nome: nomes?.imovel ?? `Imóvel #${comissao.imovel_id}` } : null);
  const [pessoa, setPessoa] = useState<Referencia | null>(comissao ? { id: comissao.pessoa_id, nome: nomes?.pessoa ?? `Pessoa #${comissao.pessoa_id}` } : null);
  const [contratoEscolhido, setContratoEscolhido] = useState<Referencia | null>(contrato ? { id: contrato.id, nome: contrato.numero_contrato }
    : comissao?.contrato_id ? { id: comissao.contrato_id, nome: nomes?.contrato ?? `Contrato #${comissao.contrato_id}` } : null);
  const [resolvendoContrato, setResolvendoContrato] = useState(false);
  const sequenciaContrato = useRef(0);
  const { register, setValue, setError, clearErrors, watch, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<ValoresComissao>({
    resolver: zodResolver(esquemaComissao),
    defaultValues: comissao
      ? { tipo_operacao: comissao.tipo_operacao, contrato_id: comissao.contrato_id, imovel_id: comissao.imovel_id, pessoa_id: comissao.pessoa_id, valor_total: comissao.valor_total, quantidade_parcelas: comissao.quantidade_parcelas, primeiro_vencimento: comissao.primeiro_vencimento ?? '', observacoes: comissao.observacoes ?? '' }
      : { tipo_operacao: contrato ? 'LOCACAO' : 'VENDA', contrato_id: contrato?.id ?? null, imovel_id: contrato?.imovel_id ?? 0, pessoa_id: 0, valor_total: '', quantidade_parcelas: 1, primeiro_vencimento: '', observacoes: '' },
  });
  const operacao = watch('tipo_operacao');
  // Só clientes que o POST aceitaria; a busca muda de identidade com o imóvel e o seletor é remontado por `key`.
  const imovelId = imovel?.id;
  const buscarClientes = useCallback(async (termo: string) => imovelId
    ? (await api.listarPessoasElegiveis({ imovel_id: imovelId, busca: termo || undefined, limite: 10 })).itens.map((item) => ({ id: item.id, nome: item.nome }))
    : [], [imovelId]);
  const limparPessoa = () => { setPessoa(null); setValue('pessoa_id', 0, { shouldDirty: true }); clearErrors('pessoa_id'); };
  const escolherImovel = (valor: Referencia | null, validar = true) => {
    setImovel(valor);
    setValue('imovel_id', valor?.id ?? 0, { shouldValidate: validar, shouldDirty: true });
    limparPessoa();
  };
  const previa = previaParcelas(watch('valor_total'), watch('quantidade_parcelas'), watch('primeiro_vencimento'));
  const escolherContrato = async (valor: Referencia | null) => {
    const atual = ++sequenciaContrato.current;
    setContratoEscolhido(valor);
    setValue('contrato_id', valor?.id ?? null, { shouldValidate: true, shouldDirty: true });
    escolherImovel(null, false);
    setErro('');
    if (!valor) { setResolvendoContrato(false); return; }
    setResolvendoContrato(true);
    try {
      const contratoCarregado = await api.obterContrato(valor.id);
      if (sequenciaContrato.current !== atual) return;
      if (contratoCarregado) {
        escolherImovel({ id: contratoCarregado.imovel_id, nome: contratoCarregado.imovel_titulo ?? `#${contratoCarregado.imovel_id}` });
      }
    } catch (falha) {
      if (sequenciaContrato.current !== atual) return;
      setErro(`Não foi possível carregar o imóvel do contrato. ${mensagemErro(falha)}`);
    } finally {
      if (sequenciaContrato.current === atual) setResolvendoContrato(false);
    }
  };
  async function salvar(valores: ValoresComissao) {
    if (resolvendoContrato) return;
    setErro(''); setConflito('');
    try {
      // O vínculo da pessoa pode ter mudado desde a escolha; receita, parcelas e vencimento ficam como estão.
      // Na edição, só revalida quando o cliente ou o imóvel mudou: o servidor ignora valores reenviados iguais.
      if (!comissao || valores.pessoa_id !== comissao.pessoa_id || valores.imovel_id !== comissao.imovel_id) {
        const compativel = await api.listarPessoasElegiveis({ imovel_id: valores.imovel_id, pessoa_id: valores.pessoa_id, limite: 1 });
        if (!compativel.itens.some((item) => item.id === valores.pessoa_id)) { setError('pessoa_id', { message: PESSOA_INCOMPATIVEL }, { shouldFocus: true }); return; }
      }
      if (comissao) await api.atualizarComissao(comissao.id, comissao.versao_registro, valores);
      else await api.criarComissao(valores);
      aoSalvar(); aoFechar();
    } catch (falha) {
      if (falha instanceof ErroApi && falha.status === 400 && /^Pessoa /.test(falha.message)) setError('pessoa_id', { message: falha.message }, { shouldFocus: true });
      else if (comissao && falha instanceof ErroApi && falha.status === 409) setConflito(falha.message);
      else setErro(mensagemErro(falha));
    }
  }
  return (
    <Dialogo titulo={comissao ? 'Editar comissão' : 'Registrar comissão'} tamanho="largo" alterado={isDirty} ocupado={isSubmitting || resolvendoContrato} aoFechar={() => { if (!isSubmitting && !resolvendoContrato) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate data-atalho-salvar={comissao ? true : undefined}>
        <fieldset disabled={isSubmitting || resolvendoContrato} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <p className="m-0">{comissao ? 'Mudar operação, vínculos, receita, parcelas ou vencimento gera um novo plano de parcelas. O plano anterior fica guardado no histórico.' : 'Informe a receita devida pela intermediação do negócio.'}</p>
          {!contrato && <Campo rotulo="Operação" erro={errors.tipo_operacao?.message}><select {...register('tipo_operacao', { onChange: () => { sequenciaContrato.current++; setResolvendoContrato(false); setValue('contrato_id', null, { shouldDirty: true }); setContratoEscolhido(null); escolherImovel(null, false); setErro(''); } })}><option value="VENDA">Venda</option><option value="LOCACAO">Locação</option></select></Campo>}
          {contrato ? <p className="m-0">Contrato: {contrato.numero_contrato}; {contrato.imovel_titulo}</p>
            : operacao === 'LOCACAO' ? <SeletorRegistro rotulo="Contrato de locação" valor={contratoEscolhido} buscar={buscarContratos} aoEscolher={(valor) => void escolherContrato(valor)} erro={errors.contrato_id?.message} dica={resolvendoContrato ? 'Buscando imóvel do contrato…' : imovel ? `Imóvel: ${imovel.nome}` : undefined} />
              : <SeletorRegistro rotulo="Imóvel" valor={imovel} buscar={buscarImoveis} aoEscolher={escolherImovel} erro={errors.imovel_id?.message} />}
          <SeletorRegistro key={imovelId ?? 'sem-imovel'} rotulo="Pessoa (cliente do negócio)" valor={pessoa} buscar={buscarClientes} desabilitado={!imovelId || resolvendoContrato}
            aoEscolher={(valor) => { setPessoa(valor); setValue('pessoa_id', valor?.id ?? 0, { shouldValidate: true, shouldDirty: true }); }} erro={errors.pessoa_id?.message}
            dica={imovelId && !resolvendoContrato ? 'Somente pessoas ativas, do mesmo responsável e sem vínculo com outro imóvel.' : `Escolha ${operacao === 'LOCACAO' && !contrato ? 'o contrato' : 'o imóvel'} antes do cliente.`} />
          <div className={estilos.grade}>
            <Campo classe="col-span-full" rotulo="Receita total" erro={errors.valor_total?.message}><CampoNumero unidade="R$" placeholder="Ex.: 1.500,00" {...register('valor_total')} /></Campo>
            <Campo rotulo="Quantidade de parcelas" erro={errors.quantidade_parcelas?.message}><CampoNumero casasDecimais={0} min={1} max={600} {...register('quantidade_parcelas', { setValueAs: numeroDoCampo })} /></Campo>
            <Campo rotulo="Primeiro vencimento" erro={errors.primeiro_vencimento?.message}><input type="date" {...register('primeiro_vencimento')} /></Campo>
            <Campo classe="col-span-full" rotulo="Observações" erro={errors.observacoes?.message}><textarea {...register('observacoes')} /></Campo>
          </div>
          {previa.length > 0 && <SecaoPainel titulo={comissao ? 'Prévia do plano' : 'Prévia do parcelamento'}><ul className="m-0 pl-5">{previa.slice(0, 4).map((item, indice) => <li key={indice}>Parcela {indice + 1}: {dinheiroExato(item.valor)} em {dataCivil(item.data)}</li>)}</ul>{previa.length > 4 && <p>Mais {previa.length - 4} parcelas. Último vencimento: {dataCivil(previa.at(-1)!.data)}.</p>}<p className={`${estilos.dica} mb-0`}>Os centavos são distribuídos entre as parcelas. Dias 29–31 são ajustados ao fim do mês.</p></SecaoPainel>}
        </fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        {conflito && <AvisoConflito mensagem={conflito} aoRecarregar={() => { aoSalvar(); aoFechar(); }} />}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting || resolvendoContrato}>{comissao ? <IconeSalvar size={20} aria-hidden="true" /> : <IconeComissoes size={20} aria-hidden="true" />}{isSubmitting ? (comissao ? 'Salvando…' : 'Registrando…') : resolvendoContrato ? 'Buscando imóvel…' : comissao ? 'Salvar alterações' : 'Registrar comissão'}</button><button type="button" className="buttonGhost" disabled={isSubmitting || resolvendoContrato} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

export function DialogoPagamento({ parcela, aoFechar, aoSalvar }: { parcela: ParcelaComissao; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<{ confirmar_pagamento: boolean; observacao_pagamento: string }>({ resolver: zodResolver(esquemaPagamento), defaultValues: { confirmar_pagamento: false, observacao_pagamento: '' } });
  async function salvar(valores: { confirmar_pagamento: boolean; observacao_pagamento: string }) {
    setErro('');
    try { await api.pagarParcela(parcela.id, { confirmar_pagamento: true, observacao_pagamento: valores.observacao_pagamento }); aoSalvar(); aoFechar(); }
    catch (falha) { setErro(mensagemErro(falha)); }
  }
  return (
    <Dialogo titulo={`Receber parcela ${parcela.numero_parcela}`} alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        <p>{dinheiroExato(parcela.valor)}; Vencimento {dataCivil(parcela.data_vencimento)}</p>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <Campo rotulo="Referência do comprovante" erro={errors.observacao_pagamento?.message}><textarea placeholder="Ex.: PIX recebido em 14/09, comprovante nº…" {...register('observacao_pagamento')} /></Campo>
          <Campo classe="grid-cols-[auto_1fr] gap-x-3 [&_label]:col-start-2 [&_label]:row-start-1 [&_input]:col-start-1 [&_input]:row-start-1 [&_input]:mt-1 [&_span]:col-span-full" rotulo="Confirmo que a imobiliária recebeu este pagamento." erro={errors.confirmar_pagamento?.message}><input className="w-auto!" type="checkbox" {...register('confirmar_pagamento')} /></Campo>
        </fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeComissoes size={20} aria-hidden="true" />{isSubmitting ? 'Confirmando…' : 'Confirmar recebimento'}</button><button className="buttonGhost" type="button" disabled={isSubmitting} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

/**
 * Com recebimento registrado ou arquivada, só observações; o restante usa o formulário completo.
 * Arquivar e reativar ficam na ficha, com confirmação.
 */
export function EdicaoComissao({ comissao, nomes, aoFechar, aoSalvar }: { comissao: Comissao; nomes?: NomesComissao; aoFechar: () => void; aoSalvar: () => void }) {
  if (!comissao.possui_recebimento && comissao.ativo) return <EditorComissao comissao={comissao} nomes={nomes} aoFechar={aoFechar} aoSalvar={aoSalvar} />;
  return <EdicaoObservacoes comissao={comissao} aoFechar={aoFechar} aoSalvar={aoSalvar} />;
}

function EdicaoObservacoes({ comissao, aoFechar, aoSalvar }: { comissao: Comissao; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const [conflito, setConflito] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<{ observacoes: string }>({ resolver: zodResolver(esquemaEdicaoComissao), defaultValues: { observacoes: comissao.observacoes ?? '' } });
  async function salvar(valores: { observacoes: string }) {
    setErro(''); setConflito('');
    try { await api.atualizarComissao(comissao.id, comissao.versao_registro, valores); aoSalvar(); aoFechar(); }
    catch (falha) { if (falha instanceof ErroApi && falha.status === 409) setConflito(falha.message); else setErro(mensagemErro(falha)); }
  }
  return (
    <Dialogo titulo="Editar comissão" alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate data-atalho-salvar>
        <p>{comissao.possui_recebimento
          ? 'Esta comissão já tem recebimento registrado. Operação, vínculos, receita, parcelas e vencimento não podem mais ser alterados; as observações continuam editáveis.'
          : 'Comissão arquivada: reative-a na ficha para alterar operação, vínculos, receita, parcelas ou vencimento.'}</p>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <Campo rotulo="Observações" erro={errors.observacoes?.message}><textarea {...register('observacoes')} /></Campo>
        </fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        {conflito && <AvisoConflito mensagem={conflito} aoRecarregar={() => { aoSalvar(); aoFechar(); }} />}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar size={20} aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Salvar alterações'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}
