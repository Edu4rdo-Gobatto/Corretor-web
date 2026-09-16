import { z } from 'zod';
export const leadSchema = z.object({
  leadName: z.string().trim().min(2, 'Informe seu nome.').max(120),
  leadPhone: z.string().trim().min(8, 'Informe um telefone válido.').max(20).regex(/^\+?[0-9 ()-]+$/, 'Use apenas números, espaços e o código de área.').refine(value => value.replace(/\D/g, '').length >= 8, 'Informe um telefone válido.'),
  leadEmail: z.union([z.literal(''), z.email('Informe um e-mail válido.')]).optional(),
  message: z.string().trim().max(2000).optional(),
  consentGiven: z.boolean().refine(value => value, 'Autorize o contato para continuar.'),
  website: z.string().max(0, 'Não foi possível enviar este formulário.').optional(),
});
export type ContactFields = z.infer<typeof leadSchema>;
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  // Preserve explicit country codes and invalid input so validation can reject it.
  if (value.trim().startsWith('+') || digits.length > 11 || /[^0-9 ()-]/.test(value)) return value;
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.length === 11 ? `${digits.slice(2, 7)}-${digits.slice(7)}` : `${digits.slice(2, 6)}-${digits.slice(6)}`}`;
}
export function whatsappPhone(value:string) { const phone=value.replace(/\D/g,''); return !value.trim().startsWith('+') && (phone.length===10||phone.length===11)?`55${phone}`:phone; }
export function whatsappUrl(property: { id: string; title: string; agent: { name: string; whatsappNumber: string } }) {
  const phone = whatsappPhone(property.agent.whatsappNumber);
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Olá ${property.agent.name}, tenho interesse no imóvel ${property.title} (Ref: ${property.id}).`)}`;
}
