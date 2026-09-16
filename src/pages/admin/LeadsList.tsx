import { whatsappPhone } from '../../services/lead';
import ClientEditor from './ClientEditor';
import type { Lead } from '../../types';
import { useCallback, useState } from 'react';
import { api } from '../../services/api';
import { date, errorMessage } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import { useAdminData } from './useAdminData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RentalSelector } from './Rentals';
import type { RentalOption } from './rentalSchema';
import { downloadLeadsCsv } from '../../services/leadExport';

const optionalDate = z.union([z.literal(''), z.iso.date('Informe uma data válida.')]);
export const leadFiltersSchema = z.object({
  search: z.string().trim(),
  imovel_id: z.union([z.literal(''), z.uuid('Selecione um imóvel válido.')]),
  createdFrom: optionalDate,
  createdTo: optionalDate,
  active: z.enum(['true', 'false']),
}).refine(value => !value.createdFrom || !value.createdTo || value.createdFrom <= value.createdTo, {
  path: ['createdTo'], message: 'A data final deve ser igual ou posterior à inicial.',
});
type LeadFilters = z.infer<typeof leadFiltersSchema>;
const defaultFilters: LeadFilters = { search: '', imovel_id: '', createdFrom: '', createdTo: '', active: 'true' };

export default function LeadsList() {
  const [editing,setEditing]=useState<Lead|null|undefined>();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [property, setProperty] = useState<RentalOption>({ id: '', nome: '' });
  const { register, setValue, reset, handleSubmit, formState: { errors } } = useForm<LeadFilters>({
    resolver: zodResolver(leadFiltersSchema), defaultValues: defaultFilters,
  });
  const [mutationError, setMutationError] = useState('');
  const [busy, setBusy] = useState('');
  const { data, loading, error, refresh } = useAdminData(
    useCallback(async () => ({ result: await api.listLeads({ page, limit: 15, active: filters.active === 'true', search: filters.search || undefined, propertyId: filters.imovel_id || undefined, createdFrom: filters.createdFrom ? `${filters.createdFrom}T00:00:00.000-04:00` : undefined, createdTo: filters.createdTo ? `${filters.createdTo}T23:59:59.999-04:00` : undefined }), filters, page }), [page, filters]),
  );
  const current = data?.filters === filters && data?.page === page;
  const result = data?.result;
  function exportCsv() {
    if (!current || loading || error || !result?.items.length) return;
    downloadLeadsCsv(result.items, page);
  }
  async function remove(id: string) {
    if (!confirm('Desativar este cliente? Seu histórico será preservado.')) return;
    setBusy(id);
    setMutationError('');
    try {
      await api.deleteLead(id);
      if (result?.items.length === 1 && page > 1) setPage(page - 1);
      else refresh();
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
          <p className="eyebrow">NOVAS CONEXÕES</p>
          <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">Clientes e contatos</h1>
          <p className="muted">Pessoas interessadas em encontrar o espaço certo.</p>
        </div>
      <button className="button" onClick={()=>setEditing(null)}>Novo cliente</button></header>
      <form noValidate className="mb-6 flex flex-wrap items-end gap-3 max-[560px]:grid max-[560px]:grid-cols-1 [&_label]:grid [&_label]:gap-1.5" onSubmit={handleSubmit(value => { setPage(1); setFilters(value); })}>
        <label>Buscar contato<input {...register('search')} placeholder="Nome do cliente" /></label>
        <div><RentalSelector tipo="IMOVEL" label="Imóvel" valor={property} onSelect={value => { setProperty(value); setValue('imovel_id', value.id, { shouldValidate: true }); }} />
        {errors.imovel_id && <p role="alert" className="error">{errors.imovel_id.message}</p>}</div>
        <label>De<input type="date" {...register('createdFrom')} />{errors.createdFrom && <span role="alert" className="error">{errors.createdFrom.message}</span>}</label>
        <label>Até<input type="date" {...register('createdTo')} />{errors.createdTo && <span role="alert" className="error">{errors.createdTo.message}</span>}</label>
        <label>Situação<select {...register('active')}><option value="true">Ativos</option><option value="false">Inativos</option></select></label><button type="submit" className="buttonSecondary">Buscar</button>
        <button type="button" className="buttonGhost" onClick={() => { reset(defaultFilters); setProperty({ id: '', nome: '' }); setFilters(defaultFilters); setPage(1); }}>Limpar</button>
        <button type="button" className="buttonSecondary" onClick={exportCsv} disabled={!current || loading || !!error || !result?.items.length}>Exportar CSV da página atual</button>
      </form>
      <p className="muted">Período em America/Cuiaba (UTC−04:00), incluindo todo o dia final. O CSV contém somente a página atual dos filtros aplicados. Origem é informativa.</p>
      {mutationError && <p className="error" role="alert">{mutationError}</p>}
      <AsyncState loading={loading} error={error} retry={refresh} />
      {result && current && !loading && !error && (
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          {!result.items.length ? (
            <p className="px-5 py-10 text-center text-muted">Nenhum contato encontrado.</p>
          ) : (
            <>
              <div className="overflow-x-auto overscroll-contain">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Contato</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Interesse</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Recebido</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((lead) => (
                      <tr key={lead.id}>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <strong>{lead.leadName}</strong>
                          <small className="mt-1 block text-muted">{lead.leadPhone}</small>
                          {lead.leadEmail && <small className="mt-1 block text-muted"><a href={`mailto:${lead.leadEmail}`}>{lead.leadEmail}</a></small>}
                        </td>
                        <td className="max-w-[340px] whitespace-normal border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          {lead.message ? <details><summary className="cursor-pointer">Ver mensagem</summary><p className="whitespace-pre-wrap break-words">{lead.message}</p></details> : 'Sem mensagem adicional'}
                          <small className="mt-1 block text-muted">Origem: {lead.origin || 'Não informada'}</small>
                          <small className="mt-1 block text-muted">{lead.propertyId ? <a href={`/admin/imoveis/${lead.propertyId}/editar`}>Ver imóvel de interesse →</a> : 'Sem imóvel vinculado'}</small>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          {date(lead.createdAt)}
                          <small className="mt-1 block text-muted">{lead.consentGiven ? 'Consentimento registrado' : lead.origin === 'MANUAL' ? 'Cadastro manual' : 'Sem consentimento'} · {lead.termsVersion}</small>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <div className="flex flex-wrap items-center gap-2.5 max-lg:justify-end [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap">
                            <a href={`https://wa.me/${whatsappPhone(lead.leadPhone)}`} target="_blank" rel="noreferrer">WhatsApp ↗</a>
                            <button className="buttonGhost" onClick={()=>setEditing(lead)}>Editar</button><button className="buttonGhost text-error!" disabled={!!busy} onClick={() => void remove(lead.id)}>{busy === lead.id ? 'Desativando…' : 'Desativar'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
            </>
          )}
        </section>
      )}
    {editing!==undefined&&<ClientEditor client={editing} close={()=>setEditing(undefined)} saved={refresh}/>}</>
  );
}
