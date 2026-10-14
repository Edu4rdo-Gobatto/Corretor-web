import { useEffect, useRef, useState } from 'react';

type Configuracao<T> = {
  iniciais: T;
  normalizar?: (valor: T) => T;
  validar?: (valor: T) => string;
  aoAplicar: (valor: T, automatico: boolean) => void;
  /** Valor aplicado vindo de fora (ex.: URL). Quando muda sem passar por `aplicar`, o rascunho acompanha. */
  externos?: T;
};

/** Um único rascunho: seleções imediatas, digitação com espera e aplicação sem duplicatas. */
export function useFiltrosAutomaticos<T>({ iniciais, normalizar, validar, aoAplicar, externos }: Configuracao<T>) {
  const [rascunho, setRascunho] = useState(iniciais);
  const [erro, setErro] = useState('');
  const atual = useRef(iniciais);
  const ultima = useRef(JSON.stringify(normalizar ? normalizar(iniciais) : iniciais));
  const temporizador = useRef<ReturnType<typeof setTimeout>>();
  const configuracao = useRef({ normalizar, validar, aoAplicar });
  configuracao.current = { normalizar, validar, aoAplicar };

  function cancelar() { clearTimeout(temporizador.current); temporizador.current = undefined; }
  useEffect(() => cancelar, []);

  function aplicar(valor: T, automatico = true) {
    cancelar();
    const config = configuracao.current;
    const normalizado = config.normalizar ? config.normalizar(valor) : valor;
    const problema = config.validar?.(normalizado) ?? '';
    setErro(problema);
    if (problema) return false;
    const chave = JSON.stringify(normalizado);
    if (chave !== ultima.current) {
      ultima.current = chave;
      config.aoAplicar(normalizado, automatico);
    }
    return true;
  }
  function definir(valor: T, imediato = false) {
    cancelar(); atual.current = valor; setRascunho(valor);
    if (imediato) aplicar(valor);
    else temporizador.current = setTimeout(() => aplicar(atual.current), 350);
  }
  function sincronizar(valor: T) {
    cancelar(); atual.current = valor; setRascunho(valor); setErro('');
    ultima.current = JSON.stringify(configuracao.current.normalizar?.(valor) ?? valor);
  }
  const chaveExterna = externos === undefined ? undefined : JSON.stringify(normalizar ? normalizar(externos) : externos);
  useEffect(() => {
    // Link do menu, voltar do navegador ou Limpar por outro caminho: a URL mudou e o rascunho não sabia.
    if (chaveExterna !== undefined && chaveExterna !== ultima.current) sincronizar(externos as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveExterna]);
  return { rascunho, definir, erro, aplicarAgora: (automatico = true) => aplicar(atual.current, automatico), sincronizar };
}
