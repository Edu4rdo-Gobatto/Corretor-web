import { routes } from '../../services/urls';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { date } from '../../services/format';
import AsyncState from '../../components/AsyncState';
import { useAdminData } from './useAdminData';

const loadProperties = () => api.listProperties({ page: 1, limit: 1, active: true }, true);
const statuses = ['DISPONIVEL', 'RESERVADO', 'CONCLUIDO'] as const;
const statusLabels = ['Disponíveis', 'Reservados', 'Concluídos'];
const statusLoaders = statuses.map(status => () => api.listProperties({ page: 1, limit: 1, active: true, status }, true));
const loadLeases = () => api.listLeases({ pagina: 1, limite: 1, status: 'ATIVO', ativo: true });
const loadLeads = () => api.listLeads({ page: 1, limit: 5, active: true, createdFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() });
const cents = (value: string) => {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) throw new Error('Valor de comissão inválido.');
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
};
const currency = (value: bigint) => `R$ ${(value / 100n).toLocaleString('pt-BR')},${String(value % 100n).padStart(2, '0')}`;
async function loadCommissions() {
  let pending = 0n;
  let received = 0n;
  let pagina = 1;
  let pages = 1;
  const seen = new Set<string>();
  do {
    const result = await api.listCommissions({ pagina, limite: 100, ativo: true });
    pages = Math.ceil(result.total / result.limite);
    for (const commission of result.itens) {
      if (!commission.ativo || seen.has(commission.id)) continue;
      seen.add(commission.id);
      for (const installment of commission.parcelas) {
        if (!installment.ativo) continue;
        if (installment.status === 'PAGO') received += cents(installment.valor);
        else pending += cents(installment.valor);
      }
    }
    pagina++;
  } while (pagina <= pages);
  return { pending, received };
}

function Metric<T>({ label, loader, children }: { label: string; loader: () => Promise<T>; children: (data: T) => ReactNode }) {
  const { data, loading, error, refresh } = useAdminData(loader);
  return <section aria-label={label} className="rounded border border-line bg-paper p-[18px] lg:p-7">
    <span>{label}</span>
    <AsyncState loading={loading} error={error} retry={refresh} />
    {!loading && !error && data !== undefined && children(data)}
  </section>;
}

export default function Dashboard() {
  const { agent } = useAuth();
  const leads = useAdminData(loadLeads);
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
      <section className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5">
        <Metric label="Imóveis no portfólio" loader={loadProperties}>{data => <><strong className="my-3 block text-[28px] text-ink">{data.total}</strong><Link to="/admin/imoveis">Gerenciar imóveis →</Link></>}</Metric>
        {statusLoaders.map((loader, index) => <Metric key={statuses[index]} label={statusLabels[index]} loader={loader}>{data => <strong className="my-3 block text-[28px] text-ink">{data.total}</strong>}</Metric>)}
        <Metric label="Contratos ativos" loader={loadLeases}>{data => <><strong className="my-3 block text-[28px] text-ink">{data.total}</strong><Link to="/admin/contratos">Ver contratos →</Link></>}</Metric>
        <Metric label="Comissões" loader={loadCommissions}>{data => <><p>Valor pendente: {currency(data.pending)}</p><p>Valor recebido: {currency(data.received)}</p><Link to="/admin/comissoes">Ver financeiro →</Link></>}</Metric>
        <section aria-label="Contatos recebidos nos últimos 30 dias" className="rounded border border-line bg-paper p-[18px] lg:p-7">
          <span>Contatos recebidos nos últimos 30 dias</span>
          <AsyncState loading={leads.loading} error={leads.error} retry={leads.refresh} />
          {!leads.loading && !leads.error && leads.data && <strong className="my-3 block text-[28px] text-ink">{leads.data.total}</strong>}
          <Link to={routes.contacts}>Ver oportunidades →</Link>
        </section>
            <div className="flex flex-wrap items-center gap-5 rounded border border-line bg-paper p-[18px] lg:block lg:p-7 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
              <span>Sua vitrine está pronta</span>
              <strong className="m-0 block font-display text-[28px] text-ink lg:my-[18px] lg:mb-2 lg:text-[38px]">↗</strong>
              <Link to={routes.home}>Explorar o site público</Link>
            </div>
          </section>
          {!leads.loading && !leads.error && leads.data && <section className="mb-6 rounded border border-line bg-paper p-5 lg:p-7">
            <h2 className="mb-6 mt-0 text-[22px] text-ink">Contatos recentes — últimos 30 dias</h2>
            {leads.data.items.length === 0 ? (
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
                    {leads.data.items.map((lead) => (
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
          </section>}
    </>
  );
}
