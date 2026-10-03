// Trava de segurança para suíte visual: impede execução contra alvos não autorizados.
const baseURLPadrao = 'http://127.0.0.1:4180';

export function dominiosPermitidos(): string[] {
  return (process.env.E2E_DOMINIOS_PERMITIDOS ?? '')
    .split(',')
    .map((dominio) => dominio.trim().toLowerCase())
    .filter(Boolean);
}

export function alvoLiberado(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
    return dominiosPermitidos().includes(hostname);
  } catch {
    return false;
  }
}

export function assertSafeTarget(url: string = baseURLPadrao) {
  if (!alvoLiberado(url)) {
    throw new Error(
      `Execução bloqueada: ${url} não é ambiente local nem está em E2E_DOMINIOS_PERMITIDOS. ` +
        `Liberação remota é por domínio explícito de homologação; produção nunca deve ser listada.`,
    );
  }
}
