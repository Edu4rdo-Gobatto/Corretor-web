import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GerenciadorMidia from './GerenciadorMidia';
import { api } from '../servicos/api';
import { prepararEnvio } from './prepararMidia';
import type { FichaImovel } from '../tipos';

vi.mock('../servicos/api', () => ({ api: { enviarMidias: vi.fn(), adicionarVideo: vi.fn(), definirCapa: vi.fn(), reordenarMidias: vi.fn(), excluirMidia: vi.fn() } }));
vi.mock('./prepararMidia', async (importar) => ({ ...(await importar<typeof import('./prepararMidia')>()), prepararEnvio: vi.fn() }));

function montar(url: string, tipo: 'VIDEO_EMBED' | 'VIDEO_ARQUIVO' = 'VIDEO_EMBED') {
  const imovel = { id: 1, midias: [{ id: 1, tipo, url, ordem: 0, capa: false }] } as FichaImovel;
  render(<GerenciadorMidia imovel={imovel} aoAlterar={async () => undefined} />);
}
describe('segurança e envio de mídia no painel', () => {
  beforeEach(() => vi.clearAllMocks());
  it('não cria link clicável para URL de embed inválida', () => {
    montar('javascript:alert(1)');
    expect(screen.getByText('Vídeo indisponível')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /assistir ao vídeo/i })).not.toBeInTheDocument();
  });
  it('usa URL canônica e rel seguro para embeds válidos', () => {
    montar('https://youtu.be/dQw4w9WgXcQ');
    expect(screen.getByRole('link', { name: /assistir ao vídeo/i })).toHaveAttribute('href', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(screen.getByRole('link', { name: /assistir ao vídeo/i })).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it('nomeia vídeos de arquivo para tecnologia assistiva', () => {
    montar('https://media.example.test/video.mp4', 'VIDEO_ARQUIVO');
    expect(screen.getByLabelText('Vídeo 1 do imóvel')).toBeInTheDocument();
  });
  it('envia as fotos legíveis e avisa quais foram puladas', async () => {
    const boa = new File(['bytes'], 'boa.webp', { type: 'image/webp' });
    vi.mocked(prepararEnvio).mockResolvedValue({ prontos: [boa], ilegiveis: ['ruim.jpg'] });
    vi.mocked(api.enviarMidias).mockResolvedValue([]);
    render(<GerenciadorMidia imovel={{ id: 1, midias: [] } as unknown as FichaImovel} aoAlterar={async () => undefined} />);
    const entrada = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(entrada, 'files', { value: [boa, new File(['bytes'], 'ruim.jpg', { type: 'image/jpeg' })] });
    fireEvent.change(entrada);
    await waitFor(() => expect(api.enviarMidias).toHaveBeenCalledWith(1, [boa]));
    expect(screen.getByText('Arquivos adicionados. Não foi possível ler: ruim.jpg.')).toBeInTheDocument();
  });
  it('recusa tipo de arquivo não aceito antes de preparar', async () => {
    render(<GerenciadorMidia imovel={{ id: 1, midias: [] } as unknown as FichaImovel} aoAlterar={async () => undefined} />);
    const entrada = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(entrada, 'files', { value: [new File(['bytes'], 'doc.pdf', { type: 'application/pdf' })] });
    fireEvent.change(entrada);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Use imagens JPG, PNG ou WebP'));
    expect(prepararEnvio).not.toHaveBeenCalled();
  });
});
