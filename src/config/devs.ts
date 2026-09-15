// Desenvolvedores exibidos em /devs. Fotos locais em public/assets (sem hotlink externo).
export interface Dev {
  nome: string;
  usuario: string;
  perfilUrl: string;
  githubUrl: string;
  avatarUrl: string;
  papel: string;
}

export const devs: Dev[] = [
  {
    nome: 'Eduardo Gobatto',
    usuario: 'e.gobatto',
    perfilUrl: 'https://www.instagram.com/e.gobatto/',
    githubUrl: 'https://github.com/Edu4rdo-Gobatto',
    avatarUrl: '/assets/dev-eduardo.jpg',
    papel: 'Front-end e back-end',
  },
  {
    nome: 'Fernando Riad',
    usuario: '_riad777',
    perfilUrl: 'https://www.instagram.com/_riad777/',
    githubUrl: 'https://github.com/SHURIKA6',
    avatarUrl: '/assets/dev-fernando.jpg',
    papel: 'Front-end e back-end',
  },
];
