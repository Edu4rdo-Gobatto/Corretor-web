import { forwardRef, useRef, type InputHTMLAttributes } from 'react';
import { creciParcial } from '../servicos/creci';

type Propriedades = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** CRECI: recusa inserção ou colagem que deixe o valor inválido, sem descartar caracteres; apagar é sempre permitido. */
const CampoCreci = forwardRef<HTMLInputElement, Propriedades>(function CampoCreci({ onChange, onBeforeInput, onPaste, onFocus, ...propriedades }, ref) {
  const anterior = useRef(String(propriedades.value ?? propriedades.defaultValue ?? ''));
  const candidato = (campo: HTMLInputElement, texto: string) => campo.value.slice(0, campo.selectionStart ?? 0) + texto + campo.value.slice(campo.selectionEnd ?? campo.value.length);
  return <input maxLength={50} autoComplete="off" autoCapitalize="characters" spellCheck={false} {...propriedades} ref={ref} type="text"
    onFocus={(evento) => { anterior.current = evento.currentTarget.value; onFocus?.(evento); }}
    onBeforeInput={(evento) => {
      const nativo = evento.nativeEvent as InputEvent;
      if (nativo.data && !nativo.isComposing && !creciParcial(candidato(evento.currentTarget, nativo.data))) evento.preventDefault();
      onBeforeInput?.(evento);
    }}
    onPaste={(evento) => {
      // Colagem inválida é recusada inteira: `12x34` não vira `1234`. Espaços nas pontas são ignorados.
      const campo = evento.currentTarget;
      const texto = evento.clipboardData.getData('text').trim();
      evento.preventDefault();
      const proximo = candidato(campo, texto);
      if (creciParcial(proximo) && proximo.length <= (propriedades.maxLength ?? 50)) {
        campo.setRangeText(texto.toUpperCase(), campo.selectionStart ?? 0, campo.selectionEnd ?? campo.value.length, 'end');
        campo.dispatchEvent(new Event('input', { bubbles: true }));
      }
      onPaste?.(evento);
    }}
    onChange={(evento) => {
      const campo = evento.currentTarget;
      const apagando = (evento.nativeEvent as InputEvent).inputType?.startsWith('delete');
      // Fallback de navegadores sem beforeinput; remover caracteres de um valor legado (ex.: `Teste`) continua livre.
      if (!apagando && !creciParcial(campo.value)) { campo.value = anterior.current; return; }
      // Só converte quando o valor já segue a regra; um legado parcialmente apagado fica como está.
      if (creciParcial(campo.value) && campo.value !== campo.value.toUpperCase()) {
        const { selectionStart, selectionEnd } = campo;
        campo.value = campo.value.toUpperCase();
        campo.setSelectionRange(selectionStart, selectionEnd);
      }
      anterior.current = campo.value;
      onChange?.(evento);
    }} />;
});

export default CampoCreci;
