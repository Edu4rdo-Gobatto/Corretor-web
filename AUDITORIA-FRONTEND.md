# Auditoria completa de front-end

**Projeto:** Corretor-web  
**Data:** 2026-09-11  
**Escopo:** `src/`, manifests npm, configuração Vite, CSS, assets e bundle de produção.

## Resumo executivo

A base do front-end é organizada, tipada e acima da média em vários fundamentos: não há uso de `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `document.write`; o access token fica somente em memória; as rotas administrativas usam lazy loading; existem estados de loading, erro e vazio; e há validação de formulários com Zod.

O principal bloqueio para considerar o front-end seguro é um XSS armazenado no painel administrativo através de URLs de mídia renderizadas diretamente. Também existem riscos relevantes de supply chain, ausência de Error Boundary, imagens críticas sem variantes responsivas e alguns problemas de foco, touch target e processamento de uploads.

## Evidências de validação

- `npm test -- --reporter=dot`: **8 arquivos e 30 testes passando**.
- `npm run build`: **passou**; 1.729 módulos transformados.
- Bundle inicial: `index-C18ki9Kz.js` com 207,98 kB / 69,46 kB gzip.
- Chunk de schemas: `schemas-CzcMzbzC.js` com 120,15 kB / 36,58 kB gzip.
- `npm audit --json`: 2 vulnerabilidades moderadas no caminho do Vitest.
- Busca global sem ocorrências de `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `document.write`.
- Não foram encontrados tokens, API keys ou segredos hardcoded no cliente.

## Achados por severidade

### 🔴 Crítico — XSS armazenado via URL de vídeo no painel

**Local:** `src/components/MediaManager.tsx:7`

Trecho:

```tsx
<a href={m.url} target="_blank" rel="noreferrer">
  Assistir ao vídeo ↗
</a>
```

`m.url` vem de dados da API. A validação feita em `embed()` ocorre apenas no cliente e pode ser contornada por uma requisição direta. Um registro `VIDEO_EMBED` com URL `javascript:` ou `data:` pode executar script quando um administrador clicar.

**Impacto:** XSS armazenado no painel autenticado, com possibilidade de leitura de dados visíveis e execução de ações privilegiadas na sessão.

**Correção recomendada:**

```tsx
import { embedUrl } from './MediaGallery';

const safeUrl = m.type === 'VIDEO_EMBED' ? embedUrl(m.url) : null;

{m.type === 'VIDEO_EMBED' ? (
  safeUrl ? (
    <a href={safeUrl} target="_blank" rel="noopener noreferrer">
      Assistir ao vídeo ↗
    </a>
  ) : (
    <span>Vídeo indisponível</span>
  )
) : null}
```

O backend também deve validar protocolo HTTPS, host permitido e identificador de vídeo. A validação no navegador não pode ser a fronteira de segurança.

---

### 🟠 Alto — Worker de compressão carrega JavaScript remoto sem integridade

**Local:** `src/components/MediaManager.tsx:2,7`

Trecho:

```tsx
const compressed = await imageCompression(file, {
  maxSizeMB: 2,
  maxWidthOrHeight: maxSize,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: .85
});
```

A versão instalada de `browser-image-compression` carrega o código do worker com `importScripts` a partir de CDN em runtime. O lockfile não garante a integridade desse payload remoto.

**Impacto:** comprometimento de CDN, dependência ou conta de publicação pode executar código no navegador do administrador durante upload e acessar imagens processadas.

**Correção simples:**

```tsx
const compressed = await imageCompression(file, {
  maxSizeMB: 2,
  maxWidthOrHeight: maxSize,
  useWebWorker: false,
  fileType: 'image/webp',
  initialQuality: 0.85,
});
```

Se o worker for indispensável, faça self-host do arquivo exato e configure `libURL` para um asset imutável servido pela própria aplicação. Complemente com CSP restritivo.

---

### 🟠 Alto — Vitest vulnerável a path traversal/arbitrary file read

**Local:** `package.json:44`, `package-lock.json:2249`

O projeto declara `vitest@^3.2.4` e resolve `vitest@3.2.7` / `@vitest/mocker@3.2.7`. `npm audit` reportou `GHSA-82fw-gwwq-j7x9`, afetando versões `>=2.1.0 <4.1.11`.

**Impacto:** em desenvolvimento ou CI, entradas de teste/mocking controladas podem permitir leitura arbitrária de arquivos.

**Correção:**

```powershell
npm install --save-dev vitest@^5.0.0
npm audit
npm test
```

O audit indica Vitest 5 como correção disponível. Validar a compatibilidade do Node e das APIs de teste antes de concluir a atualização.

---

### 🟠 Alto — Imagens críticas sem `srcset`, `sizes` ou dimensões intrínsecas

**Locais:** `src/pages/public/Catalog.tsx:45`, `src/pages/admin/Admin.module.css:1`

O hero público usa uma imagem Unsplash fixa com `w=1200&q=85`; a tela de login usa outra imagem fixa com `w=1400&q=80` em `background-image`. Não há variantes para mobile, `srcset`, `sizes` ou self-host dos assets críticos.

**Impacto:** LCP e consumo de banda piores em celulares, além de dependência de terceiro para imagens acima da dobra.

**Correção para o hero:**

```tsx
<img
  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=75"
  srcSet={[
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=640&q=70 640w',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=960&q=75 960w',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80 1200w',
  ].join(',')}
  sizes="(max-width: 560px) calc(100vw - 36px), (max-width: 900px) 50vw, 600px"
  width={1200}
  height={900}
  alt="Ambiente comercial iluminado, com mesas, vegetação e janelas amplas"
  fetchPriority="high"
/>
```

Preferencialmente, baixar e servir localmente os assets críticos em AVIF/WebP.

---

### 🟠 Alto — Ausência de Error Boundary

**Locais:** `src/App.tsx:18-22`, `src/main.tsx:4`

Há `Suspense`, mas não há Error Boundary. Uma exceção de renderização, payload inesperado ou falha em componente lazy pode desmontar toda a árvore React.

**Impacto:** tela branca sem retry, feedback ou telemetria.

**Correção:**

```tsx
import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro de renderização', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container" role="alert">
          <h1>Não foi possível carregar esta página.</h1>
          <button className="button" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
```

Envolver o `App` em `main.tsx`; idealmente, adicionar boundaries específicos para áreas pública e administrativa.

---

### 🟡 Médio — `Dialog` pode fechar o DOM sem sincronizar o estado React

**Local:** `src/components/Dialog.tsx:10,15`

O componente usa `onCancel={onClose}`, mas não chama `preventDefault()`. Ao pressionar Escape, o elemento nativo pode fechar enquanto `expanded` ou `contactOpen` permanecem `true` no componente pai.

**Impacto:** modal inconsistente, reabertura imprevisível e restauração de foco/scroll pouco confiável.

**Correção:**

```tsx
function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
  event.preventDefault();
  onClose();
}

return (
  <dialog
    ref={reference}
    className={styles.dialog}
    aria-labelledby={titleId}
    onCancel={handleCancel}
  >
    {/* conteúdo */}
  </dialog>
);
```

---

### 🟡 Médio — Bundle inicial grande para o catálogo

**Locais:** `src/App.tsx:1-16`, `src/pages/public/Catalog.tsx:1-8`

O build produziu um chunk público de 207,98 kB, além de um chunk de schemas de 120,15 kB. As rotas administrativas estão lazy, mas o catálogo ainda carrega uma superfície significativa de ícones e validação.

**Impacto:** maior tempo de download, TTI e INP em dispositivos móveis.

**Correção recomendada:**

```tsx
// Evitar barrels em componentes públicos quando o bundler não eliminar
// todos os módulos.
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Search from 'lucide-react/dist/esm/icons/search';
```

Manter schemas exclusivos do admin dentro dos módulos lazy e analisar o bundle regularmente para evitar regressões.

---

### 🟡 Médio — Até 20 imagens grandes são processadas em paralelo

**Local:** `src/components/MediaManager.tsx:7`

Trecho:

```tsx
const prepared = await Promise.all(
  files.map(async file => {
    // decode + compress
  }),
);
```

O lote permite até 20 arquivos de 30 MB, potencialmente 600 MB antes da compressão.

**Impacto:** picos de memória/CPU, travamento da aba ou crash em dispositivos móveis.

**Correção:**

```tsx
const prepared: File[] = [];

for (const file of files) {
  prepared.push(await prepareFile(file));
}
```

Para manter throughput, usar uma fila com no máximo duas tarefas simultâneas e informar progresso, por exemplo `Processando 3 de 20…`.

---

### 🟡 Médio — Rascunho do imóvel não limita o tamanho do JSON

**Locais:** `src/pages/admin/PropertyForm.tsx:14`, `src/pages/admin/propertySchema.ts:3`

`featuresText` apenas verifica se o valor é um objeto JSON. O watcher grava cada alteração no `sessionStorage`, sem limite de tamanho e sem tratamento explícito de `QuotaExceededError`.

**Impacto:** colagem de JSON muito grande pode interromper o autosave e deixar o formulário em estado inconsistente.

**Correção do schema:**

```tsx
featuresText: z
  .string()
  .max(20000, 'Use no máximo 20.000 caracteres.')
  .refine(value => {
    try {
      const parsed: unknown = JSON.parse(value);
      return !!parsed && typeof parsed === 'object' && !Array.isArray(parsed);
    } catch {
      return false;
    }
  }, 'Informe um objeto JSON válido, como {"Vagas": 4}.')
```

Também tratar quota no helper `writePropertyDraft` e exibir aviso claro ao usuário.

---

### 🟡 Médio — Menu móvel sem Escape e gerenciamento de foco

**Locais:** `src/components/PublicLayout.tsx:8-13`, `src/components/PublicLayout.module.css:19`

O menu apenas alterna `display` com `menuOpen`. Não fecha com Escape, não move o foco para o primeiro link ao abrir e não devolve foco ao botão ao fechar.

**Impacto:** navegação inconsistente para teclado e leitores de tela; foco pode permanecer em conteúdo visualmente escondido.

**Correção mínima:**

```tsx
useEffect(() => {
  if (!menuOpen) return;

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  };

  document.addEventListener('keydown', closeOnEscape);
  return () => document.removeEventListener('keydown', closeOnEscape);
}, [menuOpen]);
```

Adicionar refs para o botão e primeiro link; para o menu expandido, considerar comportamento de dialog/focus trap.

---

### 🔵 Baixo — Touch targets dos filtros abaixo de 44 px

**Local:** `src/pages/public/Catalog.module.css:34,46`

Os botões de categoria usam `min-height: 42px` e, no mobile, não garantem o alvo recomendado de 44 px.

**Impacto:** maior chance de toques errados entre filtros próximos.

**Correção:**

```css
.categories button {
  min-height: 44px;
  padding: 10px 16px;
}

@media (max-width: 560px) {
  .categories button {
    min-height: 44px;
    padding: 10px 12px;
  }
}
```

---

### 🔵 Baixo — Vídeos do painel sem nome acessível

**Local:** `src/components/MediaManager.tsx:7`

O `<video controls>` administrativo não tem `aria-label`, enquanto o vídeo público tem contexto acessível.

**Impacto:** leitores de tela anunciam um controle multimídia sem identificar seu conteúdo.

**Correção:**

```tsx
<video
  className={styles.preview}
  src={m.url}
  controls
  preload="metadata"
  aria-label={`Vídeo ${i + 1} do imóvel`}
/>
```

## Pontos auditados sem problema confirmado

### Segurança

- Não há `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `document.write`.
- `src/services/http.ts` mantém o access token em memória, não em `localStorage`; requests usam `credentials: 'include'`.
- `src/services/lead.ts` usa Zod, limita mensagem e usa `encodeURIComponent` para WhatsApp.
- `src/components/MediaGallery.tsx` faz allowlist de protocolo, host e identificador antes de criar iframe público.
- Não foram encontrados secrets, API keys ou tokens hardcoded no cliente.
- Não há logs de negócio com `console.log`/`console.warn` em `src`.

### Arquitetura e qualidade

- `src/App.tsx` usa lazy loading para rotas administrativas e páginas secundárias.
- `src/components/AsyncState.tsx` padroniza loading, erro e retry.
- Não há componentes de produção com mais de 200 linhas físicas.
- Não foi encontrado `any` explícito no front-end de produção.
- O estado global é simples e proporcional: um `AuthContext`, sem over-engineering evidente.

### UX, acessibilidade e responsividade

- Há `viewport`, skip link, `:focus-visible` e suporte a `prefers-reduced-motion`.
- Formulários possuem labels visíveis, validação e mensagens próximas dos campos.
- Existem estados vazios, carregando e erro nas principais telas.
- Cards usam `aspect-ratio`, reduzindo CLS nessa área.
- A galeria possui controles de tamanho adequado; os filtros de categoria são a exceção documentada.

## Tabela resumo

| # | Severidade | Arquivo/linha | Problema | Impacto |
|---:|:---:|---|---|---|
| 1 | 🔴 Crítico | `MediaManager.tsx:7` | `href={m.url}` sem sanitização | XSS armazenado no painel |
| 2 | 🟠 Alto | `MediaManager.tsx:2,7` | Worker baixa JavaScript remoto via CDN | Supply chain no navegador do admin |
| 3 | 🟠 Alto | `package.json:44`, lockfile | Vitest/@vitest/mocker vulneráveis | Leitura arbitrária em dev/CI |
| 4 | 🟠 Alto | `Catalog.tsx:45`, `Admin.module.css:1` | Imagens críticas sem responsive images | LCP e banda ruins |
| 5 | 🟠 Alto | `App.tsx`, `main.tsx` | Sem Error Boundary | Tela branca sem recuperação |
| 6 | 🟡 Médio | `Dialog.tsx:10,15` | Escape fecha DOM sem sincronizar estado | Modal inconsistente |
| 7 | 🟡 Médio | `App.tsx`, build | Chunk inicial de 208 kB / 69 kB gzip | TTI/INP pior em mobile |
| 8 | 🟡 Médio | `MediaManager.tsx:7` | 20 compressões em `Promise.all` | Pico de memória/CPU |
| 9 | 🟡 Médio | `PropertyForm.tsx:14`, schema | JSON de rascunho sem limite | QuotaExceeded e autosave frágil |
| 10 | 🟡 Médio | `PublicLayout.tsx`, CSS | Menu móvel sem Escape/foco | A11y e teclado inconsistentes |
| 11 | 🔵 Baixo | `Catalog.module.css:34,46` | Filtros com 42 px | Toques errados |
| 12 | 🔵 Baixo | `MediaManager.tsx:7` | Vídeo sem nome acessível | Contexto insuficiente para leitor de tela |

## Top 5 correções por retorno

1. Sanitizar `m.url` no painel e reforçar a allowlist no backend.
2. Desativar o worker remoto ou self-host do script de compressão.
3. Adicionar Error Boundary global e boundaries por área.
4. Corrigir imagens críticas com `srcset`, `sizes`, dimensões e AVIF/WebP.
5. Atualizar Vitest e limitar o processamento paralelo de mídia.

## Nota geral

| Categoria | Nota | Justificativa |
|---|---:|---|
| Segurança | **6,5/10** | Boa ausência de sinks HTML perigosos e token persistente, mas há XSS real em mídia e worker remoto sem integridade. |
| Performance | **7,0/10** | Lazy routes, fontes locais e estados assíncronos são bons; imagens remotas, bundle e compressão paralela reduzem a nota. |
| Arquitetura | **7,5/10** | Separação clara por páginas, componentes e services; falta boundary e há JSX excessivamente comprimido. |
| Acessibilidade | **7,5/10** | Labels, skip link, foco visível e reduced motion estão presentes; menu, modal e vídeos têm lacunas. |
| UX | **8,0/10** | Fluxos têm loading/error/empty states e filtros funcionais; foco, touch target e feedback de upload podem melhorar. |

## Conclusão

A base do front-end é sólida, mas o XSS por URL de mídia no painel deve ser corrigido antes de considerar o produto seguro. Em seguida, a prioridade deve ser remover o carregamento remoto do worker, adicionar Error Boundary e otimizar as imagens críticas.
