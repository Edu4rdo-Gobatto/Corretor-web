import { Link } from 'react-router-dom';
import { IconeAdicionar } from './Icones';

type Propriedades = { rotulo: string; to?: string; aoClicar?: () => void; desabilitado?: boolean; classe?: string };

/**
 * Botão de criar dos cabeçalhos do painel: "+ Rótulo" no desktop e só o "+" abaixo de `lg` (onde o painel vira
 * layout de celular). Sem dica: o rótulo continua no DOM como texto só para leitores de tela.
 */
export default function BotaoAdicionar({ rotulo, to, aoClicar, desabilitado = false, classe = '' }: Propriedades) {
  const className = `button max-lg:min-w-12 max-lg:px-0 ${classe}`;
  const conteudo = <><IconeAdicionar size={20} aria-hidden="true" /><span className="max-lg:sr-only">{rotulo}</span></>;
  return to
    ? <Link className={className} to={to} onClick={aoClicar}>{conteudo}</Link>
    : <button type="button" className={className} disabled={desabilitado} onClick={aoClicar}>{conteudo}</button>;
}
