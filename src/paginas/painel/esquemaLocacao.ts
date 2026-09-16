import { z } from 'zod';
import { normalizarDecimal } from '../../servicos/formato';

export const dataCivil = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.').refine((valor) => {
  const data = new Date(`${valor}T12:00:00Z`);
  return !valor.startsWith('0000') && Number.isFinite(data.valueOf()) && data.toISOString().slice(0, 10) === valor;
}, 'Informe uma data válida.');
const dinheiro = z.string().transform(normalizarDecimal).refine((valor) => /^(?:0|[1-9]\d{0,9})\.\d{2}$/.test(valor), 'Informe um valor com até 2 casas decimais.');
const dinheiroPositivo = dinheiro.refine((valor) => /^\d+\.\d{2}$/.test(valor) && BigInt(valor.replace('.', '')) > 0n, 'Informe um valor positivo.');
const texto = (maximo: number) => z.string().trim().max(maximo, `Use no máximo ${maximo} caracteres.`);
const id = (mensagem: string) => z.number({ error: mensagem }).int().positive(mensagem);

export const esquemaContrato = z.object({
  numero_contrato: texto(100).min(3, 'Informe o número do contrato.').regex(/^[\p{L}\p{N}._-]+$/u, 'Use letras, números, ponto, hífen ou sublinhado.'),
  imovel_id: id('Selecione um imóvel.'), locador_id: id('Selecione o proprietário.'), locatario_id: id('Selecione o inquilino.'), corretor_id: id('Selecione o intermediador.'),
  data_inicio: dataCivil, data_fim: dataCivil, valor_aluguel: dinheiroPositivo, dia_vencimento: z.number().int().min(1).max(31),
  taxa_administracao: dinheiro.refine((valor) => /^\d+\.\d{2}$/.test(valor) && BigInt(valor.replace('.', '')) <= 10000n, 'A taxa deve estar entre 0 e 100%.'),
  garantia_locaticia: texto(1000).min(2, 'Informe a garantia.'), indice_reajuste: texto(150).min(2, 'Informe o índice.'), cobranca_iptu_condominio: texto(1000).min(2, 'Informe a forma de pagamento.'),
  status: z.enum(['ATIVO', 'INATIVO']), ativo: z.boolean(), observacoes: texto(10000),
}).refine((valores) => valores.data_fim >= valores.data_inicio, { path: ['data_fim'], message: 'A data final deve ser igual ou posterior ao início.' });
export type ValoresContrato = z.infer<typeof esquemaContrato>;

export const esquemaComissao = z.object({
  tipo_operacao: z.enum(['LOCACAO', 'VENDA']), contrato_id: z.number().int().positive().nullable(), imovel_id: id('Selecione um imóvel.'), pessoa_id: id('Selecione a pessoa.'),
  valor_total: dinheiroPositivo, quantidade_parcelas: z.number().int().min(1).max(600), primeiro_vencimento: dataCivil, observacoes: texto(10000),
}).superRefine((valores, contexto) => {
  if ((valores.tipo_operacao === 'LOCACAO') !== (valores.contrato_id !== null)) contexto.addIssue({ code: 'custom', path: ['contrato_id'], message: valores.tipo_operacao === 'LOCACAO' ? 'Selecione o contrato de locação.' : 'Venda não usa contrato de locação.' });
  if (/^\d+\.\d{2}$/.test(valores.valor_total) && BigInt(valores.valor_total.replace('.', '')) < BigInt(valores.quantidade_parcelas)) contexto.addIssue({ code: 'custom', path: ['quantidade_parcelas'], message: 'Cada parcela deve valer pelo menos um centavo.' });
  if (dataCivil.safeParse(valores.primeiro_vencimento).success && Number(valores.primeiro_vencimento.slice(0, 4)) + Math.floor((Number(valores.primeiro_vencimento.slice(5, 7)) - 1 + valores.quantidade_parcelas - 1) / 12) > 9999) contexto.addIssue({ code: 'custom', path: ['primeiro_vencimento'], message: 'O último vencimento ultrapassa o intervalo de datas permitido.' });
});
export type ValoresComissao = z.infer<typeof esquemaComissao>;

export const esquemaPagamento = z.object({ confirmar_pagamento: z.boolean().refine((valor) => valor, 'Confirme que o pagamento foi recebido.'), observacao_pagamento: texto(2000).min(5, 'Informe a referência do comprovante, com pelo menos 5 caracteres.') });
export const esquemaEdicaoComissao = z.object({ ativo: z.boolean(), observacoes: texto(10000) });

/** Prévia das parcelas com centavos distribuídos nas primeiras e vencimento mensal ajustado ao fim do mês. */
export function previaParcelas(total: string, quantidade: number, primeira: string): { valor: string; data: string }[] {
  const normalizado = normalizarDecimal(total);
  if (!/^\d+\.\d{2}$/.test(normalizado) || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 600 || !dataCivil.safeParse(primeira).success) return [];
  const centavos = BigInt(normalizado.replace('.', ''));
  if (centavos < BigInt(quantidade)) return [];
  const base = centavos / BigInt(quantidade);
  const resto = centavos % BigInt(quantidade);
  const [ano, mes, dia] = primeira.split('-').map(Number);
  return Array.from({ length: quantidade }, (_, indice) => {
    const valor = base + (BigInt(indice) < resto ? 1n : 0n);
    const ultimo = new Date(Date.UTC(ano, mes - 1 + indice + 1, 0));
    const data = new Date(Date.UTC(ultimo.getUTCFullYear(), ultimo.getUTCMonth(), Math.min(dia, ultimo.getUTCDate())));
    return { valor: `${valor / 100n}.${String(valor % 100n).padStart(2, '0')}`, data: data.toISOString().slice(0, 10) };
  });
}
