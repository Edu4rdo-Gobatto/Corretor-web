import { describe, expect, it } from 'vitest';
import {
  agentFromWire,
  classificationId,
  classificationKey,
  leadFromWire,
  pageFromWire,
  propertyFromWire,
  wireCatalogQuery,
  wireQuery,
} from './portuguese';
import { sampleClassifications, sampleWireProperty } from '../seo/fixture';

describe('mapeamento do contrato português', () => {
  it('usa total_paginas do backend ou calcula o teto', () => {
    expect(pageFromWire({ itens: [1], total: 21, pagina: 1, limite: 20 }, (v) => v).totalPages).toBe(2);
    expect(
      pageFromWire({ itens: [1], total: 100, pagina: 1, limite: 20, total_paginas: 5 }, (v) => v)
        .totalPages,
    ).toBe(5);
  });

  it('resolve chaves legadas e cai para slug ou id', () => {
    expect(classificationKey({ id: 'x', slug: 'sala-comercial' })).toBe('SALA');
    expect(classificationKey({ id: 'x', slug: 'locacao' })).toBe('LOCACAO');
    expect(classificationKey({ id: 'x', slug: 'cobertura' })).toBe('cobertura');
    expect(classificationKey({ id: 'abc' })).toBe('abc');
  });

  it('localiza classificação por id, slug ou chave legada', () => {
    const [tipo] = sampleClassifications.types;
    expect(classificationId(tipo.id, sampleClassifications.types)).toBe(tipo.id);
    expect(classificationId('sala-comercial', sampleClassifications.types)).toBe(tipo.id);
    expect(classificationId('SALA', sampleClassifications.types)).toBe(tipo.id);
    expect(classificationId('inexistente', sampleClassifications.types)).toBeUndefined();
    expect(classificationId(undefined, sampleClassifications.types)).toBeUndefined();
  });

  it('rejeita filtro com tipo/finalidade desconhecidos sem chamar a API', () => {
    expect(wireCatalogQuery({ type: 'desconhecido' }, sampleClassifications)).toBeNull();
    expect(wireCatalogQuery({ purpose: 'desconhecida' }, sampleClassifications)).toBeNull();
    const encoded = wireCatalogQuery(
      { page: 1, limit: 9, type: 'SALA', purpose: 'LOCACAO', city: 'Juara' },
      sampleClassifications,
    );
    expect(encoded).toContain('tipo_id=11111111-1111-4111-8111-111111111111');
    expect(encoded).toContain('finalidade_id=33333333-3333-4333-8333-333333333333');
    expect(encoded).toContain('cidade=Juara');
  });

  it('converte valores monetários e áreas de string para número', () => {
    const property = propertyFromWire(sampleWireProperty);
    expect(property.price).toBe(2500);
    expect(property.condoFee).toBe(300);
    expect(property.usableArea).toBe(60);
    expect(
      propertyFromWire({ ...sampleWireProperty, valor_condominio: null, valor_iptu: null })
        .condoFee,
    ).toBeNull();
  });

  it('traduz tipos de mídia e preserva a capa', () => {
    const [media] = propertyFromWire(sampleWireProperty).media;
    expect(media.type).toBe('IMAGE');
    expect(media.isCover).toBe(true);
    const embed = propertyFromWire({
      ...sampleWireProperty,
      midias: [{ id: 'v', tipo: 'VIDEO_EMBED', url: 'https://www.youtube.com/watch?v=x', capa: false, ordem: 1 }],
    });
    expect(embed.media[0].type).toBe('VIDEO_EMBED');
    const arquivo = propertyFromWire({
      ...sampleWireProperty,
      midias: [{ id: 'v', tipo: 'VIDEO_ARQUIVO', url: 'https://midia/video.mp4', capa: false, ordem: 1 }],
    });
    expect(arquivo.media[0].type).toBe('VIDEO_FILE');
  });

  it('usa corretor reserva sem expor dados pessoais', () => {
    const property = propertyFromWire({ ...sampleWireProperty, corretor: null });
    expect(property.agent.name).toBe('Atendimento');
    expect(property).not.toHaveProperty('cpf');
  });

  it('mapeia papéis e normaliza nulos do contato', () => {
    expect(
      agentFromWire({ ...sampleWireProperty.corretor, id: 'a', nome: 'A', email: 'a@e', cpf: '1', whatsapp: '2', creci: null, cargo: 'ADMIN', url_foto: null, ativo: true, criado_em: '' }).role,
    ).toBe('ADMIN');
    const lead = leadFromWire({
      id: 'l', nome: 'N', telefone: 'T', email: null, mensagem: null, imovel_id: null,
      corretor_id: 'c', consentimento: true, consentimento_em: null, consentimento_ip: null,
      versao_termos: null, criado_em: '', ativo: true, origem: 'SITE',
    });
    expect(lead.leadEmail).toBeNull();
    expect(lead.consentTimestamp).toBe('');
    expect(lead.origin).toBe('SITE');
  });

  it('ignora parâmetros vazios na query de transporte', () => {
    expect(wireQuery({ pagina: 1, busca: '', cidade: undefined, ativo: true })).toBe(
      'pagina=1&ativo=true',
    );
  });
});
