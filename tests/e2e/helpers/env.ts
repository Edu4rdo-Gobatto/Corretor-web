// Ambiente dos testes ponta a ponta. Nenhum segredo fica versionado:
// credenciais de TESTE entram por variáveis de ambiente locais (.env não commitado).
export const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
export const isHttps = baseURL.startsWith('https://');

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

// O ignoreHTTPSErrors do Playwright cobre só o navegador. O fetch do Node
// usado abaixo rejeitaria um cert autoassinado local — liberado apenas neste
// processo de teste (nunca no app) para não mascarar backend como inacessível.
if (isHttps) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Trava programática em duas camadas:
// 1. E2E_BASE_URL precisa ser local ou constar na allowlist explícita
//    E2E_DOMINIOS_PERMITIDOS (ex.: um domínio de homologação). Não há bypass
//    genérico: produção nunca deve ser listada e aborta antes de qualquer chamada.
// 2. Mesmo local, o SSR pode repassar a API de produção via API_ORIGIN do .env.
//    Só roda caso com backend quem declara o stack de teste (E2E_STACK=teste),
//    após apontar API e SSR ao banco de teste (ver tests/e2e/README.md).
export function dominiosPermitidos(): string[] {
  return (process.env.E2E_DOMINIOS_PERMITIDOS ?? '')
    .split(',')
    .map((dominio) => dominio.trim().toLowerCase())
    .filter(Boolean);
}

export function alvoE2ELiberado(hostname = new URL(baseURL).hostname.toLowerCase()): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
  return dominiosPermitidos().includes(hostname);
}

export function assertSafeTarget() {
  if (!alvoE2ELiberado()) {
    throw new Error(
      `E2E bloqueado: ${baseURL} não é ambiente local nem está em E2E_DOMINIOS_PERMITIDOS. ` +
        `Liberação remota é por domínio explícito de homologação; produção nunca deve ser listada.`,
    );
  }
}

export function isTestStack(): boolean {
  return process.env.E2E_STACK === 'teste';
}

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
