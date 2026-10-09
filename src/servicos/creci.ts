import { z } from 'zod';

/** Mesma regra do DTO da API: números seguidos de um único J ou F opcional, só no final. */
const CRECI = /^\d+[JF]?$/;
export const MENSAGEM_CRECI = 'Use somente números, com J ou F opcional no final. Ex.: 15776F.';

/** Texto ainda em digitação: vazio, só números ou números com o sufixo J/F. */
export const creciParcial = (valor: string): boolean => /^\d*[JF]?$/i.test(valor);

/** Campo de formulário: vazio, CRECI válido ou o valor legado ainda não editado (`Teste`), que a API preserva se omitido. */
export const esquemaCreci = (legado: () => string) => z.string().max(50, 'Use até 50 caracteres.')
  .refine((valor) => valor === legado() || !valor.trim() || CRECI.test(valor.trim().toUpperCase()), MENSAGEM_CRECI);

/** Valor enviado: maiúsculo, vazio vira null; igual ao inicial vira undefined para o PATCH manter o registro. */
export function creciParaEnvio(valor: string, inicial?: string | null): string | null | undefined {
  if (inicial !== undefined && valor === (inicial ?? '')) return undefined;
  return valor.trim().toUpperCase() || null;
}
