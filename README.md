# corretor-web

Interface do sistema de gestão imobiliária para corretores. Desenvolvida em React com TypeScript, responsável pela exibição de imóveis, painel administrativo e captura de leads com redirecionamento para WhatsApp.

## Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Deploy:** Vercel

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
cp .env.example .env
# Edite o .env com a URL da API

# Inicie em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# URL da API backend
VITE_API_URL=http://localhost:3000

# WhatsApp do corretor (usado na captura de leads)
VITE_WHATSAPP_NUMBER=5511999999999
```

> Em produção, `VITE_API_URL` deve apontar para a URL do backend no Render. Configure via painel da Vercel em Settings → Environment Variables.

> Nunca suba o `.env` para o repositório. Ele já está no `.gitignore`.

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
