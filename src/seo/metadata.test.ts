import { describe, expect, it } from 'vitest';
import { buildSeo, renderHead } from './metadata';
import { sampleProperty } from './fixture';
const config = {siteUrl:'https://example.test',indexable:true};
describe('imagem Open Graph', () => {
  it('publica dimensões do asset conhecido e alt', () => {
    const head = renderHead(buildSeo('/',config));
    expect(head).toContain('property="og:image:width" content="1200"');
    expect(head).toContain('property="og:image:height" content="900"');
    expect(head).toContain('property="og:image:alt"');
  });
  it('não presume dimensões de uma foto do imóvel', () => {
    const head = renderHead(buildSeo('/imoveis/sala',config,{property:{...sampleProperty,media:[{...sampleProperty.media[0],url:'https://media.example.test/foto.webp'}]}}));
    expect(head).toContain('https://media.example.test/foto.webp');
    expect(head).not.toContain('og:image:width');
    expect(head).not.toContain('og:image:height');
  });
});
