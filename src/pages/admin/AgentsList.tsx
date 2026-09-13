import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Agent } from '../../types';
import { errorMessage } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import Dialog from '../../components/Dialog';
import { useAdminData } from './useAdminData';

export const agentSchema = z.object({
  name: z.string().trim().min(2, 'Use pelo menos 2 caracteres.').max(100),
  email: z.email('Informe um e-mail válido.').max(254),
  whatsappNumber: z.string().regex(/^[1-9]\d{9,14}$/, 'Use DDI e DDD, somente números. Ex.: 5565999999999.'),
  creci: z.string().max(50),
  role: z.enum(['ADMIN', 'AGENT']),
  avatarUrl: z.string().max(2048).refine((v) => !v || (/^https:\/\//.test(v) && URL.canParse(v)), 'Use uma URL HTTPS válida.'),
  password: z.string().refine((v) => v === '' || (v.length >= 12 && v.length <= 128 && /\S/.test(v)), 'Use entre 12 e 128 caracteres.'),
});
type Values = z.infer<typeof agentSchema>;

const errorText = 'm-0 text-[13px] text-error';
const hint = 'text-[13px] font-normal text-muted';

function AgentEditor({ agent, onClose, onSaved }: { agent: Agent | null; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState('');
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(agentSchema),
    defaultValues: { name: agent?.name ?? '', email: agent?.email ?? '', whatsappNumber: agent?.whatsappNumber ?? '', creci: agent?.creci ?? '', role: agent?.role ?? 'AGENT', avatarUrl: agent?.avatarUrl ?? '', password: '' },
  });
  async function save(v: Values) {
    if (!agent && !v.password) {
      setFieldError('password', { message: 'Defina uma senha de pelo menos 12 caracteres.' });
      return;
    }
    setError('');
    try {
      await api.saveAgent({ ...v, creci: v.creci || null, avatarUrl: v.avatarUrl || null, ...(v.password ? { password: v.password } : { password: undefined }) }, agent?.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <Dialog title={agent ? 'Editar corretor' : 'Novo corretor'} onClose={() => { if (!isSubmitting) onClose(); }}>
      <form className="[&_input]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_select]:w-full [&_textarea]:min-h-[130px] [&_textarea]:w-full" onSubmit={handleSubmit(save)} noValidate>
        <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
          {([['name', 'Nome', 'text'], ['email', 'E-mail', 'email'], ['whatsappNumber', 'WhatsApp com DDI e DDD', 'tel'], ['creci', 'CRECI', 'text'], ['avatarUrl', 'URL da foto (HTTPS)', 'url']] as const).map(([name, label, type]) => (
            <label key={name}>{label}<input type={type} {...register(name)} aria-invalid={!!errors[name]} />{errors[name] && <span className={errorText}>{errors[name]?.message}</span>}</label>
          ))}
          <label>Permissão<select {...register('role')}><option value="AGENT">Corretor</option><option value="ADMIN">Administrador</option></select></label>
          <label className="col-span-full">{agent ? 'Nova senha (opcional)' : 'Senha *'}<input type="password" autoComplete="new-password" {...register('password')} /><span className={hint}>{agent ? 'Deixe em branco para manter a senha atual. ' : ''}Mínimo de 12 caracteres.</span>{errors.password && <span className={errorText}>{errors.password.message}</span>}</label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="my-7 flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full">
          <button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar corretor'}</button>
          <button className="buttonGhost" type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
        </div>
      </form>
    </Dialog>
  );
}

const resetSchema = z.object({
  newPassword: z.string().min(12, 'Use entre 12 e 128 caracteres.').max(128).refine((v) => /\S/.test(v), 'Use entre 12 e 128 caracteres.'),
  confirmPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmPassword, { message: 'A confirmação não confere.', path: ['confirmPassword'] });
type ResetValues = z.infer<typeof resetSchema>;

function PasswordResetDialog({ agent, onClose, onSaved }: { agent: Agent; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  async function reset(v: ResetValues) {
    setError('');
    try {
      await api.saveAgent({ name: agent.name, email: agent.email, whatsappNumber: agent.whatsappNumber, role: agent.role, creci: agent.creci, avatarUrl: agent.avatarUrl, password: v.newPassword }, agent.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <Dialog title={`Redefinir senha de ${agent.name}`} onClose={() => { if (!isSubmitting) onClose(); }}>
      <p className="muted">Escolha a nova senha na hora e avise a pessoa: o acesso atual dela continua valendo até sair ou o token expirar.</p>
      <form className="grid grid-cols-1 gap-[22px]" onSubmit={handleSubmit(reset)} noValidate>
        <label className="grid gap-[7px] font-semibold">Nova senha<input type="password" autoComplete="new-password" aria-label="Nova senha" {...register('newPassword')} aria-invalid={!!errors.newPassword} /><span className={hint}>Mínimo de 12 caracteres.</span>{errors.newPassword && <span className={errorText}>{errors.newPassword.message}</span>}</label>
        <label className="grid gap-[7px] font-semibold">Confirmar nova senha<input type="password" autoComplete="new-password" aria-label="Confirmar nova senha" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />{errors.confirmPassword && <span className={errorText}>{errors.confirmPassword.message}</span>}</label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="my-7 flex flex-wrap items-center gap-3.5 max-[560px]:[&_.button]:w-full">
          <button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Definir nova senha'}</button>
          <button className="buttonGhost" type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
        </div>
      </form>
    </Dialog>
  );
}

export default function AgentsList() {
  const { agent } = useAuth();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Agent | null | undefined>(undefined);
  const [resetting, setResetting] = useState<Agent | undefined>(undefined);
  const [mutationError, setMutationError] = useState('');
  const [busy, setBusy] = useState('');
  const { data, loading, error, refresh } = useAdminData(
    useCallback(() => agent?.role === 'ADMIN' ? api.listAgents(page, 15) : Promise.resolve({ items: [], total: 0, page: 1, limit: 15, totalPages: 0 }), [page, agent?.role]),
  );
  if (agent?.role !== 'ADMIN') return <Navigate to="/admin" replace />;
  async function toggle(a: Agent) {
    if (!confirm(`${a.active ? 'Desativar' : 'Reativar'} a conta de ${a.name}?${a.active ? ' Os vínculos com imóveis e contatos serão preservados.' : ''}`)) return;
    setBusy(a.id);
    setMutationError('');
    try {
      await api.saveAgent({ name: a.name, email: a.email, whatsappNumber: a.whatsappNumber, role: a.role, creci: a.creci, avatarUrl: a.avatarUrl, active: !a.active }, a.id);
      refresh();
    } catch (e) {
      setMutationError(errorMessage(e));
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-5 max-[560px]:flex-col max-[560px]:items-stretch max-[560px]:[&_.button]:w-full">
        <div>
          <p className="eyebrow">NOSSA EQUIPE</p>
          <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">Corretores</h1>
          <p className="muted">Pessoas que conectam espaços e negócios.</p>
        </div>
        <button className="button" onClick={() => setEditing(null)}>+ Novo corretor</button>
      </header>
      {mutationError && <p className="error" role="alert">{mutationError}</p>}
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
            <div className="overflow-x-auto overscroll-contain">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Corretor</th>
                  <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Permissão</th>
                  <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Situação</th>
                  <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((a) => (
                  <tr key={a.id}>
                    <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                      <strong>{a.name}</strong>
                      <small className="mt-1 block text-muted">{a.email}</small>
                      <small className="mt-1 block text-muted">{a.creci ? `CRECI ${a.creci}` : a.whatsappNumber}</small>
                    </td>
                    <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">{a.role === 'ADMIN' ? 'Administrador' : 'Corretor'}</td>
                    <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                      <span className="inline-block rounded bg-[#eaf0e8] px-2.5 py-1 text-[13px] text-[#174d3b] dark:bg-white/10 dark:text-white">{a.active ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                      <div className="flex flex-wrap items-center gap-2.5 max-lg:justify-end [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap">
                        <button className="buttonGhost" onClick={() => setEditing(a)}>Editar</button>
                        <button className="buttonGhost" onClick={() => setResetting(a)}>Redefinir senha</button>
                        <button className="buttonGhost" disabled={!!busy} onClick={() => void toggle(a)}>{busy === a.id ? 'Atualizando…' : a.active ? 'Desativar' : 'Reativar'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length && <p className="px-5 py-10 text-center text-muted">Nenhum corretor cadastrado.</p>}
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </section>
      )}
      {editing !== undefined && <AgentEditor agent={editing} onClose={() => setEditing(undefined)} onSaved={refresh} />}
      {resetting && <PasswordResetDialog agent={resetting} onClose={() => setResetting(undefined)} onSaved={refresh} />}
    </>
  );
}
