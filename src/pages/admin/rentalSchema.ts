import { z } from 'zod';

export const civilDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.').refine(value => {
  const date = new Date(`${value}T12:00:00Z`);
  return !value.startsWith('0000') && Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}, 'Informe uma data válida.');
export const displayDate = (value: string) => value ? value.slice(0, 10).split('-').reverse().join('/') : 'Não informado';
export const displayMoney = (value: string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function normalizeMoney(value: string): string {
  let number = value.trim();
  if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(number)) number = number.replaceAll('.', '');
  number = number.replace(',', '.');
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(number)) return value;
  const [integer, decimals = ''] = number.split('.');
  return `${BigInt(integer)}.${decimals.padEnd(2, '0')}`;
}
const money = z.string().transform(normalizeMoney).refine(value => /^(?:0|[1-9]\d{0,9})\.\d{2}$/.test(value), 'Informe um valor com até 2 casas decimais.');
const positiveMoney = money.refine(value => /^\d+\.\d{2}$/.test(value) && BigInt(value.replace('.', '')) > 0n, 'Informe um valor positivo.');
const optionalDate = z.union([z.literal(''), civilDate]);
const text = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);
const documentValid = (value: string) => {
  if (!/^\d{11}$|^\d{14}$/.test(value) || /^(\d)\1+$/.test(value)) return false;
  const digits = [...value].map(Number);
  for (let position = digits.length - 2; position < digits.length; position++) {
    let sum = 0;
    for (let index = 0; index < position; index++) sum += digits[index] * (digits.length === 11 ? position + 1 - index : (position - 1 - index) % 8 + 2);
    const remainder = sum % 11;
    if (digits[position] !== (remainder < 2 ? 0 : 11 - remainder)) return false;
  }
  return true;
};
const phoneValid = (value: string) => {
  if (!value) return true;
  if (!/^[+\d() .-]+$/.test(value)) return false;
  let number = value.replace(/\D/g, '');
  if ((number.length === 12 || number.length === 13) && number.startsWith('55')) number = number.slice(2);
  return /^[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(number);
};
export const partySchema = z.object({
  papel: z.enum(['LOCADOR', 'LOCATARIO']), tipo_pessoa: z.enum(['PF', 'PJ']), nome: text(200).min(2, 'Informe o nome.'),
  cpf_cnpj: z.string().transform(value => value.replace(/[.\-/ ]/g, '')).refine(documentValid, 'Informe um CPF ou CNPJ válido.'),
  email: z.union([z.literal(''), z.email('Informe um e-mail válido.').max(254)]), telefone: text(30).refine(phoneValid, 'Informe DDD e telefone válido.'),
  endereco: text(1000), data_nascimento: optionalDate, banco_nome: text(150), banco_agencia: text(40), banco_conta: text(80), chave_pix: text(254), observacoes: text(10000), ativo: z.boolean(),
}).superRefine((value, ctx) => {
  if (value.cpf_cnpj.length !== (value.tipo_pessoa === 'PF' ? 11 : 14)) ctx.addIssue({ code: 'custom', path: ['cpf_cnpj'], message: 'O documento deve corresponder ao tipo de pessoa.' });
  if (value.data_nascimento && (value.tipo_pessoa !== 'PF' || value.data_nascimento > new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Cuiaba' }).format(new Date()))) ctx.addIssue({ code: 'custom', path: ['data_nascimento'], message: 'Use uma data de nascimento passada e apenas para pessoa física.' });
});
export const leaseSchema = z.object({
  numero_contrato: text(100).min(3).regex(/^[\p{L}\p{N}._-]+$/u, 'Use letras, números, ponto, hífen ou sublinhado.'),
  imovel_id: z.uuid('Selecione um imóvel.'), locador_id: z.uuid('Selecione um proprietário.'), locatario_id: z.uuid('Selecione um inquilino.'), corretor_id: z.uuid('Selecione um intermediador.'),
  data_inicio: civilDate, data_fim: civilDate, valor_aluguel: positiveMoney, dia_vencimento: z.number().int().min(1).max(31),
  taxa_administracao: money.refine(value => /^\d+\.\d{2}$/.test(value) && BigInt(value.replace('.', '')) <= 10000n, 'A taxa deve estar entre 0 e 100%.'),
  garantia_locaticia: text(1000).min(2, 'Informe a garantia.'), indice_reajuste: text(150).min(2, 'Informe o índice.'), cobranca_iptu_condominio: text(1000).min(2, 'Informe a forma de pagamento.'),
  status: z.enum(['ATIVO', 'INATIVO']), ativo: z.boolean(), observacoes: text(10000),
}).refine(value => value.data_fim >= value.data_inicio, { path: ['data_fim'], message: 'A data final deve ser igual ou posterior ao início.' });
export const commissionSchema = z.object({
  tipo_operacao: z.enum(['LOCACAO', 'VENDA']), contrato_id: z.union([z.literal(''), z.uuid()]), imovel_id: z.uuid('Selecione um imóvel.'), cliente_id: z.uuid('Selecione um cliente.'),
  valor_total: positiveMoney, quantidade_parcelas: z.number().int().min(1).max(600), primeiro_vencimento: civilDate, observacoes: text(10000),
}).superRefine((value, ctx) => {
  if ((value.tipo_operacao === 'LOCACAO') !== Boolean(value.contrato_id)) ctx.addIssue({ code: 'custom', path: ['contrato_id'], message: value.tipo_operacao === 'LOCACAO' ? 'Selecione o contrato de locação.' : 'Venda não usa contrato de locação.' });
  if (/^\d+\.\d{2}$/.test(value.valor_total) && Number.isInteger(value.quantidade_parcelas) && BigInt(value.valor_total.replace('.', '')) < BigInt(value.quantidade_parcelas)) ctx.addIssue({ code: 'custom', path: ['quantidade_parcelas'], message: 'Cada parcela deve valer pelo menos um centavo.' });
  if (civilDate.safeParse(value.primeiro_vencimento).success && Number(value.primeiro_vencimento.slice(0, 4)) + Math.floor((Number(value.primeiro_vencimento.slice(5, 7)) - 1 + value.quantidade_parcelas - 1) / 12) > 9999) ctx.addIssue({ code: 'custom', path: ['primeiro_vencimento'], message: 'O último vencimento ultrapassa o intervalo de datas permitido.' });
});
export const paymentSchema = z.object({ confirmar_pagamento: z.boolean().refine(value => value, 'Confirme que o pagamento foi recebido.'), observacao_pagamento: text(2000).min(5, 'Informe a referência do comprovante, com pelo menos 5 caracteres.') });
export const commissionEditSchema = z.object({ ativo: z.boolean(), observacoes: text(10000) });
export function installmentPreview(total: string, count: number, first: string): { valor: string; data: string }[] {
  const normalized = normalizeMoney(total);
  if (!/^\d{1,10}\.\d{2}$/.test(normalized) || !Number.isInteger(count) || count < 1 || count > 600 || !civilDate.safeParse(first).success) return [];
  const cents = BigInt(normalized.replace('.', ''));
  if (cents < BigInt(count)) return [];
  const [year, month, day] = first.split('-').map(Number);
  if(year+Math.floor((month-1+count-1)/12)>9999)return [];
  return Array.from({ length: count }, (_, index) => {
    const amount = cents / BigInt(count) + (BigInt(index) < cents % BigInt(count) ? 1n : 0n);
    const date = new Date(`${first}T12:00:00Z`);
    date.setUTCDate(1); date.setUTCFullYear(year, month - 1 + index + 1, 0);
    date.setUTCDate(Math.min(day, date.getUTCDate()));
    return { valor: `${amount / 100n}.${String(amount % 100n).padStart(2, '0')}`, data: date.toISOString().slice(0, 10) };
  });
}
export type RentalPartyInput = z.infer<typeof partySchema>;
export type LeaseInput = z.infer<typeof leaseSchema>;
export type CommissionInput = z.infer<typeof commissionSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type RentalParty = RentalPartyInput & { id: string };
export type Lease = LeaseInput & { id: string; url_pasta_drive: string | null; status_pasta_drive: 'PENDENTE' | 'CRIADA' | 'FALHOU'; imovel_titulo?: string; locador_nome?: string; locatario_nome?: string };
export interface CommissionInstallment { id: string; numero_parcela: number; data_vencimento: string; valor: string; status: 'PENDENTE' | 'PAGO' | 'ATRASADO'; pago_em: string | null; observacao_pagamento: string | null; ativo: boolean }
export interface Commission { id: string; tipo_operacao: 'LOCACAO' | 'VENDA'; contrato_id: string | null; imovel_id: string; cliente_id: string; valor_total: string; quantidade_parcelas: number; observacoes: string | null; ativo: boolean; parcelas: CommissionInstallment[]; valor_pago?: string; saldo_pendente?: string }
export interface RentalPage<T> { itens: T[]; total: number; pagina: number; limite: number }
export interface RentalOption { id: string; nome: string; corretor_id?: string; imovel_id?: string | null }
