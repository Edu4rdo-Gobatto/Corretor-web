import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram } from 'lucide-react';
import { Seo } from '../../seo/context';
import { devs, type Dev } from '../../config/devs';

function DevAvatar({ dev }: { dev: Dev }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        aria-hidden="true"
        className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-gold bg-navy font-display text-4xl text-white"
      >
        {dev.nome.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={dev.avatarUrl}
      alt={`Foto de ${dev.nome}`}
      width={112}
      height={112}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="mx-auto h-28 w-28 rounded-full border-2 border-gold object-cover"
    />
  );
}

export default function Devs() {
  return (
    <article className="container pt-9 [&_h1]:text-[clamp(32px,8vw,44px)] [&_.eyebrow]:mt-[45px]">
      <div className="mx-auto max-w-[800px]">
      <Seo />
      <Link to="/">← Voltar ao catálogo</Link>
      <p className="eyebrow">Quem fez</p>
      <h1>Desenvolvedores</h1>
      <p className="muted">Quem construiu este site: front-end e back-end.</p>
      <ul className="mt-8 grid list-none gap-6 p-0 max-[560px]:grid-cols-1 sm:grid-cols-2">
        {devs.map((dev) => (
          <li
            key={dev.usuario}
            className="rounded-xl border border-line border-t-4 border-t-gold bg-paper p-6 text-center shadow-sm"
          >
            <DevAvatar dev={dev} />
            <h2 className="mt-4 font-display text-xl text-brand">{dev.nome}</h2>
            <p className="mt-1 text-sm text-muted">{dev.papel}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <a
                href={dev.perfilUrl}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label={`Instagram de ${dev.nome}`}
                className="inline-flex min-h-11 items-center gap-2 text-brand underline underline-offset-4 hover:text-gold"
              >
                <Instagram size={18} aria-hidden="true" />@{dev.usuario}
              </a>
              <a
                href={dev.githubUrl}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label={`GitHub de ${dev.nome}`}
                className="inline-flex min-h-11 items-center gap-2 text-brand underline underline-offset-4 hover:text-gold"
              >
                <Github size={18} aria-hidden="true" />GitHub
              </a>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </article>
  );
}
