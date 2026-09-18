import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { data, mensagemErro } from '../../servicos/formato';
import { rotas } from '../../servicos/urls';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import { estilos } from '../../componentes/estilosPainel';

const esquemaPerfil = z.object({
  nome: z.string().trim().min(2, 'Use pelo menos 2 caracteres.').max(100),
  whatsapp: z.string().regex(/^[1-9]\d{9,14}$/, 'Use DDI e DDD, somente números. Ex.: 5565999999999.'),
  creci: z.string().max(50),
  url_foto: z.string().max(2048).refine((valor) => !valor || (/^https:\/\//.test(valor) && URL.canParse(valor)), 'Use uma URL HTTPS válida.'),
});
const esquemaSenha = z.object({
  senha_atual: z.string().min(1, 'Informe a senha atual.'),
  nova_senha: z.string().min(12, 'Use entre 12 e 128 caracteres.').max(128).refine((valor) => /\S/.test(valor), 'Use entre 12 e 128 caracteres.'),
  confirmacao: z.string(),
}).refine((valores) => valores.nova_senha === valores.confirmacao, { message: 'A confirmação não confere.', path: ['confirmacao'] });
type ValoresPerfil = z.infer<typeof esquemaPerfil>;
type ValoresSenha = z.infer<typeof esquemaSenha>;
const rotulo = 'grid gap-[7px] font-semibold [&_input]:w-full';

function cartao(titulo: string, valor: string | number, detalhe?: string) {
  return <div className="rounded border border-line bg-paper p-[18px] lg:p-7"><span>{titulo}</span><strong className="m-0 my-[18px] mb-2 block font-display text-[28px] text-ink lg:text-[38px]">{valor}</strong>{detalhe && <small className="text-muted">{detalhe}</small>}</div>;
}

export default function Perfil() {
  const { corretor, atualizar } = useSessao();
  const [fotoQuebrada, setFotoQuebrada] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');
  const [perfilSalvo, setPerfilSalvo] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [senhaSalva, setSenhaSalva] = useState(false);
  useEffect(() => { setFotoQuebrada(false); }, [corretor?.url_foto]);
  const { dados, carregando, erro, recarregar } = useDadosPainel(useCallback(async () => {
    const [imoveis, disponiveis, reservados, vendidos, alugados, pessoas, pendentes, ultimoMes] = await Promise.all([
      api.listarFichas({ pagina: 1, limite: 1 }), api.listarFichas({ pagina: 1, limite: 1, status: 'DISPONIVEL' }), api.listarFichas({ pagina: 1, limite: 1, status: 'RESERVADO' }),
      api.listarFichas({ pagina: 1, limite: 1, status: 'VENDIDO' }), api.listarFichas({ pagina: 1, limite: 1, status: 'ALUGADO' }),
      api.listarPessoas({ pagina: 1, limite: 1 }), api.listarPessoas({ pagina: 1, limite: 1, status_contato: 'PENDENTE' }),
      api.listarPessoas({ pagina: 1, limite: 1, criado_desde: new Date(Date.now() - 30 * 86400000).toISOString() }),
    ]);
    return { imoveis, disponiveis, reservados, vendidos, alugados, pessoas, pendentes, ultimoMes };
  }, []));
  const formularioPerfil = useForm<ValoresPerfil>({ resolver: zodResolver(esquemaPerfil), defaultValues: { nome: corretor?.nome ?? '', whatsapp: corretor?.whatsapp ?? '', creci: corretor?.creci ?? '', url_foto: corretor?.url_foto ?? '' } });
  useEffect(() => { if (corretor) formularioPerfil.reset({ nome: corretor.nome, whatsapp: corretor.whatsapp, creci: corretor.creci ?? '', url_foto: corretor.url_foto ?? '' }); }, [corretor, formularioPerfil]);
  async function salvarPerfil(valores: ValoresPerfil) {
    setErroPerfil('');
    setPerfilSalvo(false);
    try {
      await api.atualizarPerfil({ nome: valores.nome.trim(), whatsapp: valores.whatsapp, creci: valores.creci.trim() || null, url_foto: valores.url_foto.trim() || null });
      await atualizar();
      recarregar();
      setPerfilSalvo(true);
    } catch (causa) { setErroPerfil(mensagemErro(causa)); }
  }
  const formularioSenha = useForm<ValoresSenha>({ resolver: zodResolver(esquemaSenha), defaultValues: { senha_atual: '', nova_senha: '', confirmacao: '' } });
  async function salvarSenha(valores: ValoresSenha) {
    setErroSenha('');
    setSenhaSalva(false);
    try { await api.alterarSenha({ senha_atual: valores.senha_atual, nova_senha: valores.nova_senha }); formularioSenha.reset(); setSenhaSalva(true); }
    catch (causa) { setErroSenha(mensagemErro(causa)); }
  }
  if (!corretor) return null;
  const mostrarFoto = Boolean(corretor.url_foto) && !fotoQuebrada;
  const errosPerfil = formularioPerfil.formState.errors;
  const errosSenha = formularioSenha.formState.errors;
  return <>
    <header className="mb-8 flex flex-wrap items-center gap-5">
      <span aria-hidden="true" className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-3xl font-semibold text-ink">{mostrarFoto ? <img src={corretor.url_foto ?? ''} alt="" onError={() => setFotoQuebrada(true)} className="h-full w-full object-cover" /> : corretor.nome.charAt(0).toUpperCase()}</span>
      <div><p className="eyebrow">MEU PERFIL</p><h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">{corretor.nome}</h1><p className="muted">{corretor.cargo === 'ADMIN' ? 'Administrador' : 'Corretor'}{corretor.creci ? ` · CRECI ${corretor.creci}` : ''} · na equipe desde {data(corretor.criado_em)}</p></div>
    </header>
    <section className={estilos.painel} aria-label="Dados da conta">
      <h2 className={estilos.tituloPainel}>Dados da conta</h2>
      <dl className="m-0 grid grid-cols-1 gap-3 @min-[38rem]:grid-cols-2">
        <div><dt className="text-[13px] uppercase tracking-[0.08em] text-muted">E-mail</dt><dd className="m-0 mt-1">{corretor.email} <small className="text-muted">(só o admin altera)</small></dd></div>
        <div><dt className="text-[13px] uppercase tracking-[0.08em] text-muted">WhatsApp</dt><dd className="m-0 mt-1">{corretor.whatsapp}</dd></div>
      </dl>
    </section>
    <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && (
      <section className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3 lg:gap-5" aria-label="Métricas">
        {cartao('Imóveis', dados.imoveis.total, `${dados.disponiveis.total} disponíveis · ${dados.reservados.total} reservados · ${dados.vendidos.total} vendidos · ${dados.alugados.total} alugados`)}
        {cartao('Pessoas', dados.pessoas.total, `${dados.ultimoMes.total} nos últimos 30 dias`)}
        <div className="rounded border border-line bg-paper p-[18px] lg:p-7"><span>Contatos pendentes</span><strong className="m-0 my-[18px] mb-2 block font-display text-[28px] text-ink lg:text-[38px]">{dados.pendentes.total}</strong><Link to={rotas.contatos}>Responder →</Link></div>
      </section>
    )}
    <section className={estilos.painel} aria-label="Editar perfil">
      <h2 className={estilos.tituloPainel}>Editar perfil</h2>
      <form className="grid grid-cols-1 gap-[22px] @min-[38rem]:grid-cols-2" onSubmit={formularioPerfil.handleSubmit(salvarPerfil)} noValidate>
        <label className={rotulo}>Nome<input type="text" {...formularioPerfil.register('nome')} aria-invalid={!!errosPerfil.nome} />{errosPerfil.nome && <span className={estilos.erro}>{errosPerfil.nome.message}</span>}</label>
        <label className={rotulo}>WhatsApp com DDI e DDD<input type="tel" {...formularioPerfil.register('whatsapp')} aria-invalid={!!errosPerfil.whatsapp} />{errosPerfil.whatsapp && <span className={estilos.erro}>{errosPerfil.whatsapp.message}</span>}</label>
        <label className={rotulo}>CRECI<input type="text" {...formularioPerfil.register('creci')} />{errosPerfil.creci && <span className={estilos.erro}>{errosPerfil.creci.message}</span>}</label>
        <label className={rotulo}>URL da foto (HTTPS)<input type="url" {...formularioPerfil.register('url_foto')} aria-invalid={!!errosPerfil.url_foto} />{errosPerfil.url_foto && <span className={estilos.erro}>{errosPerfil.url_foto.message}</span>}</label>
        <div className="col-span-full flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full"><button className="button" disabled={formularioPerfil.formState.isSubmitting}>{formularioPerfil.formState.isSubmitting ? 'Salvando…' : 'Salvar perfil'}</button></div>
      </form>
      {erroPerfil && <p className="error" role="alert">{erroPerfil}</p>}
      {perfilSalvo && <p role="status">Perfil atualizado.</p>}
    </section>
    <section className={estilos.painel} aria-label="Trocar senha">
      <h2 className={estilos.tituloPainel}>Trocar senha</h2>
      <form className="grid grid-cols-1 gap-[22px] @min-[38rem]:grid-cols-2" onSubmit={formularioSenha.handleSubmit(salvarSenha)} noValidate>
        <label className={`${rotulo} col-span-full`}>Senha atual<input type="password" autoComplete="current-password" {...formularioSenha.register('senha_atual')} aria-invalid={!!errosSenha.senha_atual} />{errosSenha.senha_atual && <span className={estilos.erro}>{errosSenha.senha_atual.message}</span>}</label>
        <label className={rotulo}>Nova senha<input type="password" autoComplete="new-password" aria-label="Nova senha" {...formularioSenha.register('nova_senha')} aria-invalid={!!errosSenha.nova_senha} /><span className={estilos.dica}>Mínimo de 12 caracteres.</span>{errosSenha.nova_senha && <span className={estilos.erro}>{errosSenha.nova_senha.message}</span>}</label>
        <label className={rotulo}>Confirmar nova senha<input type="password" autoComplete="new-password" aria-label="Confirmar nova senha" {...formularioSenha.register('confirmacao')} aria-invalid={!!errosSenha.confirmacao} />{errosSenha.confirmacao && <span className={estilos.erro}>{errosSenha.confirmacao.message}</span>}</label>
        <div className="col-span-full flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full"><button className="button" disabled={formularioSenha.formState.isSubmitting}>{formularioSenha.formState.isSubmitting ? 'Salvando…' : 'Trocar senha'}</button></div>
      </form>
      {erroSenha && <p className="error" role="alert">{erroSenha}</p>}
      {senhaSalva && <p role="status">Senha atualizada.</p>}
    </section>
  </>;
}
