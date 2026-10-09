import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FichaImovel as Ficha } from '../../tipos';
import GaleriaMidia from '../../componentes/GaleriaMidia';
import { area, dataCivil, destaquesImovel, dinheiroExato, rotuloCaracteristica, rotulosStatusImovel, valorCaracteristica, type ChaveDestaque } from '../../servicos/formato';
import { urlFichaCorretor } from '../../servicos/urls';
import { useSessao } from '../../hooks/useSessao';
import Etiqueta from '../../componentes/Etiqueta';
import { SecaoPainel } from '../../componentes/BlocosPainel';
import { IconeArea, IconeEdificio, IconeCama, IconeGota, IconeSofa, IconeAndares, IconeCarro, IconePiscina, IconeModoClaro, IconeTerreno, type Icone } from '../../componentes/Icones';

const iconesDestaque: Record<ChaveDestaque, Icone> = { quartos: IconeCama, banheiros: IconeGota, salas: IconeSofa, pisos: IconeAndares, vagas: IconeCarro, piscina: IconePiscina, solar: IconeModoClaro, lazer: IconeTerreno };

function Nota({ titulo, children, classe = '' }: { titulo: string; children: ReactNode; classe?: string }) {
  return <SecaoPainel titulo={titulo} classe={`imovel-bloco ${classe}`} classeConteudo="imovel-nota">{children}</SecaoPainel>;
}

/** Consulta compartilhada pela ficha própria e pela edição sem permissão. */
export default function FichaImovel({ imovel }: { imovel: Ficha }) {
  const { corretor } = useSessao();
  const linha = (rotulo: string, valor: ReactNode) => <div><dt>{rotulo}</dt><dd>{valor || 'Não informado'}</dd></div>;
  const moeda = (valor: string | null) => valor === null ? 'Não informado' : dinheiroExato(valor);
  const destaques = destaquesImovel(imovel.caracteristicas);
  const iconesPorId = new Map(destaques.map((item) => [item.caracteristica_id, iconesDestaque[item.chave]]));
  const destacadas = imovel.caracteristicas.filter((item) => iconesPorId.has(item.caracteristica_id));
  const demais = imovel.caracteristicas.filter((item) => !iconesPorId.has(item.caracteristica_id));
  return <div className="imovel-ficha">
    <div className="imovel-ficha-topo">
      <Nota titulo="Fotos e vídeos" classe="imovel-nota-galeria">
        <GaleriaMidia key={imovel.id} midias={imovel.midias} titulo={imovel.titulo} />
      </Nota>
      <Nota titulo="Resumo do imóvel">
      <div className="mb-4 flex flex-wrap gap-2"><Etiqueta>{rotulosStatusImovel[imovel.status]}</Etiqueta>{!imovel.ativo && <Etiqueta tom="alerta">Arquivado</Etiqueta>}{imovel.destaque && <Etiqueta tom="atencao">Destaque</Etiqueta>}</div>
      <dl className="imovel-nota-dados imovel-nota-valores">
        {linha('Tipo', imovel.tipo?.nome)}{linha('Finalidade', imovel.finalidade?.nome)}
        {linha('Valor de venda', moeda(imovel.valor_venda))}{linha('Locação mensal', moeda(imovel.valor_locacao))}
        {linha('Condomínio', moeda(imovel.valor_condominio))}{linha('IPTU', moeda(imovel.valor_iptu))}
      </dl>
      </Nota>
    </div>
    <div className="imovel-ficha-notas">
      <Nota titulo="Características">
        <dl className="imovel-nota-destaques">
          <div><IconeArea aria-hidden="true" /><dt>Área útil</dt><dd>{area(imovel.area_util)}</dd></div>
          <div><IconeEdificio aria-hidden="true" /><dt>Área total</dt><dd>{area(imovel.area_total)}</dd></div>
          {destacadas.map((item) => {
            const IconeItem = iconesPorId.get(item.caracteristica_id)!;
            return <div key={item.caracteristica_id}><IconeItem aria-hidden="true" /><dt>{rotuloCaracteristica(item.nome)}</dt><dd>{valorCaracteristica(item.valor)}</dd></div>;
          })}
        </dl>
        {demais.length > 0 && <dl className="imovel-nota-dados mt-4">{demais.map((item) => <div key={item.caracteristica_id}><dt>{rotuloCaracteristica(item.nome)}</dt><dd>{valorCaracteristica(item.valor)}</dd></div>)}</dl>}
        {!imovel.caracteristicas.length && <p className="campo-dica mb-0 mt-4">Nenhuma característica cadastrada.</p>}
      </Nota>
      <Nota titulo="Localização"><dl className="imovel-nota-dados">
        {linha('Endereço', `${imovel.logradouro}, ${imovel.numero} ${imovel.complemento ?? ''}, ${imovel.bairro}, ${imovel.cidade}/${imovel.estado}`)}{linha('CEP', imovel.cep)}
      </dl></Nota>
      <Nota titulo="Pessoas vinculadas"><dl className="imovel-nota-dados">
        {linha('Responsável', <Link to={urlFichaCorretor(imovel.corretor_id, corretor?.id)}>{imovel.corretor?.nome ?? `Corretor #${imovel.corretor_id}`}</Link>)}
        {linha('Proprietário', imovel.proprietario && <Link to={`/admin/pessoas/${imovel.proprietario.id}`}>{imovel.proprietario.nome}</Link>)}
      </dl></Nota>
      <Nota titulo="Ficha interna" classe="imovel-nota-interna"><dl className="imovel-nota-dados">
        {linha('Exclusividade', imovel.exclusividade ? 'Sim' : 'Não')}{linha('Exclusividade até', dataCivil(imovel.exclusividade_ate))}
        {linha('Captação', dataCivil(imovel.data_captacao))}{linha('Chaves', imovel.chaves)}
        {linha('Matrícula', imovel.matricula)}{linha('Inscrição municipal', imovel.inscricao_municipal)}
        {linha('Motivo da baixa', imovel.motivo_baixa)}
      </dl></Nota>
      <Nota titulo="Descrição" classe="imovel-nota-descricao"><p className="imovel-nota-texto">{imovel.descricao || 'Não informado'}</p></Nota>
      <Nota titulo="Observações internas"><p className="imovel-nota-texto">{imovel.observacoes_internas || 'Não informado'}</p></Nota>
    </div>
  </div>;
}
