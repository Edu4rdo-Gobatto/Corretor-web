import { useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { Imovel } from '../tipos';
import { api } from '../servicos/api';
import { esquemaContato, formatarTelefone, urlWhatsapp, type CamposContato } from '../servicos/contato';
import Dialogo from './Dialogo';

/** Contato do site: abre o WhatsApp no mesmo gesto do envio e registra a pessoa com consentimento. */
export default function FormularioContato({ imovel, aoFechar }: { imovel: Imovel; aoFechar: () => void }) {
  const { register, getValues, setValue, setError, setFocus, clearErrors, formState: { errors } } = useForm<CamposContato>({
    resolver: zodResolver(esquemaContato),
    defaultValues: { nome: '', telefone: '', email: '', mensagem: '', consentimento: false, website: '' },
  });
  const [enviando, setEnviando] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const [falha, setFalha] = useState('');
  const [whatsappAberto, setWhatsappAberto] = useState(false);
  const urlContato = urlWhatsapp(imovel);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    clearErrors();
    if (getValues('website')) {
      setFalha('Não foi possível enviar este formulário.');
      return;
    }
    // Validação síncrona mantém o window.open dentro do gesto do usuário.
    const resultado = esquemaContato.safeParse(getValues());
    if (!resultado.success) {
      resultado.error.issues.forEach((problema) => setError(problema.path[0] as keyof CamposContato, { message: problema.message }));
      const primeiro = resultado.error.issues[0]?.path[0] as keyof CamposContato | undefined;
      if (primeiro && primeiro !== 'website') setFocus(primeiro);
      return;
    }
    if (!whatsappAberto) { window.open(urlContato, '_blank', 'noopener,noreferrer'); setWhatsappAberto(true); }
    setEnviando(true);
    setFalha('');
    const { email, mensagem, nome, telefone } = resultado.data;
    api.criarContato({ imovel_id: imovel.id, nome, telefone, ...(email ? { email } : {}), ...(mensagem ? { mensagem } : {}), consentimento: true })
      .then(() => setRegistrado(true))
      .catch(() => setFalha('Seu contato não foi registrado no site. Você pode continuar pelo WhatsApp ou tentar registrar novamente.'))
      .finally(() => setEnviando(false));
  }

  return (
    <Dialogo titulo={registrado ? 'Obrigado pelo seu interesse.' : 'Vamos falar sobre este espaço?'} aoFechar={aoFechar}>
      {registrado ? (
        <div className="grid justify-items-start gap-4 [&_svg]:text-brand">
          <CheckCircle2 size={32} />
          <p>Seu interesse foi registrado. Continue a conversa pelo WhatsApp.</p>
          <a className="button" href={urlContato} target="_blank" rel="noopener noreferrer">Continuar no WhatsApp <ArrowUpRight size={17} /></a>
          <button className="buttonSecondary" onClick={aoFechar}>Concluir</button>
        </div>
      ) : (
        <>
          <p className="muted">{imovel.titulo}<br />Atendimento com {imovel.corretor?.nome ?? 'o corretor responsável'}. Ao enviar, o WhatsApp será aberto antes do registro do contato.</p>
          <form onSubmit={enviar} className="grid gap-[15px] [&_label]:grid [&_label]:gap-1" noValidate>
            <label>Seu nome<input autoComplete="name" {...register('nome')} aria-invalid={Boolean(errors.nome)} />{errors.nome && <span className="error">{errors.nome.message}</span>}</label>
            <label>Telefone com DDD<input type="tel" inputMode="tel" autoComplete="tel" placeholder="(65) 99999-9999" {...register('telefone', { onChange: (evento) => setValue('telefone', formatarTelefone(evento.target.value), { shouldDirty: true }) })} aria-invalid={Boolean(errors.telefone)} />{errors.telefone && <span className="error">{errors.telefone.message}</span>}</label>
            <label>E-mail (opcional)<input type="email" autoComplete="email" {...register('email')} />{errors.email && <span className="error">{errors.email.message}</span>}</label>
            <label>Mensagem (opcional)<textarea {...register('mensagem')} maxLength={2000} /></label>
            <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden"><label>Site<input tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>
            <div>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-[13px] font-normal [&_input]:mt-1">
                <input type="checkbox" {...register('consentimento')} />
                <span>Autorizo o uso dos meus dados para receber contato sobre este imóvel, conforme a <Link to="/privacidade" target="_blank">Política de Privacidade</Link>.</span>
              </label>
              {errors.consentimento && <span className="error">{errors.consentimento.message}</span>}
            </div>
            {falha && <p className="error" role="alert">{falha}</p>}
            <button className="button" type="submit" disabled={enviando}>{enviando ? 'Registrando contato…' : falha ? 'Tentar registrar novamente' : 'Falar com corretor'}<ArrowUpRight size={17} /></button>
            {whatsappAberto && <a href={urlContato} target="_blank" rel="noopener noreferrer" className="text-center text-sm">Se o WhatsApp não abriu, clique aqui</a>}
          </form>
        </>
      )}
    </Dialogo>
  );
}
