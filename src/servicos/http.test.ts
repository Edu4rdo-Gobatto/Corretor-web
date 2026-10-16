// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let transporte: typeof import('./http');
let cache: typeof import('./cache');
const buscar = vi.fn<typeof fetch>();
const expirou = vi.fn();
const resposta = (valor: unknown, status = 200) => new Response(JSON.stringify(valor), { status });
const sessao = (token = 'renovado') => ({ token_acesso: token, tipo_token: 'Bearer', corretor: { id: 1 } });
function pendente<T>() {
  let resolver!: (valor: T) => void;
  const promessa = new Promise<T>((resolve) => { resolver = resolve; });
  return { promessa, resolver };
}
function cabecalho(indice: number, nome: string) {
  return new Headers(buscar.mock.calls[indice][1]?.headers).get(nome);
}

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', '/api/');
  vi.stubGlobal('fetch', buscar);
  buscar.mockReset();
  expirou.mockReset();
  transporte = await import('./http');
  cache = await import('./cache');
  window.addEventListener('session-expired', expirou);
});
afterEach(() => {
  transporte.definirTokenAcesso(null);
  cache.limparCache();
  window.removeEventListener('session-expired', expirou);
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('transporte HTTP', () => {
  it('envia JSON, token em memória, credenciais e sinal recebidos e devolve JSON', async () => {
    transporte.definirTokenAcesso('atual');
    buscar.mockResolvedValue(resposta({ id: 23 }));
    const sinal = new AbortController().signal;
    await expect(transporte.http('/pessoas', { method: 'POST', body: '{"nome":"Ana"}', headers: { 'X-Origem': 'painel' }, signal: sinal })).resolves.toEqual({ id: 23 });
    expect(transporte.urlApi('/pessoas')).toBe('/api/pessoas');
    expect(buscar).toHaveBeenCalledWith('/api/pessoas', expect.objectContaining({ method: 'POST', body: '{"nome":"Ana"}', credentials: 'include', signal: sinal }));
    expect(cabecalho(0, 'Authorization')).toBe('Bearer atual');
    expect(cabecalho(0, 'Content-Type')).toBe('application/json');
    expect(cabecalho(0, 'X-Origem')).toBe('painel');
  });

  it('não define Content-Type de FormData e devolve undefined no 204', async () => {
    const corpo = new FormData();
    corpo.set('nome', 'Ana');
    buscar.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(transporte.http('/perfil', { method: 'PATCH', body: corpo })).resolves.toBeUndefined();
    expect(buscar.mock.calls[0][1]?.body).toBe(corpo);
    expect(cabecalho(0, 'Content-Type')).toBeNull();
    expect(cabecalho(0, 'Authorization')).toBeNull();
  });

  it('devolve o blob de download com no-store', async () => {
    buscar.mockResolvedValue(new Response('nome\nAna', { headers: { 'Content-Type': 'text/csv' } }));
    const arquivo = await transporte.httpBlob('/contatos.csv');
    const texto = await new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = () => reject(leitor.error);
      leitor.readAsText(arquivo);
    });
    expect(texto).toBe('nome\nAna');
    expect(arquivo.type).toBe('text/csv');
    expect(buscar).toHaveBeenCalledWith('/api/contatos.csv', expect.objectContaining({ cache: 'no-store', credentials: 'include' }));
  });

  it('compartilha uma renovação entre dois 401 simultâneos e repete cada requisição uma vez', async () => {
    transporte.definirTokenAcesso('vencido');
    const renovacao = pendente<Response>();
    const iniciou = pendente<void>();
    const tentativas = new Map<string, number>();
    buscar.mockImplementation(async (destino) => {
      const caminho = String(destino);
      if (caminho === '/api/autenticacao/renovar') { iniciou.resolver(); return renovacao.promessa; }
      const tentativa = (tentativas.get(caminho) ?? 0) + 1;
      tentativas.set(caminho, tentativa);
      return tentativa === 1 ? resposta({}, 401) : resposta({ caminho });
    });
    const primeira = transporte.http('/a');
    const segunda = transporte.http('/b');
    await iniciou.promessa;
    expect(buscar.mock.calls.filter(([url]) => url === '/api/autenticacao/renovar')).toHaveLength(1);
    renovacao.resolver(resposta(sessao()));
    await expect(Promise.all([primeira, segunda])).resolves.toEqual([{ caminho: '/api/a' }, { caminho: '/api/b' }]);
    expect(buscar).toHaveBeenCalledTimes(5);
    expect(tentativas).toEqual(new Map([['/api/a', 2], ['/api/b', 2]]));
    expect(cabecalho(3, 'Authorization')).toBe('Bearer renovado');
    expect(cabecalho(4, 'Authorization')).toBe('Bearer renovado');
  });

  it('renovação direta e HTTP compartilham a mesma promessa', async () => {
    const renovacao = pendente<Response>();
    const recebeu401 = pendente<void>();
    buscar.mockImplementation(async (url) => {
      if (url === '/api/autenticacao/renovar') return renovacao.promessa;
      if (buscar.mock.calls.filter(([destino]) => destino === '/api/a').length === 1) { recebeu401.resolver(); return resposta({}, 401); }
      return resposta({ ok: true });
    });
    const direta = transporte.renovarSessao();
    const requisicao = transporte.http('/a');
    await recebeu401.promessa;
    expect(transporte.renovarSessao()).toBe(direta);
    renovacao.resolver(resposta(sessao()));
    await expect(direta).resolves.toMatchObject({ token_acesso: 'renovado' });
    await expect(requisicao).resolves.toEqual({ ok: true });
    expect(buscar.mock.calls.filter(([url]) => url === '/api/autenticacao/renovar')).toHaveLength(1);
  });

  it.each(['/autenticacao/entrar', '/autenticacao/renovar', '/autenticacao/sair'])('401 em %s não tenta renovar', async (caminho) => {
    buscar.mockResolvedValue(resposta({}, 401));
    await expect(transporte.http(caminho)).rejects.toMatchObject({ status: 401, message: 'E-mail ou senha inválidos.' });
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('podeRenovar=false impede renovação de endpoint público', async () => {
    buscar.mockResolvedValue(resposta({}, 401));
    await expect(transporte.http('/imoveis', {}, false)).rejects.toMatchObject({ status: 401 });
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('segundo 401 encerra a retentativa', async () => {
    buscar.mockResolvedValueOnce(resposta({}, 401)).mockResolvedValueOnce(resposta(sessao())).mockResolvedValueOnce(resposta({ message: 'Acesso recusado.' }, 401));
    await expect(transporte.http('/a')).rejects.toMatchObject({ status: 401, message: 'Acesso recusado.' });
    expect(buscar).toHaveBeenCalledTimes(3);
  });

  it.each([401, 403])('falha %i na renovação limpa o token e emite expiração uma vez', async (status) => {
    transporte.definirTokenAcesso('antigo');
    buscar.mockResolvedValueOnce(resposta({ message: 'cookie inválido' }, status)).mockResolvedValueOnce(resposta({ ok: true }));
    await expect(transporte.renovarSessao()).rejects.toMatchObject({ status, message: 'Sua sessão expirou. Entre novamente para continuar.' });
    expect(expirou).toHaveBeenCalledTimes(1);
    await transporte.http('/verificar');
    expect(cabecalho(1, 'Authorization')).toBeNull();
  });

  it('origem não autorizada não emite expiração nem expõe mensagem interna', async () => {
    buscar.mockResolvedValue(resposta({ message: 'Origem não autorizada.' }, 403));
    await expect(transporte.renovarSessao()).rejects.toMatchObject({ status: 403, message: 'Esta origem não é autorizada pelo serviço. Confira o endereço da API e entre novamente.' });
    expect(expirou).not.toHaveBeenCalled();
  });

  it('5xx na renovação conserva o token e não encerra a sessão', async () => {
    transporte.definirTokenAcesso('conservado');
    buscar.mockResolvedValueOnce(resposta({}, 503)).mockResolvedValueOnce(resposta({ ok: true }));
    await expect(transporte.renovarSessao()).rejects.toMatchObject({ status: 503, message: 'O serviço de sessão está indisponível. Tente novamente.' });
    expect(expirou).not.toHaveBeenCalled();
    await transporte.http('/verificar');
    expect(cabecalho(1, 'Authorization')).toBe('Bearer conservado');
  });

  it('erro de rede vira status 0 sem vazar a mensagem original', async () => {
    buscar.mockRejectedValue(new Error('senha=segredo; host interno'));
    await expect(transporte.http('/a')).rejects.toMatchObject({ status: 0, message: 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.' });
  });

  it('resposta 5xx oculta detalhes internos', async () => {
    buscar.mockResolvedValue(resposta({ message: 'SQL postgres://segredo' }, 500));
    await expect(transporte.http('/a')).rejects.toMatchObject({ status: 500, message: 'O serviço está indisponível. Aguarde um momento e tente novamente.' });
  });

  it('5xx na renovação também oculta detalhes internos', async () => {
    buscar.mockResolvedValue(resposta({ message: 'SQL postgres://usuario:segredo@host-interno' }, 503));
    await expect(transporte.renovarSessao()).rejects.toMatchObject({ status: 503, message: 'O serviço de sessão está indisponível. Tente novamente.' });
    expect(expirou).not.toHaveBeenCalled();
  });

  it('mensagens de validação em lista são apresentadas juntas', async () => {
    buscar.mockResolvedValue(resposta({ message: ['Nome obrigatório.', 'Telefone inválido.'] }, 400));
    await expect(transporte.http('/a')).rejects.toMatchObject({ status: 400, message: 'Nome obrigatório. Telefone inválido.' });
  });

  it.each([null, 'outra-sessao'])('troca/logout durante fetch impede token antigo de ressuscitar (%s)', async (token) => {
    const renovacao = pendente<Response>();
    buscar.mockReturnValueOnce(renovacao.promessa).mockResolvedValue(resposta({ ok: true }));
    const antiga = transporte.renovarSessao();
    const rejeicao = expect(antiga).rejects.toMatchObject({ status: 401, message: 'A sessão foi alterada durante a renovação.' });
    transporte.definirTokenAcesso(token);
    renovacao.resolver(resposta(sessao('obsoleto')));
    await rejeicao;
    await transporte.http('/verificar');
    expect(cabecalho(1, 'Authorization')).toBe(token ? 'Bearer outra-sessao' : null);
    expect(expirou).not.toHaveBeenCalled();
  });

  it.each([null, 'nova'])('troca/logout enquanto lê JSON de sucesso impede o token antigo (%s)', async (token) => {
    const corpo = pendente<unknown>();
    const iniciouLeitura = pendente<void>();
    const retorno = resposta({});
    vi.spyOn(retorno, 'json').mockImplementation(() => { iniciouLeitura.resolver(); return corpo.promessa; });
    buscar.mockResolvedValueOnce(retorno).mockResolvedValue(resposta({ ok: true }));
    const antiga = transporte.renovarSessao();
    const rejeicao = expect(antiga).rejects.toMatchObject({ status: 401 });
    await iniciouLeitura.promessa;
    transporte.definirTokenAcesso(token);
    corpo.resolver(sessao('obsoleto'));
    await rejeicao;
    await transporte.http('/verificar');
    expect(cabecalho(1, 'Authorization')).toBe(token ? 'Bearer nova' : null);
  });

  it('troca durante JSON de falha não limpa a sessão nova nem emite expiração', async () => {
    const corpo = pendente<unknown>();
    const iniciouLeitura = pendente<void>();
    const retorno = resposta({}, 401);
    vi.spyOn(retorno, 'json').mockImplementation(() => { iniciouLeitura.resolver(); return corpo.promessa; });
    buscar.mockResolvedValueOnce(retorno).mockResolvedValue(resposta({ ok: true }));
    const antiga = transporte.renovarSessao();
    const rejeicao = expect(antiga).rejects.toMatchObject({ message: 'A sessão foi alterada durante a renovação.' });
    await iniciouLeitura.promessa;
    transporte.definirTokenAcesso('nova');
    corpo.resolver({ message: 'expirada' });
    await rejeicao;
    await transporte.http('/verificar');
    expect(cabecalho(1, 'Authorization')).toBe('Bearer nova');
    expect(expirou).not.toHaveBeenCalled();
  });

  it('finally de renovação velha não apaga a promessa de renovação nova', async () => {
    const primeira = pendente<Response>();
    const segunda = pendente<Response>();
    buscar.mockReturnValueOnce(primeira.promessa).mockReturnValueOnce(segunda.promessa);
    const antiga = transporte.renovarSessao();
    const rejeicao = expect(antiga).rejects.toMatchObject({ status: 401 });
    transporte.definirTokenAcesso('nova');
    const atual = transporte.renovarSessao();
    primeira.resolver(resposta(sessao('obsoleto')));
    await rejeicao;
    expect(transporte.renovarSessao()).toBe(atual);
    expect(buscar).toHaveBeenCalledTimes(2);
    segunda.resolver(resposta(sessao('atual')));
    await expect(atual).resolves.toMatchObject({ token_acesso: 'atual' });
  });
});

describe('invalidação do cache pelo HTTP', () => {
  it.each(['POST', 'PATCH', 'DELETE', 'post', 'patch', 'delete'])('limpa o cache após %s bem-sucedido, inclusive 204', async (method) => {
    cache.guardarCache('catalogo', 'anterior', 1000);
    buscar.mockResolvedValue(new Response(null, { status: 204 }));
    await transporte.http('/escrita', { method });
    expect(cache.lerCache('catalogo')).toBeUndefined();
  });

  it.each(['GET', 'HEAD'])('%s não invalida cache público', async (method) => {
    cache.guardarCache('catalogo', 'anterior', 1000);
    buscar.mockResolvedValue(new Response(null, { status: 204 }));
    await transporte.http('/leitura', { method });
    expect(cache.lerCache('catalogo')).toBe('anterior');
  });

  it('escrita falha conserva o cache', async () => {
    cache.guardarCache('catalogo', 'anterior', 1000);
    buscar.mockResolvedValue(resposta({}, 400));
    await expect(transporte.http('/escrita', { method: 'PATCH' })).rejects.toMatchObject({ status: 400 });
    expect(cache.lerCache('catalogo')).toBe('anterior');
  });

  it('401+retry com falha conserva o cache', async () => {
    cache.guardarCache('catalogo', 'anterior', 1000);
    buscar.mockResolvedValueOnce(resposta({}, 401)).mockResolvedValueOnce(resposta(sessao())).mockResolvedValueOnce(resposta({}, 403));
    await expect(transporte.http('/escrita', { method: 'DELETE' })).rejects.toMatchObject({ status: 403 });
    expect(cache.lerCache('catalogo')).toBe('anterior');
    expect(buscar).toHaveBeenCalledTimes(3);
  });

  it('401 seguido de renovação só invalida quando a escrita é confirmada', async () => {
    cache.guardarCache('catalogo', 'anterior', 1000);
    const escrita = pendente<Response>();
    const iniciouRetry = pendente<void>();
    buscar.mockResolvedValueOnce(resposta({}, 401)).mockResolvedValueOnce(resposta(sessao())).mockImplementationOnce(() => { iniciouRetry.resolver(); return escrita.promessa; });
    const requisicao = transporte.http('/escrita', { method: 'POST', body: '{}' });
    await iniciouRetry.promessa;
    expect(cache.lerCache('catalogo')).toBe('anterior');
    escrita.resolver(new Response(null, { status: 204 }));
    await requisicao;
    expect(cache.lerCache('catalogo')).toBeUndefined();
  });
});
