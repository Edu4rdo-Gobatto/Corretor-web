import { useState } from 'react';
import { IconePausar, IconeReproduzir } from './Icones';
import { Link, useLocation } from 'react-router-dom';
import { urlCatalogo } from '../servicos/urls';
import { useRecuperacaoPagina } from '../hooks/useRecuperacaoPagina';
import { Seo } from '../seo/context';
import AcaoIcone from './AcaoIcone';
import CenaReparo from './CenaReparo';

export default function PaginaIndisponivel({ status }: { status: number }) {
  const location = useLocation();
  const url = location.pathname + location.search + location.hash;
  const { estado, tentarNovamente } = useRecuperacaoPagina(url);
  const [pausada, setPausada] = useState(false);
  const mensagem = estado === 'verificando' ? 'Verificando se a página já está disponível…'
    : estado === 'pausado' ? 'A verificação será retomada quando você voltar à página e estiver conectado.'
    : estado === 'recuperado' ? 'Página disponível. Abrindo…' : 'Aguardando uma nova tentativa…';

  return <div className="container py-10 md:py-16">
    <Seo status={status} />
    <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-12">
      <div className="min-w-0">
        <p className="eyebrow">Reconectando</p>
        <h1 className="mb-4 text-[clamp(30px,5vw,48px)]">Serviço temporariamente indisponível.</h1>
        <p className="muted mb-5">{estado === 'inicial' ? 'Não foi possível carregar esta página. Tente novamente em alguns instantes.'
          : 'Não foi possível carregar esta página. Tentaremos novamente automaticamente.'}</p>
        {estado !== 'inicial' && <p className="muted mb-5 text-sm" role="status">{mensagem}</p>}
        <div className="flex flex-wrap gap-3">
          <a href={location.pathname + location.search} className="button" onClick={(evento) => { evento.preventDefault(); tentarNovamente(); }}>Tentar novamente</a>
          <Link to="/" className="buttonSecondary">Voltar ao catálogo</Link>
          <Link to={urlCatalogo({ finalidade: 'locacao' })} className="buttonSecondary">Alugar</Link>
          <Link to={urlCatalogo({ finalidade: 'venda' })} className="buttonSecondary">Comprar</Link>
        </div>
      </div>
      <div className="min-w-0">
        <CenaReparo animada={estado !== 'inicial' && !pausada} rotulo="Operário ajustando o quadro de energia de uma casa com as luzes apagadas" />
        {estado !== 'inicial' && <div className="reparo-controle flex items-center justify-center gap-2">
          <AcaoIcone icone={pausada ? IconeReproduzir : IconePausar} rotulo={pausada ? 'Retomar animação' : 'Pausar animação'} aoClicar={() => setPausada((atual) => !atual)} />
          <span className="text-sm text-muted">{pausada ? 'Animação pausada' : 'Pausar animação'}</span>
        </div>}
      </div>
    </div>
  </div>;
}
