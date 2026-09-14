import { routes } from '../../services/urls';
import { useState } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { brand } from '../../config/brand';
import { errorMessage } from '../../services/format';

const schema = z.object({ email: z.email('Informe um e-mail válido.'), password: z.string().min(1, 'Informe sua senha.') });

export default function Login() {
  const { agent, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  async function enter(email: string, password: string) {
    setError('');
    try {
      await login(email, password);
      const from = location.state?.from;
      navigate(typeof from === 'string' && from.startsWith('/admin') && from !== routes.login ? from : '/admin', { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  if (agent) return <Navigate to={routes.admin} replace />;
  return (
    <div className="grid min-h-screen grid-cols-1 bg-soft lg:grid-cols-2">
      <section className="relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-navy p-7 text-white lg:p-[70px]">
        <img
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="/assets/commercial-space-source.jpg"
          srcSet="/assets/commercial-space-640.webp 640w, /assets/commercial-space-960.webp 960w, /assets/commercial-space-1400.webp 1400w"
          sizes="(max-width: 700px) 100vw, 50vw"
          width="1400"
          height="1050"
          alt=""
          {...{ fetchpriority: 'high' }}
        />
        <div aria-hidden className="absolute inset-0 z-[1] bg-gradient-to-br from-navy via-navy/80 to-navy/50" />
        <Link to={routes.home} className="relative z-[2] font-display text-[21px] leading-[1.5] text-inherit no-underline">{brand.name}</Link>
        <div className="relative z-[2]">
          <p className="eyebrow text-white">SEU PRÓXIMO CAPÍTULO</p>
          <h1 className="mb-0 max-w-[500px] font-display text-[30px] leading-[1.3] lg:text-[clamp(34px,4vw,58px)]">Boas conexões começam aqui.</h1>
          <p>Seu portfólio, seus contatos e novas oportunidades.</p>
        </div>
      </section>
      <main className="flex items-center justify-center px-6 py-9 lg:p-12">
        <div className="w-full max-w-[400px]">
          <p className="eyebrow">ÁREA DO CORRETOR</p>
          <h1 className="text-[32px] text-ink">Bem-vindo de volta.</h1>
          <p className="muted">Entre para cuidar dos seus negócios.</p>
          <form
            onSubmit={handleSubmit((v) => enter(v.email, v.password))}
            noValidate
            className="grid gap-[22px] [&_input]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_select]:w-full [&_textarea]:min-h-[130px] [&_textarea]:w-full"
          >
            <label>E-mail<input type="email" autoComplete="username" {...register('email')} />{errors.email && <span className="m-0 text-[13px] text-error">{errors.email.message}</span>}</label>
            <label>Senha<input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <span className="m-0 text-[13px] text-error">{errors.password.message}</span>}</label>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="button" disabled={isSubmitting || loading}>{isSubmitting ? 'Entrando…' : 'Entrar na conta →'}</button>
          </form>
          <p><Link to={routes.home} className="inline-flex min-h-11 items-center">← Voltar ao site</Link></p>
        </div>
      </main>
    </div>
  );
}
