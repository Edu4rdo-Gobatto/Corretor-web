import type { CorretorPublico } from '../tipos';
import { urlApi } from './http';

/** URL de exibição estável, com revisão quando a foto muda e sem chave arbitrária de storage. */
export function urlFotoCorretor(corretor: Pick<CorretorPublico, 'id' | 'url_foto'>): string {
  if (!corretor.url_foto) return '';
  const revisao = Array.from(corretor.url_foto).reduce((valor, letra) => ((valor * 31) ^ letra.charCodeAt(0)) >>> 0, 0);
  return urlApi(`/corretores/${corretor.id}/foto?v=${revisao.toString(36)}`);
}
