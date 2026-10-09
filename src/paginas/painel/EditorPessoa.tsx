import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconeSalvar } from '../../componentes/Icones';
import { api, type DadosPessoa } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { documentoValido, somenteDigitos, telefoneValido } from '../../servicos/validacao';
import { mensagemErro, rotulosStatusContato } from '../../servicos/formato';
import { podeAlterarStatusContato, podeEditarPessoa } from '../../servicos/pessoas';
import type { Pessoa, Referencia } from '../../tipos';
import Dialogo from '../../componentes/Dialogo';
import SeletorRegistro from '../../componentes/SeletorRegistro';
import Campo from '../../componentes/Campo';
import Aviso from '../../componentes/Aviso';
import { SecaoPainel } from '../../componentes/BlocosPainel';
import { estilos } from '../../componentes/estilosPainel';

const texto = (maximo: number) => z.string().trim().max(maximo, `Use no máximo ${maximo} caracteres.`);
export const esquemaPessoa = z.object({
  nome: z.string().trim().min(2, 'Informe o nome.').max(200),
  telefone: z.string().trim().refine(telefoneValido, 'Informe DDD e telefone válido.'),
  email: z.union([z.literal(''), z.email('Informe um e-mail válido.').max(254)]),
  tipo_pessoa: z.enum(['', 'PF', 'PJ']),
  cpf_cnpj: z.string().transform(somenteDigitos).refine((valor) => valor === '' || documentoValido(valor), 'Informe um CPF ou CNPJ válido.'),
  data_nascimento: z.union([z.literal(''), z.iso.date('Informe uma data válida.')]),
  endereco: texto(1000),
  banco_nome: texto(150),
  banco_agencia: texto(40),
  banco_conta: texto(80),
  chave_pix: texto(254),
  observacoes: texto(10000),
  mensagem: texto(5000),
  imovel: z.object({ id: z.number(), nome: z.string() }).nullable(),
  corretor_id: z.string(),
  status_contato: z.enum(['PENDENTE', 'RESPONDIDO', 'FINALIZADO']),
  ativo: z.boolean(),
}).superRefine((valores, contexto) => {
  if (valores.cpf_cnpj && valores.tipo_pessoa && valores.cpf_cnpj.length !== (valores.tipo_pessoa === 'PF' ? 11 : 14)) contexto.addIssue({ code: 'custom', path: ['cpf_cnpj'], message: 'O documento deve corresponder ao tipo de pessoa.' });
  if (valores.data_nascimento && valores.tipo_pessoa === 'PJ') contexto.addIssue({ code: 'custom', path: ['data_nascimento'], message: 'Data de nascimento só para pessoa física.' });
});
type ValoresPessoa = z.infer<typeof esquemaPessoa>;

/** Valores do formulário → corpo da API (vazios viram null). */
export function dadosPessoaParaApi(valores: ValoresPessoa, corretorId?: number, editando = false): DadosPessoa {
  const ouNulo = (valor: string) => valor.trim() || null;
  return {
    nome: valores.nome, telefone: valores.telefone, email: ouNulo(valores.email), tipo_pessoa: valores.tipo_pessoa || null, cpf_cnpj: ouNulo(valores.cpf_cnpj),
    data_nascimento: valores.data_nascimento || null, endereco: ouNulo(valores.endereco), banco_nome: ouNulo(valores.banco_nome), banco_agencia: ouNulo(valores.banco_agencia),
    banco_conta: ouNulo(valores.banco_conta), chave_pix: ouNulo(valores.chave_pix), observacoes: ouNulo(valores.observacoes), mensagem: ouNulo(valores.mensagem),
    imovel_id: valores.imovel?.id ?? null, ...(corretorId ? { corretor_id: corretorId } : {}), status_contato: valores.status_contato, ...(editando ? { ativo: valores.ativo } : {}),
  };
}

/** Cadastro único de pessoa: contato, cliente, proprietário ou inquilino no mesmo formulário. */
export default function EditorPessoa({ pessoa, imovelInicial, aoFechar, aoSalvar }: { pessoa: Pessoa | null; imovelInicial?: Referencia | null; aoFechar: () => void; aoSalvar: (pessoa: Pessoa) => void }) {
  const { corretor } = useSessao();
  const [erro, setErro] = useState('');
  const imovelOriginal = useRef(imovelInicial ?? (pessoa?.imovel_id ? { id: pessoa.imovel_id, nome: `Imóvel #${pessoa.imovel_id}` } : null));
  const { register, handleSubmit, setValue, setError, watch, formState: { errors, isSubmitting, isDirty } } = useForm<ValoresPessoa>({
    resolver: zodResolver(esquemaPessoa),
    defaultValues: {
      nome: pessoa?.nome ?? '', telefone: pessoa?.telefone ?? '', email: pessoa?.email ?? '', tipo_pessoa: pessoa?.tipo_pessoa ?? '', cpf_cnpj: pessoa?.cpf_cnpj ?? '',
      data_nascimento: pessoa?.data_nascimento ?? '', endereco: pessoa?.endereco ?? '', banco_nome: pessoa?.banco_nome ?? '', banco_agencia: pessoa?.banco_agencia ?? '',
      banco_conta: pessoa?.banco_conta ?? '', chave_pix: pessoa?.chave_pix ?? '', observacoes: pessoa?.observacoes ?? '', mensagem: pessoa?.mensagem ?? '',
      imovel: imovelOriginal.current,
      corretor_id: pessoa ? String(pessoa.corretor_id) : '', status_contato: pessoa?.status_contato ?? 'RESPONDIDO', ativo: pessoa?.ativo ?? true,
    },
  });
  const tipoPessoa = watch('tipo_pessoa');
  const imovel = watch('imovel');
  const finalizadoBloqueado = pessoa?.status_contato === 'FINALIZADO' && corretor?.cargo !== 'ADMIN';
  const corretores = useDadosPainel(useCallback(() => corretor?.cargo === 'ADMIN' ? api.listarCorretores(1, 100) : Promise.resolve(null), [corretor?.cargo]));
  const buscarImoveis = useCallback(async (termo: string): Promise<Referencia[]> => (await api.listarFichas({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.titulo })), []);

  async function salvar(valores: ValoresPessoa) {
    setErro('');
    if (pessoa && !podeEditarPessoa(corretor, pessoa)) {
      setErro('Você não tem permissão para editar esta pessoa.');
      return;
    }
    if (pessoa && !podeAlterarStatusContato(corretor, pessoa, valores.status_contato)) {
      setError('status_contato', { message: 'Somente um administrador pode reabrir um atendimento finalizado.' });
      return;
    }
    try {
      const corretorId = corretor?.cargo === 'ADMIN' ? Number(valores.corretor_id) || corretor.id : undefined;
      const salva = await api.salvarPessoa(dadosPessoaParaApi(valores, corretorId, !!pessoa), pessoa?.id, pessoa ?? undefined);
      aoSalvar(salva);
      aoFechar();
    } catch (causa) {
      setErro(mensagemErro(causa));
    }
  }
  const campo = (nome: keyof ValoresPessoa & string, rotulo: string, tipo = 'text', extra?: string) => (
    <Campo rotulo={rotulo.replace(' *', '')} obrigatorio={rotulo.endsWith(' *')} dica={extra} erro={errors[nome]?.message as string | undefined}><input type={tipo} {...register(nome)} autoComplete="off" /></Campo>
  );

  return (
    <Dialogo titulo={pessoa ? 'Editar pessoa' : 'Nova pessoa'} tamanho="largo" alterado={isDirty} ocupado={isSubmitting} fecharAoClicarFora aoFechar={aoFechar}>
      <form noValidate onSubmit={handleSubmit(salvar)} className={estilos.formulario}>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <SecaoPainel titulo="Dados e atendimento" classeConteudo="@container">
          <div className={estilos.grade}>
            {campo('nome', 'Nome / razão social *')}
            {campo('telefone', 'Telefone com DDD *', 'tel')}
            {campo('email', 'E-mail', 'email')}
            <Campo rotulo="Tipo de pessoa" erro={errors.tipo_pessoa?.message}><select {...register('tipo_pessoa')}><option value="">Não informado</option><option value="PF">Pessoa física</option><option value="PJ">Pessoa jurídica</option></select></Campo>
            {/* Sem data de nascimento (PJ), o documento ocupa a linha inteira para não deixar célula vazia. */}
            <div className={tipoPessoa === 'PJ' ? 'col-span-full' : ''}>{campo('cpf_cnpj', 'CPF / CNPJ')}</div>
            {tipoPessoa !== 'PJ' && campo('data_nascimento', 'Data de nascimento', 'date')}
            <div className="col-span-full">{campo('endereco', 'Endereço completo')}</div>
            <div className="col-span-full"><SeletorRegistro rotulo="Imóvel de interesse" valor={imovel} buscar={buscarImoveis} aoEscolher={(valor) => setValue('imovel', valor?.id === imovelOriginal.current?.id ? imovelOriginal.current : valor, { shouldDirty: true })} dica="Opcional. Vincula a pessoa ao imóvel que ela procura." /></div>
            <Campo classe={corretor?.cargo === 'ADMIN' ? '' : 'col-span-full'} rotulo="Situação do contato" erro={errors.status_contato?.message} dica={finalizadoBloqueado ? 'Somente um administrador pode reabrir este atendimento.' : undefined}><select {...register('status_contato')}>{Object.entries(rotulosStatusContato).filter(([valor]) => !finalizadoBloqueado || valor === 'FINALIZADO').map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></Campo>
            {corretor?.cargo === 'ADMIN' && <Campo rotulo="Corretor responsável" erro={errors.corretor_id?.message}><select {...register('corretor_id')}><option value="">Minha conta</option>{(corretores.dados?.itens ?? []).filter((item) => item.ativo || item.id === pessoa?.corretor_id).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></Campo>}
          </div>
          </SecaoPainel>
          <details className="min-w-0">
            <summary className="cursor-pointer font-display text-[22px] leading-[1.3]">Dados bancários (proprietários)</summary>
            <div className="superficie-painel @container mt-4"><div className={estilos.grade}>{campo('banco_nome', 'Banco')}{campo('banco_agencia', 'Agência')}{campo('banco_conta', 'Conta')}{campo('chave_pix', 'Chave Pix')}</div></div>
          </details>
          <SecaoPainel titulo="Anotações do atendimento" classeConteudo="@container">
          <div className={estilos.grade}>
            <Campo classe="col-span-full" rotulo="Mensagem do primeiro contato" erro={errors.mensagem?.message}><textarea rows={2} {...register('mensagem')} /></Campo>
            <Campo classe="col-span-full" rotulo="Observações" erro={errors.observacoes?.message}><textarea rows={3} {...register('observacoes')} placeholder="Anotações do atendimento, preferências, próximos passos." /></Campo>
            {pessoa && <label className="col-span-full flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('ativo')} />Cadastro ativo</label>}
          </div>
          </SecaoPainel>
        </fieldset>
        <p className={estilos.dica}>O cadastro manual não registra consentimento do site.</p>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Salvar pessoa'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}
