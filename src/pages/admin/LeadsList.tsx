import { useCallback, useState } from 'react';
import { api } from '../../services/api';
import { date, errorMessage } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import { useAdminData } from './useAdminData';

export default function LeadsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [busy, setBusy] = useState('');
  const { data, loading, error, refresh } = useAdminData(
    useCallback(() => api.listLeads({ page, limit: 15, search: search || undefined }), [page, search]),
  );
  async function remove(id: string) {
    if (!confirm('Excluir este contato permanentemente?')) return;
    setBusy(id);
    setMutationError('');
    try {
      await api.deleteLead(id);
      if (data?.items.length === 1 && page > 1) setPage(page - 1);
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
          <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">Contatos recebidos</h1>
          <p className="muted">Pessoas interessadas em encontrar o espaço certo.</p>
        </div>
      </header>
      <form className="mb-6 flex flex-wrap items-end gap-3 max-[560px]:grid max-[560px]:grid-cols-1 max-[560px]:[&_button]:w-full max-[560px]:[&_input]:min-w-0 [&_input]:min-w-[220px] [&_label]:grid [&_label]:gap-1.5" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(draft.trim()); }}>
        <label>Buscar contato<input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nome, e-mail ou telefone" /></label>
        <button className="buttonSecondary">Buscar</button>
        {search && <button type="button" className="buttonGhost" onClick={() => { setDraft(''); setSearch(''); setPage(1); }}>Limpar</button>}
      </form>
      {mutationError && <p className="error" role="alert">{mutationError}</p>}
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          {!data.items.length ? (
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
                    {data.items.map((lead) => (
                      <tr key={lead.id}>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <strong>{lead.leadName}</strong>
                          <small className="mt-1 block text-muted">{lead.leadPhone}</small>
                          {lead.leadEmail && <small className="mt-1 block text-muted"><a href={`mailto:${lead.leadEmail}`}>{lead.leadEmail}</a></small>}
                        </td>
                        <td className="max-w-[340px] whitespace-normal border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          {lead.message || 'Sem mensagem adicional'}
                          <small className="mt-1 block text-muted">{lead.propertyId ? <a href={`/admin/imoveis/${lead.propertyId}/editar`}>Ver imóvel de interesse →</a> : 'Imóvel removido'}</small>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          {date(lead.createdAt)}
                          <small className="mt-1 block text-muted">{lead.consentGiven ? 'Consentimento registrado' : 'Sem consentimento'} · {lead.termsVersion}</small>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <div className="flex flex-wrap items-center gap-2.5 max-lg:justify-end [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap">
                            <a href={`https://wa.me/${lead.leadPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp ↗</a>
                            <button className="buttonGhost text-error!" disabled={!!busy} onClick={() => void remove(lead.id)}>{busy === lead.id ? 'Excluindo…' : 'Excluir'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
            </>
          )}
        </section>
      )}
    </>
  );
}
