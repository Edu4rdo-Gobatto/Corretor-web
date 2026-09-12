import { useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { Property } from '../types';
import { api } from '../services/api';
import { leadSchema, whatsappUrl, type ContactFields } from '../services/lead';
import Dialog from './Dialog';
import styles from './LeadFormModal.module.css';

export default function LeadFormModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const { register, getValues, setError, clearErrors, formState: { errors } } = useForm<ContactFields>({ resolver: zodResolver(leadSchema), defaultValues: { leadName: '', leadPhone: '', leadEmail: '', message: '', consentGiven: false } });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState('');
  const [contactOpened, setContactOpened] = useState(false);
  const contactUrl = whatsappUrl(property);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    clearErrors();
    // Synchronous validation keeps window.open inside the original user gesture.
    const result = leadSchema.safeParse(getValues());
    if (!result.success) {
      result.error.issues.forEach(issue => setError(issue.path[0] as keyof ContactFields, { message: issue.message }));
      return;
    }
    if (!contactOpened) { window.open(contactUrl, '_blank', 'noopener,noreferrer'); setContactOpened(true); }
    setSaving(true); setFailure('');
    const { leadEmail, message, ...required } = result.data;
    api.createLead({ ...required, propertyId: property.id, ...(leadEmail ? { leadEmail } : {}), ...(message ? { message } : {}) }).then(() => setSaved(true)).catch(() => setFailure('Seu contato não foi registrado no site. Você pode continuar pelo WhatsApp ou tentar registrar novamente.')).finally(() => setSaving(false));
  }
  return <Dialog title={saved ? 'Obrigado pelo seu interesse.' : 'Vamos falar sobre este espaço?'} onClose={onClose}>
    {saved ? <div className={styles.success}><CheckCircle2 size={32}/><p>Seu interesse foi registrado. Continue a conversa com o corretor pelo WhatsApp.</p><a className="button" href={contactUrl} target="_blank" rel="noopener noreferrer">Continuar no WhatsApp <ArrowUpRight size={17}/></a><button className="buttonSecondary" onClick={onClose}>Concluir</button></div> : <><p className="muted">{property.title}<br/>Atendimento com {property.agent.name}.</p><form onSubmit={submit} className={styles.form} noValidate>
      <label>Seu nome<input autoComplete="name" {...register('leadName')} aria-invalid={Boolean(errors.leadName)}/>{errors.leadName && <span className="error">{errors.leadName.message}</span>}</label>
      <label>Telefone com DDD<input type="tel" autoComplete="tel" placeholder="(65) 99999-9999" {...register('leadPhone')} aria-invalid={Boolean(errors.leadPhone)}/>{errors.leadPhone && <span className="error">{errors.leadPhone.message}</span>}</label>
      <label>E-mail (opcional)<input type="email" autoComplete="email" {...register('leadEmail')}/>{errors.leadEmail && <span className="error">{errors.leadEmail.message}</span>}</label>
      <label>Mensagem (opcional)<textarea {...register('message')} maxLength={2000}/></label>
      <div><label className={styles.consent}><input type="checkbox" {...register('consentGiven')}/><span>Autorizo o uso dos meus dados para receber contato sobre este imóvel, conforme a <Link to="/privacidade" target="_blank">Política de Privacidade</Link>.</span></label>{errors.consentGiven && <span className="error">{errors.consentGiven.message}</span>}</div>
      {failure && <p className="error" role="alert">{failure}</p>}
      <button className="button" type="submit" disabled={saving}>{saving ? 'Registrando contato…' : failure ? 'Tentar registrar novamente' : 'Falar pelo WhatsApp'}<ArrowUpRight size={17}/></button>
      {contactOpened && <a href={contactUrl} target="_blank" rel="noopener noreferrer" className={styles.manualLink}>Se o WhatsApp não abriu, clique aqui</a>}
    </form></>}
  </Dialog>;
}
