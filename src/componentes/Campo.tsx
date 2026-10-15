import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';
import { IconeErro } from './Icones';

type Controle = { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean };
type Propriedades = { rotulo: string; erro?: string; dica?: ReactNode; obrigatorio?: boolean; classe?: string; children: ReactElement<Controle> };

/** Ícone de erro dentro do campo; o motivo aparece ao passar o mouse e o texto completo fica para leitores de tela. */
export function IconeErroCampo({ erro, classe = '' }: { erro: string; classe?: string }) {
  return <span className={`campo-icone-erro ${classe}`} title={erro}><IconeErro size={22} /></span>;
}

/** Conecta rótulo, dica e erro ao controle sem substituir a validação do formulário. O erro é só borda e ícone. */
export default function Campo({ rotulo, erro, dica, obrigatorio = false, classe = '', children }: Propriedades) {
  const idGerado = useId();
  const id = children.props.id ?? `campo-${idGerado}`;
  const descricao = [children.props['aria-describedby'], dica ? `${id}-dica` : '', erro ? `${id}-erro` : ''].filter(Boolean).join(' ') || undefined;
  return <div className={`campo ${classe}`}>
    <label htmlFor={id}><span>{rotulo}{obrigatorio && !rotulo.endsWith('*') && <span aria-hidden="true"> *</span>}</span></label>
    <div className="campo-controle">
      {cloneElement(children, { id, 'aria-describedby': descricao, 'aria-invalid': Boolean(erro) || children.props['aria-invalid'] || undefined, 'aria-required': obrigatorio || rotulo.trimEnd().endsWith('*') || children.props['aria-required'] || undefined })}
      {erro && <IconeErroCampo erro={erro} />}
    </div>
    {dica && <span id={`${id}-dica`} className="campo-dica">{dica}</span>}
    {erro && <span id={`${id}-erro`} className="srOnly">{erro}</span>}
  </div>;
}
