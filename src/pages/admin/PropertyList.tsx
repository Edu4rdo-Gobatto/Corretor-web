import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { money, propertyStatuses, propertyType, errorMessage } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import Pagination from '../../components/Pagination';
import { useAdminData } from './useAdminData';

export default function PropertyList() {
  const {agent}=useAuth();
  const [active,setActive]=useState(true);
  const [page, setPage] = useState(1);
  const [mutationError, setMutationError] = useState('');
  const [busy, setBusy] = useState('');
  const { data, loading, error, refresh } = useAdminData(
    useCallback(() => api.listProperties({ page, limit: 12, active }, true), [page,active]),
  );
  async function remove(id: string) {
    if (!confirm(active?'Desativar este imóvel? Seu histórico e suas mídias serão preservados.':'Reativar este imóvel?')) return;
    setBusy(id);
    setMutationError('');
    try {
      await api.setPropertyActive(id,!active);
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
          <p className="eyebrow">SEU PORTFÓLIO</p>
          <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">Imóveis</h1>
          <p className="muted">Espaços bem apresentados, novas possibilidades.</p>
        </div>
        <Link className="button" to="/admin/imoveis/novo">+ Novo imóvel</Link>
      </header>
<label>Situação<select value={String(active)} onChange={e=>{setActive(e.target.value==='true');setPage(1);}}><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
      {mutationError && <p className="error" role="alert">{mutationError}</p>}
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
          {!data.items.length ? (
            <div className="px-5 py-10 text-center text-muted">
              <h2>Seu portfólio começa aqui.</h2>
              <p>Cadastre o primeiro imóvel para apresentá-lo no site.</p>
              <Link to="/admin/imoveis/novo" className="button">Cadastrar imóvel</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto overscroll-contain">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Imóvel</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Valor</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Status</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((p) => (
                      <tr key={p.id}>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <strong>{p.title}</strong>
                          <small className="mt-1 block text-muted">{p.typeName || propertyType[p.type] || 'Imóvel'} · {p.addressCity}/{p.addressState}</small>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          {money(p.price)}
                          <small className="mt-1 block text-muted">{p.purposeName || (p.purpose === 'LOCACAO' ? 'Por mês' : 'Venda')}</small>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <span className="inline-block rounded bg-[#eaf0e8] px-2.5 py-1 text-[13px] text-[#174d3b] dark:bg-white/10 dark:text-white">{propertyStatuses[p.status]}</span>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <div className="flex flex-wrap items-center gap-2.5 max-lg:justify-end [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap">
                            {(agent?.role==='ADMIN'||agent?.id===p.agentId)&&<Link to={`/admin/imoveis/${p.id}/editar`}>Editar</Link>}
                            <Link to={`/admin/imoveis/${p.id}/editar`}>Ver detalhes</Link>
                            {(agent?.role==='ADMIN'||agent?.id===p.agentId)&&<button className="buttonGhost text-error!" disabled={!!busy} onClick={() => void remove(p.id)}>
                              {busy === p.id ? 'Salvando…' : active?'Desativar':'Reativar'}
                            </button>}
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
