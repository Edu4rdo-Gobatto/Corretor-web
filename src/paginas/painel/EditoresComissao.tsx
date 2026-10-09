import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
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
import { buscarImoveis, buscarPessoas } from './Contratos';
import { esquemaComissao, esquemaEdicaoComissao, esquemaPagamento, previaParcelas, type ValoresComissao } from './esquemaLocacao';

const buscarContratos = async (termo: string): Promise<(Referencia & { imovel_id: number; imovel_titulo: string | null })[]> =>
  (await api.listarContratos({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.numero_contrato, imovel_id: item.imovel_id, imovel_titulo: item.imovel_titulo }));

export function EditorComissao({ contrato, aoFechar, aoSalvar }: { contrato?: Contrato; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const [imovel, setImovel] = useState<Referencia | null>(contrato ? { id: contrato.imovel_id, nome: contrato.imovel_titulo ?? `#${contrato.imovel_id}` } : null);
  const [pessoa, setPessoa] = useState<Referencia | null>(null);
  const [contratoEscolhido, setContratoEscolhido] = useState<Referencia | null>(contrato ? { id: contrato.id, nome: contrato.numero_contrato } : null);
  const [resolvendoContrato, setResolvendoContrato] = useState(false);
  const sequenciaContrato = useRef(0);
  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<ValoresComissao>({
    resolver: zodResolver(esquemaComissao),
    defaultValues: { tipo_operacao: contrato ? 'LOCACAO' : 'VENDA', contrato_id: contrato?.id ?? null, imovel_id: contrato?.imovel_id ?? 0, pessoa_id: 0, valor_total: '', quantidade_parcelas: 1, primeiro_vencimento: '', observacoes: '' },
  });
  const operacao = watch('tipo_operacao');
  const previa = previaParcelas(watch('valor_total'), watch('quantidade_parcelas'), watch('primeiro_vencimento'));
  const escolherContrato = async (valor: Referencia | null) => {
    const atual = ++sequenciaContrato.current;
    setContratoEscolhido(valor);
    setValue('contrato_id', valor?.id ?? null, { shouldValidate: true, shouldDirty: true });
    setImovel(null);
    setValue('imovel_id', 0, { shouldDirty: true });
    setErro('');
    if (!valor) { setResolvendoContrato(false); return; }
    setResolvendoContrato(true);
    try {
      const contratoCarregado = await api.obterContrato(valor.id);
      if (sequenciaContrato.current !== atual) return;
      if (contratoCarregado) {
        setImovel({ id: contratoCarregado.imovel_id, nome: contratoCarregado.imovel_titulo ?? `#${contratoCarregado.imovel_id}` });
        setValue('imovel_id', contratoCarregado.imovel_id, { shouldValidate: true, shouldDirty: true });
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
    setErro('');
    try { await api.criarComissao(valores); aoSalvar(); aoFechar(); }
    catch (falha) { setErro(mensagemErro(falha)); }
  }
  return (
    <Dialogo titulo="Registrar comissão" tamanho="largo" alterado={isDirty} ocupado={isSubmitting || resolvendoContrato} aoFechar={() => { if (!isSubmitting && !resolvendoContrato) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        <fieldset disabled={isSubmitting || resolvendoContrato} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <p className="m-0">Informe a receita devida pela intermediação do negócio.</p>
          {!contrato && <Campo rotulo="Operação" erro={errors.tipo_operacao?.message}><select {...register('tipo_operacao', { onChange: () => { sequenciaContrato.current++; setResolvendoContrato(false); setValue('contrato_id', null, { shouldDirty: true }); setValue('imovel_id', 0, { shouldDirty: true }); setValue('pessoa_id', 0, { shouldDirty: true }); setContratoEscolhido(null); setImovel(null); setPessoa(null); setErro(''); } })}><option value="VENDA">Venda</option><option value="LOCACAO">Locação</option></select></Campo>}
          {contrato ? <p className="m-0">Contrato: {contrato.numero_contrato}; {contrato.imovel_titulo}</p>
            : operacao === 'LOCACAO' ? <SeletorRegistro rotulo="Contrato de locação" valor={contratoEscolhido} buscar={buscarContratos} aoEscolher={(valor) => void escolherContrato(valor)} erro={errors.contrato_id?.message} dica={resolvendoContrato ? 'Buscando imóvel do contrato…' : imovel ? `Imóvel: ${imovel.nome}` : undefined} />
              : <SeletorRegistro rotulo="Imóvel" valor={imovel} buscar={buscarImoveis} aoEscolher={(valor) => { setImovel(valor); setValue('imovel_id', valor?.id ?? 0, { shouldValidate: true, shouldDirty: true }); }} erro={errors.imovel_id?.message} />}
          <SeletorRegistro rotulo="Pessoa (cliente do negócio)" valor={pessoa} buscar={buscarPessoas} aoEscolher={(valor) => { setPessoa(valor); setValue('pessoa_id', valor?.id ?? 0, { shouldValidate: true, shouldDirty: true }); }} erro={errors.pessoa_id?.message} dica="A pessoa precisa estar ativa e sob o mesmo responsável pelo imóvel." />
          <div className={estilos.grade}>
            <Campo classe="col-span-full" rotulo="Receita total" erro={errors.valor_total?.message}><CampoNumero unidade="R$" placeholder="Ex.: 1.500,00" {...register('valor_total')} /></Campo>
            <Campo rotulo="Quantidade de parcelas" erro={errors.quantidade_parcelas?.message}><CampoNumero casasDecimais={0} min={1} max={600} {...register('quantidade_parcelas', { setValueAs: numeroDoCampo })} /></Campo>
            <Campo rotulo="Primeiro vencimento" erro={errors.primeiro_vencimento?.message}><input type="date" {...register('primeiro_vencimento')} /></Campo>
            <Campo classe="col-span-full" rotulo="Observações" erro={errors.observacoes?.message}><textarea {...register('observacoes')} /></Campo>
          </div>
          {previa.length > 0 && <SecaoPainel titulo="Prévia do parcelamento"><ul className="m-0 pl-5">{previa.slice(0, 4).map((item, indice) => <li key={indice}>Parcela {indice + 1}: {dinheiroExato(item.valor)} em {dataCivil(item.data)}</li>)}</ul>{previa.length > 4 && <p>Mais {previa.length - 4} parcelas. Último vencimento: {dataCivil(previa.at(-1)!.data)}.</p>}<p className={`${estilos.dica} mb-0`}>Os centavos são distribuídos entre as parcelas. Dias 29–31 são ajustados ao fim do mês.</p></SecaoPainel>}
        </fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting || resolvendoContrato}><IconeComissoes size={20} aria-hidden="true" />{isSubmitting ? 'Registrando…' : resolvendoContrato ? 'Buscando imóvel…' : 'Registrar comissão'}</button><button type="button" className="buttonGhost" disabled={isSubmitting || resolvendoContrato} data-fechar-dialogo>Cancelar</button></div>
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

export function EdicaoComissao({ comissao, aoFechar, aoSalvar }: { comissao: Comissao; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<{ ativo: boolean; observacoes: string }>({ resolver: zodResolver(esquemaEdicaoComissao), defaultValues: { ativo: comissao.ativo, observacoes: comissao.observacoes ?? '' } });
  async function salvar(valores: { ativo: boolean; observacoes: string }) {
    setErro('');
    try { await api.atualizarComissao(comissao.id, valores); aoSalvar(); aoFechar(); }
    catch (falha) { setErro(mensagemErro(falha)); }
  }
  return (
    <Dialogo titulo="Editar comissão" alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate data-atalho-salvar>
        <p>O valor total e as parcelas preservam o registro original. Ao desativar, novas baixas ficam bloqueadas e o histórico é mantido.</p>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <Campo rotulo="Observações" erro={errors.observacoes?.message}><textarea {...register('observacoes')} /></Campo>
          <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('ativo')} />Comissão ativa</label>
        </fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar size={20} aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Salvar alterações'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

