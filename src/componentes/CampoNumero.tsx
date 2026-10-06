import { forwardRef, useId, useRef, type InputHTMLAttributes } from 'react';

type Propriedades = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'> & { unidade?: string; casasDecimais?: 0 | 2 };

/** Texto decimal preservado no input; conversão só no adaptador da tela, antes do esquema existente. */
function decimalCampo(texto: string, casas: 0 | 2, parcial = false): string | null {
  const valor = texto.trim();
  if (valor === '') return '';
  if (casas === 0) return /^\d+$/.test(valor) ? valor : null;
  if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(valor)) return valor.replaceAll('.', '').replace(',', '.');
  const formato = parcial ? /^(?:\d+(?:[.,]\d{0,2})?|[.,]\d{0,2})$/ : /^(?:\d+(?:[.,]\d{1,2})?|[.,]\d{1,2})$/;
  return formato.test(valor) ? valor.replace(',', '.') : null;
}

export function numeroDoCampo(valor: unknown): number {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : NaN;
  if (typeof valor !== 'string') return NaN;
  const decimal = decimalCampo(valor, 2);
  return decimal !== null && decimal !== '' ? Number(decimal) : NaN;
}

const CampoNumero = forwardRef<HTMLInputElement, Propriedades>(function CampoNumero({ unidade, casasDecimais = 2, onChange, onBeforeInput, onPaste, onKeyDown, onFocus, 'aria-describedby': descricao, ...propriedades }, ref) {
  const idUnidade = useId();
  const anterior = useRef(String(propriedades.value ?? propriedades.defaultValue ?? ''));
  return <div className="campo-numero">
    {unidade && <span id={idUnidade} className="campo-numero-unidade">{unidade}</span>}
    <input {...propriedades} ref={ref} type="text" inputMode={casasDecimais === 0 ? 'numeric' : 'decimal'}
      aria-describedby={[descricao, unidade ? idUnidade : ''].filter(Boolean).join(' ') || undefined}
      onFocus={(evento) => { anterior.current = evento.currentTarget.value; onFocus?.(evento); }}
      onKeyDown={(evento) => {
        if (!evento.ctrlKey && !evento.metaKey && !evento.altKey && !evento.nativeEvent.isComposing && evento.key.length === 1 && !(casasDecimais === 0 ? /^\d$/ : /^[\d.,]$/).test(evento.key)) evento.preventDefault();
        onKeyDown?.(evento);
      }}
      onBeforeInput={(evento) => {
        const nativo = evento.nativeEvent as InputEvent;
        if (nativo.data && !nativo.isComposing) {
          const campo = evento.currentTarget;
          const candidato = campo.value.slice(0, campo.selectionStart ?? 0) + nativo.data + campo.value.slice(campo.selectionEnd ?? campo.value.length);
          if (decimalCampo(candidato, casasDecimais, true) === null) evento.preventDefault();
        }
        onBeforeInput?.(evento);
      }}
      onPaste={(evento) => {
        const campo = evento.currentTarget;
        const candidato = campo.value.slice(0, campo.selectionStart ?? 0) + evento.clipboardData.getData('text') + campo.value.slice(campo.selectionEnd ?? campo.value.length);
        if (decimalCampo(candidato, casasDecimais, true) === null) evento.preventDefault();
        onPaste?.(evento);
      }}
      onChange={(evento) => {
        if (decimalCampo(evento.currentTarget.value, casasDecimais, true) === null) {
          evento.currentTarget.value = anterior.current;
          return;
        }
        // A colagem agrupada vira texto editável sem separador de milhar, sem arredondar ou converter em Number.
        if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(evento.currentTarget.value.trim())) evento.currentTarget.value = evento.currentTarget.value.replaceAll('.', '');
        anterior.current = evento.currentTarget.value;
        onChange?.(evento);
      }} />
  </div>;
});

export default CampoNumero;
