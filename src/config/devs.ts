// Desenvolvedores exibidos em /devs. Fotos via avatares do GitHub informados pelo dono.
export interface Dev {
  nome: string;
  usuario: string;
  perfilUrl: string;
  avatarUrl: string;
  papel: string;
}

export const devs: Dev[] = [
  {
    nome: 'Eduardo Gobatto',
    usuario: 'e.gobatto',
    perfilUrl: 'https://www.instagram.com/e.gobatto/',
    avatarUrl: 'https://avatars.githubusercontent.com/u/215524121?v=4',
    papel: 'Front-end e back-end',
  },
  {
    nome: 'Fernando Riad',
    usuario: '_riad777',
    perfilUrl: 'https://www.instagram.com/_riad777/',
    avatarUrl: 'https://avatars.githubusercontent.com/u/65686336?v=4',
    papel: 'Front-end e back-end',
  },
];
