import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type Validos<T> = { [K in keyof T]?: readonly string[] };

/**
 * Guarda filtros textuais e a página na query string, sempre com `replace`: o Esc do painel volta pelo histórico
 * (`useVoltarPainel`) e deve sair da lista, não percorrer páginas. Valores fora de `validos` voltam ao padrão, e o
 * padrão não aparece na URL. `definirFiltros` só mexe nas chaves recebidas.
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

  const definirFiltros = useCallback((valor: Partial<T>) => {
    setParametros((anterior) => {
      const proximo = new URLSearchParams(anterior);
      for (const chave of chaves) {
        if (!(chave in valor)) continue;
        const novo = valor[chave];
        if (novo && novo !== padrao[chave]) proximo.set(chave, novo);
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
    }, { replace: true });
  }, [setParametros]);

  return { filtros, pagina, definirFiltros, definirPagina };
}
