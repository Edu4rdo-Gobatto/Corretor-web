import type { ValoresImovel } from './esquemaImovel';

const textos = ['titulo', 'tipo_id', 'finalidade_id', 'status', 'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'descricao', 'corretor_id', 'exclusividade_ate', 'data_captacao', 'chaves', 'matricula', 'inscricao_municipal', 'observacoes_internas', 'motivo_baixa'] as const;
const numeros = ['valor_venda', 'valor_locacao', 'valor_condominio', 'valor_iptu', 'area_util', 'area_total'] as const;
const booleanos = ['destaque', 'exclusividade'] as const;
type Armazenamento = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type ResultadoRascunho = 'salvo' | 'grande_demais' | 'cota' | 'indisponivel';

export const chaveRascunho = (corretorId: number | string, imovelId?: string) => `corretor:rascunho-imovel:v2:${corretorId}:${imovelId ?? 'novo'}`;

/** Restaura só campos conhecidos do formulário; nunca senhas ou dados de outra tela. */
export function lerRascunho(armazenamento: Armazenamento, chave: string): Partial<ValoresImovel> | null {
  try {
    const bruto: unknown = JSON.parse(armazenamento.getItem(chave) ?? 'null');
    if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return null;
    const origem = bruto as Record<string, unknown>;
    const rascunho: Record<string, unknown> = {};
    for (const campo of textos) if (typeof origem[campo] === 'string') rascunho[campo] = origem[campo];
    for (const campo of numeros) if (typeof origem[campo] === 'number' || origem[campo] === null) rascunho[campo] = origem[campo];
    for (const campo of booleanos) if (typeof origem[campo] === 'boolean') rascunho[campo] = origem[campo];
    const proprietario = origem.proprietario;
    if (proprietario === null) rascunho.proprietario = null;
    if (proprietario && typeof proprietario === 'object' && typeof (proprietario as { id?: unknown }).id === 'number' && typeof (proprietario as { nome?: unknown }).nome === 'string') rascunho.proprietario = proprietario;
    if (Array.isArray(origem.caracteristicas)) {
      rascunho.caracteristicas = origem.caracteristicas
        .filter((item: unknown) => item && typeof item === 'object' && typeof (item as { caracteristica_id?: unknown }).caracteristica_id === 'string' && typeof (item as { valor?: unknown }).valor === 'string')
        .slice(0, 100);
    }
    return Object.keys(rascunho).length ? rascunho as Partial<ValoresImovel> : null;
  } catch {
    return null;
  }
}

export function gravarRascunho(armazenamento: Armazenamento, chave: string, valores: Partial<ValoresImovel>): ResultadoRascunho {
  if (valores.caracteristicas && (valores.caracteristicas.length > 100 || valores.caracteristicas.some((item) => item.valor.length > 500))) return 'grande_demais';
  try {
    const rascunho: Record<string, unknown> = {};
    for (const campo of [...textos, ...numeros, ...booleanos]) if (valores[campo] !== undefined) rascunho[campo] = valores[campo];
    if (valores.proprietario !== undefined) rascunho.proprietario = valores.proprietario;
    if (valores.caracteristicas) rascunho.caracteristicas = valores.caracteristicas;
    armazenamento.setItem(chave, JSON.stringify(rascunho));
    return 'salvo';
  } catch (erro) {
    const nome = erro && typeof erro === 'object' && 'name' in erro ? (erro as { name?: unknown }).name : undefined;
    return nome === 'QuotaExceededError' || nome === 'NS_ERROR_DOM_QUOTA_REACHED' ? 'cota' : 'indisponivel';
  }
}

export function limparRascunho(armazenamento: Armazenamento, chave: string) {
  try { armazenamento.removeItem(chave); } catch { /* armazenamento bloqueado não impede o salvamento */ }
}
