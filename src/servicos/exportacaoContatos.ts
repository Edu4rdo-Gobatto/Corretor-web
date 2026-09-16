import type { Pessoa } from '../tipos';

export function celulaCsv(valor: string): string {
  // Também neutraliza depois de espaços: planilhas removem o espaço antes de avaliar a fórmula.
  const seguro = /^\s*[=+\-@]/u.test(valor) || /^\s*[\t\r\n]/u.test(valor) ? `'${valor}` : valor;
  return `"${seguro.replace(/"/g, '""')}"`;
}

export function csvContatos(pessoas: readonly Pessoa[]): string {
  const linhas = [
    ['Nome', 'Telefone', 'E-mail', 'Imóvel', 'Mensagem', 'Origem', 'Situação', 'Recebido em'],
    ...pessoas.map((pessoa) => [pessoa.nome, pessoa.telefone || '', pessoa.email || '', pessoa.imovel_id === null ? '' : String(pessoa.imovel_id), pessoa.mensagem || '', pessoa.origem, pessoa.status_contato, pessoa.criado_em]),
  ];
  return '﻿' + linhas.map((linha) => linha.map(celulaCsv).join(',')).join('\r\n');
}

export function baixarCsvContatos(pessoas: readonly Pessoa[], nome: string): void {
  const url = URL.createObjectURL(new Blob([csvContatos(pessoas)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `contatos-${nome}.csv`;
  document.body.appendChild(link);
  try { link.click(); }
  finally {
    link.remove();
    // O navegador precisa consumir a URL antes de ela ser liberada.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
