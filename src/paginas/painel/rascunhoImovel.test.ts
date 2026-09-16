import { describe, expect, it } from 'vitest';
import { chaveRascunho, gravarRascunho, lerRascunho, limparRascunho } from './rascunhoImovel';

describe('rascunho temporário do imóvel', () => {
  it('preserva campos incompletos, proprietário e características para restauração', () => {
    const chave = chaveRascunho(1, '7');
    gravarRascunho(sessionStorage, chave, { titulo: '', descricao: 'Texto em andamento', valor_locacao: 25, proprietario: { id: 3, nome: 'Dona' }, destaque: true, caracteristicas: [{ caracteristica_id: '', valor: 'em edição' }] });
    expect(lerRascunho(sessionStorage, chave)).toEqual({ titulo: '', descricao: 'Texto em andamento', valor_locacao: 25, destaque: true, proprietario: { id: 3, nome: 'Dona' }, caracteristicas: [{ caracteristica_id: '', valor: 'em edição' }] });
    limparRascunho(sessionStorage, chave);
    expect(lerRascunho(sessionStorage, chave)).toBeNull();
  });
  it('isola rascunhos entre usuários e imóveis', () => {
    expect(chaveRascunho(1, '1')).not.toBe(chaveRascunho(2, '1'));
    expect(chaveRascunho(1)).not.toBe(chaveRascunho(1, '1'));
  });
  it('não restaura senhas nem campos estranhos ao imóvel', () => {
    sessionStorage.setItem('rascunho', JSON.stringify({ titulo: 'Galpão', senha: 'segredo', telefone: '5565999999999', proprietario: { id: 'x' } }));
    expect(lerRascunho(sessionStorage, 'rascunho')).toEqual({ titulo: 'Galpão' });
  });
  it('ignora armazenamento indisponível ou corrompido e sinaliza cota', () => {
    sessionStorage.setItem('corrompido', '{');
    expect(lerRascunho(sessionStorage, 'corrompido')).toBeNull();
    const bloqueado = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); }, removeItem() { throw new Error('bloqueado'); } };
    expect(gravarRascunho(bloqueado, 'x', { titulo: 'Sala' })).toBe('indisponivel');
    expect(lerRascunho(bloqueado, 'x')).toBeNull();
    expect(() => limparRascunho(bloqueado, 'x')).not.toThrow();
    const cota = { getItem() { return null; }, setItem() { throw new DOMException('quota', 'QuotaExceededError'); }, removeItem() { return undefined; } };
    expect(gravarRascunho(cota, 'x', { titulo: 'Sala' })).toBe('cota');
    expect(gravarRascunho(sessionStorage, 'grande', { caracteristicas: [{ caracteristica_id: '', valor: 'x'.repeat(501) }] })).toBe('grande_demais');
  });
});
