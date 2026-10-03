import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemErro } from '../servicos/formato';

/** Carrega dados autenticados do painel com recarga explícita; respostas de consultas antigas são descartadas. */
export function useDadosPainel<T>(carregar: () => Promise<T>) {
  const [dados, setDados] = useState<T>();
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);
  const sequencia = useRef(0);
  const recarregar = useCallback(() => setVersao((atual) => atual + 1), []);
  useEffect(() => {
    const atual = ++sequencia.current;
    let ativo = true;
    setCarregando(true);
    setErro('');
    carregar()
      .then((valor) => { if (ativo && sequencia.current === atual) setDados(valor); })
      .catch((motivo) => { if (ativo && sequencia.current === atual) setErro(mensagemErro(motivo)); })
      .finally(() => { if (ativo && sequencia.current === atual) setCarregando(false); });
    return () => { ativo = false; };
  }, [carregar, versao]);
  return { dados, carregando, erro, recarregar };
}
