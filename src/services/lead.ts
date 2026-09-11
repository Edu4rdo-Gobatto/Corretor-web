import { z } from 'zod';
export const leadSchema = z.object({
  leadName: z.string().trim().min(2, 'Informe seu nome.').max(120),
  leadPhone: z.string().trim().min(8, 'Informe um telefone válido.').max(20).regex(/^\+?[0-9 ()-]+$/, 'Use apenas números, espaços e o código de área.').refine(value => value.replace(/\D/g, '').length >= 8, 'Informe um telefone válido.'),
  leadEmail: z.union([z.literal(''), z.email('Informe um e-mail válido.')]).optional(),
  message: z.string().trim().max(2000).optional(),
  consentGiven: z.boolean().refine(value => value, 'Autorize o contato para continuar.'),
});
export type ContactFields = z.infer<typeof leadSchema>;
export function whatsappUrl(property: { id: string; title: string; agent: { name: string; whatsappNumber: string } }) {
  const phone = property.agent.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Olá ${property.agent.name}, tenho interesse no imóvel ${property.title} (Ref: ${property.id}).`)}`;
}
