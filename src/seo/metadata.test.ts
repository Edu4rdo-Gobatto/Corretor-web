import { describe, expect, it } from 'vitest';
import { buildSeo } from './metadata';
import { imovelExemplo } from './fixture';
import { urlImovel } from '../servicos/urls';
import type { Imovel } from '../tipos';

const config = { siteUrl: 'https://exemplo.com.br', indexable: true };
const anuncio = (imovel: Imovel) => buildSeo(urlImovel(imovel.slug), config, { imovel }).jsonLd['@graph'].find((item) => item['@type'] === 'RealEstateListing') as { offers?: { availability: string } } | undefined;

describe('SEO do anúncio conforme a situação', () => {
  it('imóvel disponível é anunciado como oferta em aberto', () => {
    const imovel = { ...imovelExemplo, status: 'DISPONIVEL' as const, valor_venda: '500000.00' };
    expect(anuncio(imovel)?.offers?.availability).toBe('https://schema.org/InStock');
  });

  it('imóvel vendido continua no site, mas sem oferta em aberto nem "à venda" na descrição', () => {
    const imovel = { ...imovelExemplo, status: 'VENDIDO' as const, valor_venda: '500000.00' };
    const seo = buildSeo(urlImovel(imovel.slug), config, { imovel });
    expect(anuncio(imovel)?.offers?.availability).toBe('https://schema.org/SoldOut');
    expect(seo.description).toMatch(/^Imóvel vendido: /);
    expect(seo.description).not.toContain('à venda');
    expect(seo.robots).toBe('index,follow');
  });
});
