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
