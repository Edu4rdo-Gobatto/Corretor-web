export type AgentRole = 'ADMIN' | 'AGENT';
export interface Agent { id: string; name: string; email: string; cpf?: string; whatsappNumber: string; creci: string | null; role: AgentRole; avatarUrl: string | null; active: boolean; createdAt: string }
export type PublicAgent = Pick<Agent, 'id' | 'name' | 'whatsappNumber' | 'creci' | 'avatarUrl'>;
export type PropertyType = string;
export type PropertyPurpose = string;
export type PropertyStatus = 'DISPONIVEL' | 'RESERVADO' | 'CONCLUIDO';
export interface PropertyMedia { id: string; type: 'IMAGE' | 'VIDEO_EMBED' | 'VIDEO_FILE'; url: string; orderIndex: number; isCover: boolean }
export interface Property {
  typeId?: string; purposeId?: string; typeName?: string; purposeName?: string; postalCode?: string; addressComplement?: string; active?: boolean; featureValues?: {caracteristica_id:string;valor:string|null}[];
  id: string; title: string; slug: string; type: PropertyType; purpose: PropertyPurpose; status: PropertyStatus;
  price: number; condoFee: number | null; iptuFee: number | null; usableArea: number; totalArea: number;
  addressStreet: string; addressNumber: string; addressCity: string; addressState: string; neighborhood: string;
  description: string; features: Record<string, unknown>; agentId: string; agent: PublicAgent; media: PropertyMedia[]; createdAt: string; updatedAt: string;
}
export type PropertyInput = Omit<Property, 'id' | 'slug' | 'agent' | 'media' | 'createdAt' | 'updatedAt' | 'agentId'> & { agentId?: string };
export interface Lead { active?: boolean; origin?: 'SITE'|'MANUAL'; id: string; propertyId: string | null; agentId: string; leadName: string; leadPhone: string; leadEmail: string | null; message: string | null; consentGiven: boolean; consentTimestamp: string; consentIp: string; termsVersion: string; createdAt: string }
export interface LeadInput { propertyId: string; leadName: string; leadPhone: string; leadEmail?: string; message?: string; consentGiven: boolean }
export interface Page<T> { items: T[]; total: number; page: number; limit: number; totalPages: number }
export interface CatalogQuery { page: number; limit: number; type?: PropertyType; purpose?: PropertyPurpose; city?: string; minPrice?: number; maxPrice?: number }
export interface Session { accessToken: string; tokenType: 'Bearer'; agent: Agent }
export type AgentInput = Pick<Agent, 'name' | 'email' | 'whatsappNumber' | 'role' | 'creci' | 'avatarUrl'> & { cpf?: string; password?: string; active?: boolean };
