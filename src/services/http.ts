const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
let accessToken: string | null = null;
let pendingRefresh: Promise<void> | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }

async function send(path: string, options: RequestInit): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  try {
    return await fetch(`${baseUrl}${path}`, { ...options, headers, credentials: 'include', signal: options.signal || AbortSignal.timeout(65000) });
  } catch {
    throw new ApiError('Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.', 0);
  }
}
async function refreshAccess(): Promise<void> {
  const response = await send('/auth/refresh', { method: 'POST' });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string | string[] };
    const message = typeof body.message === 'string' ? body.message : body.message?.join(' ');
    if (response.status === 401 || response.status === 403) {
      accessToken = null;
      window.dispatchEvent(new Event('session-expired'));
      throw new ApiError('Sua sessão expirou. Entre novamente para continuar.', response.status);
    }
    throw new ApiError(message || 'O serviço de sessão está indisponível. Tente novamente.', response.status);
  }
  const session = await response.json();
  accessToken = session.accessToken;
}
async function authenticatedResponse(path: string, options: RequestInit = {}, canRefresh = true): Promise<Response> {
  let response = await send(path, options);
  if (response.status === 401 && canRefresh && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh') && !path.startsWith('/auth/logout')) {
    if (!pendingRefresh) pendingRefresh = refreshAccess().finally(() => { pendingRefresh = null; });
    await pendingRefresh;
    response = await send(path, options);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string | string[] };
    const fallback: Record<number, string> = { 401: 'E-mail ou senha inválidos.', 403: 'Você não tem permissão para esta ação.', 404: 'Registro não encontrado.', 429: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' };
    const message = typeof body.message === 'string' ? body.message : body.message?.join(' ');
    throw new ApiError(response.status >= 500 ? 'O serviço está indisponível. Aguarde um momento e tente novamente.' : message || fallback[response.status] || 'Não foi possível concluir a solicitação.', response.status);
  }
  return response;
}
export async function http<T>(path: string, options: RequestInit = {}, canRefresh = true): Promise<T> {
  const response = await authenticatedResponse(path, options, canRefresh);
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
export async function httpBlob(path: string): Promise<Blob> {
  return (await authenticatedResponse(path, {cache:'no-store'})).blob();
}
