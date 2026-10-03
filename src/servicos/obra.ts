// Easter egg do /devs: áudios reais de obra, sem dependências (só HTMLAudioElement).
// Sons em CC0 (domínio público) do BigSoundBank, vendored em `public/assets`
// (sem hotlink externo, sem streaming de terceiro):
// - obra-furadeira.mp3: furadeira #0184, aparada para loop de 10s;
// - obra-martelo.mp3: martelo com prego #0005, 11s em loop;
// - obra-ambiente.mp3: canteiro #0631, aparado para loop de 30s.
// Os arquivos só são baixados quando o visitante vai ao /devs (`preload: 'none'`
// + `load()` dentro do gesto do clique); o resto do site não paga nada.
// SSR-safe: `window`/`Audio` só dentro das funções, nunca no import.

interface Faixa {
  arquivo: string;
  volume: number;
}

const FAIXAS: Faixa[] = [
  { arquivo: '/assets/obra-furadeira.mp3', volume: 0.09 },
  { arquivo: '/assets/obra-martelo.mp3', volume: 0.8 },
  { arquivo: '/assets/obra-ambiente.mp3', volume: 0.3 },
];

let audios: HTMLAudioElement[] | null = null;
let tocando = false;
let idaAosDevs = false;

function audioDisponivel(): boolean {
  return typeof window !== 'undefined' && typeof window.Audio !== 'undefined';
}

function criarAudios(): HTMLAudioElement[] | null {
  if (!audioDisponivel()) return null;
  return FAIXAS.map((faixa) => {
    const audio = new window.Audio(faixa.arquivo);
    audio.loop = true;
    audio.volume = faixa.volume;
    audio.preload = 'none';
    return audio;
  });
}

async function tentarTocar(audio: HTMLAudioElement): Promise<boolean> {
  try {
    const promessa = audio.play() as unknown;
    if (promessa instanceof Promise) await promessa;
    return true;
  } catch {
    // Navegador bloqueou (sem gesto) ou formato indisponível.
    return false;
  }
}

/** Clique no "Desenvolvedores": pré-carrega os áudios dentro do gesto do usuário. */
export function sinalizarIdaAosDevs(): void {
  idaAosDevs = true;
  try {
    const novos = criarAudios();
    if (!novos) return;
    for (const audio of novos) audio.load();
    audios = novos;
  } catch {
    // Pré-carregamento é otimização: falhar aqui não impede o play no gesto seguinte.
  }
}

/** Há Web Audio/HTMLAudio neste ambiente? Falso no SSR. */
export function prepararAudioObra(): boolean {
  return audioDisponivel();
}

export function houveSinalDeIdaAosDevs(): boolean {
  return idaAosDevs;
}

export function limparSinalDeIdaAosDevs(): void {
  idaAosDevs = false;
}

export function obraLigada(): boolean {
  return tocando;
}

/** Toca as três faixas em loop. Resolve false se o navegador bloquear ou sem áudio. */
export async function ligarObra(): Promise<boolean> {
  if (tocando) return true;
  const lista = audios ?? criarAudios();
  if (!lista) return false;
  audios = lista;
  const resultados = await Promise.all(lista.map((audio) => tentarTocar(audio)));
  tocando = resultados.some(Boolean);
  if (!tocando) desligarObra();
  return tocando;
}

/** Pausa tudo e volta ao início, para a próxima visita recomeçar do zero. Seguro chamar desligado ou no SSR. */
export function desligarObra(): void {
  tocando = false;
  if (!audios) return;
  for (const audio of audios) {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Já pausado ou sem mídia carregada: nada a fazer.
    }
  }
}
