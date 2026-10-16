import { describe, expect, it } from 'vitest';
import { urlEmbed } from './videoEmbed';

const youtubeId = 'dQw4w9WgXcQ';
const youtubeEmbed = `https://www.youtube-nocookie.com/embed/${youtubeId}`;

describe('urlEmbed', () => {
  it.each([
    `https://www.youtube.com/watch?v=${youtubeId}&utm_source=teste&t=12#inicio`,
    `https://youtube.com/watch?feature=shared&v=${youtubeId}`,
    `https://youtu.be/${youtubeId}?si=tracking`,
    `https://www.youtube.com/embed/${youtubeId}?autoplay=1`,
    `https://youtube.com/shorts/${youtubeId}`,
    `https://www.youtube-nocookie.com/embed/${youtubeId}`,
    'https://YOUTUBE.COM/watch?v=A_-01234567',
  ])('normaliza YouTube e descarta parâmetros e fragmentos: %s', (url) => {
    const id = url.includes('A_-01234567') ? 'A_-01234567' : youtubeId;
    expect(urlEmbed(url)).toBe(`https://www.youtube-nocookie.com/embed/${id}`);
  });

  it.each(['https://vimeo.com/123456789?share=copy#inicio', 'https://www.vimeo.com/123456789', 'https://player.vimeo.com/video/123456789?autoplay=1'])(
    'normaliza Vimeo em player sem parâmetros: %s', (url) => {
      expect(urlEmbed(url)).toBe('https://player.vimeo.com/video/123456789');
    },
  );

  it.each([
    '', '/watch?v=dQw4w9WgXcQ', 'javascript:alert(1)',
    `http://youtube.com/watch?v=${youtubeId}`,
    `https://usuario@youtube.com/watch?v=${youtubeId}`,
    `https://usuario:senha@youtube.com/watch?v=${youtubeId}`,
    `https://youtube.com.evil.example/watch?v=${youtubeId}`,
    `https://evilyoutube.com/watch?v=${youtubeId}`,
    `https://m.youtube.com/watch?v=${youtubeId}`,
    `https://youtube.com@evil.example/watch?v=${youtubeId}`,
    'https://vimeo.com.evil.example/123456789', 'https://outro.vimeo.com/123456789',
    `https://youtube.com/watch?v=${youtubeId}&v=${youtubeId}`,
    `https://youtube.com/watch?v=${youtubeId}&v=`,
    'https://youtube.com/watch', 'https://youtube.com/watch?v=curto',
    `https://youtube.com/watch?v=${youtubeId}extra`,
    'https://youtube.com/watch?v=%3Cscript%3E12',
    `https://youtube.com/watch/extra?v=${youtubeId}`,
    `https://youtube.com/playlist?v=${youtubeId}`,
    `https://youtube.com/embed/${youtubeId}/extra`,
    `https://youtu.be/${youtubeId}/extra`,
    'https://vimeo.com/abc', 'https://vimeo.com/123/extra',
    'https://player.vimeo.com/123', 'https://player.vimeo.com/video/123abc',
  ])('recusa origem, credenciais, caminho ou identificador indevido: %j', (url) => {
    expect(urlEmbed(url)).toBeNull();
  });

  it('devolve uma URL de embed idempotente', () => {
    expect(urlEmbed(youtubeEmbed)).toBe(youtubeEmbed);
  });
});
