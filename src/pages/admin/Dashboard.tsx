import { routes } from '../../services/urls';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { date } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import { useAdminData } from './useAdminData';

export default function Dashboard() {
  const { agent } = useAuth();
  const { data, loading, error, refresh } = useAdminData(
    useCallback(async () => {
      const [properties, leads] = await Promise.all([
        api.listProperties({ page: 1, limit: 1 }, true),
        api.listLeads({ page: 1, limit: 5 }),
      ]);
      return { properties, leads };
    }, []),
  );
  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-5 max-[560px]:flex-col max-[560px]:items-stretch max-[560px]:[&_.button]:w-full">
        <div>
          <p className="eyebrow">VISÃO GERAL</p>
          <h1 className="my-2 text-[clamp(26px,3vw,38px)] text-ink">Olá, {agent?.name.split(' ')[0]}.</h1>
          <p className="muted">Um olhar sobre suas próximas oportunidades.</p>
        </div>
        <Link className="button" to="/admin/imoveis/novo">+ Novo imóvel</Link>
      </header>
      <AsyncState loading={loading} error={error} retry={refresh} />
      {data && !error && (
        <>
          <section className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5">
            <div className="flex flex-wrap items-center gap-5 rounded border border-line bg-paper p-[18px] lg:block lg:p-7 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
              <span>Imóveis no portfólio</span>
              <strong className="m-0 block font-display text-[28px] text-ink lg:my-[18px] lg:mb-2 lg:text-[38px]">{data.properties.total}</strong>
              <Link to="/admin/imoveis">Gerenciar imóveis →</Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 rounded border border-line bg-paper p-[18px] lg:block lg:p-7 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
              <span>Contatos recebidos</span>
              <strong className="m-0 block font-display text-[28px] text-ink lg:my-[18px] lg:mb-2 lg:text-[38px]">{data.leads.total}</strong>
              <Link to={routes.contacts}>Ver oportunidades →</Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 rounded border border-line bg-paper p-[18px] lg:block lg:p-7 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
              <span>Sua vitrine está pronta</span>
              <strong className="m-0 block font-display text-[28px] text-ink lg:my-[18px] lg:mb-2 lg:text-[38px]">↗</strong>
              <Link to={routes.home}>Explorar o site público</Link>
            </div>
          </section>
          <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
            <h2 className="mb-6 mt-0 text-[22px] text-ink">Contatos recentes</h2>
            {data.leads.items.length === 0 ? (
              <p className="px-5 py-10 text-center text-muted">Os novos contatos aparecerão aqui.</p>
            ) : (
              <div className="overflow-x-auto overscroll-contain">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Contato</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Telefone</th>
                      <th className="border-b border-line px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted max-lg:px-2 max-lg:py-3">Recebido em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leads.items.map((lead) => (
                      <tr key={lead.id}>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">
                          <strong>{lead.leadName}</strong>
                          <small className="mt-1 block text-muted">{lead.leadEmail}</small>
                        </td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">{lead.leadPhone}</td>
                        <td className="border-b border-line px-3 py-[18px] align-middle max-lg:px-2 max-lg:py-3">{date(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
