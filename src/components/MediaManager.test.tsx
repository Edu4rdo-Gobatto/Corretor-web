import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MediaManager from './MediaManager';
import { api } from '../services/api';
import { prepareMediaFiles } from './mediaUpload';
import type { Property } from '../types';

vi.mock('../services/api', () => ({
  api: {
    uploadMedia: vi.fn(),
    embedMedia: vi.fn(),
    coverMedia: vi.fn(),
    reorderMedia: vi.fn(),
    deleteMedia: vi.fn(),
  },
}));

vi.mock('./mediaUpload', () => ({ prepareMediaFiles: vi.fn() }));

function renderManager(url: string, type: 'VIDEO_EMBED' | 'VIDEO_FILE' = 'VIDEO_EMBED') {
  const property = {
    id: 'property-1',
    media: [{ id: 'media-1', type, url, orderIndex: 0, isCover: false }],
  } as Property;
  render(<MediaManager property={property} onChange={async () => undefined} />);
}

describe('segurança da mídia no painel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('não cria link clicável para URL de embed inválida', () => {
    renderManager('javascript:alert(1)');

    expect(screen.getByText('Vídeo indisponível')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /assistir ao vídeo/i })).not.toBeInTheDocument();
  });

  it('usa URL canônica e rel seguro para embeds válidos', () => {
    renderManager('https://youtu.be/dQw4w9WgXcQ');

    expect(screen.getByRole('link', { name: /assistir ao vídeo/i })).toHaveAttribute(
      'href',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
    expect(screen.getByRole('link', { name: /assistir ao vídeo/i })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('nomeia vídeos de arquivo para tecnologia assistiva', () => {
    renderManager('https://media.example.test/video.mp4', 'VIDEO_FILE');

    expect(screen.getByLabelText('Vídeo 1 do imóvel')).toBeInTheDocument();
  });

  it('envia as fotos legíveis e avisa quais foram puladas', async () => {
    const good = new File(['bytes'], 'boa.webp', { type: 'image/webp' });
    vi.mocked(prepareMediaFiles).mockImplementation(async (files, _progress, onError) => {
      onError?.(files[1]);
      return [good];
    });
    vi.mocked(api.uploadMedia).mockResolvedValue(undefined);
    render(<MediaManager property={{ id: 'property-1', media: [] } as unknown as Property} onChange={async () => undefined} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bad = new File(['bytes'], 'ruim.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [good, bad] });
    fireEvent.change(input);

    await waitFor(() => expect(api.uploadMedia).toHaveBeenCalledWith('property-1', [good]));
    expect(screen.getByText('Arquivos adicionados. Não foi possível ler: ruim.jpg.')).toBeInTheDocument();
  });

  it('mostra erro em português quando nenhuma foto pode ser lida', async () => {
    vi.mocked(prepareMediaFiles).mockImplementation(async (files, _progress, onError) => {
      files.forEach((file) => onError?.(file));
      return [];
    });
    render(<MediaManager property={{ id: 'property-1', media: [] } as unknown as Property} onChange={async () => undefined} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [new File(['bytes'], 'ruim.jpg', { type: 'image/jpeg' })] });
    fireEvent.change(input);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível ler: ruim.jpg.'));
    expect(api.uploadMedia).not.toHaveBeenCalled();
  });
});

