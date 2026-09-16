import type { Lead } from '../types';

export function csvCell(value: string): string {
  // Prefix before whitespace too: spreadsheet readers may trim it before evaluating.
  const safe = /^\s*[=+\-@]/u.test(value) || /^\s*[\t\r\n]/u.test(value)
    ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function leadsCsv(leads: readonly Lead[]): string {
  const rows = [
    ['Nome', 'Telefone', 'E-mail', 'Imóvel', 'Mensagem', 'Origem', 'Recebido em'],
    ...leads.map(lead => [lead.leadName, lead.leadPhone, lead.leadEmail || '', lead.propertyId || '', lead.message || '', lead.origin || '', lead.createdAt]),
  ];
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadLeadsCsv(leads: readonly Lead[], page: number): void {
  const url = URL.createObjectURL(new Blob([leadsCsv(leads)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `contatos-pagina-${page}.csv`;
  document.body.appendChild(link);
  try { link.click(); }
  finally {
    link.remove();
    // Allow the browser to consume the object URL before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
