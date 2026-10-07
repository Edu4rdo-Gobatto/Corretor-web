import type { Sessao } from '../tipos';

const urlBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const urlApi = (caminho: string) => `${urlBase}${caminho}`;
let tokenAcesso: string | null = null;
let renovacaoPendente: Promise<Sessao> | null = null;
let versaoSessao = 0;

export const definirTokenAcesso = (token: string | null) => { versaoSessao++; tokenAcesso = token; renovacaoPendente = null; };

export class ErroApi extends Error {
  constructor(mensagem: string, public status: number) { super(mensagem); }
}

async function enviar(caminho: string, opcoes: RequestInit): Promise<Response> {
  const cabecalhos = new Headers(opcoes.headers);
  if (opcoes.body && !(opcoes.body instanceof FormData)) cabecalhos.set('Content-Type', 'application/json');
  if (tokenAcesso) cabecalhos.set('Authorization', `Bearer ${tokenAcesso}`);
  try {
    return await fetch(`${urlBase}${caminho}`, { ...opcoes, headers: cabecalhos, credentials: 'include', signal: opcoes.signal || AbortSignal.timeout(65000) });
  } catch {
    throw new ErroApi('Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.', 0);
  }
}

async function lerMensagem(resposta: Response): Promise<string | undefined> {
  const corpo = await resposta.json().catch(() => ({})) as { message?: string | string[] };
  return typeof corpo.message === 'string' ? corpo.message : corpo.message?.join(' ');
}

async function renovarAcesso(): Promise<Sessao> {
  const versao = versaoSessao;
  const resposta = await enviar('/autenticacao/renovar', { method: 'POST' });
  const verificarVersao = () => { if (versao !== versaoSessao) throw new ErroApi('A sessão foi alterada durante a renovação.', 401); };
  verificarVersao();
  if (!resposta.ok) {
    const mensagem = await lerMensagem(resposta);
    verificarVersao();
    if (resposta.status === 401 || resposta.status === 403) {
      tokenAcesso = null;
      if (mensagem === 'Origem não autorizada.') {
        throw new ErroApi('Esta origem não é autorizada pelo serviço. Confira o endereço da API e entre novamente.', resposta.status);
      }
      window.dispatchEvent(new Event('session-expired'));
      throw new ErroApi('Sua sessão expirou. Entre novamente para continuar.', resposta.status);
    }
    throw new ErroApi(mensagem || 'O serviço de sessão está indisponível. Tente novamente.', resposta.status);
  }
  const sessao = await resposta.json() as Sessao;
  verificarVersao();
  tokenAcesso = sessao.token_acesso;
  return sessao;
}

/** A restauração do provedor e a retentativa HTTP usam a mesma rotação do cookie. */
export function renovarSessao(): Promise<Sessao> {
  if (!renovacaoPendente) {
    const promessa = renovarAcesso().finally(() => { if (renovacaoPendente === promessa) renovacaoPendente = null; });
    renovacaoPendente = promessa;
  }
  return renovacaoPendente;
}

const MENSAGENS_PADRAO: Record<number, string> = {
  401: 'E-mail ou senha inválidos.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Registro não encontrado.',
  429: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
};

/** Uma renovação de sessão por vez: chamadas concorrentes compartilham a mesma promessa. */
async function respostaAutenticada(caminho: string, opcoes: RequestInit = {}, podeRenovar = true): Promise<Response> {
  let resposta = await enviar(caminho, opcoes);
  const rotaDeSessao = ['/autenticacao/entrar', '/autenticacao/renovar', '/autenticacao/sair'].some((rota) => caminho.startsWith(rota));
  if (resposta.status === 401 && podeRenovar && !rotaDeSessao) {
    await renovarSessao();
    resposta = await enviar(caminho, opcoes);
  }
  if (!resposta.ok) {
    const mensagem = await lerMensagem(resposta);
    const texto = resposta.status >= 500 ? 'O serviço está indisponível. Aguarde um momento e tente novamente.' : mensagem || MENSAGENS_PADRAO[resposta.status] || 'Não foi possível concluir a solicitação.';
    throw new ErroApi(texto, resposta.status);
  }
  return resposta;
}

export async function http<T>(caminho: string, opcoes: RequestInit = {}, podeRenovar = true): Promise<T> {
  const resposta = await respostaAutenticada(caminho, opcoes, podeRenovar);
  return resposta.status === 204 ? undefined as T : resposta.json() as Promise<T>;
}

export async function httpBlob(caminho: string): Promise<Blob> {
  return (await respostaAutenticada(caminho, { cache: 'no-store' })).blob();
}
