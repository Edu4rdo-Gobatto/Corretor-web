import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import SelecaoMidia from './SelecaoMidia';

beforeEach(() => { vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:previa'), revokeObjectURL: vi.fn() })); });
afterEach(() => vi.unstubAllGlobals());

it('acumula fotos válidas com prévia, recusa tipos inválidos e permite remover', () => {
  const aoAlterar = vi.fn();
  const foto = new File(['bytes'], 'fachada.jpg', { type: 'image/jpeg' });
  const { rerender } = render(<SelecaoMidia arquivos={[]} videos={[]} aoAlterar={aoAlterar} />);
  const entrada = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(entrada, 'files', { value: [foto], configurable: true });
  fireEvent.change(entrada);
  expect(aoAlterar).toHaveBeenCalledWith([foto], []);
  rerender(<SelecaoMidia arquivos={[foto]} videos={[]} aoAlterar={aoAlterar} />);
  expect(screen.getByAltText('Prévia 1: fachada.jpg')).toHaveAttribute('src', 'blob:previa');
  expect(screen.getByText(/Capa · fachada.jpg/)).toBeInTheDocument();
  Object.defineProperty(entrada, 'files', { value: [new File(['x'], 'doc.pdf', { type: 'application/pdf' })], configurable: true });
  fireEvent.change(entrada);
  expect(screen.getByRole('alert')).toHaveTextContent('JPG, PNG ou WebP');
  fireEvent.click(screen.getByRole('button', { name: 'Remover' }));
  expect(aoAlterar).toHaveBeenLastCalledWith([], []);
});
it('só aceita vídeos do YouTube ou Vimeo', () => {
  const aoAlterar = vi.fn();
  render(<SelecaoMidia arquivos={[]} videos={[]} aoAlterar={aoAlterar} />);
  fireEvent.change(screen.getByLabelText('Link do YouTube ou Vimeo'), { target: { value: 'https://example.test/video' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar vídeo' }));
  expect(screen.getByRole('alert')).toHaveTextContent('YouTube ou Vimeo');
  fireEvent.change(screen.getByLabelText('Link do YouTube ou Vimeo'), { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar vídeo' }));
  expect(aoAlterar).toHaveBeenCalledWith([], ['https://youtu.be/dQw4w9WgXcQ']);
});
