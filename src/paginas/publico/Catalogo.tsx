import { useFiltrosAutomaticos } from '../../hooks/useFiltrosAutomaticos';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconeSetaBaixo, IconeSetaExterna, IconeEdificio, IconePredio, IconeBuscar, IconeFiltros, IconeFechar, IconeLoja, IconeTerreno, IconeGalpao, type Icone } from '../../componentes/Icones';
import { api } from '../../servicos/api';
import { lerConsultaCatalogo } from '../../servicos/catalogo';
import { lerUrlCatalogo, urlCatalogo } from '../../servicos/urls';
import { plural, rotulosOrdenacao } from '../../servicos/formato';
import { telefoneWhatsapp } from '../../servicos/contato';
import { useRecurso } from '../../hooks/useRecurso';
import CartaoImovel from '../../componentes/CartaoImovel';
import EstadoCarregamento from '../../componentes/EstadoCarregamento';
import Paginacao from '../../componentes/Paginacao';
import { Seo, useDadosIniciais } from '../../seo/context';
import { brand } from '../../config/brand';
import type { ConsultaCatalogo } from '../../tipos';

const icones: Record<string, Icone> = { galpao: IconeGalpao, 'sala-comercial': IconeEdificio, predio: IconePredio, loja: IconeLoja, terreno: IconeTerreno };
const campoControle = 'mt-2 min-h-12 border-0 p-[2px_26px_2px_0] text-base normal-case tracking-normal';
const chipBase = 'inline-flex min-h-[42px] items-center gap-2 rounded-[3px] border px-4 py-[10px] text-[13px] max-[560px]:min-h-11 max-[560px]:px-3';
const chipInativo = 'border-line bg-transparent text-muted hover:border-navy dark:hover:border-gold';
const chipSelecionado = 'border-navy bg-navy text-white shadow-[inset_0_-2px_0_var(--color-gold)]';
const rotuloFiltro = 'block text-xs font-semibold uppercase tracking-[0.14em]';
const CAMPOS_URL: [keyof ConsultaCatalogo, string][] = [['finalidade', 'finalidade'], ['tipo', 'tipo'], ['cidade', 'cidade'], ['bairro', 'bairro'], ['valor_min', 'preco-minimo'], ['valor_max', 'preco-maximo'], ['area_min', 'area-minima'], ['area_max', 'area-maxima'], ['ordenar', 'ordenar']];

export default function Catalogo() {
  const location = useLocation();
  const navigate = useNavigate();
  const consulta = lerUrlCatalogo(location.pathname + location.search)!;
  const parametrosAtuais = new URLSearchParams(CAMPOS_URL.flatMap(([campo, nome]) => consulta[campo] === undefined ? [] : [[nome, String(consulta[campo])]]));
  const chaveConsulta = parametrosAtuais.toString() + `&pagina=${consulta.pagina}`;
  function irPara(parametros: URLSearchParams, substituir = false) {
    const destino = urlCatalogo(lerConsultaCatalogo(parametros), new URLSearchParams(location.search));
    navigate(destino, { replace: substituir });
  }
  const buscarImoveis = useCallback(() => api.listarImoveis(consulta), [chaveConsulta]); // eslint-disable-line react-hooks/exhaustive-deps
  const iniciais = useDadosIniciais();
  const { valor: imoveis, carregando, erro, statusErro, tentarNovamente } = useRecurso(buscarImoveis, iniciais?.data.catalogo);
  const classificacoesRecurso = useRecurso(useCallback(() => api.classificacoes(), []), iniciais?.data.classificacoes);
  const classificacoes = classificacoesRecurso.valor;
  const tipos = (classificacoes?.tipos ?? []).map((item) => ({ chave: item.slug ?? String(item.id), nome: item.nome }));
  const [avancadoAberto, setAvancadoAberto] = useState(Boolean(consulta.cidade || consulta.bairro || consulta.valor_min || consulta.valor_max || consulta.area_min || consulta.area_max));
  const formulario = useRef<HTMLFormElement>(null);
  const numerosInvalidos = useRef(new Set<string>());
  const ultimaNavegacao = useRef('');
  const valoresConsulta = () => Object.fromEntries(CAMPOS_URL.map(([campo, nome]) => [nome, String(consulta[campo] ?? '')]));
  const { rascunho, definir: setRascunho, aplicarAgora, sincronizar, erro: erroFiltro } = useFiltrosAutomaticos({
    iniciais: valoresConsulta(),
    normalizar: (valor) => Object.fromEntries(Object.entries(valor).map(([nome, texto]) => [nome, /^(preco|area)-/.test(nome) && texto.trim() && Number.isFinite(Number(texto)) ? String(Number(texto)) : texto.trim()])),
    validar: (valor) => {
      for (const [nome, maximo] of [['preco-minimo', 9999999999.99], ['preco-maximo', 9999999999.99], ['area-minima', 99999999.99], ['area-maxima', 99999999.99]] as const) {
        if (valor[nome] && (!Number.isFinite(Number(valor[nome])) || Number(valor[nome]) < 0 || Number(valor[nome]) > maximo)) return nome.startsWith('preco') ? 'Informe um preço válido dentro do limite do campo.' : 'Informe uma área válida dentro do limite do campo.';
        const centavos = Number(valor[nome]) * 100;
        if (numerosInvalidos.current.has(nome) || Math.abs(centavos - Math.round(centavos)) > Math.max(0.00001, Math.abs(centavos) * Number.EPSILON)) return nome.startsWith('preco') ? 'Informe um preço válido, com até duas casas decimais.' : 'Informe uma área válida, com até duas casas decimais.';
      }
      if (valor['preco-minimo'] && valor['preco-maximo'] && Number(valor['preco-minimo']) > Number(valor['preco-maximo'])) return 'O preço mínimo deve ser menor ou igual ao máximo.';
      if (valor['area-minima'] && valor['area-maxima'] && Number(valor['area-minima']) > Number(valor['area-maxima'])) return 'A área mínima deve ser menor ou igual à máxima.';
      return '';
    },
    aoAplicar: (valor, automatico) => {
      const parametros = new URLSearchParams(Object.entries(valor).filter(([, texto]) => texto !== ''));
      ultimaNavegacao.current = urlCatalogo(lerConsultaCatalogo(parametros), new URLSearchParams(location.search));
      irPara(parametros, automatico);
    },
  });
  useEffect(() => {
    if (ultimaNavegacao.current === location.pathname + location.search) { ultimaNavegacao.current = ''; return; }
    numerosInvalidos.current.clear();
    sincronizar(valoresConsulta());
  // A URL é a fonte externa; sincronizar não deve reagir a cada edição do rascunho.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveConsulta]);
  const temFiltro = CAMPOS_URL.some(([campo]) => consulta[campo] !== undefined) || consulta.pagina > 1;

  function rolarParaCatalogo() {
    const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('catalogo')?.scrollIntoView({ behavior: reduzMovimento ? 'instant' : 'smooth' });
  }
  function mudarNumero(campo: HTMLInputElement) {
    if (campo.validity.badInput) numerosInvalidos.current.add(campo.name);
    else numerosInvalidos.current.delete(campo.name);
    setRascunho({ ...rascunho, [campo.name]: campo.value });
  }
  function removerFiltro(nome: string) { numerosInvalidos.current.clear(); setRascunho({ ...valoresConsulta(), [nome]: '' }, true); }
  function limparFiltros() {
    numerosInvalidos.current.clear();
    setRascunho(Object.fromEntries(CAMPOS_URL.map(([, nome]) => [nome, ''])), true);
    if (consulta.pagina > 1 && CAMPOS_URL.every(([campo]) => consulta[campo] === undefined)) irPara(new URLSearchParams(), true);
  }
  const filtrosAplicados = CAMPOS_URL.filter(([campo]) => campo !== 'ordenar' && consulta[campo] !== undefined).map(([campo, nome]) => {
    const valor = consulta[campo];
    const rotulos: Partial<Record<keyof ConsultaCatalogo, string>> = { cidade: 'Cidade', bairro: 'Bairro', valor_min: 'Preço mínimo', valor_max: 'Preço máximo', area_min: 'Área mínima', area_max: 'Área máxima' };
    const classificacao = campo === 'tipo' ? tipos.find((item) => item.chave === valor)?.nome : campo === 'finalidade' ? classificacoes?.finalidades.find((item) => (item.slug ?? String(item.id)) === valor)?.nome : undefined;
    return { nome, rotulo: classificacao ?? (campo === 'finalidade' ? valor === 'locacao' ? 'Alugar' : valor === 'venda' ? 'Comprar' : String(valor) : campo === 'tipo' ? String(valor) : `${rotulos[campo]}: ${valor}${campo === 'area_min' || campo === 'area_max' ? ' m²' : ''}`) };
  });

  function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (aplicarAgora(false)) rolarParaCatalogo();
  }
  function escolherTipo(tipo: string) { setRascunho({ ...rascunho, tipo }, true); }
  const cidades = Array.from(new Map((imoveis?.itens ?? []).map((item) => [item.cidade.trim().toLocaleLowerCase('pt-BR'), item.cidade.trim()])).values()).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return <>
    <Seo dados={{ catalogo: imoveis, classificacoes }} status={statusErro || 200} />
    <section className="hero-anim container grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-10 gap-y-7 pb-6 pt-9 max-[800px]:grid-cols-1 max-[800px]:gap-6 max-[800px]:pt-6">
      <div className="order-1">
        <p className="eyebrow">Imóveis comerciais</p>
        <h1 className="mb-5 mt-4 max-w-[650px] text-balance text-[clamp(30px,3.5vw,48px)] leading-[1.17] tracking-[-0.045em]">Imóveis comerciais para alugar e comprar <em className="font-normal text-brand">em {brand.region.name}.</em></h1>
        <p className="mb-6 text-[17px] leading-[1.75] text-muted max-[800px]:text-[15px] max-[560px]:text-base max-[560px]:leading-[1.6]">Encontre salas comerciais, lojas, galpões, prédios e terrenos.<br className="max-[800px]:hidden" /> Consulte as opções para o seu negócio em {brand.region.name}.</p>
        <a className="inline-flex items-center gap-7 border-b-2 border-gold pb-2 text-sm font-semibold no-underline" href="#catalogo" onClick={(evento) => { evento.preventDefault(); rolarParaCatalogo(); }}>Explore os imóveis <IconeSetaBaixo size={17} /></a>
      </div>
      <div className="relative order-2 h-[340px] overflow-hidden rounded-lg bg-soft max-[800px]:order-3 max-[800px]:h-[clamp(200px,46vw,300px)]">
        <img src="/assets/rua-comercial-1200.webp" srcSet="/assets/rua-comercial-640.webp 640w, /assets/rua-comercial-960.webp 960w, /assets/rua-comercial-1200.webp 1200w" sizes="(max-width: 800px) calc(100vw - 36px), 600px" width="1200" height="900" alt="Rua comercial arborizada ao entardecer, com lojas no térreo, salas nos andares superiores e prédio moderno ao fundo" className="h-full w-full rounded-lg object-cover" {...{ fetchpriority: 'high' }} />
      </div>
    <div className="relative order-3 col-span-full max-[800px]:order-2">
      <form ref={formulario} method="get" action="/" noValidate onSubmit={buscar} className="rounded-lg border border-line bg-paper px-7 pt-[26px] pb-[15px] shadow-sm max-[560px]:px-[18px] max-[560px]:pt-5 max-[560px]:pb-[10px]" aria-label="Buscar imóveis">
        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-[26px] max-[1100px]:gap-[18px] max-[800px]:grid-cols-2 max-[800px]:gap-5 max-[560px]:grid-cols-1 max-[560px]:gap-x-[14px] max-[560px]:gap-y-[18px]">
          <label className={`${rotuloFiltro} border-r border-line pr-5 max-[1100px]:pr-[10px] max-[800px]:border-0 max-[800px]:p-0`}>O que você procura?<select name="finalidade" value={rascunho['finalidade']} className={campoControle} onChange={(evento) => setRascunho({ ...rascunho, 'finalidade': evento.target.value }, true)}><option value="">Alugar ou comprar</option>{classificacoes?.finalidades.map((item) => <option key={item.id} value={item.slug ?? item.id}>{item.nome}</option>)}</select></label>
          <label className={rotuloFiltro}>Tipo de imóvel<select name="tipo" value={rascunho['tipo']} className={campoControle} onChange={(evento) => setRascunho({ ...rascunho, 'tipo': evento.target.value }, true)}><option value="">Todos os tipos</option>{tipos.map((tipo) => <option value={tipo.chave} key={tipo.chave}>{tipo.nome}</option>)}</select></label>
          <button className="button mb-[3px] min-h-12 w-auto max-[1100px]:px-[15px] max-[1100px]:py-3 max-[800px]:col-span-2 max-[560px]:col-span-1 max-[560px]:w-full" type="submit"><IconeBuscar size={17} /> Buscar</button>
        </div>
        <div className="mt-[19px] flex items-center gap-5 border-t border-line pt-3">
          <button type="button" className="inline-flex min-h-11 items-center gap-2 border-0 bg-transparent px-0 py-[6px] text-xs text-muted" aria-expanded={avancadoAberto} onClick={() => setAvancadoAberto(!avancadoAberto)}><IconeFiltros size={15} /> Mais filtros: local, preço e área</button>
          {temFiltro && <button type="button" className="inline-flex min-h-11 items-center gap-2 border-0 bg-transparent px-0 py-[6px] text-xs text-muted underline" onClick={limparFiltros}>Limpar filtros</button>}

        </div>
        <div className={avancadoAberto ? 'grid gap-5 py-3 md:grid-cols-2 max-[560px]:grid-cols-1' : 'hidden'}>
          <label className="block">Cidade<input name="cidade" list="catalogo-cidades" placeholder="Ex.: Juara" value={rascunho['cidade']} maxLength={100}  onChange={(evento) => setRascunho({ ...rascunho, 'cidade': evento.target.value }, false)} /></label>
          <label className="block">Bairro<input name="bairro" placeholder="Ex.: Centro" value={rascunho['bairro']} maxLength={100}  onChange={(evento) => setRascunho({ ...rascunho, 'bairro': evento.target.value }, false)} /></label>
          <label className="block">Preço mínimo (R$)<input name="preco-minimo" type="number" min="0" step="0.01" max="9999999999.99" placeholder="Sem mínimo" value={rascunho['preco-minimo']}  onChange={(evento) => mudarNumero(evento.currentTarget)} /></label>
          <label className="block">Preço máximo (R$)<input name="preco-maximo" type="number" min="0" step="0.01" max="9999999999.99" placeholder="Sem máximo" value={rascunho['preco-maximo']}  onChange={(evento) => mudarNumero(evento.currentTarget)} /></label>
          <label className="block">Área mínima (m²)<input name="area-minima" type="number" min="0" step="0.01" max="99999999.99" placeholder="Sem mínimo" value={rascunho['area-minima']}  onChange={(evento) => mudarNumero(evento.currentTarget)} /></label>
          <label className="block">Área máxima (m²)<input name="area-maxima" type="number" min="0" step="0.01" max="99999999.99" placeholder="Sem máximo" value={rascunho['area-maxima']}  onChange={(evento) => mudarNumero(evento.currentTarget)} /></label>
          {erroFiltro && <p className="error col-span-full mb-0" role="alert">{erroFiltro}</p>}
          <input type="hidden" name="ordenar" value={rascunho.ordenar} />
        </div>
        <datalist id="catalogo-cidades">{cidades.map((cidade) => <option value={cidade} key={cidade} />)}</datalist>
      </form>
    </div>
    </section>
    <section id="catalogo" className="container scroll-mt-[120px] pt-12 max-[800px]:scroll-mt-[100px] max-[560px]:pt-8" aria-labelledby="catalogo-titulo">
      <div className="flex items-end justify-between gap-6 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[10px]">
        <div><h2 id="catalogo-titulo" className="mb-2 text-[clamp(26px,2.5vw,35px)]">Imóveis disponíveis</h2><p className="m-0 text-sm text-muted" aria-live="polite">{!carregando && !erro && plural(imoveis?.total || 0, 'imóvel encontrado', 'imóveis encontrados')}</p></div>
        <label className="flex items-center gap-3 text-sm text-muted">Ordenar por
          <select className="min-h-11 w-auto" value={consulta.ordenar || 'recentes'} onChange={(evento) => setRascunho({ ...rascunho, ordenar: evento.target.value === 'recentes' ? '' : evento.target.value }, true)}>
            {Object.entries(rotulosOrdenacao).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
        </label>
      </div>
      {filtrosAplicados.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filtros aplicados">
        <span className="mr-1 text-xs text-muted">Filtros aplicados:</span>
        {filtrosAplicados.map((filtro) => <button type="button" key={filtro.nome} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-soft px-3 text-sm" aria-label={`Remover filtro ${filtro.rotulo}`} onClick={() => removerFiltro(filtro.nome)}>{filtro.rotulo}<IconeFechar size={14} aria-hidden="true" /></button>)}
      </div>}
      <div className="my-[30px] flex flex-wrap gap-[10px] max-[560px]:gap-2" role="group" aria-label="Filtrar por tipo">
        <button className={`${chipBase} ${!consulta.tipo ? chipSelecionado : chipInativo}`} onClick={() => escolherTipo('')} aria-pressed={!consulta.tipo}>Todos os imóveis</button>
        {tipos.map((tipo) => { const Icone = icones[tipo.chave] || IconeEdificio; return <button key={tipo.chave} className={`${chipBase} ${consulta.tipo === tipo.chave ? chipSelecionado : chipInativo}`} aria-pressed={consulta.tipo === tipo.chave} onClick={() => escolherTipo(tipo.chave)}><Icone size={17} />{tipo.nome}</button>; })}
      </div>
      <EstadoCarregamento carregando={false} erro={classificacoesRecurso.erro} tentarNovamente={classificacoesRecurso.tentarNovamente} />
      <EstadoCarregamento carregando={carregando} erro={erro} tentarNovamente={tentarNovamente} esqueleto="cartoes" />
      {!carregando && !erro && <>
        {imoveis?.itens.length
          ? <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-[30px] gap-y-[54px] max-[1100px]:gap-x-5 max-[1100px]:gap-y-9 max-[800px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[560px]:grid-cols-1 max-[560px]:gap-7">{imoveis.itens.map((imovel) => <CartaoImovel key={imovel.id} imovel={imovel} />)}</div>
          : <div className="rounded-[5px] border border-dashed border-line bg-soft px-6 py-[72px] text-center [&_svg]:mx-auto [&_svg]:mb-3 [&_svg]:text-brand"><IconeBuscar size={30} /><h3>Nenhum ponto com esse filtro</h3><p>Limpe a cidade ou o preço e tente de novo.</p><button className="buttonSecondary min-h-12" onClick={limparFiltros}>Limpar filtros</button></div>}
        <Paginacao pagina={consulta.pagina} totalPaginas={imoveis?.total_paginas || 0}
          href={(pagina) => { const proximos = new URLSearchParams(parametrosAtuais); if (pagina === 1) proximos.delete('pagina'); else proximos.set('pagina', String(pagina)); return urlCatalogo(lerConsultaCatalogo(proximos), new URLSearchParams(location.search)); }}
          aoMudar={(pagina) => { const proximos = new URLSearchParams(parametrosAtuais); proximos.set('pagina', String(pagina)); irPara(proximos); rolarParaCatalogo(); }} />
      </>}
    </section>
    <section className="container mt-[92px] grid grid-cols-2 gap-12 rounded-[3px] border-l-4 border-gold bg-navy px-14 py-[54px] text-white max-[800px]:gap-[30px] max-[800px]:p-8 max-[560px]:mt-[50px] max-[560px]:grid-cols-1 max-[560px]:gap-6 max-[560px]:px-6 max-[560px]:py-[30px]">
      <div><p className="eyebrow text-white">Atendimento com corretor</p><h2 className="mb-0">Precisa de ajuda para<br />encontrar seu imóvel?</h2></div>
      <div className="max-w-[400px] self-center"><p className="text-white/80">Conte o que seu negócio precisa. O corretor ajuda você a encontrar opções para alugar ou comprar em {brand.region.name}.</p><a href={`https://wa.me/${telefoneWhatsapp(brand.contact.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="buttonSecondary border-gold text-white hover:bg-white/10">Conversar pelo WhatsApp <IconeSetaExterna size={18} /></a></div>
    </section>
  </>;
}
