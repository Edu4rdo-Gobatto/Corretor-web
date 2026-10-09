import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Aviso from '../../componentes/Aviso';
import Campo from '../../componentes/Campo';
import CampoNumero, { numeroDoCampo } from '../../componentes/CampoNumero';
import Dialogo from '../../componentes/Dialogo';
import { estilos } from '../../componentes/estilosPainel';
import { IconeSalvar } from '../../componentes/Icones';
import { api } from '../../servicos/api';
import { mensagemErro } from '../../servicos/formato';
import type { CadastroContrato, CategoriaContrato } from '../../tipos';

const esquema = z.object({
  nome: z.string().trim().min(2, 'Use ao menos dois caracteres.').max(100, 'Use no máximo 100 caracteres.'),
  periodicidade_meses: z.number({ error: 'Informe a periodicidade em meses.' }).int('Use um número inteiro de meses.').min(1, 'Use ao menos 1 mês.').max(600, 'Use no máximo 600 meses.'),
  complemento: z.string().trim(),
});
type Valores = z.infer<typeof esquema>;

/** Índice de reajuste (nome, periodicidade e regra) ou tipo de contrato (nome e descrição). */
export function EditorCadastroContrato({ categoria, item, aoFechar, aoSalvar }: { categoria: CategoriaContrato; item: CadastroContrato | null; aoFechar: () => void; aoSalvar: () => void }) {
  const indice = categoria === 'indices-reajuste';
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<Valores>({
    // Tipos não usam periodicidade; o valor padrão só satisfaz o esquema e não é enviado.
    resolver: zodResolver(esquema),
    defaultValues: { nome: item?.nome ?? '', periodicidade_meses: item?.periodicidade_meses ?? 12, complemento: (indice ? item?.regra : item?.descricao) ?? '' },
  });
  const limite = indice ? 2000 : 1000;
  async function salvar(valores: Valores) {
    setErro('');
    if (valores.complemento.length > limite) { setErro(`Use no máximo ${limite} caracteres.`); return; }
    const complemento = valores.complemento || null;
    try {
      await api.salvarCadastroContrato(categoria, indice ? { nome: valores.nome, periodicidade_meses: valores.periodicidade_meses, regra: complemento } : { nome: valores.nome, descricao: complemento }, item?.id);
      aoSalvar();
      aoFechar();
    } catch (causa) { setErro(mensagemErro(causa)); }
  }
  return (
    <Dialogo titulo={`${item ? 'Editar' : 'Novo'} ${indice ? 'índice de reajuste' : 'tipo de contrato'}`} tamanho="estreito" alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form onSubmit={handleSubmit(salvar)} noValidate data-atalho-salvar className={`${estilos.formulario} grid gap-4`}>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <Campo rotulo="Nome" obrigatorio erro={errors.nome?.message}><input {...register('nome')} placeholder={indice ? 'Ex.: IPCA' : 'Ex.: Comercial'} /></Campo>
          {indice && <Campo rotulo="Periodicidade" obrigatorio erro={errors.periodicidade_meses?.message} dica="Meses entre um reajuste e o seguinte."><CampoNumero casasDecimais={0} min={1} max={600} unidade="meses" {...register('periodicidade_meses', { setValueAs: numeroDoCampo })} /></Campo>}
          <Campo rotulo={indice ? 'Regra (opcional)' : 'Descrição (opcional)'} erro={errors.complemento?.message} dica={indice ? 'Como o índice é aplicado. Só registro; o sistema não recalcula o aluguel.' : undefined}><textarea {...register('complemento')} /></Campo>
        </fieldset>
        {item && <p className={`${estilos.dica} m-0`}>Contratos já registrados mantêm os dados do momento da escolha.</p>}
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar size={20} aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Salvar'}</button><button type="button" className="buttonGhost" disabled={isSubmitting} data-fechar-dialogo>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}
