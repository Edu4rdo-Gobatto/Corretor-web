import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MediaManager from './MediaManager';
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

function renderManager(url: string, type: 'VIDEO_EMBED' | 'VIDEO_FILE' = 'VIDEO_EMBED') {
  const property = {
    id: 'property-1',
    media: [{ id: 'media-1', type, url, orderIndex: 0, isCover: false }],
  } as Property;
  render(<MediaManager property={property} onChange={async () => undefined} />);
}

describe('segurança da mídia no painel', () => {
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
});

