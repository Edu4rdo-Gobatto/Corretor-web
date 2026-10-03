import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';

type Controle = { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean };
type Propriedades = { rotulo: string; erro?: string; dica?: ReactNode; obrigatorio?: boolean; classe?: string; children: ReactElement<Controle> };

/** Conecta rótulo, dica e erro ao controle sem substituir a validação do formulário. */
export default function Campo({ rotulo, erro, dica, obrigatorio = false, classe = '', children }: Propriedades) {
  const idGerado = useId();
  const id = children.props.id ?? `campo-${idGerado}`;
  const descricao = [children.props['aria-describedby'], dica ? `${id}-dica` : '', erro ? `${id}-erro` : ''].filter(Boolean).join(' ') || undefined;
  return <div className={`campo ${classe}`}>
    <label htmlFor={id}><span>{rotulo}{obrigatorio && !rotulo.endsWith('*') && <span aria-hidden="true"> *</span>}</span></label>
    {cloneElement(children, { id, 'aria-describedby': descricao, 'aria-invalid': Boolean(erro) || children.props['aria-invalid'] || undefined, 'aria-required': obrigatorio || rotulo.trimEnd().endsWith('*') || children.props['aria-required'] || undefined })}
    {dica && <span id={`${id}-dica`} className="text-sm font-normal text-muted">{dica}</span>}
    {erro && <span id={`${id}-erro`} className="text-sm font-normal text-error">{erro}</span>}
  </div>;
}
