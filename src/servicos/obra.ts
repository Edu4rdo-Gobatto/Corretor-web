// Easter egg do /devs: áudios reais de obra, sem dependências (só HTMLAudioElement).
// Sons em CC0 (domínio público) do BigSoundBank, vendored em `public/assets`
// (sem hotlink externo, sem streaming de terceiro):
// - obra-furadeira.mp3: furadeira #0184, aparada para loop de 10s;
// - obra-martelo.mp3: martelo com prego #0005, 11s em loop;
// - obra-ambiente.mp3: canteiro #0631, aparado para loop de 30s.
// Os arquivos têm preload 'none': a intro tenta play ao abrir o /devs; o link
// do rodapé também pode pré-carregar dentro do clique. Sem áudio nas outras rotas.
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
let geracao = 0;
let pendente: Promise<boolean> | null = null;

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
  desligarObra();
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
export function ligarObra(): Promise<boolean> {
  if (tocando) return Promise.resolve(true);
  if (pendente) return pendente;
  const lista = audios ?? criarAudios();
  if (!lista) return Promise.resolve(false);
  audios = lista;
  const inicio = geracao;
  const promessa = Promise.all(lista.map(async (audio) => {
    const ligou = await tentarTocar(audio);
    if (inicio !== geracao) {
      pausar(audio);
      return false;
    }
    return ligou;
  })).then((resultados) => {
    if (inicio !== geracao) return false;
    tocando = resultados.some(Boolean);
    if (!tocando) desligarObra();
    return tocando;
  }).finally(() => {
    if (pendente === promessa) pendente = null;
  });
  pendente = promessa;
  return promessa;
}

function pausar(audio: HTMLAudioElement): void {
  try { audio.pause(); audio.currentTime = 0; } catch { /* Mídia já indisponível. */ }
}

/** Pausa tudo e volta ao início, para a próxima visita recomeçar do zero. Seguro chamar desligado ou no SSR. */
export function desligarObra(): void {
  geracao += 1;
  pendente = null;
  tocando = false;
  const anteriores = audios;
  audios = null;
  anteriores?.forEach(pausar);
}
