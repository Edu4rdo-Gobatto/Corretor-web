import { Link } from 'react-router-dom';
import { IconeSetaEsquerda } from './Icones';

/** Botão único de voltar das telas: seta em círculo, rótulo só para leitores de tela. */
export default function BotaoVoltar({ to, rotulo }: { to: string; rotulo: string }) {
  return (
    <Link to={to} aria-label={rotulo} title={rotulo}
      className="inline-grid size-11 shrink-0 place-items-center justify-self-start rounded-full border border-line bg-soft text-brand no-underline shadow-sm transition duration-150 hover:-translate-x-0.75 hover:border-gold hover:bg-gold hover:text-navy-deep focus-visible:border-acao-painel-hover motion-reduce:transform-none motion-reduce:transition-none">
      <IconeSetaEsquerda size={22} aria-hidden="true" />
    </Link>
  );
}
