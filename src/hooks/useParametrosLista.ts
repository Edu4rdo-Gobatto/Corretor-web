import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type Validos<T> = { [K in keyof T]?: readonly string[] };

/**
 * Guarda filtros textuais e a página na query string. Filtros trocam a entrada do histórico (`replace`);
 * a página entra no histórico. Valores fora de `validos` voltam ao padrão, e o padrão não aparece na URL.
 */
export function useParametrosLista<T extends Record<string, string>>(padrao: T, validos: Validos<T> = {}) {
  const [parametros, setParametros] = useSearchParams();
  const chaves = Object.keys(padrao) as (keyof T & string)[];

  const filtros = useMemo(() => {
    const atual = { ...padrao };
    for (const chave of chaves) {
      const valor = parametros.get(chave);
      if (valor === null) continue;
      const permitidos = validos[chave];
      if (!permitidos || permitidos.includes(valor)) (atual as Record<string, string>)[chave] = valor;
    }
    return atual;
    // padrao e validos são constantes de módulo nas telas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parametros]);

  const pagina = Math.max(1, Number.parseInt(parametros.get('pagina') ?? '', 10) || 1);

  const definirFiltros = useCallback((valor: T) => {
    setParametros((anterior) => {
      const proximo = new URLSearchParams(anterior);
      for (const chave of chaves) {
        if (valor[chave] && valor[chave] !== padrao[chave]) proximo.set(chave, valor[chave]);
        else proximo.delete(chave);
      }
      proximo.delete('pagina');
      return proximo;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setParametros]);

  const definirPagina = useCallback((numero: number) => {
    setParametros((anterior) => {
      const proximo = new URLSearchParams(anterior);
      if (numero > 1) proximo.set('pagina', String(numero)); else proximo.delete('pagina');
      return proximo;
    });
  }, [setParametros]);

  return { filtros, pagina, definirFiltros, definirPagina };
}
