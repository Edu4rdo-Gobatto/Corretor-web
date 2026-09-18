import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, expect, it, vi } from 'vitest';
import Dialogo from './Dialogo';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});
it('impede o fechamento nativo no Escape e sincroniza o fechamento React', () => {
  const aoFechar = vi.fn();
  render(<Dialogo titulo="Detalhes" aoFechar={aoFechar}><p>Conteúdo</p></Dialogo>);
  const evento = new Event('cancel', { bubbles: true, cancelable: true });
  fireEvent(screen.getByRole('dialog'), evento);
  expect(evento.defaultPrevented).toBe(true);
  expect(aoFechar).toHaveBeenCalledOnce();
});
it('centraliza o modal e aplica a largura do tamanho escolhido', () => {
  render(<Dialogo titulo="Novo corretor" tamanho="largo" aoFechar={vi.fn()}><p>Conteúdo</p></Dialogo>);
  const dialogo = screen.getByRole('dialog');
  // Sem m-auto o reset do Tailwind zera a margem e o modal cola no canto superior esquerdo ("tela dividida").
  expect(dialogo).toHaveClass('m-auto');
  expect(dialogo.className).toContain('w-[min(880px,calc(100vw-32px))]');
  // O corpo rola por dentro e é o container das grades do formulário.
  expect(screen.getByText('Conteúdo').closest('[data-rolagem]')).toHaveClass('@container', 'overflow-y-auto');
});
it('usa a largura média quando o tamanho não é informado', () => {
  render(<Dialogo titulo="Contato" aoFechar={vi.fn()}><p>Conteúdo</p></Dialogo>);
  expect(screen.getByRole('dialog').className).toContain('w-[min(640px,calc(100vw-32px))]');
});
it('trava a rolagem compensando a barra e restaura o body ao fechar', () => {
  const larguraUtil = vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1009);
  const { unmount } = render(<Dialogo titulo="Contato" aoFechar={vi.fn()}><p>Conteúdo</p></Dialogo>);
  // jsdom tem innerWidth 1024: 15px de barra de rolagem a compensar.
  expect(document.body.style.overflow).toBe('hidden');
  expect(document.body.style.paddingRight).toBe('15px');
  unmount();
  expect(document.body.style.overflow).toBe('');
  expect(document.body.style.paddingRight).toBe('');
  larguraUtil.mockRestore();
});
