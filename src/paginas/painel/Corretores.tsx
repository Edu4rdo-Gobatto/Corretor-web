import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate } from 'react-router-dom';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import type { Corretor } from '../../tipos';
import { mensagemErro } from '../../servicos/formato';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import Dialogo from '../../componentes/Dialogo';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Etiqueta from '../../componentes/Etiqueta';
import Paginacao from '../../componentes/Paginacao';
import Tabela from '../../componentes/Tabela';
import { estilos } from '../../componentes/estilosPainel';

export const esquemaCorretor = z.object({
  nome: z.string().trim().min(2, 'Use pelo menos 2 caracteres.').max(100),
  cpf: z.string().regex(/^\d{11}$/, 'Informe os 11 dígitos do CPF.'),
  email: z.email('Informe um e-mail válido.').max(254),
  whatsapp: z.string().regex(/^[1-9]\d{9,14}$/, 'Use DDI e DDD, somente números. Ex.: 5565999999999.'),
  creci: z.string().max(50),
  cargo: z.enum(['ADMIN', 'CORRETOR']),
  url_foto: z.string().max(2048).refine((valor) => !valor || (/^https:\/\//.test(valor) && URL.canParse(valor)), 'Use uma URL HTTPS válida.'),
  senha: z.string().refine((valor) => valor === '' || (valor.length >= 12 && valor.length <= 128 && /\S/.test(valor)), 'Use entre 12 e 128 caracteres.'),
});
type Valores = z.infer<typeof esquemaCorretor>;
const esquemaSenha = z.object({
  nova_senha: z.string().min(12, 'Use entre 12 e 128 caracteres.').max(128).refine((valor) => /\S/.test(valor), 'Use entre 12 e 128 caracteres.'),
  confirmacao: z.string(),
}).refine((valores) => valores.nova_senha === valores.confirmacao, { message: 'A confirmação não confere.', path: ['confirmacao'] });

const dadosBase = (corretor: Corretor) => ({ nome: corretor.nome, cpf: corretor.cpf, email: corretor.email, whatsapp: corretor.whatsapp, cargo: corretor.cargo, creci: corretor.creci, url_foto: corretor.url_foto });

function EditorCorretor({ corretor, aoFechar, aoSalvar }: { corretor: Corretor | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(esquemaCorretor),
    defaultValues: { nome: corretor?.nome ?? '', cpf: corretor?.cpf ?? '', email: corretor?.email ?? '', whatsapp: corretor?.whatsapp ?? '', creci: corretor?.creci ?? '', cargo: corretor?.cargo ?? 'CORRETOR', url_foto: corretor?.url_foto ?? '', senha: '' },
  });
  async function salvar(valores: Valores) {
    if (!corretor && !valores.senha) { setError('senha', { message: 'Defina uma senha de pelo menos 12 caracteres.' }); return; }
    setErro('');
    try {
      await api.salvarCorretor({ ...valores, creci: valores.creci || null, url_foto: valores.url_foto || null, senha: valores.senha || undefined }, corretor?.id);
      aoSalvar();
      aoFechar();
    } catch (causa) { setErro(mensagemErro(causa)); }
  }
  // Ordem pensada para a grade de 2 colunas não deixar célula vazia: Nome / CPF+E-mail / WhatsApp+CRECI / Permissão+Foto / Senha.
  const campos: [keyof Valores, string, string, string?][] = [['nome', 'Nome', 'text', 'col-span-full'], ['cpf', 'CPF (somente números)', 'text'], ['email', 'E-mail', 'email'], ['whatsapp', 'WhatsApp com DDI e DDD', 'tel'], ['creci', 'CRECI', 'text']];
  const campo = ([nome, rotulo, tipo, classe]: [keyof Valores, string, string, string?]) => <label key={nome} className={classe}>{rotulo}<input type={tipo} {...register(nome)} aria-invalid={!!errors[nome]} />{errors[nome] && <span className={estilos.erro}>{errors[nome]?.message}</span>}</label>;
  return (
    <Dialogo titulo={corretor ? 'Editar corretor' : 'Novo corretor'} tamanho="largo" aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate>
        <div className={estilos.grade}>
          {campos.map((item) => campo(item))}
          <label>Permissão<select {...register('cargo')}><option value="CORRETOR">Corretor</option><option value="ADMIN">Administrador</option></select></label>
          {campo(['url_foto', 'URL da foto (HTTPS)', 'url'])}
          <label className="col-span-full">{corretor ? 'Nova senha (opcional)' : 'Senha *'}<input type="password" autoComplete="new-password" {...register('senha')} /><span className={estilos.dica}>{corretor ? 'Deixe em branco para manter a senha atual. ' : ''}Mínimo de 12 caracteres.</span>{errors.senha && <span className={estilos.erro}>{errors.senha.message}</span>}</label>
        </div>
        {erro && <p className="error" role="alert">{erro}</p>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar corretor'}</button><button className="buttonGhost" type="button" onClick={aoFechar} disabled={isSubmitting}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

function DialogoSenha({ corretor, aoFechar, aoSalvar }: { corretor: Corretor; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof esquemaSenha>>({ resolver: zodResolver(esquemaSenha), defaultValues: { nova_senha: '', confirmacao: '' } });
  async function redefinir(valores: z.infer<typeof esquemaSenha>) {
    setErro('');
    try { await api.salvarCorretor({ ...dadosBase(corretor), senha: valores.nova_senha }, corretor.id); aoSalvar(); aoFechar(); }
    catch (causa) { setErro(mensagemErro(causa)); }
  }
  return (
    <Dialogo titulo={`Redefinir senha de ${corretor.nome}`} tamanho="estreito" aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <p className="muted">Escolha a nova senha na hora e avise a pessoa: as sessões abertas dela são encerradas.</p>
      <form className="grid grid-cols-1 gap-[22px]" onSubmit={handleSubmit(redefinir)} noValidate>
        <label className="grid gap-[7px] font-semibold">Nova senha<input type="password" autoComplete="new-password" aria-label="Nova senha" {...register('nova_senha')} aria-invalid={!!errors.nova_senha} /><span className={estilos.dica}>Mínimo de 12 caracteres.</span>{errors.nova_senha && <span className={estilos.erro}>{errors.nova_senha.message}</span>}</label>
        <label className="grid gap-[7px] font-semibold">Confirmar nova senha<input type="password" autoComplete="new-password" aria-label="Confirmar nova senha" {...register('confirmacao')} aria-invalid={!!errors.confirmacao} />{errors.confirmacao && <span className={estilos.erro}>{errors.confirmacao.message}</span>}</label>
        {erro && <p className="error" role="alert">{erro}</p>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Definir nova senha'}</button><button className="buttonGhost" type="button" onClick={aoFechar} disabled={isSubmitting}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

export default function Corretores() {
  const { corretor: sessao } = useSessao();
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Corretor | null | undefined>();
  const [redefinindo, setRedefinindo] = useState<Corretor>();
  const [erroMutacao, setErroMutacao] = useState('');
  const [ocupado, setOcupado] = useState(0);
  const admin = sessao?.cargo === 'ADMIN';
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(() => admin ? api.listarCorretores(pagina, 15) : Promise.resolve({ itens: [], total: 0, pagina: 1, limite: 15, total_paginas: 0 }), [pagina, admin]));
  if (!admin) return <Navigate to="/admin" replace />;
  async function alternar(corretor: Corretor) {
    if (!confirm(`${corretor.ativo ? 'Desativar' : 'Reativar'} a conta de ${corretor.nome}?${corretor.ativo ? ' Os vínculos com imóveis e contatos serão preservados.' : ''}`)) return;
    setOcupado(corretor.id);
    setErroMutacao('');
    try { await api.salvarCorretor({ ...dadosBase(corretor), ativo: !corretor.ativo }, corretor.id); recarregar(); }
    catch (causa) { setErroMutacao(mensagemErro(causa)); }
    finally { setOcupado(0); }
  }
  return <>
    <CabecalhoPagina rotulo="NOSSA EQUIPE" titulo="Corretores" descricao="Pessoas que conectam espaços e negócios." acoes={<button className="button" onClick={() => setEditando(null)}>+ Novo corretor</button>} />
    {erroMutacao && <p className="error" role="alert">{erroMutacao}</p>}
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && (
      <section className={estilos.painel}>
        <Tabela<Corretor> itens={dados.itens} chave={(corretor) => corretor.id} vazio="Nenhum corretor cadastrado." rotulo="Corretores" colunas={[
          { titulo: 'Corretor', celula: (corretor) => <><strong>{corretor.nome}</strong><small className="mt-1 block wrap-anywhere text-muted">{corretor.email}</small><small className="mt-1 block text-muted">{corretor.creci ? `CRECI ${corretor.creci}` : corretor.whatsapp}</small></> },
          { titulo: 'Permissão', celula: (corretor) => corretor.cargo === 'ADMIN' ? 'Administrador' : 'Corretor' },
          { titulo: 'Situação', celula: (corretor) => <Etiqueta tom={corretor.ativo ? 'neutro' : 'alerta'}>{corretor.ativo ? 'Ativo' : 'Inativo'}</Etiqueta> },
          { titulo: 'Ações', celula: (corretor) => <div className={`${estilos.acoes} max-lg:justify-end`}><button className="buttonGhost" onClick={() => setEditando(corretor)}>Editar</button><button className="buttonGhost" onClick={() => setRedefinindo(corretor)}>Redefinir senha</button><button className="buttonGhost" disabled={!!ocupado} onClick={() => void alternar(corretor)}>{ocupado === corretor.id ? 'Atualizando…' : corretor.ativo ? 'Desativar' : 'Reativar'}</button></div> },
        ]} />
        <Paginacao pagina={pagina} totalPaginas={dados.total_paginas} aoMudar={setPagina} />
      </section>
    )}
    {editando !== undefined && <EditorCorretor corretor={editando} aoFechar={() => setEditando(undefined)} aoSalvar={recarregar} />}
    {redefinindo && <DialogoSenha corretor={redefinindo} aoFechar={() => setRedefinindo(undefined)} aoSalvar={recarregar} />}
  </>;
}
