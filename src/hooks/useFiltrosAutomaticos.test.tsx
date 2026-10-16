// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFiltrosAutomaticos } from './useFiltrosAutomaticos';

type Filtros = { busca: string; status: string };
const filtros = (busca = '', status = ''): Filtros => ({ busca, status });
const normalizar = (valor: Filtros): Filtros => ({ ...valor, busca: valor.busca.trim() });
type ConfigTeste = {
  iniciais: Filtros;
  externos?: Filtros;
  normalizar?: (valor: Filtros) => Filtros;
  validar?: (valor: Filtros) => string;
  aoAplicar: (valor: Filtros, automatico: boolean) => void;
};

function montar(opcoes: Partial<ConfigTeste> = {}) {
  const aoAplicar = vi.fn<(valor: Filtros, automatico: boolean) => void>();
  const initialProps: ConfigTeste = { iniciais: filtros(), normalizar, aoAplicar, ...opcoes };
  return { ...renderHook((props: ConfigTeste) => useFiltrosAutomaticos(props), { initialProps }), aoAplicar, initialProps };
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); });

describe('useFiltrosAutomaticos', () => {
  it('não aplica na montagem e aguarda exatamente 350 ms após digitar', () => {
    const { result, aoAplicar } = montar();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(aoAplicar).not.toHaveBeenCalled();
    act(() => { result.current.definir(filtros('sala')); });
    expect(result.current.rascunho).toEqual(filtros('sala'));
    act(() => { vi.advanceTimersByTime(349); });
    expect(aoAplicar).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('sala'), true);
  });

  it('reinicia a espera a cada alteração e aplica somente o rascunho mais recente', () => {
    const { result, aoAplicar } = montar();
    act(() => { result.current.definir(filtros('sa')); vi.advanceTimersByTime(300); });
    act(() => { result.current.definir(filtros('sala')); vi.advanceTimersByTime(349); });
    expect(aoAplicar).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('sala'), true);
  });

  it('aplica a seleção imediatamente e cancela o timer da digitação anterior', () => {
    const { result, aoAplicar } = montar();
    act(() => { result.current.definir(filtros('sala')); vi.advanceTimersByTime(100); });
    act(() => { result.current.definir(filtros('sala', 'DISPONIVEL'), true); });
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('sala', 'DISPONIVEL'), true);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(aoAplicar).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([true, false])('aplicarAgora(%s) usa o rascunho e cancela a aplicação pendente', (automatico) => {
    const { result, aoAplicar } = montar();
    act(() => { result.current.definir(filtros('galpão')); });
    act(() => { expect(result.current.aplicarAgora(automatico)).toBe(true); });
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('galpão'), automatico);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(aoAplicar).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('normaliza antes de validar/enviar e deduplica valores equivalentes inclusive o inicial', () => {
    const validar = vi.fn<(valor: Filtros) => string>(() => '');
    const { result, aoAplicar } = montar({ iniciais: filtros(' sala '), validar });
    act(() => { result.current.definir(filtros('sala'), true); });
    expect(aoAplicar).not.toHaveBeenCalled();
    act(() => { result.current.definir(filtros(' galpão ')); vi.advanceTimersByTime(350); });
    expect(validar).toHaveBeenLastCalledWith(filtros('galpão'));
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('galpão'), true);
    expect(result.current.rascunho).toEqual(filtros(' galpão '));
    act(() => { result.current.definir(filtros('galpão'), true); result.current.aplicarAgora(false); });
    expect(aoAplicar).toHaveBeenCalledTimes(1);
  });

  it('expõe erro sem aplicar nem consumir a chave e limpa o erro após corrigir', () => {
    const validar = (valor: Filtros) => valor.busca.length < 3 ? 'Informe pelo menos 3 letras.' : '';
    const { result, aoAplicar } = montar({ validar });
    act(() => { result.current.definir(filtros('sa')); vi.advanceTimersByTime(350); });
    expect(result.current.erro).toBe('Informe pelo menos 3 letras.');
    expect(aoAplicar).not.toHaveBeenCalled();
    act(() => { expect(result.current.aplicarAgora()).toBe(false); });
    act(() => { result.current.definir(filtros(' sala ')); vi.advanceTimersByTime(350); });
    expect(result.current.erro).toBe('');
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('sala'), true);
  });

  it('permite reenviar o mesmo valor após uma validação antes reprovada', () => {
    const validar = vi.fn<(valor: Filtros) => string>(() => 'Indisponível');
    const { result, rerender, initialProps, aoAplicar } = montar({ validar });
    act(() => { result.current.definir(filtros('sala'), true); });
    expect(aoAplicar).not.toHaveBeenCalled();
    rerender({ ...initialProps, validar: () => '' });
    act(() => { expect(result.current.aplicarAgora()).toBe(true); });
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('sala'), true);
    expect(result.current.erro).toBe('');
  });

  it('sincronizar cancela a pendência, limpa erro e atualiza a chave sem aplicar', () => {
    const { result, aoAplicar } = montar({ validar: (valor) => valor.busca === 'erro' ? 'Busca inválida' : '' });
    act(() => { result.current.definir(filtros('erro'), true); });
    expect(result.current.erro).toBe('Busca inválida');
    act(() => { result.current.definir(filtros('pendente')); result.current.sincronizar(filtros('externo')); });
    expect(result.current.rascunho).toEqual(filtros('externo'));
    expect(result.current.erro).toBe('');
    act(() => { vi.advanceTimersByTime(1000); result.current.aplicarAgora(); });
    expect(aoAplicar).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancela a aplicação ao desmontar', () => {
    const { result, unmount, aoAplicar } = montar();
    act(() => { result.current.definir(filtros('sala')); });
    unmount();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(aoAplicar).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('usa normalização, validação e callback mais recentes em timer já agendado', () => {
    const validarAntigo = vi.fn<(valor: Filtros) => string>(() => 'Erro antigo');
    const { result, rerender, initialProps, aoAplicar } = montar({ validar: validarAntigo });
    act(() => { result.current.definir(filtros(' sala ')); vi.advanceTimersByTime(100); });
    const novoAoAplicar = vi.fn<(valor: Filtros, automatico: boolean) => void>();
    const novaValidacao = vi.fn<(valor: Filtros) => string>(() => '');
    rerender({ ...initialProps, normalizar: (valor) => ({ ...normalizar(valor), busca: valor.busca.trim().toUpperCase() }), validar: novaValidacao, aoAplicar: novoAoAplicar });
    act(() => { vi.advanceTimersByTime(250); });
    expect(novaValidacao).toHaveBeenCalledExactlyOnceWith(filtros('SALA'));
    expect(novoAoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('SALA'), true);
    expect(validarAntigo).not.toHaveBeenCalled();
    expect(aoAplicar).not.toHaveBeenCalled();
    expect(result.current.erro).toBe('');
  });

  it('acompanha mudança externa da URL, cancelando digitação e erro sem aplicar outra vez', () => {
    const { result, rerender, initialProps, aoAplicar } = montar({ externos: filtros(), validar: (valor) => valor.busca === 'erro' ? 'Busca inválida' : '' });
    act(() => { result.current.definir(filtros('erro'), true); });
    expect(result.current.erro).toBe('Busca inválida');
    act(() => { result.current.definir(filtros('pendente')); });
    rerender({ ...initialProps, externos: filtros('vindo da URL', 'DISPONIVEL') });
    expect(result.current.rascunho).toEqual(filtros('vindo da URL', 'DISPONIVEL'));
    expect(result.current.erro).toBe('');
    act(() => { vi.advanceTimersByTime(1000); result.current.aplicarAgora(); });
    expect(aoAplicar).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserva digitação ao renderizar novamente com o mesmo valor externo', () => {
    const { result, rerender, initialProps, aoAplicar } = montar({ externos: filtros() });
    act(() => { result.current.definir(filtros('digitando')); vi.advanceTimersByTime(100); });
    rerender({ ...initialProps, externos: filtros() });
    expect(result.current.rascunho).toEqual(filtros('digitando'));
    act(() => { vi.advanceTimersByTime(250); });
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros('digitando'), true);
  });

  it('não apaga nova digitação quando a URL confirma um valor já aplicado', () => {
    const { result, rerender, initialProps, aoAplicar } = montar({ externos: filtros() });
    act(() => { result.current.definir(filtros('sala'), true); });
    act(() => { result.current.definir(filtros('galpão')); vi.advanceTimersByTime(100); });
    rerender({ ...initialProps, externos: filtros('sala') });
    expect(result.current.rascunho).toEqual(filtros('galpão'));
    act(() => { vi.advanceTimersByTime(250); });
    expect(aoAplicar.mock.calls).toEqual([[filtros('sala'), true], [filtros('galpão'), true]]);
  });

  it('funciona sem normalizador ou validador opcionais', () => {
    const { result, aoAplicar } = montar({ normalizar: undefined });
    act(() => { result.current.definir(filtros(' sala '), true); });
    expect(aoAplicar).toHaveBeenCalledExactlyOnceWith(filtros(' sala '), true);
    expect(result.current.erro).toBe('');
  });
});
