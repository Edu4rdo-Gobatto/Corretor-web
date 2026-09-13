import { useCallback, useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { errorMessage } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import Dialog from '../../components/Dialog';
import Pagination from '../../components/Pagination';
import { useAdminData } from './useAdminData';
import { partySchema, leaseSchema, type RentalPartyInput, type RentalParty, type LeaseInput, type Lease, type RentalDocument, type AcquisitionCommission } from './rentalSchema';

type Kind = 'OWNER' | 'TENANT';
const pathFor = (kind: Kind) => `/admin/${kind === 'OWNER' ? 'proprietarios' : 'inquilinos'}`;
const statusNames = { DRAFT: 'Rascunho', ACTIVE: 'Ativo', ENDED: 'Encerrado' };

const heading = 'mb-8 flex items-center justify-between gap-5 max-lg:items-start';
const headingTitle = 'my-2 text-[clamp(26px,3vw,38px)] text-ink';
const panel = 'mb-6 rounded border border-line bg-paper p-5 lg:p-7';
const panelTitle = 'mb-6 mt-0 text-[22px] text-ink';
const tableWrap = 'overflow-x-auto';
const table = 'w-full min-w-[640px] border-collapse text-left';
const th = 'border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3';
const td = 'border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3';
const cellSmall = 'mt-1 block text-muted';
const actions = 'flex flex-wrap items-center gap-2.5 max-lg:justify-end [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap';
const grid2 = 'grid grid-cols-1 gap-[22px] md:grid-cols-2';
const toolbar = 'mb-6 flex flex-wrap items-end gap-3 [&_label]:grid [&_label]:gap-1.5';
const formField = '[&_input]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_select]:w-full [&_textarea]:min-h-[130px] [&_textarea]:w-full';
const errorText = 'm-0 text-[13px] text-error';
const hint = 'text-[13px] font-normal text-muted';
const formFooter = 'my-7 flex items-center gap-3.5';
const empty = 'px-5 py-10 text-center text-muted';

export function RentalGuard({ children }: { children: ReactNode }) {
  const { agent } = useAuth();
  return agent?.role === 'ADMIN' ? children : <Navigate to="/admin" replace />;
}

function Search({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <label>Buscar<input type="search" value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function PartyEditor({ party, kind, onClose, onSaved }: { party?: RentalParty; kind: Kind; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RentalPartyInput>({
    resolver: zodResolver(partySchema),
    defaultValues: { kind, personType: 'PF', name: '', taxId: '', email: '', phone: '', address: '', birthDate: '', notes: '', bankName: '', bankAgency: '', bankAccount: '', pixKey: '', active: true, ...party },
  });
  async function save(v: RentalPartyInput) {
    setError('');
    try {
      await api.saveRentalParty(v, party?.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  const fields = [['name', 'Nome / razão social', 'text'], ['taxId', 'CPF / CNPJ (somente números)', 'text'], ['email', 'E-mail', 'email'], ['phone', 'Telefone', 'tel'], ['address', 'Endereço completo', 'text'], ['birthDate', 'Data de nascimento / constituição', 'date']] as const;
  const bankFields = [['bankName', 'Banco'], ['bankAgency', 'Agência'], ['bankAccount', 'Conta'], ['pixKey', 'Chave Pix']] as const;
  return (
    <Dialog title={party ? 'Editar cadastro' : 'Novo cadastro'} onClose={() => { if (!isSubmitting) onClose(); }}>
      <form className={formField} onSubmit={handleSubmit(save)} noValidate>
        <fieldset disabled={isSubmitting}>
          <div className={grid2}>
            <label>Tipo de pessoa<select {...register('personType')}><option value="PF">Pessoa física</option><option value="PJ">Pessoa jurídica</option></select></label>
            {fields.map(([name, label, type]) => (
              <label key={name}>{label}<input type={type} {...register(name)} aria-invalid={!!errors[name]} /><span className={errorText}>{errors[name]?.message}</span></label>
            ))}
            {kind === 'OWNER' && bankFields.map(([name, label]) => (
              <label key={name}>{label}<input {...register(name)} autoComplete="off" aria-invalid={!!errors[name]} /><span className={errorText}>{errors[name]?.message}</span></label>
            ))}
            <label className="col-span-full">Observações<textarea {...register('notes')} /><span className={errorText}>{errors.notes?.message}</span></label>
            <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto" {...register('active')} />Cadastro ativo</label>
          </div>
        </fieldset>
        {error && <p role="alert" className="error">{error}</p>}
        <div className={formFooter}>
          <button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar'}</button>
          <button className="buttonGhost" type="button" disabled={isSubmitting} onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Dialog>
  );
}

export function Parties({ kind }: { kind: Kind }) {
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [active, setActive] = useState('');
  const [creating, setCreating] = useState(false);
  const { data, loading, error, refresh } = useAdminData(
    useCallback(() => api.listRentalParties({ kind, page, limit: 15, search, active: active === '' ? undefined : active === 'true' }), [kind, page, search, active]),
  );
  return (
    <>
      <header className={heading}>
        <h1 className={headingTitle}>{kind === 'OWNER' ? 'Proprietários' : 'Inquilinos'}</h1>
        <button className="button" onClick={() => setCreating(true)}>+ Novo cadastro</button>
      </header>
      <div className={toolbar}>
        <Search value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        <label>Situação<select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}><option value="">Todos</option><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
      </div>
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <section className={panel}>
          <div className={tableWrap}>
            <table className={table}>
              <thead><tr><th className={th}>Nome</th><th className={th}>Tipo</th><th className={th}>Situação</th><th className={th}>Ficha</th></tr></thead>
              <tbody>{data.items.map((p) => (
                <tr key={p.id}>
                  <td className={td}>{p.name}</td>
                  <td className={td}>{p.personType}</td>
                  <td className={td}>{p.active ? 'Ativo' : 'Inativo'}</td>
                  <td className={td}><Link to={`${pathFor(kind)}/${p.id}`}>Abrir ficha</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {!data.items.length && <p className={empty}>Nenhum cadastro encontrado.</p>}
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </section>
      )}
      {creating && <PartyEditor kind={kind} onClose={() => setCreating(false)} onSaved={refresh} />}
    </>
  );
}

export function RentalDocuments({ partyId, leaseId }: { partyId?: string; leaseId?: string }) {
  const [busy, setBusy] = useState(false), [mutationError, setMutationError] = useState('');
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.listRentalDocuments({ partyId, leaseId }), [partyId, leaseId]));
  async function upload(file: File) {
    setMutationError('');
    if (file.size > 10 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setMutationError('Escolha PDF, JPEG ou PNG de até 10 MiB.');
      return;
    }
    setBusy(true);
    try {
      await api.uploadRentalDocument(file, { partyId, leaseId });
      refresh();
    } catch (e) {
      setMutationError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function download(d: RentalDocument) {
    setBusy(true);
    setMutationError('');
    try {
      const blob = await api.downloadRentalDocument(d.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = d.fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setMutationError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(d: RentalDocument) {
    if (!confirm(`Excluir o documento ${d.fileName}?`)) return;
    setBusy(true);
    setMutationError('');
    try {
      await api.deleteRentalDocument(d.id);
      refresh();
    } catch (e) {
      setMutationError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={panel}>
      <h2 className={panelTitle}>Documentos privados</h2>
      <label className="grid gap-[7px] font-semibold">Adicionar documento (PDF, JPEG ou PNG, até 10 MiB)<input type="file" accept="application/pdf,image/jpeg,image/png" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void upload(file); }} /></label>
      {busy && <p role="status">Processando documento…</p>}
      {mutationError && <p role="alert" className="error">{mutationError}</p>}
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <ul>{data.map((d) => (
          <li key={d.id}>
            <div className={actions}>
              <span>{d.fileName} ({Math.ceil(d.size / 1024)} KB)</span>
              <button className="buttonGhost" disabled={busy} onClick={() => void download(d)}>Baixar</button>
              <button className="buttonGhost" disabled={busy} onClick={() => void remove(d)}>Excluir</button>
            </div>
          </li>
        ))}</ul>
      )}
      {data?.length === 0 && !error && <p>Nenhum documento anexado.</p>}
    </section>
  );
}

export function PartyDetail() {
  const { id = '' } = useParams();
  const [editing, setEditing] = useState(false);
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.getRentalParty(id), [id]));
  return (
    <>
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <>
          <header className={heading}>
            <div>
              <Link to={pathFor(data.kind)}>Voltar aos cadastros</Link>
              <h1 className={headingTitle}>{data.name}</h1>
              <p>{data.personType} · {data.active ? 'Ativo' : 'Inativo'}</p>
            </div>
            <button className="button" onClick={() => setEditing(true)}>Editar cadastro</button>
          </header>
          <section className={panel}>
            <dl>{([
              ['CPF / CNPJ', data.taxId],
              ['E-mail', data.email],
              ['Telefone', data.phone],
              ['Endereço', data.address],
              ['Nascimento / constituição', data.birthDate],
              ['Observações', data.notes],
              ...(data.kind === 'OWNER' ? [['Banco', data.bankName], ['Agência', data.bankAgency], ['Conta', data.bankAccount], ['Pix', data.pixKey]] : []),
            ]).map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value || 'Não informado'}</dd></div>
            ))}</dl>
          </section>
          <LeaseList partyId={id} />
          <RentalDocuments partyId={id} />
          {editing && <PartyEditor party={data} kind={data.kind} onClose={() => setEditing(false)} onSaved={refresh} />}
        </>
      )}
    </>
  );
}

function EntitySelector({ kind, value, label, onChange }: { kind: 'PROPERTY' | Kind; value: { id: string; name: string }; label: string; onChange: (v: { id: string; name: string }) => void }) {
  const [page, setPage] = useState(1), [search, setSearch] = useState('');
  const { data, loading, error, refresh } = useAdminData(useCallback(async () => {
    if (kind === 'PROPERTY') {
      const result = await api.listRentalProperties(page, search);
      return { ...result, items: result.items.map((p) => ({ id: p.id, name: p.title })) };
    }
    const result = await api.listRentalParties({ page, limit: 15, kind, search, active: true });
    return { ...result, items: result.items.map((p) => ({ id: p.id, name: p.name })) };
  }, [kind, page, search]));
  return (
    <section className={panel} aria-label={label}>
      <h3>{label}</h3>
      <p>Selecionado: {value.name || 'Nenhum'}</p>
      <label className="grid gap-[7px] font-semibold">Buscar {label.toLowerCase()}<input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label>
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <>
          <label className="grid gap-[7px] font-semibold">{label}<select value={value.id} onChange={(e) => { const selected = data.items.find((p) => p.id === e.target.value); if (selected) onChange(selected); }}><option value="">Selecione</option>{value.id && !data.items.some((p) => p.id === value.id) && <option value={value.id}>{value.name}</option>}{data.items.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          {!data.items.length && <p>Nenhum resultado nesta busca.</p>}
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </section>
  );
}

function LeaseEditor({ lease, onClose, onSaved }: { lease?: Lease; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState('');
  const [property, setProperty] = useState({ id: lease?.propertyId ?? '', name: lease?.propertyTitle ?? '' });
  const [owner, setOwner] = useState({ id: lease?.ownerId ?? '', name: lease?.ownerName ?? '' });
  const [tenant, setTenant] = useState({ id: lease?.tenantId ?? '', name: lease?.tenantName ?? '' });
  const { register, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeaseInput>({
    resolver: zodResolver(leaseSchema),
    defaultValues: lease ?? { reference: '', propertyId: '', ownerId: '', tenantId: '', startDate: '', endDate: '', rentAmount: '', dueDay: 5, status: 'DRAFT', notes: '' },
  });
  async function save(v: LeaseInput) {
    setError('');
    try {
      await api.saveLease(v, lease?.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <Dialog title={lease ? 'Editar contrato' : 'Novo contrato'} onClose={() => { if (!isSubmitting) onClose(); }}>
      <form className={formField} onSubmit={handleSubmit(save)} noValidate>
        <fieldset disabled={isSubmitting}>
          <EntitySelector kind="PROPERTY" label="Imóvel" value={property} onChange={(v) => { setProperty(v); setValue('propertyId', v.id, { shouldValidate: true }); }} />
          <p className={errorText}>{errors.propertyId?.message}</p>
          <EntitySelector kind="OWNER" label="Proprietário" value={owner} onChange={(v) => { setOwner(v); setValue('ownerId', v.id, { shouldValidate: true }); }} />
          <p className={errorText}>{errors.ownerId?.message}</p>
          <EntitySelector kind="TENANT" label="Inquilino" value={tenant} onChange={(v) => { setTenant(v); setValue('tenantId', v.id, { shouldValidate: true }); }} />
          <p className={errorText}>{errors.tenantId?.message}</p>
          <div className={grid2}>
            {([['reference', 'Referência', 'text'], ['startDate', 'Início', 'date'], ['endDate', 'Fim', 'date'], ['rentAmount', 'Aluguel (R$; use ponto para centavos)', 'text']] as const).map(([name, label, type]) => (
              <label key={name}>{label}<input type={type} {...register(name)} aria-invalid={!!errors[name]} /><span className={errorText}>{errors[name]?.message}</span></label>
            ))}
            <label>Dia do vencimento<input type="number" min={1} max={31} {...register('dueDay', { valueAsNumber: true })} /><span className={errorText}>{errors.dueDay?.message}</span></label>
            <label>Situação<select {...register('status')}>{Object.entries(statusNames).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label className="col-span-full">Observações<textarea {...register('notes')} /><span className={errorText}>{errors.notes?.message}</span></label>
          </div>
        </fieldset>
        <p className={hint}>O cadastro do valor e vencimento não gera cobranças ou repasses.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <div className={formFooter}>
          <button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar contrato'}</button>
          <button type="button" className="buttonGhost" disabled={isSubmitting} onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Dialog>
  );
}

export function LeaseList({ partyId }: { partyId?: string }) {
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [status, setStatus] = useState(''), [creating, setCreating] = useState(false);
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.listLeases({ page, limit: 15, search, partyId, status }), [page, search, partyId, status]));
  return (
    <>
      <header className={heading}>
        {partyId ? <h2>Contratos vinculados</h2> : <h1 className={headingTitle}>Contratos de locação</h1>}
        {!partyId && <button className="button" onClick={() => setCreating(true)}>+ Novo contrato</button>}
      </header>
      <div className={toolbar}>
        <Search value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        <label>Situação<select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Todas</option>{Object.entries(statusNames).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      </div>
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <section className={panel}>
          <div className={tableWrap}>
            <table className={table}>
              <thead><tr><th className={th}>Contrato / imóvel</th><th className={th}>Partes</th><th className={th}>Situação</th><th className={th}>Ações</th></tr></thead>
              <tbody>{data.items.map((l) => (
                <tr key={l.id}>
                  <td className={td}>{l.reference}<small className={cellSmall}>{l.propertyTitle}</small></td>
                  <td className={td}>{l.ownerName}<small className={cellSmall}>{l.tenantName}</small></td>
                  <td className={td}>{statusNames[l.status]}</td>
                  <td className={td}><Link to={`/admin/contratos/${l.id}`}>Abrir contrato</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {!data.items.length && <p>Nenhum contrato encontrado.</p>}
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </section>
      )}
      {creating && <LeaseEditor onClose={() => setCreating(false)} onSaved={refresh} />}
    </>
  );
}

export function LeaseDetail() {
  const { id = '' } = useParams();
  const [editing, setEditing] = useState(false);
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.getLease(id), [id]));
  return (
    <>
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <>
          <header className={heading}>
            <div>
              <Link to="/admin/contratos">Voltar aos contratos</Link>
              <h1 className={headingTitle}>{data.reference}</h1>
              <p>{statusNames[data.status]}</p>
            </div>
            <button className="button" onClick={() => setEditing(true)}>Editar contrato</button>
          </header>
          <section className={panel}>
            <h2 className={panelTitle}>{data.propertyTitle}</h2>
            <p>Proprietário: <Link to={`/admin/proprietarios/${data.ownerId}`}>{data.ownerName}</Link></p>
            <p>Inquilino: <Link to={`/admin/inquilinos/${data.tenantId}`}>{data.tenantName}</Link></p>
            <p>Período: {data.startDate} a {data.endDate}</p>
            <p>Aluguel: {Number(data.rentAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · Vencimento: dia {data.dueDay}</p>
            <p>{data.notes}</p>
          </section>
          <CommissionPanel leaseId={id} rentAmount={data.rentAmount} />
          <RentalDocuments leaseId={id} />
          {editing && <LeaseEditor lease={data} onClose={() => setEditing(false)} onSaved={refresh} />}
        </>
      )}
    </>
  );
}

export function CommissionPanel({ leaseId, rentAmount }: { leaseId: string; rentAmount: string }) {
  const [data, setData] = useState<AcquisitionCommission | null>(null);
  const [error, setError] = useState('');
  const [count, setCount] = useState(1);
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api.getCommission(leaseId).then(setData).catch((e) => { if (e?.status !== 404) setError(errorMessage(e)); }), [leaseId]);
  useState(() => { void load(); });
  async function create() {
    setBusy(true);
    try {
      setData(await api.createCommission({ leaseId, installmentCount: count, firstDueDate: date }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function paid(id: string) {
    setBusy(true);
    try {
      setData(await api.markCommissionPaid(id));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={panel}>
      <h2 className={panelTitle}>Comissão de captação</h2>
      <p>Regra atual: equivalente a um aluguel ({Number(rentAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}). Parcelamento e confirmação são manuais.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {!data ? (
        <div className={`${grid2} ${formField}`}>
          <label>Parcelas<input type="number" min="1" max="60" value={count} onChange={(e) => setCount(Number(e.target.value))} /></label>
          <label>Primeiro vencimento<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <button className="button" disabled={busy || !date} onClick={() => void create()}>Criar comissão</button>
        </div>
      ) : (
        <>
          <p>Total: {data.totalAmount} · Recebido: {data.paidAmount} · Saldo: {data.balanceAmount}</p>
          <ul>{data.installments.map((i) => (
            <li key={i.id}>Parcela {i.installmentNumber}: {i.amount} · {i.dueDate} · {i.status === 'PAID' ? 'Paga' : <button className="buttonGhost" disabled={busy} onClick={() => void paid(i.id)}>Confirmar pagamento</button>}</li>
          ))}</ul>
        </>
      )}
    </section>
  );
}
