# Corretor Comercial

Interface editorial para imóveis comerciais, com catálogo público, detalhe de imóvel, captação de contatos e painel administrativo. O front é um repositório separado da API NestJS em `../Corretor-API`.

## Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Deploy:** Vercel (build estático)

## Pré-requisitos

- Node.js 20+
- npm 10+
- Git

## Instalação e execução local

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/corretor-web.git
cd corretor-web

# Instale as dependências
npm install

# Configure as variáveis de ambiente
Copy-Item .env.example .env
# Em desenvolvimento, API_PROXY_TARGET aponta para http://localhost:3000

# Inicie em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# URL usada pelo navegador; /api mantém o cookie no domínio do front
VITE_API_URL=/api
# Destino do proxy Vite durante o desenvolvimento
API_PROXY_TARGET=http://localhost:3000
# Ative apenas para uma prévia visual local sem serviços externos
VITE_DEMO_MODE=false
```

Em produção, configure a reescrita `/api/*` da Vercel para o domínio do backend Render, ou use o domínio da API diretamente e configure CORS com credenciais. A API não possui prefixo `/api`; o proxy deve removê-lo.

> Nunca suba o `.env` para o repositório. Ele já está no `.gitignore`.

## Modo demonstrativo

O comando `npm run dev:demo` ativa dados fictícios somente por configuração explícita. A faixa superior e o login identificam o modo. Contatos, imóveis criados e mídias ficam em memória e desaparecem ao recarregar; uma falha de rede nunca ativa esse modo.

Credenciais demonstrativas: use os botões Administrador ou Corretor na tela de login, ou `admin@demo.local` / `agent@demo.local`, senha `demo`.

## Scripts disponíveis

```bash
npm run dev       # Desenvolvimento com hot reload
npm run build     # Compila para produção
npm run preview   # Visualiza o build de produção localmente
npm run lint      # Verifica o código
```

## Estrutura do projeto

```
src/
├── assets/         # Imagens e arquivos estáticos
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── services/       # Comunicação com a API (fetch/axios)
├── hooks/          # Custom hooks
├── types/          # Tipagens TypeScript compartilhadas
└── main.tsx        # Entry point da aplicação
```

## Deploy

O deploy é feito automaticamente pela [Vercel](https://vercel.com) a cada push na branch `main`.

Para conectar o repositório à Vercel:
1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Framework preset: **Vite**
3. Configure as variáveis de ambiente no painel da Vercel
4. Clique em **Deploy**
