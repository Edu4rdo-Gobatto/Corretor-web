import { useCallback, useEffect, useState } from 'react';
import { mensagemErro } from '../servicos/formato';

/** Carrega um recurso público; o valor inicial vem do SSR e evita a primeira busca no cliente. */
export function useRecurso<T>(carregar: () => Promise<T>, valorInicial?: T) {
  const [valor, setValor] = useState<T | undefined>(valorInicial);
  const [carregando, setCarregando] = useState(valorInicial === undefined);
  const [erro, setErro] = useState('');
  const [statusErro, setStatusErro] = useState(0);
  const [tentativa, setTentativa] = useState(0);
  const tentarNovamente = useCallback(() => setTentativa((atual) => atual + 1), []);
  useEffect(() => {
    if (valorInicial !== undefined && tentativa === 0) return;
    let ativo = true;
    setCarregando(true); setErro(''); setStatusErro(0);
    carregar()
      .then((resultado) => { if (ativo) setValor(resultado); })
      .catch((motivo: { status?: number }) => { if (ativo) { setErro(mensagemErro(motivo)); setStatusErro(motivo?.status === 404 ? 404 : 503); } })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [carregar, tentativa, valorInicial]);
  return { valor, carregando, erro, statusErro, tentarNovamente };
}
