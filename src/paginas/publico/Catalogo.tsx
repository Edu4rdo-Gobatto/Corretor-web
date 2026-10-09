import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconeSetaBaixo,
  IconeSetaExterna,
  IconeBuscar,
} from "../../componentes/Icones";
import { api } from "../../servicos/api";
import { lerUrlCatalogo, urlCatalogo } from "../../servicos/urls";
import { plural } from "../../servicos/formato";
import { telefoneWhatsapp } from "../../servicos/contato";
import { useRecurso } from "../../hooks/useRecurso";
import CartaoImovel from "../../componentes/CartaoImovel";
import EstadoCarregamento from "../../componentes/EstadoCarregamento";
import FiltrosCatalogo from "../../componentes/FiltrosCatalogo";
import Paginacao from "../../componentes/Paginacao";
import { Seo, useDadosIniciais } from "../../seo/context";
import { brand } from "../../config/brand";
import type { ConsultaCatalogo } from "../../tipos";

export default function Catalogo() {
  const location = useLocation();
  const navigate = useNavigate();
  const consulta = lerUrlCatalogo(location.pathname + location.search)!;
  const chaveConsulta = urlCatalogo(consulta);
  // Parâmetros de fora do catálogo (utm etc.) acompanham cada troca de filtro.
  const extras = new URLSearchParams(location.search);
  const urlCom = (alteracoes: Partial<ConsultaCatalogo>) =>
    urlCatalogo({ ...consulta, pagina: 1, ...alteracoes }, extras);
  /** Navega e devolve a chave da nova consulta; `substituir` evita encher o histórico com a digitação. */
  const aplicar = (
    alteracoes: Partial<ConsultaCatalogo>,
    substituir = false,
  ) => {
    const destino = urlCom(alteracoes);
    navigate(destino, { replace: substituir });
    return urlCatalogo(lerUrlCatalogo(destino)!);
  };
  const limpar = () =>
    navigate(urlCatalogo({ ordenar: consulta.ordenar }, extras));
  const buscarImoveis = useCallback(
    () => api.listarImoveis(consulta),
    [chaveConsulta],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const iniciais = useDadosIniciais();
  const {
    valor: imoveis,
    carregando,
    erro,
    statusErro,
    tentarNovamente,
  } = useRecurso(buscarImoveis, iniciais?.data.catalogo);
  const classificacoesRecurso = useRecurso(
    useCallback(() => api.classificacoes(), []),
    iniciais?.data.classificacoes,
  );
  const classificacoes = classificacoesRecurso.valor;
  const chave = (item: { id: number; slug?: string | null }) =>
    item.slug ?? String(item.id);
  const tipos = (classificacoes?.tipos ?? []).map((item) => ({
    chave: chave(item),
    nome: item.nome,
  }));
  const finalidades = (classificacoes?.finalidades ?? []).map((item) => ({
    chave: chave(item),
    nome: item.nome,
  }));
  const cidades = Array.from(
    new Map(
      (imoveis?.itens ?? []).map((item) => [
        item.cidade.trim().toLocaleLowerCase("pt-BR"),
        item.cidade.trim(),
      ]),
    ).values(),
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  function rolarParaCatalogo() {
    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById("catalogo")
      ?.scrollIntoView({ behavior: reduzMovimento ? "instant" : "smooth" });
  }

  // Links Alugar/Comprar do cabeçalho levam direto aos imóveis filtrados.
  const rolarAoChegar = (location.state as { rolarCatalogo?: boolean } | null)
    ?.rolarCatalogo;
  useEffect(() => {
    if (rolarAoChegar) rolarParaCatalogo();
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Seo
        dados={{ catalogo: imoveis, classificacoes }}
        status={statusErro || 200}
      />
      <section className="hero-anim container grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-5 pb-2 pt-4 max-[800px]:grid-cols-1 max-[800px]:gap-6 max-[800px]:pt-6">
        <div>
          <h1 className="mb-2 mt-2 max-w-[650px] text-balance text-[clamp(30px,3.5vw,48px)] leading-[1.17] tracking-[-0.045em]">
            Imóveis para alugar e comprar{" "}
            <em className="font-normal text-brand">
              em {brand.region.city}-{brand.region.state}
            </em>
          </h1>
          <p className="mb-6 text-[17px] leading-[1.75] text-muted max-[800px]:text-[15px] max-[560px]:text-base max-[560px]:leading-[1.6]">
            Encontre salas comerciais, lojas, galpões, prédios e terrenos.
            <br className="max-[800px]:hidden" /> Consulte as opções para o seu
            negócio em {brand.region.city}-{brand.region.state} e região.
          </p>
          <a
            className="inline-flex items-center gap-7 border-b-2 border-gold pb-2 text-sm font-semibold no-underline"
            href="#catalogo"
            onClick={(evento) => {
              evento.preventDefault();
              rolarParaCatalogo();
            }}
          >
            Explore os imóveis <IconeSetaBaixo size={17} />
          </a>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-lg bg-soft max-[800px]:h-[clamp(200px,46vw,300px)]">
          <img
            src="/assets/rua-comercial-1200.webp"
            srcSet="/assets/rua-comercial-640.webp 640w, /assets/rua-comercial-960.webp 960w, /assets/rua-comercial-1200.webp 1200w"
            sizes="(max-width: 800px) calc(100vw - 36px), 600px"
            width="1200"
            height="900"
            alt="Rua comercial arborizada ao entardecer, com lojas no térreo, salas nos andares superiores e prédio moderno ao fundo"
            className="h-full w-full rounded-lg object-cover"
            {...{ fetchpriority: "high" }}
          />
        </div>
      </section>
      {/* Margem de rolagem = altura do cabeçalho (104/84px) + 20px − padding do topo: o título para logo abaixo do cabeçalho. */}
      <section
        id="catalogo"
        className="container scroll-mt-[76px] pt-12 max-[800px]:scroll-mt-[56px] max-[560px]:scroll-mt-[72px] max-[560px]:pt-8"
        aria-labelledby="catalogo-titulo"
      >
        <div className="mb-6">
          <h2
            id="catalogo-titulo"
            className="mb-2 text-[clamp(26px,2.5vw,35px)]"
          >
            Imóveis disponíveis
          </h2>
          <p
            className="m-0 min-h-[1.55em] text-sm text-muted"
            aria-live="polite"
          >
            {!carregando &&
              !erro &&
              plural(
                imoveis?.total || 0,
                "imóvel encontrado",
                "imóveis encontrados",
              )}
          </p>
        </div>
        <FiltrosCatalogo
          consulta={consulta}
          chaveConsulta={chaveConsulta}
          finalidades={finalidades}
          tipos={tipos}
          cidades={cidades}
          aplicar={aplicar}
          limpar={limpar}
        />
        <div className="mt-[34px] max-[560px]:mt-7">
          <EstadoCarregamento
            carregando={false}
            erro={classificacoesRecurso.erro}
            tentarNovamente={classificacoesRecurso.tentarNovamente}
          />
          <EstadoCarregamento
            carregando={carregando}
            erro={erro}
            tentarNovamente={tentarNovamente}
            esqueleto="cartoes"
          />
          {!carregando && !erro && (
            <>
              {imoveis?.itens.length ? (
                <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-[30px] gap-y-[54px] max-[1100px]:gap-x-5 max-[1100px]:gap-y-9 max-[800px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[560px]:grid-cols-1 max-[560px]:gap-7">
                  {imoveis.itens.map((imovel) => (
                    <CartaoImovel key={imovel.id} imovel={imovel} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[5px] border border-dashed border-line bg-soft px-6 py-[72px] text-center [&_svg]:mx-auto [&_svg]:mb-3 [&_svg]:text-brand">
                  <IconeBuscar size={30} />
                  <h3>Nenhum imóvel com esses filtros</h3>
                  <p>Tire algum filtro ou limpe todos para ver mais opções.</p>
                  <button className="buttonSecondary min-h-12" onClick={limpar}>
                    Limpar filtros
                  </button>
                </div>
              )}
              <Paginacao
                pagina={consulta.pagina}
                totalPaginas={imoveis?.total_paginas || 0}
                href={(pagina) => urlCom({ pagina })}
                aoMudar={(pagina) => {
                  aplicar({ pagina });
                  rolarParaCatalogo();
                }}
              />
            </>
          )}
        </div>
      </section>
      <section className="container mt-[92px] grid items-start gap-12 rounded-[3px] border-l-4 border-gold bg-navy px-14 py-9 text-white min-[561px]:grid-cols-[auto_minmax(0,1fr)] max-[800px]:gap-[30px] max-[800px]:px-8 max-[800px]:py-7 max-[560px]:mt-[50px] max-[560px]:grid-cols-1 max-[560px]:gap-6 max-[560px]:px-6 max-[560px]:py-6">
        <div>
          <h2 className="mb-0">
            Precisa de ajuda para
            <br />
            encontrar seu imóvel?
          </h2>
        </div>
        <div className="flex flex-col items-end max-[560px]:items-stretch">
          <p className="text-white/80 text-2xl mt-4">
            Encontrar o seu lar é a nossa missão. Nós ajudamos você a encontrar
            a opção ideal para você e sua família em {brand.region.city} e
            região.
          </p>
          <a
            href={`https://wa.me/${telefoneWhatsapp(brand.contact.whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="buttonSecondary border-gold text-white hover:bg-white/10 mt-4"
          >
            Conversar pelo WhatsApp <IconeSetaExterna size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
