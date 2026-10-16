/**
 * O `Seletor` trabalha com texto; os formulários guardam texto ("12", "MT") ou número (ids de Contratos, com 0 como
 * "nenhum"). Estas duas funções fazem a ida e a volta, e o vazio sempre vira `''` no seletor.
 */
export function valorDoCampo(valor: unknown, numerico = false): string {
  if (valor === null || valor === undefined) return '';
  if (numerico) return typeof valor === 'number' && Number.isFinite(valor) && valor !== 0 ? String(valor) : '';
  return String(valor);
}

export function valorParaCampo(texto: string, numerico = false): string | number {
  if (!numerico) return texto;
  return texto === '' ? 0 : Number(texto);
}
