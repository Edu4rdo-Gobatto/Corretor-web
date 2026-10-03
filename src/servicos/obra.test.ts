import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface AudioFalso {
  src: string;
  loop: boolean;
  volume: number;
  preload: string;
  currentTime: number;
  paused: boolean;
  load: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
}

function instalarAudioFalso(falhar = false) {
  const criados: AudioFalso[] = [];
  const construtor = vi.fn(function (this: unknown, src?: string) {
    const audio: AudioFalso = {
      src: src ?? '',
      loop: false,
      volume: 1,
      preload: '',
      currentTime: 0,
      paused: true,
      load: vi.fn(),
      play: vi.fn(() => {
        if (falhar) return Promise.reject(new Error('autoplay bloqueado'));
        audio.paused = false;
        return Promise.resolve();
      }),
      pause: vi.fn(() => {
        audio.paused = true;
      }),
    };
    criados.push(audio);
    return audio;
  });
  vi.stubGlobal('Audio', construtor);
  return { construtor, criados };
}

// Módulo com estado (audios em cache): recarrega a cada teste para isolar.
async function carregarObra() {
  return await import('./obra');
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sons reais da obra', () => {
  it('é inofensivo sem HTMLAudio (SSR ou navegador sem áudio)', async () => {
    vi.stubGlobal('Audio', undefined);
    const obra = await carregarObra();
    expect(obra.prepararAudioObra()).toBe(false);
    expect(await obra.ligarObra()).toBe(false);
    expect(obra.obraLigada()).toBe(false);
    expect(() => obra.desligarObra()).not.toThrow();
  });

  it('liga as três faixas em loop com volumes próprios e desliga zerando', async () => {
    const { construtor, criados } = instalarAudioFalso();
    const obra = await carregarObra();
    expect(await obra.ligarObra()).toBe(true);
    expect(construtor).toHaveBeenCalledTimes(3);
    expect(criados.map((audio) => audio.src)).toEqual([
      '/assets/obra-furadeira.mp3',
      '/assets/obra-martelo.mp3',
      '/assets/obra-ambiente.mp3',
    ]);
    for (const audio of criados) {
      expect(audio.loop).toBe(true);
      expect(audio.play).toHaveBeenCalled();
    }
    expect(obra.obraLigada()).toBe(true);
    // Segunda chamada reaproveita (sem duplicar).
    expect(await obra.ligarObra()).toBe(true);
    expect(construtor).toHaveBeenCalledTimes(3);
    obra.desligarObra();
    expect(obra.obraLigada()).toBe(false);
    for (const audio of criados) {
      expect(audio.pause).toHaveBeenCalled();
      expect(audio.currentTime).toBe(0);
    }
  });

  it('relata false quando o navegador bloqueia o autoplay', async () => {
    instalarAudioFalso(true);
    const obra = await carregarObra();
    expect(await obra.ligarObra()).toBe(false);
    expect(obra.obraLigada()).toBe(false);
  });

  it('sinaliza a ida ao /devs e pré-carrega dentro do gesto', async () => {
    const { criados } = instalarAudioFalso();
    const obra = await carregarObra();
    expect(obra.houveSinalDeIdaAosDevs()).toBe(false);
    obra.sinalizarIdaAosDevs();
    expect(obra.houveSinalDeIdaAosDevs()).toBe(true);
    expect(criados).toHaveLength(3);
    for (const audio of criados) {
      expect(audio.load).toHaveBeenCalled();
      expect(audio.preload).toBe('none');
    }
    obra.limparSinalDeIdaAosDevs();
    expect(obra.houveSinalDeIdaAosDevs()).toBe(false);
  });
});
