import { useState } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { rotas } from '../../servicos/urls';
import { useSessao } from '../../hooks/useSessao';
import { brand } from '../../config/brand';
import { mensagemErro } from '../../servicos/formato';

const esquema = z.object({ email: z.email('Informe um e-mail válido.'), senha: z.string().min(1, 'Informe sua senha.') });

export default function Entrar() {
  const { corretor, entrar, carregando } = useSessao();
  const navigate = useNavigate();
  const location = useLocation();
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof esquema>>({ resolver: zodResolver(esquema) });
  async function acessar(email: string, senha: string) {
    setErro('');
    try {
      await entrar(email, senha);
      const de = (location.state as { de?: unknown } | null)?.de;
      navigate(typeof de === 'string' && de.startsWith('/admin') && de !== rotas.entrar ? de : rotas.painel, { replace: true });
    } catch (falha) {
      setErro(mensagemErro(falha));
    }
  }
  if (corretor) return <Navigate to={rotas.painel} replace />;
  return (
    <div className="grid min-h-screen grid-cols-1 bg-soft lg:grid-cols-2">
      <section className="relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-navy p-7 text-white lg:p-[70px]">
        <img className="absolute inset-0 z-0 h-full w-full object-cover" src="/assets/commercial-space-source.jpg" srcSet="/assets/commercial-space-640.webp 640w, /assets/commercial-space-960.webp 960w, /assets/commercial-space-1400.webp 1400w" sizes="(max-width: 700px) 100vw, 50vw" width="1400" height="1050" alt="" {...{ fetchpriority: 'high' }} />
        <div aria-hidden className="absolute inset-0 z-[1] bg-gradient-to-br from-navy via-navy/80 to-navy/50" />
        <Link to={rotas.inicio} className="relative z-[2] font-display text-[21px] leading-[1.5] text-inherit no-underline">{brand.name}</Link>
        <div className="relative z-[2]"><p className="eyebrow text-white">SEU PRÓXIMO CAPÍTULO</p><h1 className="mb-0 max-w-[500px] font-display text-[30px] leading-[1.3] lg:text-[clamp(34px,4vw,58px)]">Boas conexões começam aqui.</h1><p>Seu portfólio, seus contatos e novas oportunidades.</p></div>
      </section>
      <main className="flex items-center justify-center px-6 py-9 lg:p-12">
        <div className="w-full max-w-[400px]">
          <p className="eyebrow">ÁREA DO CORRETOR</p>
          <h1 className="text-[32px] text-ink">Bem-vindo de volta.</h1>
          <p className="muted">Entre para cuidar dos seus negócios.</p>
          <form onSubmit={handleSubmit((valores) => acessar(valores.email, valores.senha))} noValidate className="grid gap-[22px] [&_input]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold">
            <label>E-mail<input type="email" autoComplete="username" {...register('email')} />{errors.email && <span className="m-0 text-[13px] text-error">{errors.email.message}</span>}</label>
            <label>Senha<input type="password" autoComplete="current-password" {...register('senha')} />{errors.senha && <span className="m-0 text-[13px] text-error">{errors.senha.message}</span>}</label>
            {erro && <p className="error" role="alert">{erro}</p>}
            <button className="button" disabled={isSubmitting || carregando}>{isSubmitting ? 'Entrando…' : 'Entrar na conta →'}</button>
          </form>
          <p><Link to={rotas.inicio} className="inline-flex min-h-11 items-center">← Voltar ao site</Link></p>
        </div>
      </main>
    </div>
  );
}
