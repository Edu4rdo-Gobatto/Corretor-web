const urlBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
let tokenAcesso: string | null = null;
let renovacaoPendente: Promise<void> | null = null;

export const definirTokenAcesso = (token: string | null) => { tokenAcesso = token; };

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

async function renovarAcesso(): Promise<void> {
  const resposta = await enviar('/autenticacao/renovar', { method: 'POST' });
  if (!resposta.ok) {
    const mensagem = await lerMensagem(resposta);
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
  const sessao = await resposta.json() as { token_acesso: string };
  tokenAcesso = sessao.token_acesso;
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
    if (!renovacaoPendente) renovacaoPendente = renovarAcesso().finally(() => { renovacaoPendente = null; });
    await renovacaoPendente;
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
