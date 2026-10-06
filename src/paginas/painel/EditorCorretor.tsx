import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Aviso from '../../componentes/Aviso';
import Campo from '../../componentes/Campo';
import Dialogo from '../../componentes/Dialogo';
import { estilos } from '../../componentes/estilosPainel';
import { IconeSalvar } from '../../componentes/Icones';
import { api } from '../../servicos/api';
import { mensagemErro } from '../../servicos/formato';
import type { Corretor } from '../../tipos';

export const esquemaCorretor = z.object({
  nome: z.string().trim().min(2, 'Use pelo menos 2 caracteres.').max(100),
  cpf: z.string().regex(/^\d{11}$/, 'Informe os 11 dígitos do CPF.'),
  email: z.email('Informe um e-mail válido.').max(254),
  whatsapp: z.string().regex(/^[1-9]\d{9,14}$/, 'Use DDI e DDD, somente números. Ex.: 5565999999999.'),
  creci: z.string().max(50),
  cargo: z.enum(['ADMIN', 'CORRETOR']),
  url_foto: z.string().max(2048).refine((valor) => !valor || (/^https:\/\//.test(valor) && URL.canParse(valor)), 'Use uma URL HTTPS válida.'),
  senha: z.string().refine((valor) => valor === '' || (valor.length >= 12 && valor.length <= 128 && /\S/.test(valor)), 'Use entre 12 e 128 caracteres.'),
});
type Valores = z.infer<typeof esquemaCorretor>;
const esquemaSenha = z.object({
  nova_senha: z.string().min(12, 'Use entre 12 e 128 caracteres.').max(128).refine((valor) => /\S/.test(valor), 'Use entre 12 e 128 caracteres.'),
  confirmacao: z.string(),
}).refine((valores) => valores.nova_senha === valores.confirmacao, { message: 'A confirmação não confere.', path: ['confirmacao'] });

export const dadosBase = (corretor: Corretor) => ({ nome: corretor.nome, cpf: corretor.cpf, email: corretor.email, whatsapp: corretor.whatsapp, cargo: corretor.cargo, creci: corretor.creci, url_foto: corretor.url_foto });

export function EditorCorretor({ corretor, aoFechar, aoSalvar }: { corretor: Corretor | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting, isDirty } } = useForm<Valores>({
    resolver: zodResolver(esquemaCorretor),
    defaultValues: { nome: corretor?.nome ?? '', cpf: corretor?.cpf ?? '', email: corretor?.email ?? '', whatsapp: corretor?.whatsapp ?? '', creci: corretor?.creci ?? '', cargo: corretor?.cargo ?? 'CORRETOR', url_foto: corretor?.url_foto ?? '', senha: '' },
  });
  async function salvar(valores: Valores) {
    if (!corretor && !valores.senha) { setError('senha', { message: 'Defina uma senha de pelo menos 12 caracteres.' }); return; }
    setErro('');
    try {
      await api.salvarCorretor({ ...valores, creci: valores.creci || null, url_foto: valores.url_foto || null, senha: valores.senha || undefined }, corretor?.id);
      aoSalvar();
      aoFechar();
    } catch (causa) { setErro(mensagemErro(causa)); }
  }
  // Ordem pensada para a grade de 2 colunas não deixar célula vazia: Nome / CPF+E-mail / WhatsApp+CRECI / Permissão+Foto / Senha.
  const campos: [keyof Valores, string, string, string?][] = [['nome', 'Nome', 'text', 'col-span-full'], ['cpf', 'CPF (somente números)', 'text'], ['email', 'E-mail', 'email'], ['whatsapp', 'WhatsApp com DDI e DDD', 'tel'], ['creci', 'CRECI', 'text']];
  const campo = ([nome, rotulo, tipo, classe]: [keyof Valores, string, string, string?]) => <Campo key={nome} classe={classe} rotulo={rotulo} obrigatorio={nome === 'nome' || nome === 'cpf' || nome === 'email' || nome === 'whatsapp'} erro={errors[nome]?.message}><input type={tipo} {...register(nome)} /></Campo>;
  return (
    <Dialogo titulo={corretor ? 'Editar corretor' : 'Novo corretor'} tamanho="largo" alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <form className={estilos.formulario} onSubmit={handleSubmit(salvar)} noValidate data-atalho-salvar>
        <fieldset disabled={isSubmitting} className="m-0 border-0 p-0"><div className={estilos.grade}>
          {campos.map((item) => campo(item))}
          <Campo rotulo="Permissão" erro={errors.cargo?.message} obrigatorio><select {...register('cargo')}><option value="CORRETOR">Corretor</option><option value="ADMIN">Administrador</option></select></Campo>
          {campo(['url_foto', 'URL da foto (HTTPS)', 'url'])}
          <Campo classe="col-span-full" rotulo={corretor ? 'Nova senha (opcional)' : 'Senha'} obrigatorio={!corretor} erro={errors.senha?.message} dica={`${corretor ? 'Deixe em branco para manter a senha atual. ' : ''}Mínimo de 12 caracteres.`}><input type="password" autoComplete="new-password" {...register('senha')} /></Campo>
        </div></fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar size={20} aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Salvar corretor'}</button><button className="buttonGhost" type="button" data-fechar-dialogo disabled={isSubmitting}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

export function DialogoSenha({ corretor, aoFechar, aoSalvar }: { corretor: Corretor; aoFechar: () => void; aoSalvar: () => void }) {
  const [erro, setErro] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<z.infer<typeof esquemaSenha>>({ resolver: zodResolver(esquemaSenha), defaultValues: { nova_senha: '', confirmacao: '' } });
  async function redefinir(valores: z.infer<typeof esquemaSenha>) {
    setErro('');
    try { await api.salvarCorretor({ ...dadosBase(corretor), senha: valores.nova_senha }, corretor.id); aoSalvar(); aoFechar(); }
    catch (causa) { setErro(mensagemErro(causa)); }
  }
  return (
    <Dialogo titulo={`Redefinir senha de ${corretor.nome}`} tamanho="estreito" alterado={isDirty} ocupado={isSubmitting} aoFechar={() => { if (!isSubmitting) aoFechar(); }}>
      <p className="muted">Escolha a nova senha na hora e avise a pessoa: as sessões abertas dela são encerradas.</p>
      <form className="grid grid-cols-1 gap-[22px]" onSubmit={handleSubmit(redefinir)} noValidate data-atalho-salvar>
        <fieldset disabled={isSubmitting} className="m-0 grid gap-4 border-0 p-0"><Campo rotulo="Nova senha" obrigatorio erro={errors.nova_senha?.message} dica="Mínimo de 12 caracteres."><input type="password" autoComplete="new-password" {...register('nova_senha')} /></Campo>
        <Campo rotulo="Confirmar nova senha" obrigatorio erro={errors.confirmacao?.message}><input type="password" autoComplete="new-password" {...register('confirmacao')} /></Campo></fieldset>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className={estilos.rodapeDialogo}><button className="button" disabled={isSubmitting}><IconeSalvar size={20} aria-hidden="true" />{isSubmitting ? 'Salvando…' : 'Definir nova senha'}</button><button className="buttonGhost" type="button" data-fechar-dialogo disabled={isSubmitting}>Cancelar</button></div>
      </form>
    </Dialogo>
  );
}

