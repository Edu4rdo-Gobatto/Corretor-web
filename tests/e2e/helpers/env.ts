// Ambiente dos testes ponta a ponta. Nenhum segredo fica versionado:
// credenciais de TESTE entram por variáveis de ambiente locais (.env não commitado).
export const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
export const isHttps = baseURL.startsWith('https://');

// Escritas E2E só podem usar localhost por padrão. Um ambiente remoto de
// homologação precisa de uma autorização explícita, evitando produção por
// acidente quando as variáveis locais estiverem configuradas incorretamente.
export const isLocalE2E = (() => {
  const host = new URL(baseURL).hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
})();
export const allowExternalE2E = process.env.E2E_ALLOW_EXTERNAL === 'true';

export function assertSafeE2ETarget() {
  if (!isLocalE2E && !allowExternalE2E) {
    throw new Error(
      `E2E_BASE_URL aponta para ${new URL(baseURL).origin}. Para escrever fora do localhost, defina E2E_ALLOW_EXTERNAL=true explicitamente.`,
    );
  }
}

export const apiUrl = (path: string) => `${baseURL}/api${path.startsWith('/') ? path : `/${path}`}`;

export interface TestCredentials {
  email: string;
  senha: string;
}

export function adminCredentials(): TestCredentials | null {
  const email = process.env.E2E_ADMIN_EMAIL;
  const senha = process.env.E2E_ADMIN_SENHA;
  return email && senha ? { email, senha } : null;
}

export function corretorCredentials(): TestCredentials | null {
  const email = process.env.E2E_CORRETOR_EMAIL;
  const senha = process.env.E2E_CORRETOR_SENHA;
  return email && senha ? { email, senha } : null;
}

// Prefixo único por execução: isola dados sintéticos e permite limpeza segura.
export const runTag = `e2e-${Date.now().toString(36)}`;
export const e2eName = (base: string) => `${base} ${runTag}`;

// Verifica backend+banco reais de teste via health check pelo proxy SSR.
// O proxy remove o prefixo /api e a API completa com /api/v1, então o
// caminho pelo navegador é /api/saude (não /api/v1/saude).
export async function backendReachable(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl('/saude'), { signal: AbortSignal.timeout(10000) });
    return response.ok;
  } catch {
    return false;
  }
}
