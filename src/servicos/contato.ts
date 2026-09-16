import { z } from 'zod';
import { codigoImovel } from './formato';

export const esquemaContato = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome.').max(120),
  telefone: z.string().trim().min(8, 'Informe um telefone válido.').max(20).regex(/^\+?[0-9 ()-]+$/, 'Use apenas números, espaços e o código de área.').refine((valor) => valor.replace(/\D/g, '').length >= 8, 'Informe um telefone válido.'),
  email: z.union([z.literal(''), z.email('Informe um e-mail válido.')]).optional(),
  mensagem: z.string().trim().max(2000).optional(),
  consentimento: z.boolean().refine((valor) => valor, 'Autorize o contato para continuar.'),
  // Campo isca: preenchido só por robôs.
  website: z.string().max(0, 'Não foi possível enviar este formulário.').optional(),
});
export type CamposContato = z.infer<typeof esquemaContato>;

/** Máscara nacional (65) 99999-9999; números com + ou fora do padrão ficam como digitados. */
export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '');
  if (valor.trim().startsWith('+') || digitos.length > 11 || /[^0-9 ()-]/.test(valor)) return valor;
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.length === 11 ? `${digitos.slice(2, 7)}-${digitos.slice(7)}` : `${digitos.slice(2, 6)}-${digitos.slice(6)}`}`;
}

export function telefoneWhatsapp(valor: string): string {
  const digitos = valor.replace(/\D/g, '');
  return !valor.trim().startsWith('+') && (digitos.length === 10 || digitos.length === 11) ? `55${digitos}` : digitos;
}

export function urlWhatsapp(imovel: { id: number; titulo: string; corretor: { nome: string; whatsapp: string } | null }): string {
  const telefone = telefoneWhatsapp(imovel.corretor?.whatsapp ?? '');
  const texto = `Olá ${imovel.corretor?.nome ?? ''}, tenho interesse no imóvel ${imovel.titulo} (Ref. ${codigoImovel(imovel.id)}).`;
  return `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
}
