import { ErroApi } from './http';

export function idRegistro(parametro?: string): number | null {
  if (!parametro || !/^[1-9]\d*$/.test(parametro)) return null;
  const id = Number(parametro);
  return Number.isSafeInteger(id) ? id : null;
}

/** Ausência/permissão são estado indisponível; indisponibilidade do serviço conserva retry. */
export async function consultarRegistroDisponivel<T>(consultar: () => Promise<T>): Promise<T | null> {
  try { return await consultar(); }
  catch (erro) {
    if (erro instanceof ErroApi && (erro.status === 403 || erro.status === 404)) return null;
    throw erro;
  }
}
