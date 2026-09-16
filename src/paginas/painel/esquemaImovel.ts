import { z } from 'zod';
import type { DadosImovel } from '../../servicos/api';
import type { FichaImovel } from '../../tipos';

export const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'] as const;
const duasCasas = (valor: number) => Math.abs(valor * 100 - Math.round(valor * 100)) < 0.001;
const decimal = (minimo: number, maximo: number) => z.number({ error: 'Informe um número válido.' }).min(minimo, `O mínimo é ${minimo}.`).max(maximo, 'Valor acima do limite.').refine(duasCasas, 'Use até duas casas decimais.');
const dataOpcional = z.union([z.literal(''), z.iso.date('Informe uma data válida.')]);
const texto = (maximo: number) => z.string().trim().max(maximo, `Use no máximo ${maximo} caracteres.`);

export const esquemaImovel = z.object({
  titulo: z.string().trim().min(3, 'Use pelo menos 3 caracteres.').max(200),
  tipo_id: z.string().min(1, 'Selecione um tipo.'),
  finalidade_id: z.string().min(1, 'Selecione uma finalidade.'),
  status: z.enum(['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO', 'RETIRADO']),
  destaque: z.boolean(),
  valor_venda: decimal(0, 9999999999.99).nullable(),
  valor_locacao: decimal(0, 9999999999.99).nullable(),
  valor_condominio: decimal(0, 99999999.99).nullable(),
  valor_iptu: decimal(0, 99999999.99).nullable(),
  area_util: decimal(0.01, 99999999.99),
  area_total: decimal(0.01, 99999999.99),
  cep: z.string().regex(/^(?:\d{5}-?\d{3})?$/, 'Informe um CEP válido.'),
  logradouro: z.string().trim().min(1, 'Informe a rua.').max(200),
  numero: z.string().trim().min(1, 'Informe o número.').max(30),
  complemento: texto(200),
  bairro: z.string().trim().min(1, 'Informe o bairro.').max(100),
  cidade: z.string().trim().min(1, 'Informe a cidade.').max(100),
  estado: z.enum(estados),
  descricao: z.string().trim().min(1, 'Descreva o imóvel.').max(20000),
  corretor_id: z.string(),
  proprietario: z.object({ id: z.number(), nome: z.string() }).nullable(),
  exclusividade: z.boolean(),
  exclusividade_ate: dataOpcional,
  data_captacao: dataOpcional,
  chaves: texto(500),
  matricula: texto(100),
  inscricao_municipal: texto(100),
  observacoes_internas: texto(20000),
  motivo_baixa: texto(1000),
  caracteristicas: z.array(z.object({ caracteristica_id: z.string().min(1, 'Selecione uma característica.'), valor: z.string().max(500, 'Use até 500 caracteres.') })).max(100)
    .refine((lista) => new Set(lista.map((item) => item.caracteristica_id)).size === lista.length, 'Não repita características.'),
}).refine((valores) => valores.area_total >= valores.area_util, { path: ['area_total'], message: 'A área total não pode ser menor que a área útil.' });

export type ValoresImovel = z.infer<typeof esquemaImovel>;

export const imovelVazio: ValoresImovel = {
  titulo: '', tipo_id: '', finalidade_id: '', status: 'DISPONIVEL', destaque: false,
  valor_venda: null, valor_locacao: null, valor_condominio: null, valor_iptu: null, area_util: 0, area_total: 0,
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'MT', descricao: '', corretor_id: '',
  proprietario: null, exclusividade: false, exclusividade_ate: '', data_captacao: '', chaves: '', matricula: '', inscricao_municipal: '', observacoes_internas: '', motivo_baixa: '',
  caracteristicas: [],
};

const numeroOuNulo = (valor: string | null) => valor === null ? null : Number(valor);

/** Ficha da API → valores do formulário. */
export function valoresDaFicha(ficha: FichaImovel): ValoresImovel {
  return {
    titulo: ficha.titulo, tipo_id: String(ficha.tipo_id), finalidade_id: String(ficha.finalidade_id), status: ficha.status, destaque: ficha.destaque,
    valor_venda: numeroOuNulo(ficha.valor_venda), valor_locacao: numeroOuNulo(ficha.valor_locacao), valor_condominio: numeroOuNulo(ficha.valor_condominio), valor_iptu: numeroOuNulo(ficha.valor_iptu),
    area_util: Number(ficha.area_util), area_total: Number(ficha.area_total),
    cep: ficha.cep ?? '', logradouro: ficha.logradouro, numero: ficha.numero, complemento: ficha.complemento ?? '', bairro: ficha.bairro, cidade: ficha.cidade,
    estado: estados.includes(ficha.estado as typeof estados[number]) ? ficha.estado as typeof estados[number] : 'MT', descricao: ficha.descricao, corretor_id: String(ficha.corretor_id),
    proprietario: ficha.proprietario, exclusividade: ficha.exclusividade, exclusividade_ate: ficha.exclusividade_ate ?? '', data_captacao: ficha.data_captacao ?? '',
    chaves: ficha.chaves ?? '', matricula: ficha.matricula ?? '', inscricao_municipal: ficha.inscricao_municipal ?? '', observacoes_internas: ficha.observacoes_internas ?? '', motivo_baixa: ficha.motivo_baixa ?? '',
    caracteristicas: ficha.caracteristicas.map((item) => ({ caracteristica_id: String(item.caracteristica_id), valor: item.valor ?? '' })),
  };
}

const decimalTexto = (valor: number | null) => valor === null ? null : valor.toFixed(2);
const textoOuNulo = (valor: string) => valor.trim() || null;

/** Valores do formulário → corpo da API (decimais como texto, vazios como null). */
export function dadosParaApi(valores: ValoresImovel, corretorId?: number): DadosImovel {
  return {
    titulo: valores.titulo, tipo_id: Number(valores.tipo_id), finalidade_id: Number(valores.finalidade_id), status: valores.status, destaque: valores.destaque,
    valor_venda: decimalTexto(valores.valor_venda), valor_locacao: decimalTexto(valores.valor_locacao), valor_condominio: decimalTexto(valores.valor_condominio), valor_iptu: decimalTexto(valores.valor_iptu),
    area_util: valores.area_util.toFixed(2), area_total: valores.area_total.toFixed(2),
    cep: textoOuNulo(valores.cep), logradouro: valores.logradouro, numero: valores.numero, complemento: textoOuNulo(valores.complemento), bairro: valores.bairro, cidade: valores.cidade, estado: valores.estado, descricao: valores.descricao,
    ...(corretorId ? { corretor_id: corretorId } : {}),
    proprietario_id: valores.proprietario?.id ?? null, exclusividade: valores.exclusividade, exclusividade_ate: valores.exclusividade_ate || null, data_captacao: valores.data_captacao || null,
    chaves: textoOuNulo(valores.chaves), matricula: textoOuNulo(valores.matricula), inscricao_municipal: textoOuNulo(valores.inscricao_municipal), observacoes_internas: textoOuNulo(valores.observacoes_internas), motivo_baixa: textoOuNulo(valores.motivo_baixa),
    caracteristicas: valores.caracteristicas.map((item) => ({ caracteristica_id: Number(item.caracteristica_id), valor: item.valor.trim() || null })),
  };
}
