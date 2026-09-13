import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { date, errorMessage } from '../../services/format';
import { routes } from '../../services/urls';
import AsyncState from '../../components/AsyncState';
import { useAdminData } from './useAdminData';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Use pelo menos 2 caracteres.').max(100),
  whatsappNumber: z.string().regex(/^[1-9]\d{9,14}$/, 'Use DDI e DDD, somente números. Ex.: 5565999999999.'),
  creci: z.string().max(50),
  avatarUrl: z.string().max(2048).refine((v) => !v || (/^https:\/\//.test(v) && URL.canParse(v)), 'Use uma URL HTTPS válida.'),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: z.string().min(12, 'Use entre 12 e 128 caracteres.').max(128).refine((v) => /\S/.test(v), 'Use entre 12 e 128 caracteres.'),
  confirmPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmPassword, { message: 'A confirmação não confere.', path: ['confirmPassword'] });
type PasswordValues = z.infer<typeof passwordSchema>;

const errorText = 'm-0 text-[13px] text-error';
const label = 'grid gap-[7px] font-semibold [&_input]:w-full';

function metricCard(title: string, value: string | number, detail?: string) {
  return (
    <div className="rounded border border-line bg-paper p-[18px] lg:p-7">
      <span>{title}</span>
      <strong className="m-0 my-[18px] mb-2 block font-display text-[28px] text-ink lg:text-[38px]">{value}</strong>
      {detail && <small className="text-muted">{detail}</small>}
    </div>
  );
}

export default function Profile() {
  const { agent, refresh } = useAuth();
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  useEffect(() => { setAvatarBroken(false); }, [agent?.avatarUrl]);

  const { data, loading, error, refresh: refreshMetrics } = useAdminData(
    useCallback(async () => {
      const [properties, disponivel, reservado, concluido, leads, recent, lastMonth] = await Promise.all([
        api.listProperties({ page: 1, limit: 1 }, true),
        api.listProperties({ page: 1, limit: 1, status: 'DISPONIVEL' }, true),
        api.listProperties({ page: 1, limit: 1, status: 'RESERVADO' }, true),
        api.listProperties({ page: 1, limit: 1, status: 'CONCLUIDO' }, true),
        api.listLeads({ page: 1, limit: 1 }),
        api.listLeads({ page: 1, limit: 5 }),
        api.listLeads({ page: 1, limit: 1, createdFrom: new Date(Date.now() - 30 * 86400000).toISOString() }),
      ]);
      return { properties, disponivel, reservado, concluido, leads, recent, lastMonth };
    }, []),
  );

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: agent?.name ?? '', whatsappNumber: agent?.whatsappNumber ?? '', creci: agent?.creci ?? '', avatarUrl: agent?.avatarUrl ?? '' },
  });
  useEffect(() => {
    if (agent) profileForm.reset({ name: agent.name, whatsappNumber: agent.whatsappNumber, creci: agent.creci ?? '', avatarUrl: agent.avatarUrl ?? '' });
  }, [agent, profileForm]);
  async function saveProfile(values: ProfileValues) {
    setProfileError('');
    setProfileSaved(false);
    try {
      await api.updateProfile({ name: values.name.trim(), whatsappNumber: values.whatsappNumber, creci: values.creci.trim() || null, avatarUrl: values.avatarUrl.trim() || null });
      await refresh();
      refreshMetrics();
      setProfileSaved(true);
    } catch (e) {
      setProfileError(errorMessage(e));
    }
  }

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  async function savePassword(values: PasswordValues) {
    setPasswordError('');
    setPasswordSaved(false);
    try {
      await api.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      passwordForm.reset();
      setPasswordSaved(true);
    } catch (e) {
      setPasswordError(errorMessage(e));
    }
  }

  if (!agent) return null;
  const showAvatar = Boolean(agent.avatarUrl) && !avatarBroken;
  const initial = agent.name.charAt(0).toUpperCase();
  const roleLabel = agent.role === 'ADMIN' ? 'Administrador' : 'Corretor';
  return (
    <>
      <header className="mb-8 flex flex-wrap items-center gap-5">
        <span aria-hidden="true" className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-3xl font-semibold text-ink">
          {showAvatar ? (
            <img src={agent.avatarUrl ?? ''} alt="" onError={() => setAvatarBroken(true)} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <div>
          <p className="eyebrow">MEU PERFIL</p>
          <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">{agent.name}</h1>
          <p className="muted">{roleLabel}{agent.creci ? ` · CRECI ${agent.creci}` : ''} · na equipe desde {date(agent.createdAt)}</p>
        </div>
      </header>

      <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7" aria-label="Dados da conta">
        <h2 className="mb-6 mt-0 text-[22px] text-ink">Dados da conta</h2>
        <dl className="m-0 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div><dt className="text-[13px] uppercase tracking-[0.08em] text-muted">E-mail</dt><dd className="m-0 mt-1">{agent.email} <small className="text-muted">(só o admin altera)</small></dd></div>
          <div><dt className="text-[13px] uppercase tracking-[0.08em] text-muted">WhatsApp</dt><dd className="m-0 mt-1">{agent.whatsappNumber}</dd></div>
        </dl>
      </section>

      <AsyncState loading={loading} error={error} retry={refreshMetrics} />
      {data && !error && (
        <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5" aria-label="Métricas">
          {metricCard('Meus imóveis', data.properties.total, `${data.disponivel.total} disponíveis · ${data.reservado.total} reservados · ${data.concluido.total} concluídos`)}
          {metricCard('Meus contatos', data.leads.total, `${data.lastMonth.total} nos últimos 30 dias`)}
          <div className="rounded border border-line bg-paper p-[18px] lg:p-7">
            <span>Contatos recentes</span>
            <strong className="m-0 my-[18px] mb-2 block font-display text-[28px] text-ink lg:text-[38px]">{data.recent.items.length}</strong>
            <Link to={routes.contacts}>Ver oportunidades →</Link>
          </div>
        </section>
      )}

      <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7" aria-label="Editar perfil">
        <h2 className="mb-6 mt-0 text-[22px] text-ink">Editar perfil</h2>
        <form className="grid grid-cols-1 gap-[22px] md:grid-cols-2" onSubmit={profileForm.handleSubmit(saveProfile)} noValidate>
          <label className={label}>Nome<input type="text" {...profileForm.register('name')} aria-invalid={!!profileForm.formState.errors.name} />{profileForm.formState.errors.name && <span className={errorText}>{profileForm.formState.errors.name.message}</span>}</label>
          <label className={label}>WhatsApp com DDI e DDD<input type="tel" {...profileForm.register('whatsappNumber')} aria-invalid={!!profileForm.formState.errors.whatsappNumber} />{profileForm.formState.errors.whatsappNumber && <span className={errorText}>{profileForm.formState.errors.whatsappNumber.message}</span>}</label>
          <label className={label}>CRECI<input type="text" {...profileForm.register('creci')} />{profileForm.formState.errors.creci && <span className={errorText}>{profileForm.formState.errors.creci.message}</span>}</label>
          <label className={label}>URL da foto (HTTPS)<input type="url" {...profileForm.register('avatarUrl')} aria-invalid={!!profileForm.formState.errors.avatarUrl} />{profileForm.formState.errors.avatarUrl && <span className={errorText}>{profileForm.formState.errors.avatarUrl.message}</span>}</label>
          <div className="flex flex-wrap items-center gap-3.5 md:col-span-2 max-[560px]:[&_.button]:w-full">
            <button className="button" disabled={profileForm.formState.isSubmitting}>{profileForm.formState.isSubmitting ? 'Salvando…' : 'Salvar perfil'}</button>
          </div>
        </form>
        {profileError && <p className="error" role="alert">{profileError}</p>}
        {profileSaved && <p role="status">Perfil atualizado.</p>}
      </section>

      <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7" aria-label="Trocar senha">
        <h2 className="mb-6 mt-0 text-[22px] text-ink">Trocar senha</h2>
        <form className="grid grid-cols-1 gap-[22px] md:grid-cols-2" onSubmit={passwordForm.handleSubmit(savePassword)} noValidate>
          <label className={label}>Senha atual<input type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} aria-invalid={!!passwordForm.formState.errors.currentPassword} />{passwordForm.formState.errors.currentPassword && <span className={errorText}>{passwordForm.formState.errors.currentPassword.message}</span>}</label>
          <label className={label}>Nova senha<input type="password" autoComplete="new-password" aria-label="Nova senha" {...passwordForm.register('newPassword')} aria-invalid={!!passwordForm.formState.errors.newPassword} /><span className="text-[13px] font-normal text-muted">Mínimo de 12 caracteres.</span>{passwordForm.formState.errors.newPassword && <span className={errorText}>{passwordForm.formState.errors.newPassword.message}</span>}</label>
          <label className={label}>Confirmar nova senha<input type="password" autoComplete="new-password" aria-label="Confirmar nova senha" {...passwordForm.register('confirmPassword')} aria-invalid={!!passwordForm.formState.errors.confirmPassword} />{passwordForm.formState.errors.confirmPassword && <span className={errorText}>{passwordForm.formState.errors.confirmPassword.message}</span>}</label>
          <div className="flex flex-wrap items-center gap-3.5 md:col-span-2 max-[560px]:[&_.button]:w-full">
            <button className="button" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting ? 'Salvando…' : 'Trocar senha'}</button>
          </div>
        </form>
        {passwordError && <p className="error" role="alert">{passwordError}</p>}
        {passwordSaved && <p role="status">Senha atualizada.</p>}
      </section>
    </>
  );
}
