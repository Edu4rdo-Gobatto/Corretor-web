import { useCallback, useEffect, useState } from 'react';
import { mensagemErro } from '../servicos/formato';

/** Carrega dados autenticados do painel com recarga explícita. */
export function useDadosPainel<T>(carregar: () => Promise<T>) {
  const [dados, setDados] = useState<T>();
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((atual) => atual + 1), []);
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    carregar()
      .then((valor) => { if (ativo) setDados(valor); })
      .catch((motivo) => { if (ativo) setErro(mensagemErro(motivo)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [carregar, versao]);
  return { dados, carregando, erro, recarregar };
}
