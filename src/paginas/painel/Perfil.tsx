import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { urlFotoCorretor } from '../../servicos/fotos';
import { prepararEnvio, validarSelecaoMidia } from '../../componentes/prepararMidia';
import CabecalhoPagina from '../../componentes/CabecalhoPagina';
import { IconeSalvar } from '../../componentes/Icones';
import { GuardaFormulario, useGuardaFormulario } from '../../hooks/useGuardaFormulario';
import { useAcoesPainel } from '../../hooks/useComandosPainel';
import { api } from '../../servicos/api';
import { useSessao } from '../../hooks/useSessao';
import { useDadosPainel } from '../../hooks/useDadosPainel';
import { data, mensagemErro } from '../../servicos/formato';
import { rotas } from '../../servicos/urls';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Campo from '../../componentes/Campo';
import Aviso from '../../componentes/Aviso';

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

export default function Perfil() {
  const { corretor, atualizar } = useSessao();
  const [fotoQuebrada, setFotoQuebrada] = useState(false);
  const [fotoPendente, setFotoPendente] = useState<File | null>(null);
  const [previaArquivo, setPreviaArquivo] = useState('');
  const [modoFoto, setModoFoto] = useState<'ARQUIVO' | 'URL'>('ARQUIVO');
  const [erroFoto, setErroFoto] = useState('');
  useEffect(() => {
    if (!fotoPendente) { setPreviaArquivo(''); return; }
    const previa = URL.createObjectURL(fotoPendente); setPreviaArquivo(previa);
    return () => URL.revokeObjectURL(previa);
  }, [fotoPendente]);
  useEffect(() => { setFotoPendente(null); setErroFoto(''); }, [corretor?.id]);
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
  const perfilInicializado = useRef(corretor?.id);
  useEffect(() => { if (corretor && (perfilInicializado.current !== corretor.id || !formularioPerfil.formState.isDirty)) { formularioPerfil.reset({ nome: corretor.nome, whatsapp: corretor.whatsapp, creci: corretor.creci ?? '', url_foto: corretor.url_foto ?? '' }); perfilInicializado.current = corretor.id; } }, [corretor, formularioPerfil]);
  async function salvarPerfil(valores: ValoresPerfil) {
    setErroPerfil('');
    setPerfilSalvo(false);
    try {
      const foto = fotoPendente ? (await prepararEnvio([fotoPendente])).prontos[0] : undefined;
      const salvo = await api.atualizarPerfil({ nome: valores.nome.trim(), whatsapp: valores.whatsapp, creci: valores.creci.trim() || null, ...(formularioPerfil.formState.dirtyFields.url_foto ? { url_foto: valores.url_foto.trim() || null } : {}) }, foto);
      setFotoPendente(null); setErroFoto('');
      formularioPerfil.reset({ nome: salvo.nome, whatsapp: salvo.whatsapp, creci: salvo.creci ?? '', url_foto: salvo.url_foto ?? '' });
      setPerfilSalvo(true);
      try { await atualizar(); } catch (causa) { setErroPerfil(`O perfil foi salvo, mas não foi possível atualizar a sessão. ${mensagemErro(causa)}`); }
      recarregar();
    } catch (causa) { setErroPerfil(mensagemErro(causa)); }
  }
  const formularioSenha = useForm<ValoresSenha>({ resolver: zodResolver(esquemaSenha), defaultValues: { senha_atual: '', nova_senha: '', confirmacao: '' } });
  async function salvarSenha(valores: ValoresSenha) {
    setErroSenha('');
    setSenhaSalva(false);
    try { await api.alterarSenha({ senha_atual: valores.senha_atual, nova_senha: valores.nova_senha }); formularioSenha.reset(); setSenhaSalva(true); }
    catch (causa) { setErroSenha(mensagemErro(causa)); }
  }
  const alterado = formularioPerfil.formState.isDirty || formularioSenha.formState.isDirty || Boolean(fotoPendente);
  const liberado = useGuardaFormulario(alterado);
  const ocupado = formularioPerfil.formState.isSubmitting || formularioSenha.formState.isSubmitting;
  useAcoesPainel(useMemo(() => [{ id: 'editar-perfil', rotulo: 'Editar meu perfil', executar: () => document.querySelector<HTMLInputElement>('[data-editar-perfil]')?.focus() }], []));
  const valorFoto = formularioPerfil.watch('url_foto');
  const previaFoto = previaArquivo || (corretor && valorFoto === corretor.url_foto ? urlFotoCorretor(corretor) : /^https:\/\//.test(valorFoto) ? valorFoto : '');
  useEffect(() => { setFotoQuebrada(false); }, [previaFoto]);
  if (!corretor) return null;
  const mostrarFoto = Boolean(previaFoto) && !fotoQuebrada;
  function escolherFoto(arquivo?: File) {
    if (!arquivo || ocupado) return;
    const problema = !arquivo.type.startsWith('image/') ? 'Use uma foto JPG, PNG ou WebP.' : validarSelecaoMidia([arquivo]);
    setErroFoto(problema ?? '');
    if (!problema) {
      formularioPerfil.setValue('url_foto', corretor?.url_foto ?? '', { shouldDirty: true, shouldValidate: true });
      setFotoPendente(arquivo);
    }
  }
  const errosPerfil = formularioPerfil.formState.errors;
  const errosSenha = formularioSenha.formState.errors;
  return <>
    <GuardaFormulario alterado={alterado} liberado={liberado} descricao="Há alterações não salvas no perfil ou na senha. Sair descarta somente estas edições." />
    <CabecalhoPagina titulo="Meu perfil" descricao={corretor.nome} />
    <div className="grid items-start gap-4 @min-[58rem]/principal:grid-cols-2">
    <section className="@container rounded-xl border border-line bg-paper p-5" aria-label="Dados e foto">
      <h2 className="mb-4 text-[22px]">Dados e foto</h2>
      <form className="grid grid-cols-1 items-start gap-4 @min-[28rem]:grid-cols-2" onSubmit={formularioPerfil.handleSubmit(salvarPerfil)} noValidate data-atalho-salvar>
        <fieldset disabled={ocupado} className="contents">
        <div className="col-span-full flex flex-wrap items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-[28px] font-semibold text-ink">{mostrarFoto ? <img src={previaFoto} alt="Prévia da foto do perfil" onError={() => setFotoQuebrada(true)} className="h-full w-full object-cover" /> : corretor.nome.charAt(0).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="mb-1 text-base text-muted">{corretor.cargo === 'ADMIN' ? 'Administrador' : 'Corretor'} · Desde {data(corretor.criado_em)}</p><p className="m-0 break-all text-base">{corretor.email}</p><small className="text-[14px] text-muted">O administrador altera seu e-mail.</small></div>
        </div>
        <div className="col-span-full">
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Origem da foto">
            <button type="button" className={`buttonGhost !min-h-11 !px-3 !py-2 !text-base ${modoFoto === 'ARQUIVO' ? 'bg-soft' : ''}`} aria-pressed={modoFoto === 'ARQUIVO'} onClick={() => setModoFoto('ARQUIVO')}>Enviar foto</button>
            <button type="button" className={`buttonGhost !min-h-11 !px-3 !py-2 !text-base ${modoFoto === 'URL' ? 'bg-soft' : ''}`} aria-pressed={modoFoto === 'URL'} onClick={() => { setModoFoto('URL'); setFotoPendente(null); setErroFoto(''); }}>Usar URL</button>
            {(fotoPendente || valorFoto) && <button type="button" className="buttonGhost !min-h-11 !px-3 !py-2 !text-base" onClick={() => { setFotoPendente(null); setErroFoto(''); formularioPerfil.setValue('url_foto', '', { shouldDirty: true, shouldValidate: true }); }}>Remover foto</button>}
          </div>
          {modoFoto === 'ARQUIVO' ? <Campo rotulo="Foto do perfil" erro={erroFoto || undefined} dica={fotoPendente ? `${fotoPendente.name} · Será enviada ao salvar.` : 'JPG, PNG ou WebP, até 30 MB. A foto será otimizada antes do envio.'}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(evento) => { escolherFoto(evento.target.files?.[0]); evento.target.value = ''; }} /></Campo> : <Campo rotulo="URL da foto (HTTPS)" erro={errosPerfil.url_foto?.message}><input type="url" {...formularioPerfil.register('url_foto')} /></Campo>}
        </div>
        <Campo rotulo="Nome" erro={errosPerfil.nome?.message}><input data-editar-perfil type="text" autoComplete="name" {...formularioPerfil.register('nome')} /></Campo>
        <Campo rotulo="WhatsApp com DDI e DDD" erro={errosPerfil.whatsapp?.message} dica="Somente números. Ex.: 5565999999999."><input type="tel" autoComplete="tel" {...formularioPerfil.register('whatsapp')} /></Campo>
        <Campo rotulo="CRECI" erro={errosPerfil.creci?.message}><input type="text" {...formularioPerfil.register('creci')} /></Campo>
        <div className="col-span-full flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full"><button className="button" disabled={ocupado}><IconeSalvar size={20} aria-hidden="true" />{formularioPerfil.formState.isSubmitting ? 'Preparando e salvando…' : 'Salvar perfil'}</button></div>
        </fieldset>
      </form>
      {erroPerfil && <Aviso tom="erro" classe="mt-4">{erroPerfil}</Aviso>}
      {perfilSalvo && <Aviso tom="sucesso" classe="mt-4">Perfil atualizado.</Aviso>}
    </section>
    <section className="@container rounded-xl border border-line bg-paper p-5" aria-label="Segurança">
      <h2 className="mb-4 text-[22px]">Segurança</h2>
      <form className="grid grid-cols-1 items-start gap-4 @min-[28rem]:grid-cols-2" onSubmit={formularioSenha.handleSubmit(salvarSenha)} noValidate data-atalho-salvar>
        <fieldset disabled={ocupado} className="contents"><Campo classe="col-span-full" rotulo="Senha atual" erro={errosSenha.senha_atual?.message}><input type="password" autoComplete="current-password" {...formularioSenha.register('senha_atual')} /></Campo>
        <Campo rotulo="Nova senha" erro={errosSenha.nova_senha?.message} dica="Use entre 12 e 128 caracteres."><input type="password" autoComplete="new-password" {...formularioSenha.register('nova_senha')} /></Campo>
        <Campo rotulo="Confirmar nova senha" erro={errosSenha.confirmacao?.message}><input type="password" autoComplete="new-password" {...formularioSenha.register('confirmacao')} /></Campo>
        <div className="col-span-full flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full"><button className="button" disabled={ocupado}><IconeSalvar size={20} aria-hidden="true" />{formularioSenha.formState.isSubmitting ? 'Salvando…' : 'Trocar senha'}</button></div>
        </fieldset>
      </form>
      {erroSenha && <Aviso tom="erro" classe="mt-4">{erroSenha}</Aviso>}
      {senhaSalva && <Aviso tom="sucesso" classe="mt-4">Senha atualizada.</Aviso>}
    </section>
    </div>
    <EstadoCarregamento compacto carregando={carregando} erro={erro} tentarNovamente={recarregar} />
    {dados && !erro && <section className="mt-4 grid gap-3 @min-[38rem]/principal:grid-cols-3" aria-label="Métricas">
      <div className="rounded-xl border border-line bg-paper p-4"><strong className="mr-2 text-[22px]">{dados.imoveis.total}</strong>Imóveis<p className="mb-0 mt-1 text-base text-muted">{dados.disponiveis.total} disponíveis · {dados.reservados.total} reservados · {dados.vendidos.total} vendidos · {dados.alugados.total} alugados</p></div>
      <div className="rounded-xl border border-line bg-paper p-4"><strong className="mr-2 text-[22px]">{dados.pessoas.total}</strong>Pessoas<p className="mb-0 mt-1 text-base text-muted">{dados.ultimoMes.total} nos últimos 30 dias</p></div>
      <div className="rounded-xl border border-line bg-paper p-4"><strong className="mr-2 text-[22px]">{dados.pendentes.total}</strong>Contatos pendentes<p className="mb-0 mt-1 text-base"><Link to={rotas.contatos} className="link-texto">Responder contatos</Link></p></div>
    </section>}
  </>;
}
