import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Dialog from './Dialog';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});

describe('Dialog', () => {
  it('impede o fechamento nativo no Escape e sincroniza o fechamento React', () => {
    const onClose = vi.fn();
    render(<Dialog title="Detalhes" onClose={onClose}><p>Conteúdo</p></Dialog>);

    const event = new Event('cancel', { bubbles: true, cancelable: true });
    fireEvent(screen.getByRole('dialog'), event);

    expect(event.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

