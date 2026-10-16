import { Controller, type Control, type FieldPath, type FieldValues, type PathValue } from 'react-hook-form';
import Seletor, { type OpcaoSeletor } from './Seletor';
import { valorDoCampo, valorParaCampo } from './valorSelecao';

type Propriedades<V extends FieldValues> = {
  control: Control<V>; name: FieldPath<V>; rotulo: string; opcoes: readonly OpcaoSeletor<string>[];
  obrigatorio?: boolean; dica?: string; classe?: string; desabilitado?: boolean; placeholder?: string;
  /** Guarda número no formulário (ids de Contratos); `0` é "nenhum". */
  numerico?: boolean;
  /** Efeitos depois da troca (ex.: Operação da comissão zera o contrato escolhido). */
  aoMudar?: (valor: string) => void;
};

/** `Seletor` ligado ao react-hook-form: valor, erro, foco no primeiro inválido e `onBlur` vêm do `Controller`. */
export default function CampoSelecao<V extends FieldValues>({ control, name, rotulo, opcoes, obrigatorio, dica, classe, desabilitado, placeholder, numerico = false, aoMudar }: Propriedades<V>) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => (
    <Seletor rotulo={rotulo} valor={valorDoCampo(field.value, numerico)} opcoes={opcoes} classe={classe} obrigatorio={obrigatorio} dica={dica}
      placeholder={placeholder} desabilitado={desabilitado || field.disabled} erro={fieldState.error?.message}
      campoRef={field.ref} aoDesfocar={field.onBlur}
      aoMudar={(valor) => { field.onChange(valorParaCampo(valor, numerico) as PathValue<V, FieldPath<V>>); aoMudar?.(valor); }} />
  )} />;
}
