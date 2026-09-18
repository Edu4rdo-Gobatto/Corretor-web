import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, type DadosPessoa } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { documentoValido, somenteDigitos, telefoneValido } from '../../servicos/validacao';
import { mensagemErro, rotulosStatusContato } from '../../servicos/formato';
import type { Pessoa, Referencia } from '../../tipos';
import Dialogo from '../../componentes/Dialogo';
import SeletorRegistro from '../../componentes/SeletorRegistro';
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
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ValoresPessoa>({
    resolver: zodResolver(esquemaPessoa),
    defaultValues: {
      nome: pessoa?.nome ?? '', telefone: pessoa?.telefone ?? '', email: pessoa?.email ?? '', tipo_pessoa: pessoa?.tipo_pessoa ?? '', cpf_cnpj: pessoa?.cpf_cnpj ?? '',
      data_nascimento: pessoa?.data_nascimento ?? '', endereco: pessoa?.endereco ?? '', banco_nome: pessoa?.banco_nome ?? '', banco_agencia: pessoa?.banco_agencia ?? '',
      banco_conta: pessoa?.banco_conta ?? '', chave_pix: pessoa?.chave_pix ?? '', observacoes: pessoa?.observacoes ?? '', mensagem: pessoa?.mensagem ?? '',
      imovel: imovelInicial ?? (pessoa?.imovel_id ? { id: pessoa.imovel_id, nome: `Imóvel #${pessoa.imovel_id}` } : null),
      corretor_id: pessoa ? String(pessoa.corretor_id) : '', status_contato: pessoa?.status_contato ?? 'RESPONDIDO', ativo: pessoa?.ativo ?? true,
    },
  });
  const tipoPessoa = watch('tipo_pessoa');
  const imovel = watch('imovel');
  const corretores = useDadosPainel(useCallback(() => corretor?.cargo === 'ADMIN' ? api.listarCorretores(1, 100) : Promise.resolve(null), [corretor?.cargo]));
  const buscarImoveis = useCallback(async (termo: string): Promise<Referencia[]> => (await api.listarFichas({ busca: termo || undefined, limite: 10, ativo: true })).itens.map((item) => ({ id: item.id, nome: item.titulo })), []);

  async function salvar(valores: ValoresPessoa) {
    setErro('');
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
    <label>{rotulo}<input type={tipo} {...register(nome)} aria-invalid={!!errors[nome]} autoComplete="off" />{extra && <span className={estilos.dica}>{extra}</span>}{errors[nome] && <span className={estilos.erro}>{errors[nome]?.message as string}</span>}</label>
  );

  return (
    <Dialogo titulo={pessoa ? `Editar ${pessoa.nome}` : 'Nova pessoa'} tamanho="largo" aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form noValidate onSubmit={handleSubmit(salvar)} className={estilos.formulario}>
        <fieldset disabled={isSubmitting} className="m-0 border-0 p-0">
          <div className={estilos.grade}>
            {campo('nome', 'Nome / razão social *')}
            {campo('telefone', 'Telefone com DDD *', 'tel')}
            {campo('email', 'E-mail', 'email')}
            <label>Tipo de pessoa<select {...register('tipo_pessoa')}><option value="">Não informado</option><option value="PF">Pessoa física</option><option value="PJ">Pessoa jurídica</option></select></label>
            {/* Sem data de nascimento (PJ), o documento ocupa a linha inteira para não deixar célula vazia. */}
            <div className={tipoPessoa === 'PJ' ? 'col-span-full' : ''}>{campo('cpf_cnpj', 'CPF / CNPJ')}</div>
            {tipoPessoa !== 'PJ' && campo('data_nascimento', 'Data de nascimento', 'date')}
            <div className="col-span-full">{campo('endereco', 'Endereço completo')}</div>
            <div className="col-span-full"><SeletorRegistro rotulo="Imóvel de interesse" valor={imovel} buscar={buscarImoveis} aoEscolher={(valor) => setValue('imovel', valor, { shouldDirty: true })} dica="Opcional. Vincula a pessoa ao imóvel que ela procura." /></div>
            <label className={corretor?.cargo === 'ADMIN' ? '' : 'col-span-full'}>Situação do contato<select {...register('status_contato')}>{Object.entries(rotulosStatusContato).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></label>
            {corretor?.cargo === 'ADMIN' && <label>Corretor responsável<select {...register('corretor_id')}><option value="">Minha conta</option>{(corretores.dados?.itens ?? []).filter((item) => item.ativo || item.id === pessoa?.corretor_id).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>}
          </div>
          <details className="mt-5">
            <summary className="cursor-pointer font-semibold">Dados bancários (proprietários)</summary>
            <div className={`${estilos.grade} mt-3`}>{campo('banco_nome', 'Banco')}{campo('banco_agencia', 'Agência')}{campo('banco_conta', 'Conta')}{campo('chave_pix', 'Chave Pix')}</div>
          </details>
          <div className={`${estilos.grade} mt-5`}>
            <label className="col-span-full">Mensagem do primeiro contato<textarea rows={2} {...register('mensagem')} /></label>
            <label className="col-span-full">Observações<textarea rows={3} {...register('observacoes')} placeholder="Anotações do atendimento, preferências, próximos passos." /></label>
            {pessoa && <label className="col-span-full flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('ativo')} />Cadastro ativo</label>}
          </div>
        </fieldset>
        <p className={estilos.dica}>O cadastro manual não registra consentimento do site.</p>
        {erro && <p role="alert" className="error">{erro}</p>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar pessoa'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} onClick={aoFechar}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}
