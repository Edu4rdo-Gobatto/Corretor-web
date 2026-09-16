import { describe, expect, it } from 'vitest';
import { urlEmbed } from './videoEmbed';

describe('vídeo incorporado', () => {
  it('normaliza YouTube e Vimeo para os reprodutores canônicos', () => {
    expect(urlEmbed('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(urlEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(urlEmbed('https://vimeo.com/1234')).toBe('https://player.vimeo.com/video/1234');
  });
  it('rejeita origens enganosas, credenciais e esquemas inseguros', () => {
    for (const valor of ['https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'https://user@youtube.com/watch?v=dQw4w9WgXcQ', 'http://vimeo.com/1234', 'javascript:alert(1)']) expect(urlEmbed(valor)).toBeNull();
  });
});
