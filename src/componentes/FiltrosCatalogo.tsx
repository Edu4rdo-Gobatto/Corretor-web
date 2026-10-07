import { useEffect, useRef, useState, type FormEvent } from 'react';
import { IconeEdificio, IconeFechar, IconeFiltros, IconeGalpao, IconeLoja, IconePredio, IconeProximo, IconeTerreno, type Icone } from './Icones';
import FiltroSuspenso from './FiltroSuspenso';
import Dialogo from './Dialogo';
import { useFiltrosAutomaticos } from '../hooks/useFiltrosAutomaticos';
import { rotulosOrdenacao } from '../servicos/formato';
import type { ConsultaCatalogo, Ordenacao } from '../tipos';

type Classificacao = { chave: string; nome: string };
type Propriedades = {
  consulta: ConsultaCatalogo; chaveConsulta: string; finalidades: Classificacao[]; tipos: Classificacao[]; cidades: string[];
  /** Navega e devolve a chave da nova consulta. */
  aplicar: (alteracoes: Partial<ConsultaCatalogo>, substituir?: boolean) => string; limpar: () => void;
};

const icones: Record<string, Icone> = { galpao: IconeGalpao, 'sala-comercial': IconeEdificio, predio: IconePredio, loja: IconeLoja, terreno: IconeTerreno };
const chipBase = 'inline-flex min-h-11 items-center gap-2 rounded-[3px] border px-3 py-[10px] text-sm';
const chipInativo = 'border-line bg-transparent text-muted hover:border-navy dark:hover:border-gold';
const chipSelecionado = 'border-navy bg-navy text-white shadow-[inset_0_-2px_0_var(--color-gold)]';
const rotuloGrupo = 'mb-2 block text-sm font-semibold';
const ordenacoes = Object.entries(rotulosOrdenacao).map(([valor, rotulo]) => ({ valor, rotulo }));
const CAMPOS_EXTRAS = ['cidade', 'bairro', 'valor_min', 'valor_max', 'area_min', 'area_max'] as const;
const LIMITES = { valor_min: 9999999999.99, valor_max: 9999999999.99, area_min: 99999999.99, area_max: 99999999.99 } as const;
type CampoExtra = typeof CAMPOS_EXTRAS[number];
type Extras = Record<CampoExtra, string>;

const extrasDaConsulta = (consulta: Partial<ConsultaCatalogo>) => Object.fromEntries(CAMPOS_EXTRAS.map((campo) => [campo, String(consulta[campo] ?? '')])) as Extras;
const normalizarExtras = (valor: Extras) => Object.fromEntries(CAMPOS_EXTRAS.map((campo) => {
  const texto = valor[campo].trim();
  return [campo, campo in LIMITES && texto && Number.isFinite(Number(texto)) ? String(Number(texto)) : texto];
})) as Extras;
const extrasParaConsulta = (valor: Extras): Partial<ConsultaCatalogo> => ({
  cidade: valor.cidade || undefined, bairro: valor.bairro || undefined,
  valor_min: valor.valor_min ? Number(valor.valor_min) : undefined, valor_max: valor.valor_max ? Number(valor.valor_max) : undefined,
  area_min: valor.area_min ? Number(valor.area_min) : undefined, area_max: valor.area_max ? Number(valor.area_max) : undefined,
});
/** `invalidos`: campos numéricos com texto que o navegador não converte (validity.badInput chega como valor vazio). */
function validarExtras(valor: Extras, invalidos: Set<string>) {
  for (const [campo, maximo] of Object.entries(LIMITES) as [keyof typeof LIMITES, number][]) {
    const preco = campo.startsWith('valor');
    const numero = Number(valor[campo]);
    if (valor[campo] && (!Number.isFinite(numero) || numero < 0 || numero > maximo)) return preco ? 'Informe um preço válido dentro do limite do campo.' : 'Informe uma área válida dentro do limite do campo.';
    const centavos = numero * 100;
    if (invalidos.has(campo) || Math.abs(centavos - Math.round(centavos)) > Math.max(0.00001, Math.abs(centavos) * Number.EPSILON)) return preco ? 'Informe um preço válido, com até duas casas decimais.' : 'Informe uma área válida, com até duas casas decimais.';
  }
  if (valor.valor_min && valor.valor_max && Number(valor.valor_min) > Number(valor.valor_max)) return 'O preço mínimo deve ser menor ou igual ao máximo.';
  if (valor.area_min && valor.area_max && Number(valor.area_min) > Number(valor.area_max)) return 'A área mínima deve ser menor ou igual à máxima.';
  return '';
}

function resumoTipos(selecionados: string[], tipos: Classificacao[]) {
  if (!selecionados.length) return 'Todos';
  if (selecionados.length > 2) return `${selecionados.length} tipos`;
  const nomes = selecionados.map((chave) => tipos.find((tipo) => tipo.chave === chave)?.nome ?? chave);
  return new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(nomes);
}

/** Local, preço e área: o mesmo trecho serve ao painel do desktop e à tela cheia do mobile. */
function CamposExtras({ rascunho, aoMudar, emColunas }: { rascunho: Extras; aoMudar: (campo: HTMLInputElement) => void; emColunas: boolean }) {
  const ligar = (campo: CampoExtra) => ({ name: campo, value: rascunho[campo], onChange: (evento: { currentTarget: HTMLInputElement }) => aoMudar(evento.currentTarget) });
  const grupo = 'm-0 grid min-w-0 grid-cols-2 gap-3 border-0 p-0';
  const legenda = 'mb-2 p-0 text-sm font-semibold';
  const campo = 'block min-w-0 text-sm font-normal text-muted [&_input]:text-ink';
  return <div className={emColunas ? 'grid grid-cols-3 gap-6 max-[1100px]:gap-4' : 'grid gap-6'}>
    <fieldset className={grupo}><legend className={legenda}>Local</legend>
      <label className={campo}>Cidade<input {...ligar('cidade')} list="catalogo-cidades" placeholder="Ex.: Juara" maxLength={100} /></label>
      <label className={campo}>Bairro<input {...ligar('bairro')} placeholder="Ex.: Centro" maxLength={100} /></label>
    </fieldset>
    <fieldset className={grupo}><legend className={legenda}>Preço (R$)</legend>
      <label className={campo}>Mínimo<input {...ligar('valor_min')} type="number" inputMode="decimal" min="0" step="0.01" max={LIMITES.valor_min} placeholder="Sem mínimo" /></label>
      <label className={campo}>Máximo<input {...ligar('valor_max')} type="number" inputMode="decimal" min="0" step="0.01" max={LIMITES.valor_max} placeholder="Sem máximo" /></label>
    </fieldset>
    <fieldset className={grupo}><legend className={legenda}>Área útil (m²)</legend>
      <label className={campo}>Mínima<input {...ligar('area_min')} type="number" inputMode="decimal" min="0" step="0.01" max={LIMITES.area_min} placeholder="Sem mínimo" /></label>
      <label className={campo}>Máxima<input {...ligar('area_max')} type="number" inputMode="decimal" min="0" step="0.01" max={LIMITES.area_max} placeholder="Sem máximo" /></label>
    </fieldset>
  </div>;
}

/**
 * Card único de filtros do catálogo. Desktop: dois seletores (finalidade e tipos) e "Mais filtros" abrindo um painel
 * no próprio card. Mobile: chips e "Mais filtros" em tela cheia. A troca é só por CSS, então o HTML do SSR é o mesmo.
 * Seleções aplicam na hora; local, preço e área aplicam sozinhos 350 ms depois da digitação (useFiltrosAutomaticos),
 * substituindo a entrada do histórico, e na hora com Enter.
 */
export default function FiltrosCatalogo({ consulta, chaveConsulta, finalidades, tipos, cidades, aplicar, limpar }: Propriedades) {
  const selecionados = consulta.tipos ?? [];
  const extrasAtivos = CAMPOS_EXTRAS.filter((campo) => consulta[campo] !== undefined).length;
  const [painelAberto, setPainelAberto] = useState(extrasAtivos > 0);
  const [telaCheia, setTelaCheia] = useState(false);
  const numerosInvalidos = useRef(new Set<string>());
  // Chave da última navegação feita pelo próprio card: a URL que ela gera não deve sobrescrever o que ainda está sendo digitado.
  const ultimaNavegacao = useRef('');
  const { rascunho, definir, erro, aplicarAgora, sincronizar } = useFiltrosAutomaticos<Extras>({
    iniciais: extrasDaConsulta(consulta),
    normalizar: normalizarExtras,
    validar: (valor) => validarExtras(valor, numerosInvalidos.current),
    aoAplicar: (valor, automatico) => { ultimaNavegacao.current = aplicar(extrasParaConsulta(valor), automatico); },
  });
  useEffect(() => {
    if (ultimaNavegacao.current === chaveConsulta) { ultimaNavegacao.current = ''; return; }
    numerosInvalidos.current.clear();
    sincronizar(extrasDaConsulta(consulta));
  // A URL é a fonte externa; sincronizar não deve reagir a cada edição do rascunho.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveConsulta]);
  const temFiltro = Boolean(selecionados.length || consulta.finalidade || extrasAtivos || Object.values(rascunho).some(Boolean));

  /** Seleção durante a espera da digitação leva junto o rascunho válido; inválido, ele fica no campo com o aviso. */
  function selecionar(alteracoes: Partial<ConsultaCatalogo>) {
    const normalizado = normalizarExtras(rascunho);
    if (validarExtras(normalizado, numerosInvalidos.current)) { ultimaNavegacao.current = aplicar(alteracoes); return; }
    sincronizar(rascunho);
    ultimaNavegacao.current = aplicar({ ...extrasParaConsulta(normalizado), ...alteracoes });
  }
  function alternarTipo(chave: string) {
    if (!chave) { selecionar({ tipos: undefined }); return; }
    const proximos = selecionados.includes(chave) ? selecionados.filter((item) => item !== chave) : [...selecionados, chave];
    selecionar({ tipos: proximos.length && proximos.length < tipos.length ? proximos : undefined });
  }
  const ordenar = consulta.ordenar ?? 'recentes';
  const escolherOrdem = (valor: string) => selecionar({ ordenar: valor === 'recentes' ? undefined : valor as Ordenacao });
  function mudarCampo(campo: HTMLInputElement) {
    if (campo.validity.badInput) numerosInvalidos.current.add(campo.name);
    else numerosInvalidos.current.delete(campo.name);
    definir({ ...rascunho, [campo.name]: campo.value });
  }
  function aplicarExtras(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (aplicarAgora(false)) setTelaCheia(false);
  }
  function limparTudo() {
    numerosInvalidos.current.clear();
    sincronizar(extrasDaConsulta({}));
    limpar();
  }
  const contador = extrasAtivos > 0 && <><span aria-hidden="true" className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-gold px-1.5 text-xs font-bold text-navy-deep">{extrasAtivos}</span><span className="sr-only">({extrasAtivos} {extrasAtivos === 1 ? 'ativo' : 'ativos'})</span></>;
  const mensagemErro = erro && <p className="error mb-0 mt-4" role="alert">{erro}</p>;

  return <div role="search" aria-label="Filtrar imóveis" className="rounded-lg border border-line bg-paper px-7 pb-4 pt-6 shadow-sm max-[560px]:px-[18px] max-[560px]:pt-5">
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] items-end gap-5 max-[1100px]:gap-3 max-[960px]:grid-cols-2 max-[960px]:gap-y-4 max-[800px]:hidden">
      <FiltroSuspenso id="filtro-finalidade" rotulo="Alugar ou comprar" resumo={finalidades.find((item) => item.chave === consulta.finalidade)?.nome ?? 'Todos'}
        opcoes={finalidades.map((item) => ({ valor: item.chave, rotulo: item.nome }))}
        selecionados={consulta.finalidade ? [consulta.finalidade] : []} aoMudar={([finalidade]) => selecionar({ finalidade })} />
      <FiltroSuspenso id="filtro-tipos" rotulo="Tipo de imóvel" multiplo resumo={resumoTipos(selecionados, tipos)} selecionados={selecionados}
        opcoes={tipos.map((tipo) => { const Icone = icones[tipo.chave] || IconeEdificio; return { valor: tipo.chave, rotulo: tipo.nome, icone: <Icone size={17} /> }; })}
        aoMudar={(proximos) => selecionar({ tipos: proximos.length ? proximos : undefined })} />
      <FiltroSuspenso id="filtro-ordem" rotulo="Ordenar por" todos={false} resumo={rotulosOrdenacao[ordenar]} opcoes={ordenacoes}
        selecionados={[ordenar]} aoMudar={([valor]) => escolherOrdem(valor)} />
      <button type="button" aria-expanded={painelAberto} aria-controls="filtros-extras" onClick={() => setPainelAberto(!painelAberto)}
        className={`buttonSecondary min-h-12 border-[var(--color-control-line)] px-4 py-0 ${painelAberto ? 'bg-soft' : ''}`}>
        <IconeFiltros size={18} aria-hidden="true" />Mais filtros{contador}
        <IconeProximo size={18} aria-hidden="true" className={`text-muted transition-transform ${painelAberto ? '-rotate-90' : 'rotate-90'}`} />
      </button>
    </div>
    {painelAberto && <form id="filtros-extras" noValidate onSubmit={aplicarExtras} aria-label="Mais filtros" className="mt-5 border-t border-line pt-5 max-[800px]:hidden">
      <CamposExtras rascunho={rascunho} aoMudar={mudarCampo} emColunas />
      {!telaCheia && mensagemErro}
    </form>}

    <div className="grid gap-5 min-[801px]:hidden">
      <div role="group" aria-labelledby="filtros-finalidade">
        <span id="filtros-finalidade" className={rotuloGrupo}>Alugar ou comprar</span>
        <div className="flex flex-wrap gap-2">
          {[{ chave: '', nome: 'Todos' }, ...finalidades].map((item) => {
            const marcado = (consulta.finalidade ?? '') === item.chave;
            return <button key={item.chave || '-todos'} type="button" aria-pressed={marcado} onClick={() => selecionar({ finalidade: item.chave || undefined })}
              className={`${chipBase} ${marcado ? chipSelecionado : chipInativo}`}>{item.nome}</button>;
          })}
        </div>
      </div>
      <div role="group" aria-labelledby="filtros-tipos">
        <span id="filtros-tipos" className={rotuloGrupo}>Tipo de imóvel</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!selecionados.length} onClick={() => alternarTipo('')} className={`${chipBase} ${!selecionados.length ? chipSelecionado : chipInativo}`}>Todos</button>
          {tipos.map((tipo) => {
            const Icone = icones[tipo.chave] || IconeEdificio;
            const marcado = selecionados.includes(tipo.chave);
            return <button key={tipo.chave} type="button" aria-pressed={marcado} onClick={() => alternarTipo(tipo.chave)} className={`${chipBase} ${marcado ? chipSelecionado : chipInativo}`}><Icone size={17} aria-hidden="true" />{tipo.nome}</button>;
          })}
        </div>
      </div>
      <div role="group" aria-labelledby="filtros-ordem">
        <span id="filtros-ordem" className={rotuloGrupo}>Ordenar por</span>
        <div className="flex flex-wrap gap-2">
          {ordenacoes.map((opcao) => <button key={opcao.valor} type="button" aria-pressed={ordenar === opcao.valor} onClick={() => escolherOrdem(opcao.valor)}
            className={`${chipBase} ${ordenar === opcao.valor ? chipSelecionado : chipInativo}`}>{opcao.rotulo}</button>)}
        </div>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <button type="button" onClick={limparTudo} disabled={!temFiltro}
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-[4px] border-0 bg-transparent px-2 text-sm font-semibold hover:bg-soft disabled:hover:bg-transparent">
        <IconeFechar size={16} aria-hidden="true" />Limpar
      </button>
      <button type="button" aria-haspopup="dialog" onClick={() => setTelaCheia(true)} className="buttonSecondary min-h-11 border-[var(--color-control-line)] px-4 min-[801px]:hidden">
        <IconeFiltros size={18} aria-hidden="true" />Mais filtros{contador}
      </button>
    </div>
    <datalist id="catalogo-cidades">{cidades.map((cidade) => <option value={cidade} key={cidade} />)}</datalist>

    {telaCheia && <Dialogo titulo="Mais filtros" telaInteira aoFechar={() => { aplicarAgora(); setTelaCheia(false); }}>
      <form noValidate onSubmit={aplicarExtras} className="flex min-h-full flex-col">
        <CamposExtras rascunho={rascunho} aoMudar={mudarCampo} emColunas={false} />
        {mensagemErro}
        <div className="mt-auto pt-8"><button type="submit" className="button w-full">Ver imóveis</button></div>
      </form>
    </Dialogo>}
  </div>;
}
