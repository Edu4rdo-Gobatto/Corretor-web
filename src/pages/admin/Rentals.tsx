import { useCallback, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { errorMessage } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import Dialog from '../../components/Dialog';
import Pagination from '../../components/Pagination';
import { useAdminData } from './useAdminData';
import Commissions from './Commissions';
import { partySchema, leaseSchema, displayDate, displayMoney, type RentalPartyInput, type RentalParty, type LeaseInput, type Lease, type RentalOption, type RentalPage } from './rentalSchema';

type Kind = 'OWNER' | 'TENANT';
const pathFor = (papel: 'LOCADOR' | 'LOCATARIO') => `/admin/${papel === 'LOCADOR' ? 'proprietarios' : 'inquilinos'}`;
export const rentalUi = {
  heading: 'mb-8 flex flex-wrap items-center justify-between gap-5 max-[560px]:flex-col max-[560px]:items-stretch',
  title: 'my-2 text-[clamp(26px,3vw,38px)] text-ink', panel: 'mb-6 rounded border border-line bg-paper p-5 lg:p-7',
  panelTitle: 'mb-6 mt-0 text-[22px] text-ink', tableWrap: 'overflow-x-auto overscroll-contain', table: 'w-full min-w-[640px] border-collapse text-left',
  th: 'border-b border-line px-3 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted', td: 'border-b border-line px-3 py-[18px] align-middle',
  actions: 'flex flex-wrap items-center gap-2.5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center', grid: 'grid grid-cols-1 gap-[22px] md:grid-cols-2',
  toolbar: 'mb-6 flex flex-wrap items-end gap-3 [&_label]:grid [&_label]:gap-1.5',
  form: '[&_input]:w-full [&_label]:grid [&_label]:gap-[7px] [&_label]:font-semibold [&_select]:w-full [&_textarea]:min-h-[100px] [&_textarea]:w-full',
  error: 'm-0 text-[13px] text-error', hint: 'text-[13px] font-normal text-muted', footer: 'my-7 flex flex-wrap items-center gap-3.5',
};
const u = rentalUi;
export function RentalGuard({ children }: { children: ReactNode }) {
  const { agent, loading } = useAuth();
  if (loading) return <AsyncState loading />;
  return agent ? children : <Navigate to="/admin/entrar" replace />;
}
export function RentalSelector({ tipo, label, valor, onSelect, imovel_id, corretor_id }: { tipo: 'IMOVEL' | 'LOCADOR' | 'LOCATARIO' | 'CLIENTE' | 'CORRETOR' | 'CONTRATO'; label: string; valor: RentalOption; onSelect: (option: RentalOption) => void; imovel_id?: string; corretor_id?: string }) {
  const [page, setPage] = useState(1), [search, setSearch] = useState('');
  const { data, loading, error, refresh } = useAdminData<RentalPage<RentalOption>>(useCallback(async () => {
    if (tipo === 'IMOVEL') return api.rentalPropertyOptions(page, search);
    if (tipo === 'CLIENTE') return api.rentalClientOptions(page, search);
    if (tipo === 'CORRETOR') return api.rentalAgentOptions(page, search);
    if (tipo === 'CONTRATO') {
      const result = await api.listLeases({ pagina: page, limite: 15, busca: search, ativo: true });
      return { ...result, itens: result.itens.map(item => ({ id: item.id, nome: item.numero_contrato, imovel_id: item.imovel_id, corretor_id: item.corretor_id })) };
    }
    const result = await api.listRentalParties({ pagina: page, limite: 15, busca: search, ativo: true, papel: tipo });
    return { ...result, itens: result.itens.map(item => ({ id: item.id, nome: item.nome })) };
  }, [tipo, page, search]));
  const options: RentalOption[] = (data?.itens ?? []).filter(item => (!corretor_id || !item.corretor_id || item.corretor_id === corretor_id) && (!imovel_id || !item.imovel_id || item.imovel_id === imovel_id));
  return <section className="my-4 rounded border border-line p-4" aria-label={label}>
    <label>Buscar {label.toLowerCase()}<input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
    <AsyncState loading={loading} error={error} retry={refresh} />
    <label className="mt-3">{label}<select value={valor.id} disabled={loading || !!error} onChange={event => { const selected = options.find(option => option.id === event.target.value); onSelect(selected ?? { id: '', nome: '' }); }}>
      <option value="">Selecione</option>{valor.id && !options.some(option => option.id === valor.id) && <option value={valor.id}>{valor.nome || 'Seleção atual'}</option>}{options.map(option => <option key={option.id} value={option.id}>{option.nome}</option>)}
    </select></label>
    {data && !loading && !error && !options.length && <p className={u.hint}>Nenhum cadastro compatível nesta página. Ajuste a busca ou avance as páginas.</p>}
    {data && <Pagination page={page} totalPages={Math.ceil(data.total / data.limite)} onChange={setPage} />}
  </section>;
}
function PartyEditor({ party, papel, onClose, onSaved }: { party?: RentalParty; papel: 'LOCADOR' | 'LOCATARIO'; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState('');
  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<RentalPartyInput>({ resolver: zodResolver(partySchema), defaultValues: { papel, tipo_pessoa: 'PF', nome: '', cpf_cnpj: '', email: '', telefone: '', endereco: '', data_nascimento: '', banco_nome: '', banco_agencia: '', banco_conta: '', chave_pix: '', observacoes: '', ativo: true, ...party } });
  const pessoa = watch('tipo_pessoa');
  async function save(value: RentalPartyInput) {
    setError('');
    try { await api.saveRentalParty(value, party?.id); onSaved(); onClose(); } catch (failure) { setError(errorMessage(failure)); }
  }
  return <Dialog title={party ? 'Editar cadastro' : 'Novo cadastro'} onClose={() => { if (!isSubmitting) onClose(); }}><form className={u.form} onSubmit={handleSubmit(save)} noValidate><fieldset disabled={isSubmitting}><div className={u.grid}>
    <label>Tipo de pessoa<select {...register('tipo_pessoa', { onChange: event => { if (event.target.value === 'PJ') setValue('data_nascimento', ''); } })}><option value="PF">Pessoa física</option><option value="PJ">Pessoa jurídica</option></select></label>
    {([['nome', 'Nome / razão social', 'text'], ['cpf_cnpj', 'CPF / CNPJ', 'text'], ['email', 'E-mail', 'email'], ['telefone', 'Telefone', 'tel'], ['endereco', 'Endereço completo', 'text']] as const).map(([name, label, type]) => <label key={name}>{label}<input type={type} {...register(name)} aria-invalid={!!errors[name]} /><span className={u.error}>{errors[name]?.message}</span></label>)}
    {pessoa === 'PF' && <label>Data de nascimento<input type="date" {...register('data_nascimento')} /><span className={u.error}>{errors.data_nascimento?.message}</span></label>}
    {papel === 'LOCADOR' && ([['banco_nome', 'Banco'], ['banco_agencia', 'Agência'], ['banco_conta', 'Conta'], ['chave_pix', 'Chave Pix']] as const).map(([name, label]) => <label key={name}>{label}<input {...register(name)} autoComplete="off" /><span className={u.error}>{errors[name]?.message}</span></label>)}
    <label className="col-span-full">Observações<textarea {...register('observacoes')} /><span className={u.error}>{errors.observacoes?.message}</span></label>
    {party && <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('ativo')} />Cadastro ativo</label>}
  </div></fieldset>{error && <p role="alert" className="error">{error}</p>}<div className={u.footer}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar cadastro'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} onClick={onClose}>Cancelar</button></div></form></Dialog>;
}
export function Parties({ kind }: { kind: Kind }) {
  const { agent } = useAuth(); const admin = agent?.role === 'ADMIN'; const papel = kind === 'OWNER' ? 'LOCADOR' : 'LOCATARIO';
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [active, setActive] = useState(true), [creating, setCreating] = useState(false);
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.listRentalParties({ papel, pagina: page, limite: 15, busca: search, ativo: active }), [papel, page, search, active]));
  return <><header className={u.heading}><h1 className={u.title}>{kind === 'OWNER' ? 'Proprietários' : 'Inquilinos'}</h1>{admin && <button className="button" onClick={() => setCreating(true)}>+ Novo cadastro</button>}</header>
    {!admin && <p>Cadastros vinculados aos contratos sob sua intermediação.</p>}<div className={u.toolbar}><label>Buscar por nome<input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label><label>Situação<select value={String(active)} onChange={event => { setActive(event.target.value === 'true'); setPage(1); }}><option value="true">Ativos</option><option value="false">Inativos</option></select></label></div>
    <AsyncState loading={loading} error={error} retry={refresh} />{data && !error && <section className={u.panel}><div className={u.tableWrap}><table className={u.table}><thead><tr><th className={u.th}>Nome</th><th className={u.th}>Tipo</th><th className={u.th}>Situação</th><th className={u.th}>Ficha</th></tr></thead><tbody>{data.itens.map(item => <tr key={item.id}><td className={u.td}>{item.nome}</td><td className={u.td}>{item.tipo_pessoa}</td><td className={u.td}>{item.ativo ? 'Ativo' : 'Inativo'}</td><td className={u.td}><Link to={`${pathFor(item.papel)}/${item.id}`}>Abrir ficha</Link></td></tr>)}</tbody></table></div>{!data.itens.length && <p>Nenhum cadastro encontrado.</p>}<Pagination page={page} totalPages={Math.ceil(data.total / data.limite)} onChange={setPage} /></section>}
    {creating && admin && <PartyEditor papel={papel} onClose={() => setCreating(false)} onSaved={refresh} />}</>;
}
export function PartyDetail() {
  const { id = '' } = useParams(), { agent } = useAuth();
  const [editing, setEditing] = useState(false), [archiving, setArchiving] = useState(false), [busy, setBusy] = useState(false), [mutationError, setMutationError] = useState('');
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.getRentalParty(id), [id]));
  async function archive() { setBusy(true); setMutationError(''); try { await api.deleteRentalParty(id); setArchiving(false); refresh(); } catch (failure) { setMutationError(errorMessage(failure)); } finally { setBusy(false); } }
  return <><AsyncState loading={loading} error={error} retry={refresh} />{data && !error && <><header className={u.heading}><div><Link to={pathFor(data.papel)}>Voltar aos cadastros</Link><h1 className={u.title}>{data.nome}</h1><p>{data.tipo_pessoa} · {data.ativo ? 'Ativo' : 'Inativo'}</p></div>{agent?.role === 'ADMIN' && <div className={u.actions}><button className="button" onClick={() => setEditing(true)}>Editar cadastro</button>{data.ativo && <button className="buttonGhost" onClick={() => setArchiving(true)}>Desativar</button>}</div>}</header>
    <section className={u.panel}><dl className="m-0 grid gap-3.5 [&_dd]:m-0 [&_dd]:[overflow-wrap:anywhere] [&_dt]:font-semibold">{([['CPF / CNPJ', data.cpf_cnpj], ['E-mail', data.email], ['Telefone', data.telefone], ['Endereço', data.endereco], ['Nascimento', displayDate(data.data_nascimento)], ['Banco', data.banco_nome], ['Agência', data.banco_agencia], ['Conta', data.banco_conta], ['Pix', data.chave_pix], ['Observações', data.observacoes]]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Não informado'}</dd></div>)}</dl></section><Link to="/admin/contratos" className="buttonGhost">Consultar contratos</Link>
    {editing && <PartyEditor party={data} papel={data.papel} onClose={() => setEditing(false)} onSaved={refresh} />}{archiving && <Dialog title="Desativar cadastro" onClose={() => { if (!busy) setArchiving(false); }}><p>Desativar {data.nome}? O histórico será preservado. Cadastros vinculados a contratos ativos precisam permanecer ativos.</p>{mutationError && <p role="alert" className="error">{mutationError}</p>}<button className="button" disabled={busy} onClick={() => void archive()}>{busy ? 'Desativando…' : 'Desativar cadastro'}</button></Dialog>}</>}</>;
}
function LeaseEditor({ lease, onClose, onSaved }: { lease?: Lease; onClose: () => void; onSaved: (lease: Lease) => void }) {
  const { agent } = useAuth(); const [error, setError] = useState('');
  const [property, setProperty] = useState<RentalOption>({ id: lease?.imovel_id ?? '', nome: lease?.imovel_titulo ?? '' });
  const [owner, setOwner] = useState<RentalOption>({ id: lease?.locador_id ?? '', nome: lease?.locador_nome ?? '' });
  const [tenant, setTenant] = useState<RentalOption>({ id: lease?.locatario_id ?? '', nome: lease?.locatario_nome ?? '' });
  const [broker, setBroker] = useState<RentalOption>({ id: lease?.corretor_id ?? agent?.id ?? '', nome: !lease || lease.corretor_id === agent?.id ? agent?.name ?? '' : 'Intermediador atual' });
  const { register, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeaseInput>({ resolver: zodResolver(leaseSchema), defaultValues: { numero_contrato: '', imovel_id: '', locador_id: '', locatario_id: '', corretor_id: agent?.id ?? '', data_inicio: '', data_fim: '', valor_aluguel: '', dia_vencimento: 5, taxa_administracao: '', garantia_locaticia: '', indice_reajuste: '', cobranca_iptu_condominio: '', status: 'ATIVO', ativo: true, observacoes: '', ...lease } });
  async function save(value: LeaseInput) { setError(''); try { const saved = await api.saveLease(value, lease?.id); onSaved(saved); onClose(); } catch (failure) { setError(errorMessage(failure)); } }
  return <Dialog title={lease ? 'Editar contrato' : 'Novo contrato'} onClose={() => { if (!isSubmitting) onClose(); }}><form className={u.form} onSubmit={handleSubmit(save)} noValidate><fieldset disabled={isSubmitting}>
    <RentalSelector tipo="IMOVEL" label="Imóvel" valor={property} onSelect={value => { setProperty(value); setValue('imovel_id', value.id, { shouldValidate: true }); }} /><p className={u.error}>{errors.imovel_id?.message}</p>
    <RentalSelector tipo="LOCADOR" label="Proprietário" valor={owner} onSelect={value => { setOwner(value); setValue('locador_id', value.id, { shouldValidate: true }); }} /><p className={u.error}>{errors.locador_id?.message}</p>
    <RentalSelector tipo="LOCATARIO" label="Inquilino" valor={tenant} onSelect={value => { setTenant(value); setValue('locatario_id', value.id, { shouldValidate: true }); }} /><p className={u.error}>{errors.locatario_id?.message}</p>
    {agent?.role === 'ADMIN' ? <RentalSelector tipo="CORRETOR" label="Intermediador" valor={broker} onSelect={value => { setBroker(value); setValue('corretor_id', value.id, { shouldValidate: true }); }} /> : <p>Intermediador: {agent?.name}. Para partes ainda não vinculadas aos seus contratos, solicite o cadastro ao administrador.</p>}<p className={u.error}>{errors.corretor_id?.message}</p>
    <div className={u.grid}>{([['numero_contrato', 'Número do contrato', 'text'], ['data_inicio', 'Início', 'date'], ['data_fim', 'Fim', 'date'], ['valor_aluguel', 'Aluguel (R$)', 'text'], ['taxa_administracao', 'Taxa de administração (%)', 'text'], ['garantia_locaticia', 'Garantia locatícia', 'text'], ['indice_reajuste', 'Índice de reajuste', 'text'], ['cobranca_iptu_condominio', 'Pagamento de IPTU e condomínio', 'text']] as const).map(([name, label, type]) => <label key={name}>{label}<input type={type} inputMode={name === 'valor_aluguel' || name === 'taxa_administracao' ? 'decimal' : undefined} {...register(name)} aria-invalid={!!errors[name]} /><span className={u.error}>{errors[name]?.message}</span></label>)}
      <label>Dia de vencimento<input type="number" min={1} max={31} {...register('dia_vencimento', { valueAsNumber: true })} /><span className={u.error}>{errors.dia_vencimento?.message}</span></label>
      <label>Situação<select {...register('status')}><option value="ATIVO">Ativo</option><option value="INATIVO">Encerrado</option></select></label><label className="col-span-full">Observações<textarea {...register('observacoes')} /><span className={u.error}>{errors.observacoes?.message}</span></label>
      {lease && <label className="flex! items-center gap-2.5!"><input type="checkbox" className="w-auto!" {...register('ativo')} />Manter no cadastro de contratos</label>}
    </div></fieldset><p className={u.hint}>A receita de intermediação é registrada separadamente em Comissões. O contrato vencido é encerrado automaticamente.</p>{error && <p role="alert" className="error">{error}</p>}<div className={u.footer}><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar contrato'}</button><button className="buttonGhost" type="button" disabled={isSubmitting} onClick={onClose}>Cancelar</button></div></form></Dialog>;
}
export function LeaseList() {
  const navigate = useNavigate(); const [page, setPage] = useState(1), [search, setSearch] = useState(''), [status, setStatus] = useState<'' | 'ATIVO' | 'INATIVO'>(''), [active, setActive] = useState(true), [creating, setCreating] = useState(false);
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.listLeases({ pagina: page, limite: 15, busca: search, status: status || undefined, ativo: active }), [page, search, status, active]));
  return <><header className={u.heading}><h1 className={u.title}>Contratos de locação</h1><button className="button" onClick={() => setCreating(true)}>+ Novo contrato</button></header><div className={u.toolbar}><label>Buscar número<input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label><label>Situação<select value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(1); }}><option value="">Todas</option><option value="ATIVO">Ativos</option><option value="INATIVO">Encerrados</option></select></label><label>Cadastro<select value={String(active)} onChange={event => { setActive(event.target.value === 'true'); setPage(1); }}><option value="true">Em cadastro</option><option value="false">Arquivados</option></select></label></div>
    <AsyncState loading={loading} error={error} retry={refresh} />{data && !error && <section className={u.panel}><div className={u.tableWrap}><table className={u.table}><thead><tr><th className={u.th}>Contrato</th><th className={u.th}>Período</th><th className={u.th}>Aluguel</th><th className={u.th}>Situação</th><th className={u.th}>Ações</th></tr></thead><tbody>{data.itens.map(item => <tr key={item.id}><td className={u.td}>{item.numero_contrato}</td><td className={u.td}>{displayDate(item.data_inicio)} a {displayDate(item.data_fim)}</td><td className={u.td}>{displayMoney(item.valor_aluguel)}</td><td className={u.td}>{item.status === 'ATIVO' ? 'Ativo' : 'Encerrado'}</td><td className={u.td}><Link to={`/admin/contratos/${item.id}`}>Abrir contrato</Link></td></tr>)}</tbody></table></div>{!data.itens.length && <p>Nenhum contrato encontrado.</p>}<Pagination page={page} totalPages={Math.ceil(data.total / data.limite)} onChange={setPage} /></section>}
    {creating && <LeaseEditor onClose={() => setCreating(false)} onSaved={saved => navigate(`/admin/contratos/${saved.id}`)} />}</>;
}
export function LeaseDetail() {
  const { id = '' } = useParams(); const [editing, setEditing] = useState(false), [archiving, setArchiving] = useState(false), [busy, setBusy] = useState(false), [mutationError, setMutationError] = useState('');
  const { data, loading, error, refresh } = useAdminData(useCallback(() => api.getLease(id), [id]));
  async function mutate(action: 'drive' | 'archive') { setBusy(true); setMutationError(''); try { const result = action === 'drive' ? await api.retryLeaseDrive(id) : await api.deleteLease(id); if (action === 'drive' && result.status_pasta_drive !== 'CRIADA') setMutationError('O contrato está salvo, mas a pasta ainda não está disponível. Tente novamente após ajustar a integração.'); setArchiving(false); refresh(); } catch (failure) { setMutationError(errorMessage(failure)); } finally { setBusy(false); } }
  const driveUrl = data?.url_pasta_drive && /^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+$/.test(data.url_pasta_drive) ? data.url_pasta_drive : null;
  return <><AsyncState loading={loading} error={error} retry={refresh} />{data && !error && <><header className={u.heading}><div><Link to="/admin/contratos">Voltar aos contratos</Link><h1 className={u.title}>{data.numero_contrato}</h1><p>{data.status === 'ATIVO' ? 'Ativo' : 'Encerrado'}{!data.ativo && ' · Arquivado'}</p></div><div className={u.actions}><button className="button" onClick={() => setEditing(true)}>Editar contrato</button>{data.ativo && <button className="buttonGhost" onClick={() => setArchiving(true)}>Arquivar</button>}</div></header>
    <section className={u.panel}><h2 className={u.panelTitle}>{data.imovel_titulo}</h2><p>Proprietário: <Link to={`/admin/proprietarios/${data.locador_id}`}>{data.locador_nome}</Link></p><p>Inquilino: <Link to={`/admin/inquilinos/${data.locatario_id}`}>{data.locatario_nome}</Link></p><p>Período: {displayDate(data.data_inicio)} a {displayDate(data.data_fim)}</p><p>Aluguel: {displayMoney(data.valor_aluguel)} · Vencimento: dia {data.dia_vencimento}</p><p>Taxa de administração: {data.taxa_administracao}%</p><p>Garantia: {data.garantia_locaticia}</p><p>Reajuste: {data.indice_reajuste}</p><p>IPTU e condomínio: {data.cobranca_iptu_condominio}</p>{data.observacoes && <p className="whitespace-pre-wrap">{data.observacoes}</p>}</section>
    <section className={u.panel}><h2 className={u.panelTitle}>Documentos do contrato</h2>{driveUrl && <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="buttonGhost">Abrir pasta no Google Drive</a>}<p>{data.status_pasta_drive === 'CRIADA' ? 'Pasta disponível para as pessoas autorizadas no Drive.' : data.status_pasta_drive === 'FALHOU' ? 'O contrato foi salvo. A criação ou atualização da pasta não foi concluída.' : 'A pasta será preparada para este contrato quando ele estiver ativo.'}</p>{data.status === 'ATIVO' && data.ativo && data.status_pasta_drive !== 'CRIADA' && <button className="buttonSecondary" disabled={busy} onClick={() => void mutate('drive')}>{busy ? 'Preparando pasta…' : 'Tentar preparar pasta novamente'}</button>}{mutationError && <p className="error" role="alert">{mutationError}</p>}</section>
    <Commissions lease={data} />{editing && <LeaseEditor lease={data} onClose={() => setEditing(false)} onSaved={refresh} />}{archiving && <Dialog title="Arquivar contrato" onClose={() => { if (!busy) setArchiving(false); }}><p>Arquivar {data.numero_contrato}? O contrato será encerrado e o histórico permanecerá disponível.</p><button className="button" disabled={busy} onClick={() => void mutate('archive')}>{busy ? 'Arquivando…' : 'Arquivar contrato'}</button>{mutationError && <p role="alert" className="error">{mutationError}</p>}</Dialog>}</>}</>;
}
